/**
 * Single source of truth for the analysis's generated prose.
 *
 * These templates were previously inline in `analyze-stock.ts`, producing
 * English strings that were then stored. They now live here, parameterised by a
 * translator, and are called in two places:
 *   • at analysis time (English translator) to populate the stored strings, so
 *     history one-liners, CSV export and the screener keep working unchanged;
 *   • at display time (viewer's locale) to render the result page in French or
 *     English from the numbers the analysis already carries.
 *
 * Because both callers run the same functions, the English output cannot drift
 * from what is stored, and the French output is a faithful, deterministic
 * translation of it. A handful of inputs (three risk flags, the per-model
 * intrinsic values) are not present on analyses saved before this existed;
 * those degrade gracefully — see `proseModelFromAnalysis`.
 */
import { scoreBand } from "@/lib/finance/ratios";
import { describeValuationGap } from "@/lib/finance/valuation-gap";
import { translateDataQualityNote } from "@/lib/finance/data-notes";
import type { Translator } from "@/lib/i18n/translate";
import type { ValueMetricsResult } from "@/types/finance";
import type { ValueInvestingAnalysis, VerdictLabel } from "@/types/analysis";

export type IntrinsicMethod = "dcf" | "nav" | "ddm" | "pbroe";

/** The minimal, locale-neutral input every generator reads from. */
export interface ProseModel {
  companyName: string;
  currentPrice: number;
  verdict: VerdictLabel;
  compositeScore: number;
  /** scoreBand key for the composite; carried (not re-derived) to match the engine exactly. */
  compositeBandKey: string;
  valuation: {
    pe: number | null;
    pb: number | null;
    ps: number | null;
    ev_ebitda: number | null;
    price_fcf: number | null;
    graham_number: number | null;
    valuation_score: number;
  };
  health: {
    debt_equity: number | null;
    current_ratio: number | null;
    interest_coverage: number | null;
    health_score: number;
  };
  quality: {
    roe_pct: number | null;
    roic_pct: number | null;
    gross_margin_pct: number | null;
    operating_margin_pct: number | null;
    quality_score: number;
    moat_score: number;
  };
  intrinsic: {
    dcf_value_per_share: number | null;
    graham_value_per_share: number | null;
    nav_value_per_share: number | null;
    ddm_value_per_share: number | null;
    pbroe_value_per_share: number | null;
    normalized_roe_pct: number | null;
    blended_intrinsic_value_per_share: number | null;
    margin_of_safety_pct: number | null;
    method: IntrinsicMethod;
  };
  flags: {
    severeBalanceSheet: boolean;
    weakBusiness: boolean;
    valueTrap: boolean;
  };
  /** Engine-generated notes, in their stored (English) form. */
  dataQualityNotes: string[];
}

// ─── number formatting (identical to the original inline helpers) ────────────

function fmt(n: number | null, decimals = 2, suffix = ""): string {
  if (n === null) return "N/A";
  return n.toFixed(decimals) + suffix;
}
const fmtPct = (n: number | null) => fmt(n, 1, "%");
const fmtX = (n: number | null) => fmt(n, 1, "x");

/** Localised band word for the `(elite)` parenthetical; EN reproduces the key. */
const band = (score: number, t: Translator) => t(`bands.${scoreBand(score)}`);

const BAND_KEYS = new Set(["elite", "strong", "mixed", "weak", "poor"]);

/** Localise a stored band label (the `verdict` on each evidence section), safely. */
export function translateBand(value: string, t: Translator): string {
  return BAND_KEYS.has(value) ? t(`bands.${value}`) : value;
}

const GICS_SECTORS = new Set([
  "Energy", "Materials", "Industrials", "Consumer Discretionary", "Consumer Staples",
  "Health Care", "Financials", "Information Technology", "Communication Services",
  "Utilities", "Real Estate",
]);

/** Localise a GICS sector name; unknown/absent sectors pass through unchanged. */
export function translateSector(sector: string | null | undefined, t: Translator): string {
  if (!sector) return "—";
  return GICS_SECTORS.has(sector) ? t(`sectors.${sector}`) : sector;
}

// ─── generators ──────────────────────────────────────────────────────────────

export function valuationSummary(m: ProseModel, t: Translator): string {
  const { pe, pb, ev_ebitda, price_fcf, graham_number, valuation_score } = m.valuation;
  const parts: string[] = [];
  if (pe !== null) parts.push(t("prose.val.pe", { v: fmtX(pe) }));
  if (pb !== null) parts.push(t("prose.val.pb", { v: fmtX(pb) }));
  if (ev_ebitda !== null) parts.push(t("prose.val.evEbitda", { v: fmtX(ev_ebitda) }));
  if (price_fcf !== null) parts.push(t("prose.val.priceFcf", { v: fmtX(price_fcf) }));

  const grahamNote =
    graham_number !== null
      ? t("prose.val.grahamNote", {
          graham: fmt(graham_number, 2),
          price: fmt(m.currentPrice, 2),
          range: graham_number >= m.currentPrice ? t("prose.val.within") : t("prose.val.above"),
        })
      : "";

  const base =
    parts.length > 0
      ? t("prose.val.base", { company: m.companyName, parts: parts.join(", ") })
      : t("prose.val.baseNone", { company: m.companyName });

  return base + grahamNote + t("prose.val.score", { score: valuation_score, band: band(valuation_score, t) });
}

export function healthSummary(m: ProseModel, t: Translator): string {
  const { debt_equity, current_ratio, interest_coverage, health_score } = m.health;
  const parts: string[] = [];
  if (debt_equity !== null) parts.push(t("prose.health.de", { v: fmt(debt_equity, 2) }));
  if (current_ratio !== null) parts.push(t("prose.health.cr", { v: fmt(current_ratio, 2) }));
  if (interest_coverage !== null) parts.push(t("prose.health.ic", { v: fmtX(interest_coverage) }));

  const base =
    parts.length > 0 ? t("prose.health.base", { parts: parts.join(", ") }) : t("prose.health.baseNone");
  const weakness = m.flags.severeBalanceSheet ? t("prose.health.weakness") : "";

  return base + weakness + t("prose.health.score", { score: Math.round(health_score), band: band(health_score, t) });
}

export function qualitySummary(m: ProseModel, t: Translator): string {
  const { roe_pct, roic_pct, gross_margin_pct, operating_margin_pct, quality_score, moat_score } = m.quality;
  const parts: string[] = [];
  if (gross_margin_pct !== null) parts.push(t("prose.quality.gm", { v: fmtPct(gross_margin_pct) }));
  if (operating_margin_pct !== null) parts.push(t("prose.quality.om", { v: fmtPct(operating_margin_pct) }));
  if (roe_pct !== null) parts.push(t("prose.quality.roe", { v: fmtPct(roe_pct) }));
  if (roic_pct !== null) parts.push(t("prose.quality.roic", { v: fmtPct(roic_pct) }));

  const base =
    parts.length > 0 ? t("prose.quality.base", { parts: parts.join(", ") }) : t("prose.quality.baseNone");
  const moat =
    moat_score >= 70 ? t("prose.quality.moatHigh") : moat_score >= 50 ? t("prose.quality.moatMid") : t("prose.quality.moatLow");

  return base + moat + t("prose.quality.score", { score: Math.round(quality_score), band: band(quality_score, t) });
}

export function intrinsicValueSummary(m: ProseModel, t: Translator): string {
  const iv = m.intrinsic;
  if (iv.blended_intrinsic_value_per_share === null) return t("prose.iv.none");

  const gap = describeValuationGap(iv.margin_of_safety_pct);
  const mosStr =
    gap.kind === "margin"
      ? t("prose.iv.mosMargin", { v: gap.display })
      : gap.kind === "premium"
        ? t("prose.iv.mosPremium", { v: gap.display })
        : gap.magnitudePct === null
          ? t("prose.iv.mosIndeterminate")
          : t("prose.iv.mosAtValue");

  let basis: string;
  if (iv.method === "nav") {
    basis = t("prose.iv.basisNav", { v: fmt(iv.nav_value_per_share ?? iv.blended_intrinsic_value_per_share, 2) });
  } else if (iv.method === "ddm") {
    basis = t("prose.iv.basisDdm", { v: fmt(iv.ddm_value_per_share, 2) });
  } else if (iv.method === "pbroe") {
    basis = t("prose.iv.basisPbroe", { v: fmt(iv.pbroe_value_per_share, 2), roe: fmtPct(iv.normalized_roe_pct) });
  } else {
    basis = t("prose.iv.basisDcf", { dcf: fmt(iv.dcf_value_per_share, 2), graham: fmt(iv.graham_value_per_share, 2) });
  }

  return t("prose.iv.assembled", {
    basis,
    iv: fmt(iv.blended_intrinsic_value_per_share, 2),
    price: fmt(m.currentPrice, 2),
    mos: mosStr,
  });
}

export function buildBullCase(m: ProseModel, t: Translator): string[] {
  const bulls: string[] = [];
  const mos = m.intrinsic.margin_of_safety_pct;
  if (mos !== null && mos > 20) bulls.push(t("prose.bull.undervalued", { v: fmtPct(mos) }));
  if (m.quality.quality_score >= 65) bulls.push(t("prose.bull.quality", { score: Math.round(m.quality.quality_score) }));
  if (m.health.health_score >= 65) bulls.push(t("prose.bull.health"));
  if (m.quality.moat_score >= 65) bulls.push(t("prose.bull.moat"));
  if (m.valuation.valuation_score >= 65) bulls.push(t("prose.bull.multiples"));
  return bulls.length > 0 ? bulls : [t("prose.bull.fallback")];
}

export function buildBearCase(m: ProseModel, t: Translator): string[] {
  const bears: string[] = [];
  const mos = m.intrinsic.margin_of_safety_pct;
  if (mos !== null && mos < 0) bears.push(t("prose.bear.overvalued", { v: fmtPct(Math.abs(mos)) }));
  if (m.quality.quality_score < 50) bears.push(t("prose.bear.quality", { score: Math.round(m.quality.quality_score) }));
  if (m.health.health_score < 50) bears.push(t("prose.bear.health"));
  if (m.flags.severeBalanceSheet) bears.push(t("prose.bear.severe"));
  if (m.valuation.valuation_score < 40) bears.push(t("prose.bear.multiples"));
  return bears.length > 0 ? bears : [t("prose.bear.fallback")];
}

export function buildRedFlags(m: ProseModel, t: Translator): string[] {
  const flags: string[] = [];
  if (m.flags.severeBalanceSheet) flags.push(t("prose.flag.severe"));
  if (m.flags.weakBusiness) flags.push(t("prose.flag.weak"));
  if (m.flags.valueTrap) flags.push(t("prose.flag.valueTrap"));
  if (m.health.interest_coverage !== null && m.health.interest_coverage < 2)
    flags.push(t("prose.flag.lowCoverage", { v: fmtX(m.health.interest_coverage) }));
  return flags;
}

export function buildKeyRisk(m: ProseModel, t: Translator): string {
  if (m.flags.valueTrap) return t("prose.risk.valueTrap");
  if (m.flags.severeBalanceSheet) return t("prose.risk.severe");
  if (m.flags.weakBusiness) return t("prose.risk.weak");
  if (m.intrinsic.margin_of_safety_pct !== null && m.intrinsic.margin_of_safety_pct < -20) return t("prose.risk.overvalued");
  return t("prose.risk.execution");
}

export function buildOneLineVerdict(m: ProseModel, t: Translator): string {
  const gap = describeValuationGap(m.intrinsic.margin_of_safety_pct);
  const mosStr =
    gap.kind === "margin"
      ? t("prose.oneLine.mosMargin", { v: gap.display })
      : gap.kind === "premium"
        ? t("prose.oneLine.mosPremium", { v: gap.display })
        : "";
  return t(`prose.oneLine.${m.verdict}`, { company: m.companyName, mos: mosStr });
}

export function buildReasoning(m: ProseModel, t: Translator): string {
  const notes =
    m.dataQualityNotes.length > 0
      ? m.dataQualityNotes.map((n) => translateDataQualityNote(n, t)).join("; ")
      : t("prose.reasoning.none");
  const mos =
    m.intrinsic.margin_of_safety_pct !== null
      ? t("prose.reasoning.mos", { v: fmtPct(m.intrinsic.margin_of_safety_pct) })
      : t("prose.reasoning.mosNone");
  return t("prose.reasoning.body", {
    score: m.compositeScore,
    band: t(`bands.${m.compositeBandKey}`),
    valuation: m.valuation.valuation_score,
    health: Math.round(m.health.health_score),
    quality: Math.round(m.quality.quality_score),
    mos,
    notes,
  });
}

/** Everything the result page renders, generated in one pass. */
export interface AnalysisProse {
  valuationSummary: string;
  healthSummary: string;
  qualitySummary: string;
  intrinsicSummary: string;
  bullCase: string[];
  bearCase: string[];
  redFlags: string[];
  keyRisk: string;
  oneLineVerdict: string;
  reasoning: string;
}

export function analysisProse(m: ProseModel, t: Translator): AnalysisProse {
  return {
    valuationSummary: valuationSummary(m, t),
    healthSummary: healthSummary(m, t),
    qualitySummary: qualitySummary(m, t),
    intrinsicSummary: intrinsicValueSummary(m, t),
    bullCase: buildBullCase(m, t),
    bearCase: buildBearCase(m, t),
    redFlags: buildRedFlags(m, t),
    keyRisk: buildKeyRisk(m, t),
    oneLineVerdict: buildOneLineVerdict(m, t),
    reasoning: buildReasoning(m, t),
  };
}

// ─── adapters ────────────────────────────────────────────────────────────────

/** At analysis time — from the rich engine result. */
export function proseModelFromMetrics(m: ValueMetricsResult): ProseModel {
  return {
    companyName: m.company_name,
    currentPrice: m.current_price,
    verdict: m.suggested_verdict,
    compositeScore: m.composite_score,
    compositeBandKey: m.score_band,
    valuation: {
      pe: m.valuation.pe,
      pb: m.valuation.pb,
      ps: m.valuation.ps,
      ev_ebitda: m.valuation.ev_ebitda,
      price_fcf: m.valuation.price_fcf,
      graham_number: m.valuation.graham_number,
      valuation_score: m.valuation.valuation_score,
    },
    health: {
      debt_equity: m.financial_health.debt_equity,
      current_ratio: m.financial_health.current_ratio,
      interest_coverage: m.financial_health.interest_coverage,
      health_score: m.financial_health.health_score,
    },
    quality: {
      roe_pct: m.business_quality.roe_pct,
      roic_pct: m.business_quality.roic_pct,
      gross_margin_pct: m.business_quality.gross_margin_pct,
      operating_margin_pct: m.business_quality.operating_margin_pct,
      quality_score: m.business_quality.quality_score,
      moat_score: m.business_quality.moat_score,
    },
    intrinsic: {
      dcf_value_per_share: m.intrinsic_value.dcf_value_per_share,
      graham_value_per_share: m.intrinsic_value.graham_value_per_share,
      nav_value_per_share: m.intrinsic_value.nav_value_per_share,
      ddm_value_per_share: m.intrinsic_value.ddm_value_per_share,
      pbroe_value_per_share: m.intrinsic_value.pbroe_value_per_share,
      normalized_roe_pct: m.intrinsic_value.normalized_roe_pct,
      blended_intrinsic_value_per_share: m.intrinsic_value.blended_intrinsic_value_per_share,
      margin_of_safety_pct: m.intrinsic_value.margin_of_safety_pct,
      method: m.intrinsic_value.intrinsic_method,
    },
    flags: {
      severeBalanceSheet: m.financial_health.severe_balance_sheet_weakness,
      weakBusiness: m.business_quality.weak_business_profile,
      valueTrap: m.diagnostics.value_trap_risk,
    },
    dataQualityNotes: m.diagnostics.data_quality_notes,
  };
}

/**
 * At display time — from the stored analysis. The three risk flags and the
 * per-model intrinsic values are optional on older saves: flags are recovered
 * from `verdict_explanation` where possible and otherwise default off, and the
 * intrinsic basis falls back to the DCF/Graham figures that are always stored.
 */
export function proseModelFromAnalysis(a: ValueInvestingAnalysis): ProseModel {
  const iv = a.intrinsic_value;
  const gates = a.verdict_explanation?.hard_gates ?? [];
  const gateNamed = (name: string) => gates.some((g) => g.name === name);

  // Prefer the explicitly stored diagnostics; fall back to what the verdict
  // explanation encodes (a "fail" with score ≥ 55 can only be a flag, since the
  // band thresholds put anything below 55 at "fail" on score alone).
  const fhCheck = a.verdict_explanation?.checks.find((c) => c.name === "Financial health");
  const bqCheck = a.verdict_explanation?.checks.find((c) => c.name === "Business quality");

  const severe =
    a.diagnostics?.severe_balance_sheet_weakness ??
    (gateNamed("Balance-sheet safety") ||
      (fhCheck?.status === "fail" && Math.round(a.financial_health.health_score) >= 55));
  const weak =
    a.diagnostics?.weak_business_profile ??
    (bqCheck?.status === "fail" && Math.round(a.business_quality.quality_score) >= 55);
  const valueTrap = a.diagnostics?.value_trap_risk ?? gateNamed("Value-trap risk");

  const method: IntrinsicMethod = iv.intrinsic_method ?? a.verdict_explanation?.valuation_method ?? "dcf";
  const composite = a.verdict_explanation?.overall_score ?? Math.round(
    (a.valuation.valuation_score + a.financial_health.health_score + a.business_quality.quality_score) / 3,
  );

  return {
    companyName: a.company_name,
    currentPrice: a.current_price,
    verdict: a.final_verdict.label,
    compositeScore: composite,
    compositeBandKey: scoreBand(composite),
    valuation: {
      pe: a.valuation.pe,
      pb: a.valuation.pb,
      ps: a.valuation.ps,
      ev_ebitda: a.valuation.ev_ebitda,
      price_fcf: a.valuation.price_fcf,
      graham_number: a.valuation.graham_number,
      valuation_score: a.valuation.valuation_score,
    },
    health: {
      debt_equity: a.financial_health.debt_equity,
      current_ratio: a.financial_health.current_ratio,
      interest_coverage: a.financial_health.interest_coverage,
      health_score: a.financial_health.health_score,
    },
    quality: {
      roe_pct: a.business_quality.roe_pct,
      roic_pct: a.business_quality.roic_pct,
      gross_margin_pct: a.business_quality.gross_margin_pct,
      operating_margin_pct: a.business_quality.operating_margin_pct,
      quality_score: a.business_quality.quality_score,
      moat_score: a.business_quality.moat_score,
    },
    intrinsic: {
      dcf_value_per_share: iv.dcf_value_per_share,
      graham_value_per_share: iv.graham_value_per_share,
      nav_value_per_share: iv.nav_value_per_share ?? null,
      ddm_value_per_share: iv.ddm_value_per_share ?? null,
      pbroe_value_per_share: iv.pbroe_value_per_share ?? null,
      normalized_roe_pct: iv.normalized_roe_pct ?? null,
      blended_intrinsic_value_per_share: iv.blended_intrinsic_value_per_share,
      margin_of_safety_pct: iv.margin_of_safety_pct,
      method,
    },
    flags: { severeBalanceSheet: !!severe, weakBusiness: !!weak, valueTrap: !!valueTrap },
    dataQualityNotes: a.data_status?.data_quality_notes ?? [],
  };
}
