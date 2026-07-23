import type { VerdictLabel } from "@/types/analysis";

export interface FinancialSnapshot {
  revenue: number | null;
  ebitda: number | null;
  ebit: number | null;
  net_income: number | null;
  diluted_eps: number | null;
  bvps: number | null;
  free_cash_flow: number | null;
  total_debt: number | null;
  total_equity: number | null;
  cash_and_equivalents: number | null;
  current_assets: number | null;
  current_liabilities: number | null;
  interest_expense: number | null;
  gross_margin_pct: number | null;
  operating_margin_pct: number | null;
  roe_pct: number | null;
  roic_pct: number | null;
  /** Trailing annual dividend per share (same currency unit as bvps/eps). Optional. */
  dividend_per_share?: number | null;
}

export interface FinancialHistory5Y {
  revenue: Array<number | null>;
  free_cash_flow: Array<number | null>;
  diluted_eps: Array<number | null>;
  gross_margin_pct: Array<number | null>;
  operating_margin_pct: Array<number | null>;
  roe_pct: Array<number | null>;
  roic_pct: Array<number | null>;
  /** Reported net income per year — used with OCF for accruals/earnings-quality checks */
  net_income?: Array<number | null>;
  /** Operating cash flow per year — earnings backed by cash should track net income */
  operating_cash_flow?: Array<number | null>;
  /** Shares outstanding per year — rising count is dilution, falling is buybacks */
  shares_outstanding?: Array<number | null>;
}

export interface NormalizedFinancialDataset {
  ticker: string;
  company_name: string;
  currency: string;
  /** GICS sector string, e.g. "Information Technology" */
  sector?: string;
  /** Yahoo industry string, e.g. "Asset Management", "Banks - Regional" */
  industry?: string;
  /** ISO date of first trading day — used for recent-IPO detection */
  first_trade_date?: string;
  /**
   * For closed-end funds: historical price/book (≈ price/NAV) per fiscal year,
   * oldest-first. Lets the screener anchor to the fund's OWN average discount
   * (discounts persist; reversion is to the historical mean, not to NAV parity).
   */
  cef_pb_history?: Array<number | null>;
  price: number;
  market_cap: number;
  enterprise_value: number;
  shares_outstanding: number;
  latest: FinancialSnapshot;
  history_5y: FinancialHistory5Y;
  as_of_date: string;
  source_name: string;
  /**
   * Provenance the provider can supply. All optional: older fixtures and the
   * mock provider omit them, and the data-status builder degrades gracefully to
   * "not recorded" rather than inventing values.
   */
  provenance?: {
    /** ISO timestamp of the quote itself (Yahoo regularMarketTime), not fetch time */
    price_as_of?: string;
    /** IANA zone of the listing exchange, e.g. "America/New_York" */
    price_timezone?: string;
    /** Raw Yahoo market state: REGULAR | CLOSED | PRE | POST | PREPRE | POSTPOST */
    market_state?: string;
    /** ISO date of the latest annual income statement used */
    income_statement_period?: string;
    /** ISO date of the latest balance sheet used */
    balance_sheet_period?: string;
    /** True when SEC EDGAR was consulted to fill gaps Yahoo left */
    edgar_supplemented?: boolean;
  };
}

export interface ValueCalculationAssumptions {
  discount_rate_pct: number;
  terminal_growth_pct: number;
  max_growth_cap_pct: number;
  use_conservative_fcf_basis: boolean;
}

export type ScoreBand = "elite" | "strong" | "mixed" | "weak" | "poor";

export interface ValueMetricsResult {
  ticker: string;
  company_name: string;
  currency: string;
  current_price: number;
  valuation: {
    pe: number | null;
    pb: number | null;
    ps: number | null;
    ev_ebitda: number | null;
    price_fcf: number | null;
    graham_number: number | null;
    valuation_score: number;
    band: ScoreBand;
  };
  financial_health: {
    debt_equity: number | null;
    current_ratio: number | null;
    interest_coverage: number | null;
    fcf_consistency_score: number;
    health_score: number;
    band: ScoreBand;
    severe_balance_sheet_weakness: boolean;
  };
  business_quality: {
    roe_pct: number | null;
    roic_pct: number | null;
    gross_margin_pct: number | null;
    operating_margin_pct: number | null;
    revenue_stability_score: number;
    moat_score: number;
    quality_score: number;
    band: ScoreBand;
    weak_business_profile: boolean;
    /** 4-year CAGR of revenue, oldest-first history */
    revenue_cagr_pct: number | null;
    /** Direction of operating margin over the 5-year history */
    operating_margin_trend: "improving" | "declining" | "stable" | null;
  };
  intrinsic_value: {
    dcf_value_per_share: number | null;
    graham_value_per_share: number | null;
    /** NAV (book value per share) — populated when intrinsic_method is "nav" */
    nav_value_per_share: number | null;
    /** Dividend-discount value — populated when intrinsic_method is "ddm" */
    ddm_value_per_share: number | null;
    /** Justified-P/B value from normalized ROE — populated when intrinsic_method is "pbroe" */
    pbroe_value_per_share: number | null;
    /** Cycle-average ROE used by the pbroe model */
    normalized_roe_pct: number | null;
    /** The intrinsic estimate actually used for margin of safety, per sector method */
    blended_intrinsic_value_per_share: number | null;
    /** Which model anchored the intrinsic value */
    intrinsic_method: "dcf" | "nav" | "ddm" | "pbroe";
    margin_of_safety_pct: number | null;
    growth_rate_pct: number | null;
    conservative_fcf_basis: number | null;
  };
  composite_score: number;
  score_band: ScoreBand;
  suggested_verdict: VerdictLabel;
  diagnostics: {
    margin_of_safety_score: number;
    value_trap_risk: boolean;
    /** TTM EPS > 1.4× its 5-year average — earnings likely at a cyclical peak */
    peak_earnings: boolean;
    /** Red flags that capped the verdict (e.g. "peak_earnings", "declining_revenue") */
    verdict_caps: string[];
    /** "closed_end_fund" routes valuation to NAV discount; "operating" is the default */
    security_type: "operating" | "closed_end_fund";
    data_quality_notes: string[];
    assumptions: ValueCalculationAssumptions;
  };
}
