import type { NormalizedFinancialDataset, ValueCalculationAssumptions, ValueMetricsResult } from "@/types/finance";
import type { VerdictLabel } from "@/types/analysis";

import { calculateDdmValue, calculateJustifiedPbValue, calculateReitValue, calculateSimplifiedDcf } from "@/lib/finance/dcf";
import {
  clamp,
  computeBusinessQuality,
  computeFinancialHealth,
  computeRevenueCagr,
  computeValuationRatios,
  computeValuationScore,
  marginOfSafetyScore,
  roundTo,
  scoreBand,
} from "@/lib/finance/ratios";
import { classifySecurityType, costOfEquitySizePremiumPct, getSectorProfile } from "@/lib/finance/sector-profile";

export const DEFAULT_VALUE_ASSUMPTIONS: ValueCalculationAssumptions = {
  discount_rate_pct: 10,
  terminal_growth_pct: 2.5,
  max_growth_cap_pct: 8,
  use_conservative_fcf_basis: true,
};

function calculateMarginOfSafety(
  blendedIntrinsicValuePerShare: number | null,
  price: number,
): number | null {
  if (
    blendedIntrinsicValuePerShare === null ||
    !Number.isFinite(blendedIntrinsicValuePerShare) ||
    blendedIntrinsicValuePerShare <= 0
  ) {
    return null;
  }

  return ((blendedIntrinsicValuePerShare - price) / blendedIntrinsicValuePerShare) * 100;
}

function calculateBlendedIntrinsicValue(input: {
  dcf: number | null;
  graham: number | null;
}): number | null {
  if (input.dcf === null && input.graham === null) {
    return null;
  }
  if (input.dcf !== null && input.graham !== null) {
    // Standard blend: DCF 70% / Graham 30%.
    // The Graham number assumes meaningful book value and positive EPS; for
    // asset-light or buyback-heavy businesses (tiny BVPS) it collapses far below
    // the cash-flow-based DCF and would distort intrinsic value. When the two
    // diverge by more than 2× in either direction, down-weight Graham to 15%.
    const ratio = input.graham / input.dcf;
    const isOutlier = input.dcf > 0 && (ratio < 0.5 || ratio > 2);
    const grahamWeight = isOutlier ? 0.15 : 0.3;
    return roundTo(input.dcf * (1 - grahamWeight) + input.graham * grahamWeight);
  }
  return input.dcf ?? input.graham;
}

function buildDataQualityNotes(
  dataset: NormalizedFinancialDataset,
  businessQuality: ReturnType<typeof computeBusinessQuality>,
): string[] {
  const notes: string[] = [];

  if (dataset.latest.free_cash_flow === null) {
    notes.push("Latest free cash flow is missing.");
  }
  if (dataset.history_5y.free_cash_flow.filter((value) => value !== null).length < 3) {
    notes.push("Five-year free cash flow history is thin.");
  }
  if (dataset.latest.gross_margin_pct === null) {
    notes.push("Gross margin is not meaningful or unavailable for this business mix.");
  }
  if (dataset.latest.diluted_eps !== null && dataset.latest.diluted_eps <= 0) {
    notes.push("The latest diluted EPS is non-positive, which weakens multiple-based valuation.");
  }

  // ── Trend-based flags ────────────────────────────────────────────────────
  if (businessQuality.revenue_cagr_pct !== null && businessQuality.revenue_cagr_pct < -5) {
    notes.push(
      `Revenue declining at ${Math.abs(businessQuality.revenue_cagr_pct).toFixed(1)}% CAGR — structural contraction risk.`,
    );
  }
  if (businessQuality.operating_margin_trend === "declining") {
    notes.push("Operating margin has been compressing over the past 5 years.");
  }

  // FCF deterioration: was positive in prior years, now negative
  const fcfHistory = dataset.history_5y.free_cash_flow;
  const earlierFcf = fcfHistory.slice(0, -2).filter((v): v is number => v !== null);
  const recentFcf  = fcfHistory.slice(-2).filter((v): v is number => v !== null);
  const wasPositive = earlierFcf.some((v) => v > 0);
  const nowNegative = recentFcf.length > 0 && recentFcf.every((v) => v < 0);
  if (wasPositive && nowNegative) {
    notes.push("FCF has turned negative in recent periods after being positive historically.");
  }

  return notes;
}

function determineVerdict(input: {
  marginOfSafetyPct: number | null;
  healthScore: number;
  qualityScore: number;
  severeBalanceSheetWeakness: boolean;
  valueTrapRisk: boolean;
}): VerdictLabel {
  if (input.severeBalanceSheetWeakness || input.valueTrapRisk) {
    return "AVOID";
  }

  const mos = input.marginOfSafetyPct;
  if (mos === null) {
    // No reliable intrinsic value (e.g. loss-making with no FCF basis) → avoid.
    return "AVOID";
  }

  // Bands are monotonic in margin of safety: a larger MoS can never produce a
  // worse verdict. Gates are NESTED — Strong Buy must satisfy every requirement
  // of the tiers below it (previously a company could earn the top label with a
  // health score that would have disqualified it from a mere Buy).
  if (mos > 40 && input.qualityScore >= 70 && input.healthScore >= 65) {
    return "STRONG_BUY";
  }
  if (mos >= 25 && input.healthScore >= 55) {
    return "BUY";
  }
  if (mos >= 10) {
    return "WATCH";
  }
  if (mos >= -10) {
    return "HOLD";
  }
  return "AVOID";
}

export function calculateValueMetrics(
  dataset: NormalizedFinancialDataset,
  assumptions: ValueCalculationAssumptions = DEFAULT_VALUE_ASSUMPTIONS,
  sectorOverride?: string,
): ValueMetricsResult {
  // ── Sector profile ─────────────────────────────────────────────────────────
  const profile = getSectorProfile(sectorOverride ?? dataset.sector);

  // Build effective DCF assumptions from sector profile, preserving any
  // explicit caller overrides (i.e. values that differ from defaults).
  const baseDiscountRatePct =
    assumptions.discount_rate_pct !== DEFAULT_VALUE_ASSUMPTIONS.discount_rate_pct
      ? assumptions.discount_rate_pct
      : profile.discountRatePct;
  // Size-aware cost of equity: add the small-cap equity-risk premium so a single
  // sector rate can't flatter ordinary small caps into top-tier valuations
  // (the justified-P/B model for financials is most sensitive to this). Capped
  // at a sane ceiling. Rendered in the auditable assumptions, so the shown rate
  // is the one actually used.
  const effectiveDiscountRatePct = Math.min(
    16,
    (roundTo(baseDiscountRatePct + costOfEquitySizePremiumPct(dataset.market_cap)) ??
      baseDiscountRatePct),
  );

  const effectiveAssumptions: ValueCalculationAssumptions = {
    discount_rate_pct: effectiveDiscountRatePct,
    terminal_growth_pct:
      assumptions.terminal_growth_pct !== DEFAULT_VALUE_ASSUMPTIONS.terminal_growth_pct
        ? assumptions.terminal_growth_pct
        : profile.terminalGrowthPct,
    max_growth_cap_pct:
      assumptions.max_growth_cap_pct !== DEFAULT_VALUE_ASSUMPTIONS.max_growth_cap_pct
        ? assumptions.max_growth_cap_pct
        : profile.maxGrowthCapPct,
    use_conservative_fcf_basis: assumptions.use_conservative_fcf_basis,
  };

  const valuationRatios = computeValuationRatios({
    price: dataset.price,
    marketCap: dataset.market_cap,
    enterpriseValue: dataset.enterprise_value,
    latest: dataset.latest,
  });
  const valuationScore = roundTo(
    computeValuationScore({
      price: dataset.price,
      ratios: valuationRatios,
      latest: dataset.latest,
    }),
    0,
  ) ?? 0;

  const financialHealth = computeFinancialHealth({
    latest: dataset.latest,
    history: dataset.history_5y,
  });

  // Re-evaluate severe_balance_sheet_weakness using sector-specific thresholds.
  // Each liquidity/coverage test is skipped for sectors where it is structurally
  // meaningless (e.g. banks: no working-capital current ratio, interest expense ≈ EBIT).
  const sectorAwareSevereWeakness =
    (financialHealth.debt_equity !== null &&
      financialHealth.debt_equity > profile.severeDebtEquityThreshold) ||
    (profile.currentRatioMeaningful &&
      financialHealth.current_ratio !== null &&
      financialHealth.current_ratio < 0.9) ||
    (profile.interestCoverageMeaningful &&
      financialHealth.interest_coverage !== null &&
      financialHealth.interest_coverage < 1.5) ||
    (profile.fcfMeaningful &&
      financialHealth.fcf_consistency_score < 40 &&
      (dataset.latest.total_debt ?? 0) > (dataset.latest.cash_and_equivalents ?? 0));

  const businessQuality = computeBusinessQuality({
    latest: dataset.latest,
    history: dataset.history_5y,
  });
  const dcf = calculateSimplifiedDcf({
    latest: dataset.latest,
    historyFcf: dataset.history_5y.free_cash_flow,
    sharesOutstanding: dataset.shares_outstanding,
    assumptions: effectiveAssumptions,
  });
  const grahamValuePerShare = valuationRatios.graham_number;

  // ── Cyclical-earnings normalization (Graham's averaging rule) ─────────────
  // When TTM EPS is >1.4× the 5-year average, earnings are likely at a cycle
  // peak (insurers in a hard market, miners at commodity highs, banks at NIM
  // peaks). Multiple-based intrinsic values then use the AVERAGE, and the
  // verdict is capped below Buy regardless of apparent cheapness.
  const positiveEpsHistory = dataset.history_5y.diluted_eps.filter(
    (v): v is number => v !== null && Number.isFinite(v),
  );
  const avgEps =
    positiveEpsHistory.length >= 3
      ? positiveEpsHistory.reduce((s, v) => s + v, 0) / positiveEpsHistory.length
      : null;
  const peakEarnings =
    avgEps !== null &&
    avgEps > 0 &&
    dataset.latest.diluted_eps !== null &&
    dataset.latest.diluted_eps > 1.4 * avgEps;

  // Graham anchor for intrinsic value: averaged EPS when at a peak
  const grahamForIntrinsic =
    peakEarnings && avgEps !== null && avgEps > 0 && (dataset.latest.bvps ?? 0) > 0
      ? roundTo(Math.sqrt(22.5 * avgEps * dataset.latest.bvps!))
      : grahamValuePerShare;

  // ── Sector-specific intrinsic-value anchor ─────────────────────────────────
  // REITs are valued on NAV + FFO (property metrics); utilities on a dividend-
  // discount model; financials on justified P/B from cycle-average ROE. All
  // sectors fall back as noted if their primary method can't be computed.
  // Operating income from clean financialData fields (revenue × operating margin)
  // is more reliable than the time-series EBIT for REITs, where reported EBIT can
  // include property-disposal gains.
  const reitOperatingIncome =
    dataset.latest.revenue !== null && dataset.latest.operating_margin_pct !== null
      ? dataset.latest.revenue * (dataset.latest.operating_margin_pct / 100)
      : dataset.latest.ebit;
  const reit = calculateReitValue({
    bvps: dataset.latest.bvps ?? null,
    netIncome: dataset.latest.net_income,
    ebitda: dataset.latest.ebitda,
    operatingIncome: reitOperatingIncome,
    sharesOutstanding: dataset.shares_outstanding,
  });
  const navValuePerShare = reit.nav;

  // Dividend growth: trailing EPS CAGR, floored at the sector's long-run terminal
  // growth (a regulated utility's dividend grows at least with inflation/GDP).
  const epsCagr = computeRevenueCagr(dataset.history_5y.diluted_eps);
  const ddm = calculateDdmValue({
    dividendPerShare: dataset.latest.dividend_per_share ?? null,
    discountRatePct: effectiveAssumptions.discount_rate_pct,
    growthRatePct: Math.max(epsCagr ?? 0, effectiveAssumptions.terminal_growth_pct),
  });
  // Justified P/B for financials — uses the 5-year ROE history, never FCF
  // (financial-sector "FCF" is float and deposit timing, not owner earnings).
  const pbroe = calculateJustifiedPbValue({
    bvps: dataset.latest.bvps,
    roeHistoryPct: dataset.history_5y.roe_pct,
    latestRoePct: dataset.latest.roe_pct,
    discountRatePct: effectiveAssumptions.discount_rate_pct,
    terminalGrowthPct: effectiveAssumptions.terminal_growth_pct,
  });

  const dcfGrahamBlend = calculateBlendedIntrinsicValue({
    dcf: dcf.dcf_value_per_share,
    graham: grahamForIntrinsic,
  });

  // Closed-end funds / investment trusts override the sector method entirely:
  // book value IS the (marked) NAV, and their EPS is portfolio revaluation,
  // so the only sound intrinsic anchor is the NAV itself — MoS = NAV discount.
  const securityType = classifySecurityType({
    companyName: dataset.company_name,
    industry: dataset.industry,
    revenueCagrPct: businessQuality.revenue_cagr_pct,
  });

  let intrinsicMethod: "dcf" | "nav" | "ddm" | "pbroe" = "dcf";
  let blendedIntrinsicValuePerShare: number | null;
  if (securityType === "closed_end_fund") {
    // CEF discounts persist: revert to the fund's OWN 5-year average P/NAV
    // (clamped 0.7–1.1), not to NAV parity. A trust that always trades at a
    // 10% discount is fairly priced at a 10% discount.
    const pbHist = (dataset.cef_pb_history ?? []).filter(
      (v): v is number => v !== null && Number.isFinite(v) && v > 0,
    );
    const avgPb = pbHist.length >= 2 ? pbHist.reduce((s, v) => s + v, 0) / pbHist.length : 1;
    const targetPb = Math.min(1.1, Math.max(0.7, avgPb));
    intrinsicMethod = "nav";
    blendedIntrinsicValuePerShare =
      dataset.latest.bvps !== null && dataset.latest.bvps > 0
        ? roundTo(dataset.latest.bvps * targetPb)
        : null;
  } else if (profile.intrinsicMethod === "nav" && reit.value !== null) {
    intrinsicMethod = "nav";
    blendedIntrinsicValuePerShare = reit.value;
  } else if (profile.intrinsicMethod === "ddm" && ddm.ddm_value_per_share !== null) {
    intrinsicMethod = "ddm";
    blendedIntrinsicValuePerShare = ddm.ddm_value_per_share;
  } else if (profile.intrinsicMethod === "pbroe") {
    // Fall back to the (cycle-normalized) Graham number — but never to FCF-DCF.
    intrinsicMethod = "pbroe";
    blendedIntrinsicValuePerShare = pbroe.pbroe_value_per_share ?? grahamForIntrinsic;
  } else {
    intrinsicMethod = "dcf";
    blendedIntrinsicValuePerShare = dcfGrahamBlend;
  }

  const marginOfSafetyPct = roundTo(
    calculateMarginOfSafety(blendedIntrinsicValuePerShare, dataset.price),
  );
  const mosScore = marginOfSafetyScore(marginOfSafetyPct);
  const growthRatePct =
    intrinsicMethod === "ddm" ? ddm.growth_rate_pct :
    intrinsicMethod === "pbroe" ? roundTo(effectiveAssumptions.terminal_growth_pct) :
    dcf.growth_rate_pct;

  // Value-trap risk: a "cheap" stock whose cheapness reflects deteriorating
  // fundamentals rather than opportunity. Distinguish KNOWN-negative earnings/FCF
  // (a real red flag) from MISSING data (unknown — must not be treated as ≤0).
  const epsKnownNonPositive = dataset.latest.diluted_eps !== null && dataset.latest.diluted_eps <= 0;
  const fcfKnownNonPositive = dataset.latest.free_cash_flow !== null && dataset.latest.free_cash_flow <= 0;
  const fcfKnownNegative = dataset.latest.free_cash_flow !== null && dataset.latest.free_cash_flow < 0;

  // For sectors where FCF isn't primary (banks), don't penalise negative/absent FCF.
  const valueTrapRisk = profile.fcfMeaningful
    ? ((marginOfSafetyPct !== null &&
        marginOfSafetyPct > 0 &&
        (businessQuality.quality_score < 50 || financialHealth.health_score < 45) &&
        (epsKnownNonPositive || fcfKnownNonPositive)) ||
      (fcfKnownNegative && businessQuality.quality_score < 55))
    : (marginOfSafetyPct !== null &&
        marginOfSafetyPct > 0 &&
        epsKnownNonPositive &&
        businessQuality.quality_score < 50);

  let suggestedVerdict = determineVerdict({
    marginOfSafetyPct,
    healthScore: financialHealth.health_score,
    qualityScore: businessQuality.quality_score,
    severeBalanceSheetWeakness: sectorAwareSevereWeakness,
    valueTrapRisk,
  });

  // ── Red-flag verdict caps ──────────────────────────────────────────────────
  // A screen should not issue a Buy on peak-cycle earnings, a shrinking
  // business, an untradeable micro-cap, a freshly-listed company, or data too
  // thin to trust — no matter how large the modeled margin of safety. Cap at
  // WATCH and record why.
  // Missing-data notes gate the verdict; trend/insight notes added below are
  // informational and must not count toward the insufficient-data threshold.
  const missingDataNotes = buildDataQualityNotes(dataset, businessQuality);
  const dataQualityNotes = [
    ...missingDataNotes,
    ...(peakEarnings
      ? ["TTM earnings exceed 1.4× the 5-year average — likely cyclical peak; intrinsic value uses averaged earnings and the verdict is capped."]
      : []),
  ];

  const yearsListed =
    dataset.first_trade_date !== undefined
      ? (Date.now() - new Date(dataset.first_trade_date).getTime()) / (365.25 * 24 * 3600 * 1000)
      : null;

  // Dilution: annualised growth of the share count. Persistent issuance is how
  // "cheap" small-caps destroy per-share value even while the business grows.
  const sharesCagrPct = computeRevenueCagr(dataset.history_5y.shares_outstanding ?? []);
  if (sharesCagrPct !== null && sharesCagrPct <= -2) {
    dataQualityNotes.push(
      `Share count shrinking ${Math.abs(sharesCagrPct).toFixed(1)}%/yr — consistent buybacks support per-share value.`,
    );
  } else if (sharesCagrPct !== null && sharesCagrPct > 3 && sharesCagrPct <= 8) {
    dataQualityNotes.push(`Share count growing ${sharesCagrPct.toFixed(1)}%/yr — moderate dilution drag.`);
  }

  // Earnings quality: reported profits should be backed by operating cash.
  // A persistent gap (median accrual ratio > 30%) is the classic precursor to
  // write-downs and restatements. Skipped for financials, whose OCF embeds
  // float and deposit flows and is not comparable to net income.
  let poorEarningsQuality = false;
  if (profile.fcfMeaningful) {
    const niSeries = dataset.history_5y.net_income ?? [];
    const ocfSeries = dataset.history_5y.operating_cash_flow ?? [];
    const accrualGaps: number[] = [];
    for (let i = 0; i < niSeries.length; i++) {
      const ni = niSeries[i];
      const ocf = ocfSeries[i];
      if (ni !== null && ocf !== null && ni > 0) {
        accrualGaps.push((ni - ocf) / ni);
      }
    }
    if (accrualGaps.length >= 3) {
      const sorted = [...accrualGaps].sort((a, b) => a - b);
      const medianGap = sorted[Math.floor(sorted.length / 2)];
      if (medianGap > 0.3) {
        poorEarningsQuality = true;
        dataQualityNotes.push(
          "Net income persistently exceeds operating cash flow by >30% — accrual-heavy earnings; verify receivables, inventory, and capitalised costs.",
        );
      } else if (medianGap > 0.15) {
        dataQualityNotes.push("Net income runs ahead of operating cash flow — monitor earnings quality.");
      }
    }
  }

  // Dividend sustainability — decisive for utilities whose intrinsic value IS
  // the dividend stream (DDM); informational elsewhere.
  const payoutRatio =
    dataset.latest.dividend_per_share != null &&
    dataset.latest.dividend_per_share > 0 &&
    dataset.latest.diluted_eps !== null &&
    dataset.latest.diluted_eps > 0
      ? dataset.latest.dividend_per_share / dataset.latest.diluted_eps
      : null;
  const dividendUnsustainable =
    intrinsicMethod === "ddm" &&
    ((payoutRatio !== null && payoutRatio > 1.0) ||
      ((dataset.latest.dividend_per_share ?? 0) > 0 &&
        dataset.latest.diluted_eps !== null &&
        dataset.latest.diluted_eps <= 0));
  if (payoutRatio !== null && payoutRatio > 0.9 && !dividendUnsustainable) {
    dataQualityNotes.push(
      `Payout ratio ${(payoutRatio * 100).toFixed(0)}% — little retained buffer; dividend growth depends on earnings growth.`,
    );
  }

  const verdictCaps: string[] = [];
  if (peakEarnings) verdictCaps.push("peak_earnings");
  if (businessQuality.revenue_cagr_pct !== null && businessQuality.revenue_cagr_pct < -5) {
    verdictCaps.push("declining_revenue");
  }
  // Below ~100M (listing currency) bid/ask spreads and depth make screen prices unrealisable
  if (dataset.market_cap > 0 && dataset.market_cap < 100_000_000) {
    verdictCaps.push("microcap_illiquidity");
  }
  // Less than 2 years listed: no cycle history, lock-up overhangs, insiders sold at this price
  if (yearsListed !== null && yearsListed < 2) {
    verdictCaps.push("recent_ipo");
  }
  // Heavy issuance (>8%/yr) means per-share claims are melting under the holder
  if (sharesCagrPct !== null && sharesCagrPct > 8) {
    verdictCaps.push("heavy_dilution");
  }
  if (poorEarningsQuality) {
    verdictCaps.push("poor_earnings_quality");
  }
  if (dividendUnsustainable) {
    verdictCaps.push("unsustainable_dividend");
  }
  if (missingDataNotes.length >= 3) {
    verdictCaps.push("insufficient_data_quality");
  }
  if (verdictCaps.length > 0 && (suggestedVerdict === "STRONG_BUY" || suggestedVerdict === "BUY")) {
    suggestedVerdict = "WATCH";
  }

  // ── Triangulation gate for Strong Buy ──────────────────────────────────────
  // Top conviction requires a second, independent valuation method agreeing
  // within 30% of the primary. One model's opinion — however cheap it looks —
  // is not corroboration (large modeled MoS is more often model error than
  // market error).
  if (suggestedVerdict === "STRONG_BUY") {
    const corroborationPair: [number | null, number | null] =
      intrinsicMethod === "pbroe" ? [pbroe.pbroe_value_per_share, grahamForIntrinsic] :
      intrinsicMethod === "nav"   ? [reit.nav, reit.ffo_value] :
      intrinsicMethod === "ddm"   ? [ddm.ddm_value_per_share, dcfGrahamBlend] :
      [dcf.dcf_value_per_share, grahamForIntrinsic];
    const [a, b] = corroborationPair;
    const corroborated =
      a !== null && b !== null && a > 0 && b > 0 && Math.abs(a - b) / ((a + b) / 2) <= 0.3;
    if (!corroborated) {
      verdictCaps.push("uncorroborated_valuation");
      suggestedVerdict = "BUY";
    }
  }

  // Sector-aware composite weights
  const w = profile.compositeWeights;
  const compositeScore = clamp(
    valuationScore * w.valuation +
      financialHealth.health_score * w.health +
      businessQuality.quality_score * w.quality +
      mosScore * w.mos,
  );

  return {
    ticker: dataset.ticker,
    company_name: dataset.company_name,
    currency: dataset.currency,
    current_price: dataset.price,
    valuation: {
      ...valuationRatios,
      valuation_score: valuationScore,
      band: scoreBand(valuationScore),
    },
    financial_health: {
      ...financialHealth,
      severe_balance_sheet_weakness: sectorAwareSevereWeakness,
      band: scoreBand(financialHealth.health_score),
    },
    business_quality: {
      ...businessQuality,
      band: scoreBand(businessQuality.quality_score),
      revenue_cagr_pct: businessQuality.revenue_cagr_pct,
      operating_margin_trend: businessQuality.operating_margin_trend,
    },
    intrinsic_value: {
      dcf_value_per_share: dcf.dcf_value_per_share,
      // Report the Graham value actually used in the blend. When earnings are at
      // a cyclical peak this is the averaged-earnings figure, not the raw one —
      // reporting the raw number would contradict the base case shown alongside it.
      graham_value_per_share: grahamForIntrinsic,
      nav_value_per_share: navValuePerShare,
      ddm_value_per_share: ddm.ddm_value_per_share,
      pbroe_value_per_share: pbroe.pbroe_value_per_share,
      normalized_roe_pct: pbroe.normalized_roe_pct,
      blended_intrinsic_value_per_share: blendedIntrinsicValuePerShare,
      intrinsic_method: intrinsicMethod,
      margin_of_safety_pct: marginOfSafetyPct,
      growth_rate_pct: growthRatePct,
      conservative_fcf_basis: dcf.conservative_fcf_basis,
    },
    composite_score: roundTo(compositeScore, 0) ?? 0,
    score_band: scoreBand(compositeScore),
    suggested_verdict: suggestedVerdict,
    diagnostics: {
      margin_of_safety_score: roundTo(mosScore, 0) ?? 0,
      value_trap_risk: valueTrapRisk,
      peak_earnings: peakEarnings,
      verdict_caps: verdictCaps,
      security_type: securityType,
      data_quality_notes: dataQualityNotes,
      assumptions: effectiveAssumptions,
    },
  };
}
