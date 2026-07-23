export type VerdictLabel = "STRONG_BUY" | "BUY" | "WATCH" | "HOLD" | "AVOID";

export type CheckStatus = "pass" | "warn" | "fail";

export interface VerdictCheck {
  name: string;
  status: CheckStatus;
  /** Component score out of 100 where one applies */
  score: number | null;
  detail: string;
}

/**
 * The authoritative record of how a verdict was reached. Built once by
 * `buildVerdictExplanation`; UI renders it rather than re-deriving verdicts.
 */
export interface VerdictExplanation {
  final_verdict: VerdictLabel;
  overall_score: number;
  valuation_method: "dcf" | "nav" | "ddm" | "pbroe";
  valuation_method_label: string;
  checks: VerdictCheck[];
  /** Gates that override the composite score entirely */
  hard_gates: { name: string; detail: string }[];
  explanation: string;
}

export interface AnalysisSource {
  title: string;
  url: string;
  used_for: string;
}

/** The valuation-model inputs actually used, for auditability. */
export interface DataStatusAssumptions {
  discount_rate_pct: number;
  terminal_growth_pct: number;
  max_growth_cap_pct: number;
  use_conservative_fcf_basis: boolean;
}

/**
 * Auditable provenance for a saved analysis — what the numbers are based on and
 * when. Replaces vague "live data" claims with a specific, checkable record.
 *
 * Optional on `ValueInvestingAnalysis`: analyses saved before this existed have
 * none, and the mock provider supplies only what its fixtures carry, so every
 * field the UI renders must tolerate absence.
 */
export interface DataStatus {
  /** ISO timestamp of the market quote (falls back to fetch time) */
  price_as_of: string;
  /** IANA zone or short code of the listing exchange */
  price_timezone?: string;
  /**
   * How to read the price: delayed (market open, feed is delayed), closed
   * (last close), prepost (extended hours), or asof (state unknown).
   */
  price_state: "delayed" | "closed" | "prepost" | "asof";
  /** ISO date of the latest income statement used */
  income_statement_period?: string;
  /** ISO date of the latest balance sheet used */
  balance_sheet_period?: string;
  currency: string;
  /** Exchange code (see lib/finance/exchanges.ts) */
  exchange: string;
  model_version: string;
  assumptions?: DataStatusAssumptions;
  /** Source names, primary first */
  sources: string[];
  /** Whether SEC EDGAR was consulted to fill gaps Yahoo left */
  edgar_supplemented: boolean;
  /** Human-readable inputs that were unavailable ("None" implied when empty) */
  missing_fields: string[];
  /** Material data-quality notes from the valuation engine */
  data_quality_notes: string[];
}

/**
 * Five-year fundamental history for the trend charts (§8), oldest-first. Every
 * array is aligned to `period_labels` and may contain nulls where a year is
 * missing. Optional on the analysis: absent on older saves and whenever the
 * provider returned no usable history, in which case charts show empty states.
 */
export interface AnalysisSeries {
  /** Fiscal-year labels, oldest-first, e.g. ["2021","2022","2023","2024","2025"] */
  period_labels: string[];
  revenue: (number | null)[];
  diluted_eps: (number | null)[];
  free_cash_flow: (number | null)[];
  operating_margin_pct: (number | null)[];
  roic_pct: (number | null)[];
}

export interface ValueInvestingAnalysis {
  ticker: string;
  /** Exchange code — with `ticker` this forms the security identity.
   *  Optional: absent on analyses saved before exchanges were tracked. */
  exchange?: string;
  /** GICS sector, for the result header. Optional on older analyses. */
  sector?: string;
  company_name: string;
  currency: string;
  current_price: number;
  analysis_date: string;
  valuation: {
    pe: number | null;
    pb: number | null;
    ps: number | null;
    ev_ebitda: number | null;
    price_fcf: number | null;
    graham_number: number | null;
    valuation_score: number;
    verdict: string;
    summary: string;
  };
  financial_health: {
    debt_equity: number | null;
    current_ratio: number | null;
    interest_coverage: number | null;
    fcf_consistency_score: number;
    health_score: number;
    verdict: string;
    summary: string;
  };
  business_quality: {
    roe_pct: number | null;
    roic_pct: number | null;
    gross_margin_pct: number | null;
    operating_margin_pct: number | null;
    revenue_stability_score: number;
    moat_score: number;
    quality_score: number;
    verdict: string;
    summary: string;
  };
  intrinsic_value: {
    dcf_value_per_share: number | null;
    graham_value_per_share: number | null;
    blended_intrinsic_value_per_share: number | null;
    margin_of_safety_pct: number | null;
    summary: string;
  };
  thesis: {
    bull_case: string[];
    bear_case: string[];
    red_flags: string[];
    key_risk: string;
  };
  final_verdict: {
    label: VerdictLabel;
    confidence_pct: number;
    one_line_verdict: string;
    reasoning: string;
  };
  /** Optional: absent on analyses saved before this field existed */
  verdict_explanation?: VerdictExplanation;
  /** Optional: absent on analyses saved before provenance was captured */
  data_status?: DataStatus;
  /** Optional: 5-year fundamental history for the trend charts (§8) */
  series?: AnalysisSeries;
  sources: AnalysisSource[];
}

export interface SavedAnalysisSummary {
  id: string;
  ticker: string;
  /** Exchange code; inferred from the ticker suffix for older rows */
  exchange: string;
  companyName: string;
  analysisDate: string;
  finalVerdictLabel: VerdictLabel;
  confidencePct: number;
  marginOfSafetyPct: number | null;
  oneLineVerdict: string;
  /** Short reason the verdict landed where it did, for dense contexts */
  verdictReason: string;
  createdAt: string;
}

export interface SavedAnalysisRecord extends SavedAnalysisSummary {
  currency: string;
  currentPrice: number;
  updatedAt: string;
  fullJson: ValueInvestingAnalysis;
}
