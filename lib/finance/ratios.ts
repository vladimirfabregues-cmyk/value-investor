import type { FinancialHistory5Y, FinancialSnapshot } from "@/types/finance";

export function roundTo(value: number | null, decimals = 2): number | null {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function safeDivide(
  numerator: number | null,
  denominator: number | null,
): number | null {
  if (
    numerator === null ||
    denominator === null ||
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator === 0
  ) {
    return null;
  }

  return numerator / denominator;
}

export function scoreBand(value: number): "elite" | "strong" | "mixed" | "weak" | "poor" {
  if (value >= 85) {
    return "elite";
  }
  if (value >= 70) {
    return "strong";
  }
  if (value >= 55) {
    return "mixed";
  }
  if (value >= 40) {
    return "weak";
  }
  return "poor";
}

export function weightedAverage(
  entries: Array<{ value: number | null; weight: number }>,
): number {
  let numerator = 0;
  let denominator = 0;

  for (const entry of entries) {
    if (entry.value === null || !Number.isFinite(entry.value)) {
      continue;
    }
    numerator += entry.value * entry.weight;
    denominator += entry.weight;
  }

  if (denominator === 0) {
    return 50;
  }

  return clamp(numerator / denominator);
}

export function positiveSeriesRatio(series: Array<number | null>): number {
  const usable = series.filter((value): value is number => value !== null);
  if (usable.length === 0) {
    return 0;
  }

  const positives = usable.filter((value) => value > 0).length;
  return (positives / usable.length) * 100;
}

export function computeValuationRatios(input: {
  price: number;
  marketCap: number;
  enterpriseValue: number;
  latest: FinancialSnapshot;
}) {
  const pe =
    input.latest.diluted_eps && input.latest.diluted_eps > 0
      ? input.price / input.latest.diluted_eps
      : null;
  const pb =
    input.latest.bvps && input.latest.bvps > 0
      ? input.price / input.latest.bvps
      : null;
  const ps =
    input.latest.revenue && input.latest.revenue > 0
      ? input.marketCap / input.latest.revenue
      : null;
  const evEbitda =
    input.latest.ebitda && input.latest.ebitda > 0
      ? input.enterpriseValue / input.latest.ebitda
      : null;
  const priceFcf =
    input.latest.free_cash_flow && input.latest.free_cash_flow > 0
      ? input.marketCap / input.latest.free_cash_flow
      : null;
  const grahamNumber =
    input.latest.diluted_eps &&
    input.latest.diluted_eps > 0 &&
    input.latest.bvps &&
    input.latest.bvps > 0
      ? Math.sqrt(22.5 * input.latest.diluted_eps * input.latest.bvps)
      : null;

  return {
    pe: roundTo(pe),
    pb: roundTo(pb),
    ps: roundTo(ps),
    ev_ebitda: roundTo(evEbitda),
    price_fcf: roundTo(priceFcf),
    graham_number: roundTo(grahamNumber),
  };
}

function inverseMultipleScore(
  value: number | null,
  thresholds: [number, number, number, number],
): number | null {
  if (value === null) {
    return null;
  }

  if (value <= thresholds[0]) {
    return 90;
  }
  if (value <= thresholds[1]) {
    return 75;
  }
  if (value <= thresholds[2]) {
    return 60;
  }
  if (value <= thresholds[3]) {
    return 45;
  }
  return 25;
}

function directRatioScore(
  value: number | null,
  thresholds: [number, number, number, number],
): number | null {
  if (value === null) {
    return null;
  }

  if (value >= thresholds[0]) {
    return 90;
  }
  if (value >= thresholds[1]) {
    return 75;
  }
  if (value >= thresholds[2]) {
    return 60;
  }
  if (value >= thresholds[3]) {
    return 45;
  }
  return 25;
}

export function computeValuationScore(input: {
  price: number;
  ratios: ReturnType<typeof computeValuationRatios>;
  latest: FinancialSnapshot;
}): number {
  const scores: Array<number | null> = [
    input.latest.diluted_eps !== null && input.latest.diluted_eps <= 0
      ? 18
      : inverseMultipleScore(input.ratios.pe, [12, 18, 25, 35]),
    input.latest.bvps !== null && input.latest.bvps <= 0
      ? 20
      : inverseMultipleScore(input.ratios.pb, [1.5, 3, 6, 10]),
    input.latest.revenue !== null && input.latest.revenue <= 0
      ? 15
      : inverseMultipleScore(input.ratios.ps, [2, 4, 8, 12]),
    input.latest.ebitda !== null && input.latest.ebitda <= 0
      ? 18
      : inverseMultipleScore(input.ratios.ev_ebitda, [8, 12, 18, 25]),
    input.latest.free_cash_flow !== null && input.latest.free_cash_flow <= 0
      ? 15
      : inverseMultipleScore(input.ratios.price_fcf, [12, 18, 25, 35]),
    input.ratios.graham_number === null
      ? null
      : input.price <= input.ratios.graham_number * 0.7
        ? 90
        : input.price <= input.ratios.graham_number
          ? 75
          : input.price <= input.ratios.graham_number * 1.2
            ? 60
            : input.price <= input.ratios.graham_number * 1.5
              ? 45
              : 25,
  ];

  const available = scores.filter((value): value is number => value !== null);

  if (available.length === 0) {
    return 25;
  }

  const average = available.reduce((sum, value) => sum + value, 0) / available.length;
  return clamp(average);
}

export function computeFinancialHealth(input: { latest: FinancialSnapshot; history: FinancialHistory5Y }) {
  const debtEquity =
    input.latest.total_equity && input.latest.total_equity > 0
      ? input.latest.total_debt !== null
        ? input.latest.total_debt / input.latest.total_equity
        : null
      : null;
  const currentRatio =
    input.latest.current_liabilities && input.latest.current_liabilities > 0
      ? input.latest.current_assets !== null
        ? input.latest.current_assets / input.latest.current_liabilities
        : null
      : null;
  const interestCoverage =
    input.latest.interest_expense && input.latest.interest_expense > 0
      ? input.latest.ebit !== null
        ? input.latest.ebit / input.latest.interest_expense
        : null
      : null;
  const fcfConsistencyScore = positiveSeriesRatio(input.history.free_cash_flow);

  const debtScore =
    debtEquity === null
      ? 50
      : debtEquity <= 0.3
        ? 90
        : debtEquity <= 0.6
          ? 75
          : debtEquity <= 1
            ? 60
            : debtEquity <= 1.5
              ? 45
              : 20;
  const currentScore =
    currentRatio === null
      ? 50
      : currentRatio >= 2
        ? 90
        : currentRatio >= 1.5
          ? 75
          : currentRatio >= 1.2
            ? 60
            : currentRatio >= 1
              ? 45
              : 20;
  const interestScore =
    interestCoverage === null
      ? input.latest.interest_expense === 0
        ? 70
        : 35
      : interestCoverage >= 10
        ? 90
        : interestCoverage >= 6
          ? 75
          : interestCoverage >= 3
            ? 60
            : interestCoverage >= 1.5
              ? 40
              : 15;

  const healthScore = clamp(
    debtScore * 0.35 +
      currentScore * 0.25 +
      interestScore * 0.2 +
      fcfConsistencyScore * 0.2,
  );

  const severeBalanceSheetWeakness =
    (debtEquity !== null && debtEquity > 1.5) ||
    (currentRatio !== null && currentRatio < 0.9) ||
    (interestCoverage !== null && interestCoverage < 1.5) ||
    (fcfConsistencyScore < 40 && (input.latest.total_debt ?? 0) > (input.latest.cash_and_equivalents ?? 0));

  return {
    debt_equity: roundTo(debtEquity),
    current_ratio: roundTo(currentRatio),
    interest_coverage: roundTo(interestCoverage),
    fcf_consistency_score: roundTo(fcfConsistencyScore, 0) ?? 0,
    health_score: roundTo(healthScore, 0) ?? 0,
    severe_balance_sheet_weakness: severeBalanceSheetWeakness,
  };
}

/**
 * Compound annual growth rate of a revenue series (oldest-first).
 * Returns null when fewer than 2 non-null positive values exist.
 */
export function computeRevenueCagr(revenueSeries: Array<number | null>): number | null {
  const values = revenueSeries.filter((v): v is number => v !== null && v > 0);
  if (values.length < 2) return null;
  const first = values[0];
  const last  = values[values.length - 1];
  const years = values.length - 1;
  const cagr  = (Math.pow(last / first, 1 / years) - 1) * 100;
  return Number.isFinite(cagr) ? roundTo(cagr, 1) : null;
}

/**
 * Direction of a margin series: compare the average of the first half
 * against the average of the most recent half.
 * Threshold: ±2.5 percentage points to call a trend.
 */
export function computeMarginTrend(
  marginSeries: Array<number | null>,
): "improving" | "declining" | "stable" | null {
  const values = marginSeries.filter((v): v is number => v !== null);
  if (values.length < 3) return null;
  const mid = Math.floor(values.length / 2);
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const delta = avg(values.slice(-mid)) - avg(values.slice(0, mid));
  if (delta > 2.5)  return "improving";
  if (delta < -2.5) return "declining";
  return "stable";
}

export function computeRevenueStabilityScore(revenueSeries: Array<number | null>): number {
  const usable = revenueSeries.filter((value): value is number => value !== null && value > 0);
  if (usable.length < 3) {
    return 45;
  }

  let score = 100;
  let maxRevenue = usable[0];

  for (let index = 1; index < usable.length; index += 1) {
    const previous = usable[index - 1];
    const current = usable[index];
    maxRevenue = Math.max(maxRevenue, current);
    const growth = (current - previous) / previous;
    score -= Math.min(Math.abs(growth) * 120, 18);

    if (growth < -0.1) {
      score -= 6;
    }
    if (growth < -0.2) {
      score -= 12;
    }
  }

  const latest = usable[usable.length - 1];
  if (latest < maxRevenue * 0.7) {
    score -= 25;
  }

  return clamp(score);
}

function profitabilityScore(value: number | null, thresholds: [number, number, number, number]): number | null {
  return directRatioScore(value, thresholds);
}

function marginDurabilityScore(series: Array<number | null>): number {
  const usable = series.filter((value): value is number => value !== null);
  if (usable.length < 3) {
    return 50;
  }

  const mean = usable.reduce((sum, value) => sum + value, 0) / usable.length;
  const variance =
    usable.reduce((sum, value) => sum + (value - mean) ** 2, 0) / usable.length;
  const stdDev = Math.sqrt(variance);

  return clamp(90 - stdDev * 4);
}

function cagrScore(cagr: number | null): number | null {
  if (cagr === null) return null;
  if (cagr > 15) return 90;
  if (cagr > 8)  return 75;
  if (cagr > 3)  return 60;
  if (cagr >= 0) return 45;
  return 20; // declining revenue
}

export function computeBusinessQuality(input: {
  latest: FinancialSnapshot;
  history: FinancialHistory5Y;
}) {
  const revenueStabilityScore  = computeRevenueStabilityScore(input.history.revenue);
  const revenueCagr            = computeRevenueCagr(input.history.revenue);
  const opMarginTrend          = computeMarginTrend(input.history.operating_margin_pct);
  const revCagrScore           = cagrScore(revenueCagr);

  const roicScore          = profitabilityScore(input.latest.roic_pct, [20, 14, 9, 5]);
  const roeScore           = profitabilityScore(input.latest.roe_pct, [22, 16, 10, 6]);
  const grossMarginScore   = profitabilityScore(input.latest.gross_margin_pct, [65, 45, 30, 20]);
  const operatingMarginScore = profitabilityScore(input.latest.operating_margin_pct, [30, 20, 12, 5]);
  const marginDurability   = weightedAverage([
    { value: marginDurabilityScore(input.history.gross_margin_pct), weight: 0.5 },
    { value: marginDurabilityScore(input.history.operating_margin_pct), weight: 0.5 },
  ]);

  // CAGR joins the moat mix with a small weight; ROIC is still dominant
  const moatScore = clamp(
    weightedAverage([
      { value: roicScore,             weight: 0.35 },
      { value: grossMarginScore,      weight: 0.15 },
      { value: operatingMarginScore,  weight: 0.20 },
      { value: marginDurability,      weight: 0.10 },
      { value: revenueStabilityScore, weight: 0.10 },
      { value: revCagrScore,          weight: 0.10 },
    ]),
  );
  const qualityScore = clamp(
    weightedAverage([
      { value: roeScore,              weight: 0.15 },
      { value: roicScore,             weight: 0.20 },
      { value: grossMarginScore,      weight: 0.15 },
      { value: operatingMarginScore,  weight: 0.15 },
      { value: revenueStabilityScore, weight: 0.10 },
      { value: revCagrScore,          weight: 0.05 },
      { value: moatScore,             weight: 0.20 },
    ]),
  );

  const weakBusinessProfile =
    qualityScore < 50 ||
    (input.latest.roic_pct !== null && input.latest.roic_pct < 6) ||
    (input.latest.operating_margin_pct !== null && input.latest.operating_margin_pct < 5);

  return {
    roe_pct: roundTo(input.latest.roe_pct),
    roic_pct: roundTo(input.latest.roic_pct),
    gross_margin_pct: roundTo(input.latest.gross_margin_pct),
    operating_margin_pct: roundTo(input.latest.operating_margin_pct),
    revenue_stability_score: roundTo(revenueStabilityScore, 0) ?? 0,
    moat_score: roundTo(moatScore, 0) ?? 0,
    quality_score: roundTo(qualityScore, 0) ?? 0,
    weak_business_profile: weakBusinessProfile,
    // Trend analytics
    revenue_cagr_pct: revenueCagr,
    operating_margin_trend: opMarginTrend,
  };
}

export function marginOfSafetyScore(marginOfSafetyPct: number | null): number {
  if (marginOfSafetyPct === null) {
    return 30;
  }
  if (marginOfSafetyPct > 40) {
    return 90;
  }
  if (marginOfSafetyPct >= 25) {
    return 75;
  }
  if (marginOfSafetyPct >= 10) {
    return 60;
  }
  if (marginOfSafetyPct >= -10) {
    return 45;
  }
  return 20;
}
