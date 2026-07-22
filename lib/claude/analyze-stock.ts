import { getFinanceProvider } from "@/lib/finance/mock-provider";
import { FinanceProviderError } from "@/lib/finance/provider";
import { calculateValueMetrics } from "@/lib/finance/scoring";
import { buildVerdictExplanation } from "@/lib/finance/verdict-explanation";
import { describeValuationGap } from "@/lib/finance/valuation-gap";
import { resolveSecurity } from "@/lib/finance/exchanges";
import type { ValueMetricsResult } from "@/types/finance";
import type { ValueInvestingAnalysis, VerdictLabel } from "@/types/analysis";

export type AnalysisProgressCallback = (stage: string) => void;

// ─── text generators ────────────────────────────────────────────────────────

function fmt(n: number | null, decimals = 2, suffix = ""): string {
  if (n === null) return "N/A";
  return n.toFixed(decimals) + suffix;
}

function fmtPct(n: number | null): string {
  return fmt(n, 1, "%");
}

function fmtX(n: number | null): string {
  return fmt(n, 1, "x");
}

function valuationSummary(m: ValueMetricsResult): string {
  const { pe, pb, ps, ev_ebitda, price_fcf, graham_number } = m.valuation;
  const price = m.current_price;
  const parts: string[] = [];

  if (pe !== null) parts.push(`P/E of ${fmtX(pe)}`);
  if (pb !== null) parts.push(`P/B of ${fmtX(pb)}`);
  if (ev_ebitda !== null) parts.push(`EV/EBITDA of ${fmtX(ev_ebitda)}`);
  if (price_fcf !== null) parts.push(`Price/FCF of ${fmtX(price_fcf)}`);

  const grahamNote =
    graham_number !== null
      ? ` The Graham Number is ${fmt(graham_number, 2)} vs. current price of ${fmt(price, 2)}, implying the stock is ${price <= graham_number ? "within" : "above"} Graham's conservative valuation range.`
      : "";

  const base =
    parts.length > 0
      ? `${m.company_name} trades at ${parts.join(", ")}.`
      : `Limited valuation multiples available for ${m.company_name}.`;

  return base + grahamNote + ` Valuation score: ${m.valuation.valuation_score}/100 (${m.valuation.band}).`;
}

function healthSummary(m: ValueMetricsResult): string {
  const { debt_equity, current_ratio, interest_coverage, health_score, band } = m.financial_health;
  const parts: string[] = [];

  if (debt_equity !== null) parts.push(`debt/equity of ${fmt(debt_equity, 2)}`);
  if (current_ratio !== null) parts.push(`current ratio of ${fmt(current_ratio, 2)}`);
  if (interest_coverage !== null) parts.push(`interest coverage of ${fmtX(interest_coverage)}`);

  const base = parts.length > 0
    ? `Balance sheet shows ${parts.join(", ")}.`
    : "Balance sheet data is limited.";

  const weakness = m.financial_health.severe_balance_sheet_weakness
    ? " Severe balance sheet weakness detected — elevated leverage or inadequate liquidity."
    : "";

  return `${base}${weakness} Health score: ${Math.round(health_score)}/100 (${band}).`;
}

function qualitySummary(m: ValueMetricsResult): string {
  const { roe_pct, roic_pct, gross_margin_pct, operating_margin_pct, quality_score, moat_score } = m.business_quality;
  const parts: string[] = [];

  if (gross_margin_pct !== null) parts.push(`gross margin ${fmtPct(gross_margin_pct)}`);
  if (operating_margin_pct !== null) parts.push(`operating margin ${fmtPct(operating_margin_pct)}`);
  if (roe_pct !== null) parts.push(`ROE ${fmtPct(roe_pct)}`);
  if (roic_pct !== null) parts.push(`ROIC ${fmtPct(roic_pct)}`);

  const base = parts.length > 0
    ? `Business metrics: ${parts.join(", ")}.`
    : "Profitability metrics are limited.";

  const moat = moat_score >= 70 ? " Margin and return trends suggest a durable competitive advantage."
    : moat_score >= 50 ? " Competitive positioning appears moderate."
    : " Limited evidence of a durable moat.";

  return `${base}${moat} Quality score: ${Math.round(quality_score)}/100 (${m.business_quality.band}).`;
}

function intrinsicValueSummary(m: ValueMetricsResult): string {
  const {
    dcf_value_per_share,
    graham_value_per_share,
    nav_value_per_share,
    ddm_value_per_share,
    blended_intrinsic_value_per_share,
    intrinsic_method,
    margin_of_safety_pct,
  } = m.intrinsic_value;
  const price = m.current_price;

  if (blended_intrinsic_value_per_share === null) {
    return "Intrinsic value could not be estimated due to insufficient earnings or cash flow data.";
  }

  const gap = describeValuationGap(margin_of_safety_pct);
  const mosStr =
    gap.kind === "margin"
      ? `a margin of safety of ${gap.display}`
      : gap.kind === "premium"
        ? `a ${gap.display} premium to estimated value`
        : gap.magnitudePct === null
          ? "an indeterminate margin of safety"
          : "a price at roughly estimated value";

  // Each sector is anchored to the valuation model that best fits its economics.
  let basis: string;
  if (intrinsic_method === "nav") {
    basis = `Net asset value (book value ≈ NAV) estimate: ${fmt(nav_value_per_share ?? blended_intrinsic_value_per_share, 2)} — the appropriate anchor for property businesses and closed-end funds/investment trusts (margin of safety = discount to NAV)`;
  } else if (intrinsic_method === "ddm") {
    basis = `Dividend-discount estimate: ${fmt(ddm_value_per_share, 2)} — the appropriate anchor for regulated, dividend-centric utilities`;
  } else if (intrinsic_method === "pbroe") {
    basis = `Justified P/B estimate: ${fmt(m.intrinsic_value.pbroe_value_per_share, 2)} (cycle-average ROE ${fmtPct(m.intrinsic_value.normalized_roe_pct)}) — the appropriate anchor for banks and insurers, where reported FCF is float rather than owner earnings`;
  } else {
    basis = `DCF estimate: ${fmt(dcf_value_per_share, 2)} · Graham Number: ${fmt(graham_value_per_share, 2)}`;
  }

  return (
    `${basis} · Intrinsic value: ${fmt(blended_intrinsic_value_per_share, 2)} vs. price ${fmt(price, 2)}, implying ${mosStr}.`
  );
}

function buildBullCase(m: ValueMetricsResult): string[] {
  const bulls: string[] = [];
  const { latest } = m as unknown as { latest: { gross_margin_pct: number | null; roic_pct: number | null; free_cash_flow: number | null } };
  const iv = m.intrinsic_value;
  const bq = m.business_quality;
  const fh = m.financial_health;

  if (iv.margin_of_safety_pct !== null && iv.margin_of_safety_pct > 20)
    bulls.push(`Stock appears undervalued with a ${fmtPct(iv.margin_of_safety_pct)} margin of safety vs. blended intrinsic value.`);
  if (bq.quality_score >= 65)
    bulls.push(`High business quality score (${Math.round(bq.quality_score)}/100) with strong margins and returns on capital.`);
  if (fh.health_score >= 65)
    bulls.push(`Solid balance sheet with manageable leverage and adequate liquidity.`);
  if (bq.moat_score >= 65)
    bulls.push(`Margin and ROIC stability suggest a durable competitive advantage.`);
  if (m.valuation.valuation_score >= 65)
    bulls.push(`Attractive valuation multiples relative to earnings, book value, and cash flow.`);

  return bulls.length > 0 ? bulls : ["Deterministic scores indicate some positive attributes — review individual metrics for detail."];
}

function buildBearCase(m: ValueMetricsResult): string[] {
  const bears: string[] = [];
  const iv = m.intrinsic_value;
  const bq = m.business_quality;
  const fh = m.financial_health;

  if (iv.margin_of_safety_pct !== null && iv.margin_of_safety_pct < 0)
    bears.push(`Stock appears overvalued by ${fmtPct(Math.abs(iv.margin_of_safety_pct))} vs. blended intrinsic value.`);
  if (bq.quality_score < 50)
    bears.push(`Below-average business quality (${Math.round(bq.quality_score)}/100) — thin margins or weak capital returns.`);
  if (fh.health_score < 50)
    bears.push(`Balance sheet concerns — elevated leverage or weak liquidity.`);
  if (fh.severe_balance_sheet_weakness)
    bears.push("Severe balance sheet weakness flagged — high debt/equity or current ratio below 1.");
  if (m.valuation.valuation_score < 40)
    bears.push("Valuation multiples are elevated relative to fundamentals.");

  return bears.length > 0 ? bears : ["No critical weaknesses identified from deterministic scoring — validate with qualitative research."];
}

function buildRedFlags(m: ValueMetricsResult): string[] {
  const flags: string[] = [];
  const fh = m.financial_health;
  const bq = m.business_quality;

  if (fh.severe_balance_sheet_weakness) flags.push("Severe balance sheet weakness — high D/E or current ratio < 1.");
  if (bq.weak_business_profile) flags.push("Weak business profile — ROIC and operating margin both below threshold.");
  if (m.diagnostics.value_trap_risk) flags.push("Value trap risk: cheap price may reflect deteriorating fundamentals, not opportunity.");
  if (fh.interest_coverage !== null && fh.interest_coverage < 2) flags.push(`Low interest coverage (${fmtX(fh.interest_coverage)}) — debt service risk.`);

  return flags;
}

function buildKeyRisk(m: ValueMetricsResult): string {
  if (m.diagnostics.value_trap_risk) return "Value trap risk: low valuation may reflect structural deterioration rather than a buying opportunity.";
  if (m.financial_health.severe_balance_sheet_weakness) return "Balance sheet fragility — elevated leverage limits resilience in a downturn.";
  if (m.business_quality.weak_business_profile) return "Weak business economics — thin margins and poor capital returns reduce long-term compounding potential.";
  if (m.intrinsic_value.margin_of_safety_pct !== null && m.intrinsic_value.margin_of_safety_pct < -20) return "Overvaluation risk — limited margin of safety leaves little room for error.";
  return "Execution risk — future results may diverge from historical trends used in the deterministic model.";
}

function buildOneLineVerdict(m: ValueMetricsResult): string {
  const label = m.suggested_verdict;
  const gap = describeValuationGap(m.intrinsic_value.margin_of_safety_pct);
  // Never render a negative "margin of safety" — above estimated value is a premium.
  const mosStr =
    gap.kind === "margin"
      ? ` (${gap.display} margin of safety)`
      : gap.kind === "premium"
        ? ` (${gap.display} premium to estimated value)`
        : "";
  const map: Record<VerdictLabel, string> = {
    STRONG_BUY: `${m.company_name} is attractively priced with strong fundamentals${mosStr}.`,
    BUY: `${m.company_name} offers a reasonable margin of safety with solid quality${mosStr}.`,
    WATCH: `${m.company_name} has mixed signals — worth monitoring for a better entry${mosStr}.`,
    HOLD: `${m.company_name} is fairly valued; neither compelling nor alarming${mosStr}.`,
    AVOID: `${m.company_name} does not meet value investing criteria at the current price${mosStr}.`,
  };
  return map[label] ?? `Composite score: ${m.composite_score}/100.`;
}

function buildReasoning(m: ValueMetricsResult): string {
  return (
    `Composite score ${m.composite_score}/100 (${m.score_band}). ` +
    `Valuation ${m.valuation.valuation_score}/100, ` +
    `health ${Math.round(m.financial_health.health_score)}/100, ` +
    `quality ${Math.round(m.business_quality.quality_score)}/100. ` +
    (m.intrinsic_value.margin_of_safety_pct !== null
      ? `Margin of safety: ${fmtPct(m.intrinsic_value.margin_of_safety_pct)}. `
      : "Intrinsic value not estimable. ") +
    `Data quality notes: ${m.diagnostics.data_quality_notes.join("; ") || "none"}.`
  );
}

function confidenceFromScores(m: ValueMetricsResult): number {
  const notes = m.diagnostics.data_quality_notes.length;
  const base = notes === 0 ? 75 : notes === 1 ? 65 : notes === 2 ? 55 : 45;
  return Math.min(85, base + Math.round(m.composite_score * 0.1));
}

// ─── main export ─────────────────────────────────────────────────────────────

export async function analyzeTicker(
  ticker: string,
  onProgress?: AnalysisProgressCallback,
): Promise<ValueInvestingAnalysis> {
  onProgress?.("Fetching financial data...");
  const provider = getFinanceProvider();
  const dataset = await provider.getCompanySnapshot(ticker);

  onProgress?.("Calculating intrinsic value...");
  const m = calculateValueMetrics(dataset, undefined, dataset.sector);

  onProgress?.("Building analysis...");

  const security = resolveSecurity(m.ticker);

  return {
    ticker: m.ticker,
    exchange: security.exchange,
    sector: dataset.sector,
    company_name: m.company_name,
    currency: m.currency,
    current_price: m.current_price,
    analysis_date: new Date().toISOString(),
    valuation: {
      pe: m.valuation.pe,
      pb: m.valuation.pb,
      ps: m.valuation.ps,
      ev_ebitda: m.valuation.ev_ebitda,
      price_fcf: m.valuation.price_fcf,
      graham_number: m.valuation.graham_number,
      valuation_score: m.valuation.valuation_score,
      verdict: m.valuation.band,
      summary: valuationSummary(m),
    },
    financial_health: {
      debt_equity: m.financial_health.debt_equity,
      current_ratio: m.financial_health.current_ratio,
      interest_coverage: m.financial_health.interest_coverage,
      fcf_consistency_score: m.financial_health.fcf_consistency_score,
      health_score: m.financial_health.health_score,
      verdict: m.financial_health.band,
      summary: healthSummary(m),
    },
    business_quality: {
      roe_pct: dataset.latest.roe_pct,
      roic_pct: dataset.latest.roic_pct,
      gross_margin_pct: dataset.latest.gross_margin_pct,
      operating_margin_pct: dataset.latest.operating_margin_pct,
      revenue_stability_score: m.business_quality.revenue_stability_score,
      moat_score: m.business_quality.moat_score,
      quality_score: m.business_quality.quality_score,
      verdict: m.business_quality.band,
      summary: qualitySummary(m),
    },
    intrinsic_value: {
      dcf_value_per_share: m.intrinsic_value.dcf_value_per_share,
      graham_value_per_share: m.intrinsic_value.graham_value_per_share,
      blended_intrinsic_value_per_share: m.intrinsic_value.blended_intrinsic_value_per_share,
      margin_of_safety_pct: m.intrinsic_value.margin_of_safety_pct,
      summary: intrinsicValueSummary(m),
    },
    thesis: {
      bull_case: buildBullCase(m),
      bear_case: buildBearCase(m),
      red_flags: buildRedFlags(m),
      key_risk: buildKeyRisk(m),
    },
    final_verdict: {
      label: m.suggested_verdict,
      confidence_pct: confidenceFromScores(m),
      one_line_verdict: buildOneLineVerdict(m),
      reasoning: buildReasoning(m),
    },
    verdict_explanation: buildVerdictExplanation(m),
    sources: [
      {
        title: "Yahoo Finance (yahoo-finance2)",
        url: "https://finance.yahoo.com",
        used_for: "Financial statements, price data, and 5-year history",
      },
    ],
  };
}

export { FinanceProviderError };

export class ToolValidationError extends Error {
  readonly statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "ToolValidationError";
    this.statusCode = statusCode;
  }
}
