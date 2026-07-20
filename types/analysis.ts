export type VerdictLabel = "STRONG_BUY" | "BUY" | "WATCH" | "HOLD" | "AVOID";

export interface AnalysisSource {
  title: string;
  url: string;
  used_for: string;
}

export interface ValueInvestingAnalysis {
  ticker: string;
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
  sources: AnalysisSource[];
}

export interface SavedAnalysisSummary {
  id: string;
  ticker: string;
  companyName: string;
  analysisDate: string;
  finalVerdictLabel: VerdictLabel;
  confidencePct: number;
  marginOfSafetyPct: number | null;
  oneLineVerdict: string;
  createdAt: string;
}

export interface SavedAnalysisRecord extends SavedAnalysisSummary {
  currency: string;
  currentPrice: number;
  updatedAt: string;
  fullJson: ValueInvestingAnalysis;
}
