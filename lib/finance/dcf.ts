import type { FinancialSnapshot, ValueCalculationAssumptions } from "@/types/finance";

import { roundTo } from "@/lib/finance/ratios";

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clampGrowth(growthPct: number, assumptions: ValueCalculationAssumptions): number {
  return Math.min(assumptions.max_growth_cap_pct, Math.max(-3, growthPct));
}

export function estimateFcfCagr(series: Array<number | null>): number | null {
  const indexed = series
    .map((value, index) => ({ value, index }))
    .filter(
      (entry): entry is { value: number; index: number } =>
        entry.value !== null && entry.value > 0,
    );

  if (indexed.length < 2) {
    return null;
  }

  const first = indexed[0];
  const last = indexed[indexed.length - 1];
  const periods = last.index - first.index;

  if (periods <= 0) {
    return null;
  }

  const cagr = (last.value / first.value) ** (1 / periods) - 1;
  return Number.isFinite(cagr) ? cagr * 100 : null;
}

export function selectConservativeFcfBasis(
  latestFcf: number | null,
  history: Array<number | null>,
  useConservative: boolean,
): number | null {
  const trailingThreeAverage = average(
    history
      .slice(-3)
      .filter((value): value is number => value !== null && Number.isFinite(value)),
  );

  if (!useConservative) {
    return latestFcf ?? trailingThreeAverage;
  }

  if (latestFcf !== null && trailingThreeAverage !== null) {
    return Math.min(latestFcf, trailingThreeAverage);
  }

  return latestFcf ?? trailingThreeAverage;
}

export function deriveGrowthRatePct(
  history: Array<number | null>,
  assumptions: ValueCalculationAssumptions,
): number | null {
  const estimatedCagr = estimateFcfCagr(history);
  const usable = history.filter((value): value is number => value !== null);

  if (usable.length === 0) {
    return null;
  }

  const hasNegative = usable.some((value) => value <= 0);
  const volatile =
    usable.length >= 3 &&
    usable.slice(1).some((value, index) => {
      const previous = usable[index];
      return previous !== 0 && Math.abs((value - previous) / previous) > 0.35;
    });

  let growthPct = estimatedCagr ?? 3;

  if (hasNegative) {
    growthPct = Math.min(growthPct, 2);
  }
  if (volatile) {
    growthPct = Math.min(growthPct, 3);
  }
  if (usable.filter((value) => value <= 0).length >= 2) {
    growthPct = Math.min(growthPct, 0.5);
  }

  return clampGrowth(growthPct, assumptions);
}

/**
 * Net asset value anchor for property businesses (REITs).
 * Book value per share ≈ NAV; UK/IFRS funds mark property to fair value so book
 * value tracks NAV closely, while US GAAP REITs report at depreciated cost and
 * therefore understate true NAV (a conservative bias, acceptable for screening).
 */
export function calculateNavValue(bvps: number | null): number | null {
  if (bvps === null || !Number.isFinite(bvps) || bvps <= 0) return null;
  return roundTo(bvps);
}

/**
 * REIT intrinsic value combining two standard property metrics:
 *  - NAV: book value per share (≈ fair-value NAV under IFRS)
 *  - FFO value: (net income + real-estate depreciation) capitalised at a P/FFO
 *    multiple. Depreciation ≈ EBITDA − EBIT.
 *
 * Under US GAAP, property is carried at depreciated cost, so NAV (book value)
 * understates the true asset value — its signature is NAV ≪ FFO value. When that
 * appears we weight FFO heavily; otherwise (IFRS fair-value REITs) the two agree
 * and are weighted evenly. This auto-adapts across markets without hard-coding.
 */
export function calculateReitValue(input: {
  bvps: number | null;
  netIncome: number | null;
  ebitda: number | null;
  /** Clean operating income (revenue × operating margin); EBITDA − this ≈ D&A */
  operatingIncome: number | null;
  sharesOutstanding: number;
  ffoMultiple?: number;
}): { nav: number | null; ffo_value: number | null; value: number | null } {
  const multiple = input.ffoMultiple ?? 14;
  const nav = input.bvps !== null && input.bvps > 0 ? roundTo(input.bvps) : null;

  const depreciation =
    input.ebitda !== null && input.operatingIncome !== null && input.ebitda > input.operatingIncome
      ? input.ebitda - input.operatingIncome
      : null;
  const ffoPerShare =
    input.netIncome !== null && depreciation !== null && input.sharesOutstanding > 0
      ? (input.netIncome + depreciation) / input.sharesOutstanding
      : null;
  const ffoValue =
    ffoPerShare !== null && ffoPerShare > 0 ? roundTo(ffoPerShare * multiple) : null;

  let value: number | null;
  if (nav !== null && ffoValue !== null) {
    const navUnderstated = nav < 0.5 * ffoValue; // US-GAAP cost-accounting signature
    const navWeight = navUnderstated ? 0.2 : 0.5;
    value = roundTo(nav * navWeight + ffoValue * (1 - navWeight));
  } else {
    value = nav ?? ffoValue;
  }
  return { nav, ffo_value: ffoValue, value };
}

/**
 * Justified price-to-book valuation for financials (banks, insurers, asset
 * managers): the Gordon-growth identity  P/B* = (ROE − g) / (r − g).
 *
 * Crucially, ROE is the multi-year AVERAGE — for insurers and banks, trailing
 * earnings at the top of an underwriting / rate cycle massively overstate
 * sustainable profitability (Graham's 7-year-average rule applied to ROE).
 * FCF is never used: financial-sector "free cash flow" is float growth and
 * deposit/reserve timing, not distributable owner earnings.
 */
export function calculateJustifiedPbValue(input: {
  bvps: number | null;
  roeHistoryPct: Array<number | null>;
  latestRoePct: number | null;
  discountRatePct: number;
  terminalGrowthPct: number;
}): { pbroe_value_per_share: number | null; normalized_roe_pct: number | null } {
  const usable = input.roeHistoryPct.filter(
    (v): v is number => v !== null && Number.isFinite(v),
  );
  // Prefer the multi-year history; fall back to the latest point if history is thin.
  const roeBasis =
    usable.length >= 2
      ? usable.reduce((s, v) => s + v, 0) / usable.length
      : input.latestRoePct;

  if (
    roeBasis === null ||
    !Number.isFinite(roeBasis) ||
    input.bvps === null ||
    input.bvps <= 0
  ) {
    return { pbroe_value_per_share: null, normalized_roe_pct: roundTo(roeBasis ?? null) };
  }

  // Clamp normalized ROE to a credible range; even elite financials rarely
  // sustain >30% through a full cycle.
  const roeNorm = Math.min(30, Math.max(-10, roeBasis));
  const r = input.discountRatePct;
  const g = Math.min(input.terminalGrowthPct, r - 1);

  // Justified multiple, bounded to [0.4, 3.0] — outside that the inputs, not
  // the market, are usually wrong.
  const rawPb = (roeNorm - g) / (r - g);
  const justifiedPb = Math.min(3.0, Math.max(0.4, rawPb));

  return {
    pbroe_value_per_share: roundTo(justifiedPb * input.bvps),
    normalized_roe_pct: roundTo(roeNorm),
  };
}

/**
 * Gordon-growth dividend-discount value for regulated utilities:
 *   V = D1 / (r − g),  D1 = D0 × (1 + g)
 * Growth is clamped to stay safely below the discount rate so the model can't
 * diverge. Returns null when there is no (positive) dividend to discount.
 */
export function calculateDdmValue(input: {
  dividendPerShare: number | null;
  discountRatePct: number;
  growthRatePct: number | null;
}): { ddm_value_per_share: number | null; growth_rate_pct: number | null } {
  const r = input.discountRatePct / 100;
  // Keep g at least 4pp below r for numerical stability, and non-negative.
  const gUpperBound = Math.max(0, input.discountRatePct - 4);
  const gPct = Math.min(Math.max(input.growthRatePct ?? 0, 0), gUpperBound);
  const g = gPct / 100;

  if (
    input.dividendPerShare === null ||
    !Number.isFinite(input.dividendPerShare) ||
    input.dividendPerShare <= 0 ||
    r - g < 0.01
  ) {
    return { ddm_value_per_share: null, growth_rate_pct: roundTo(gPct) };
  }

  const d1 = input.dividendPerShare * (1 + g);
  return { ddm_value_per_share: roundTo(d1 / (r - g)), growth_rate_pct: roundTo(gPct) };
}

export function calculateSimplifiedDcf(input: {
  latest: FinancialSnapshot;
  historyFcf: Array<number | null>;
  sharesOutstanding: number;
  assumptions: ValueCalculationAssumptions;
}) {
  const basis = selectConservativeFcfBasis(
    input.latest.free_cash_flow,
    input.historyFcf,
    input.assumptions.use_conservative_fcf_basis,
  );

  if (basis === null || basis <= 0 || input.sharesOutstanding <= 0) {
    return {
      dcf_value_per_share: null,
      growth_rate_pct: deriveGrowthRatePct(input.historyFcf, input.assumptions),
      conservative_fcf_basis: roundTo(basis),
    };
  }

  const growthRatePct = deriveGrowthRatePct(input.historyFcf, input.assumptions);
  const discountRate = input.assumptions.discount_rate_pct / 100;
  const terminalGrowthRate = input.assumptions.terminal_growth_pct / 100;
  const growthRate = (growthRatePct ?? 2) / 100;

  const projectedCashFlows: number[] = [];

  for (let year = 1; year <= 5; year += 1) {
    projectedCashFlows.push(basis * (1 + growthRate) ** year);
  }

  const discountedCashFlows = projectedCashFlows.map(
    (cashFlow, index) => cashFlow / (1 + discountRate) ** (index + 1),
  );

  const terminalCashFlow = projectedCashFlows[projectedCashFlows.length - 1];
  const cappedTerminalGrowthRate = Math.min(terminalGrowthRate, discountRate - 0.01);
  const terminalValue =
    (terminalCashFlow * (1 + cappedTerminalGrowthRate)) /
    (discountRate - cappedTerminalGrowthRate);
  const discountedTerminalValue = terminalValue / (1 + discountRate) ** 5;
  const enterpriseLikeValue =
    discountedCashFlows.reduce((sum, value) => sum + value, 0) + discountedTerminalValue;
  const equityValue =
    enterpriseLikeValue +
    (input.latest.cash_and_equivalents ?? 0) -
    (input.latest.total_debt ?? 0);
  const valuePerShare = equityValue / input.sharesOutstanding;

  return {
    dcf_value_per_share: roundTo(valuePerShare),
    growth_rate_pct: roundTo(growthRatePct),
    conservative_fcf_basis: roundTo(basis),
  };
}
