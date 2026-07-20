import { z } from "zod";

const finiteNumberSchema = z.number().finite();
const nullableFiniteNumberSchema = finiteNumberSchema.nullable();
const fiveYearSeriesSchema = z.array(nullableFiniteNumberSchema).length(5);

export const financialSnapshotSchema = z
  .object({
    revenue: nullableFiniteNumberSchema,
    ebitda: nullableFiniteNumberSchema,
    ebit: nullableFiniteNumberSchema,
    net_income: nullableFiniteNumberSchema,
    diluted_eps: nullableFiniteNumberSchema,
    bvps: nullableFiniteNumberSchema,
    free_cash_flow: nullableFiniteNumberSchema,
    total_debt: nullableFiniteNumberSchema,
    total_equity: nullableFiniteNumberSchema,
    cash_and_equivalents: nullableFiniteNumberSchema,
    current_assets: nullableFiniteNumberSchema,
    current_liabilities: nullableFiniteNumberSchema,
    interest_expense: nullableFiniteNumberSchema,
    gross_margin_pct: nullableFiniteNumberSchema,
    operating_margin_pct: nullableFiniteNumberSchema,
    roe_pct: nullableFiniteNumberSchema,
    roic_pct: nullableFiniteNumberSchema,
    dividend_per_share: nullableFiniteNumberSchema.optional(),
  })
  .strict();

export const financialHistory5YSchema = z
  .object({
    revenue: fiveYearSeriesSchema,
    free_cash_flow: fiveYearSeriesSchema,
    diluted_eps: fiveYearSeriesSchema,
    gross_margin_pct: fiveYearSeriesSchema,
    operating_margin_pct: fiveYearSeriesSchema,
    roe_pct: fiveYearSeriesSchema,
    roic_pct: fiveYearSeriesSchema,
    net_income: fiveYearSeriesSchema.optional(),
    operating_cash_flow: fiveYearSeriesSchema.optional(),
    shares_outstanding: fiveYearSeriesSchema.optional(),
  })
  .strict();

export const normalizedFinancialDatasetSchema = z
  .object({
    ticker: z.string().min(1).max(20),
    company_name: z.string().min(1),
    currency: z.string().min(1).max(10),
    sector: z.string().min(1).optional(),
    industry: z.string().min(1).optional(),
    first_trade_date: z.string().min(1).optional(),
    cef_pb_history: z.array(nullableFiniteNumberSchema).optional(),
    price: finiteNumberSchema,
    market_cap: finiteNumberSchema,
    enterprise_value: finiteNumberSchema,
    shares_outstanding: finiteNumberSchema.positive(),
    latest: financialSnapshotSchema,
    history_5y: financialHistory5YSchema,
    as_of_date: z.string().min(1),
    source_name: z.string().min(1),
  })
  .strict();

export const valueCalculationAssumptionsSchema = z
  .object({
    discount_rate_pct: finiteNumberSchema,
    terminal_growth_pct: finiteNumberSchema,
    max_growth_cap_pct: finiteNumberSchema,
    use_conservative_fcf_basis: z.boolean(),
  })
  .strict();

export const fetchFinancialDatasetArgsSchema = z
  .object({
    ticker: z.string().trim().min(1).max(20),
    exchange_hint: z.string().trim().min(1).max(32).nullable().optional(),
    currency: z.string().trim().min(1).max(10).nullable().optional(),
  })
  .strict();

export const calculateValueMetricsArgsSchema = z
  .object({
    ticker: z.string().trim().min(1).max(20),
    company_name: z.string().min(1),
    currency: z.string().min(1).max(10),
    price: finiteNumberSchema,
    market_cap: finiteNumberSchema,
    enterprise_value: finiteNumberSchema,
    shares_outstanding: finiteNumberSchema.positive(),
    latest: financialSnapshotSchema,
    history_5y: financialHistory5YSchema,
    assumptions: valueCalculationAssumptionsSchema,
  })
  .strict();

export const valueMetricsResultSchema = z
  .object({
    ticker: z.string().min(1).max(20),
    company_name: z.string().min(1),
    currency: z.string().min(1).max(10),
    current_price: finiteNumberSchema,
    valuation: z
      .object({
        pe: nullableFiniteNumberSchema,
        pb: nullableFiniteNumberSchema,
        ps: nullableFiniteNumberSchema,
        ev_ebitda: nullableFiniteNumberSchema,
        price_fcf: nullableFiniteNumberSchema,
        graham_number: nullableFiniteNumberSchema,
        valuation_score: finiteNumberSchema.min(0).max(100),
        band: z.enum(["elite", "strong", "mixed", "weak", "poor"]),
      })
      .strict(),
    financial_health: z
      .object({
        debt_equity: nullableFiniteNumberSchema,
        current_ratio: nullableFiniteNumberSchema,
        interest_coverage: nullableFiniteNumberSchema,
        fcf_consistency_score: finiteNumberSchema.min(0).max(100),
        health_score: finiteNumberSchema.min(0).max(100),
        band: z.enum(["elite", "strong", "mixed", "weak", "poor"]),
        severe_balance_sheet_weakness: z.boolean(),
      })
      .strict(),
    business_quality: z
      .object({
        roe_pct: nullableFiniteNumberSchema,
        roic_pct: nullableFiniteNumberSchema,
        gross_margin_pct: nullableFiniteNumberSchema,
        operating_margin_pct: nullableFiniteNumberSchema,
        revenue_stability_score: finiteNumberSchema.min(0).max(100),
        moat_score: finiteNumberSchema.min(0).max(100),
        quality_score: finiteNumberSchema.min(0).max(100),
        band: z.enum(["elite", "strong", "mixed", "weak", "poor"]),
        weak_business_profile: z.boolean(),
        revenue_cagr_pct: nullableFiniteNumberSchema,
        operating_margin_trend: z.enum(["improving", "declining", "stable"]).nullable(),
      })
      .strict(),
    intrinsic_value: z
      .object({
        dcf_value_per_share: nullableFiniteNumberSchema,
        graham_value_per_share: nullableFiniteNumberSchema,
        nav_value_per_share: nullableFiniteNumberSchema,
        ddm_value_per_share: nullableFiniteNumberSchema,
        pbroe_value_per_share: nullableFiniteNumberSchema,
        normalized_roe_pct: nullableFiniteNumberSchema,
        blended_intrinsic_value_per_share: nullableFiniteNumberSchema,
        intrinsic_method: z.enum(["dcf", "nav", "ddm", "pbroe"]),
        margin_of_safety_pct: nullableFiniteNumberSchema,
        growth_rate_pct: nullableFiniteNumberSchema,
        conservative_fcf_basis: nullableFiniteNumberSchema,
      })
      .strict(),
    composite_score: finiteNumberSchema.min(0).max(100),
    score_band: z.enum(["elite", "strong", "mixed", "weak", "poor"]),
    suggested_verdict: z.enum(["STRONG_BUY", "BUY", "WATCH", "HOLD", "AVOID"]),
    diagnostics: z
      .object({
        margin_of_safety_score: finiteNumberSchema.min(0).max(100),
        value_trap_risk: z.boolean(),
        peak_earnings: z.boolean(),
        verdict_caps: z.array(z.string()),
        security_type: z.enum(["operating", "closed_end_fund"]),
        data_quality_notes: z.array(z.string()),
        assumptions: valueCalculationAssumptionsSchema,
      })
      .strict(),
  })
  .strict();

export type NormalizedFinancialDatasetInput = z.infer<
  typeof normalizedFinancialDatasetSchema
>;
export type CalculateValueMetricsArgs = z.infer<
  typeof calculateValueMetricsArgsSchema
>;
