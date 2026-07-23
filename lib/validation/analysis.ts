import { z } from "zod";

export const analyzeRequestSchema = z
  .object({
    ticker: z
      .string()
      .trim()
      .min(1)
      .max(20)
      .regex(/^[A-Z0-9.\-]+$/i, "Ticker must contain only letters, digits, dots, or hyphens.")
      .transform((v) => v.toUpperCase()),
    // Half of the security identity. Optional so existing links keep working;
    // when absent it is inferred from the ticker suffix.
    exchange: z.string().trim().min(1).max(12).optional(),
  })
  .strict();

export const compareRequestSchema = z
  .object({
    ids: z.array(z.string().trim().min(1)).min(1).max(2),
  })
  .strict();

const nullableFiniteNumberSchema = z.number().finite().nullable();

export const analysisSourceSchema = z
  .object({
    title: z.string().min(1),
    url: z.string().url(),
    used_for: z.string().min(1),
  })
  .strict();

const verdictCheckSchema = z
  .object({
    name: z.string().min(1),
    status: z.enum(["pass", "warn", "fail"]),
    score: z.number().finite().nullable(),
    detail: z.string().min(1),
  })
  .strict();

export const dataStatusSchema = z
  .object({
    price_as_of: z.string().min(1),
    price_timezone: z.string().min(1).optional(),
    price_state: z.enum(["delayed", "closed", "prepost", "asof"]),
    income_statement_period: z.string().min(1).optional(),
    balance_sheet_period: z.string().min(1).optional(),
    currency: z.string().min(1).max(10),
    exchange: z.string().min(1).max(12),
    model_version: z.string().min(1),
    assumptions: z
      .object({
        discount_rate_pct: z.number().finite(),
        terminal_growth_pct: z.number().finite(),
        max_growth_cap_pct: z.number().finite(),
        use_conservative_fcf_basis: z.boolean(),
      })
      .strict()
      .optional(),
    sources: z.array(z.string().min(1)),
    edgar_supplemented: z.boolean(),
    missing_fields: z.array(z.string().min(1)),
    data_quality_notes: z.array(z.string().min(1)),
  })
  .strict();

const nullableFiniteArray = z.array(z.number().finite().nullable());

const analysisSeriesSchema = z
  .object({
    period_labels: z.array(z.string().min(1)),
    revenue: nullableFiniteArray,
    diluted_eps: nullableFiniteArray,
    free_cash_flow: nullableFiniteArray,
    operating_margin_pct: nullableFiniteArray,
    roic_pct: nullableFiniteArray,
  })
  .strict();

const verdictExplanationSchema = z
  .object({
    final_verdict: z.enum(["STRONG_BUY", "BUY", "WATCH", "HOLD", "AVOID"]),
    overall_score: z.number().finite(),
    valuation_method: z.enum(["dcf", "nav", "ddm", "pbroe"]),
    valuation_method_label: z.string().min(1),
    checks: z.array(verdictCheckSchema),
    hard_gates: z.array(
      z.object({ name: z.string().min(1), detail: z.string().min(1) }).strict(),
    ),
    explanation: z.string().min(1),
  })
  .strict();

export const valueInvestingAnalysisSchema = z
  .object({
    ticker: z.string().min(1).max(20),
    company_name: z.string().min(1),
    currency: z.string().min(1).max(10),
    current_price: z.number().finite(),
    analysis_date: z.string().min(1),
    valuation: z
      .object({
        pe: nullableFiniteNumberSchema,
        pb: nullableFiniteNumberSchema,
        ps: nullableFiniteNumberSchema,
        ev_ebitda: nullableFiniteNumberSchema,
        price_fcf: nullableFiniteNumberSchema,
        graham_number: nullableFiniteNumberSchema,
        valuation_score: z.number().finite().min(0).max(100),
        verdict: z.string().min(1),
        summary: z.string().min(1),
      })
      .strict(),
    financial_health: z
      .object({
        debt_equity: nullableFiniteNumberSchema,
        current_ratio: nullableFiniteNumberSchema,
        interest_coverage: nullableFiniteNumberSchema,
        fcf_consistency_score: z.number().finite().min(0).max(100),
        health_score: z.number().finite().min(0).max(100),
        verdict: z.string().min(1),
        summary: z.string().min(1),
      })
      .strict(),
    business_quality: z
      .object({
        roe_pct: nullableFiniteNumberSchema,
        roic_pct: nullableFiniteNumberSchema,
        gross_margin_pct: nullableFiniteNumberSchema,
        operating_margin_pct: nullableFiniteNumberSchema,
        revenue_stability_score: z.number().finite().min(0).max(100),
        moat_score: z.number().finite().min(0).max(100),
        quality_score: z.number().finite().min(0).max(100),
        verdict: z.string().min(1),
        summary: z.string().min(1),
      })
      .strict(),
    intrinsic_value: z
      .object({
        dcf_value_per_share: nullableFiniteNumberSchema,
        graham_value_per_share: nullableFiniteNumberSchema,
        blended_intrinsic_value_per_share: nullableFiniteNumberSchema,
        margin_of_safety_pct: nullableFiniteNumberSchema,
        summary: z.string().min(1),
      })
      .strict(),
    thesis: z
      .object({
        bull_case: z.array(z.string().min(1)),
        bear_case: z.array(z.string().min(1)),
        red_flags: z.array(z.string().min(1)),
        key_risk: z.string().min(1),
      })
      .strict(),
    final_verdict: z
      .object({
        label: z.enum(["STRONG_BUY", "BUY", "WATCH", "HOLD", "AVOID"]),
        confidence_pct: z.number().finite().min(0).max(100),
        one_line_verdict: z.string().min(1),
        reasoning: z.string().min(1),
      })
      .strict(),
    // Optional: absent on analyses saved before these fields existed
    exchange: z.string().min(1).max(12).optional(),
    sector: z.string().min(1).max(60).optional(),
    verdict_explanation: verdictExplanationSchema.optional(),
    data_status: dataStatusSchema.optional(),
    series: analysisSeriesSchema.optional(),
    sources: z.array(analysisSourceSchema),
  })
  .strict();

export const savedAnalysisSummarySchema = z
  .object({
    id: z.string().min(1),
    ticker: z.string().min(1),
    exchange: z.string().min(1).max(12),
    companyName: z.string().min(1),
    analysisDate: z.string().min(1),
    finalVerdictLabel: z.enum(["STRONG_BUY", "BUY", "WATCH", "HOLD", "AVOID"]),
    confidencePct: z.number().finite().min(0).max(100),
    marginOfSafetyPct: nullableFiniteNumberSchema,
    oneLineVerdict: z.string().min(1),
    verdictReason: z.string().min(1),
    createdAt: z.string().min(1),
  })
  .strict();

export const savedAnalysisRecordSchema = savedAnalysisSummarySchema
  .extend({
    currency: z.string().min(1),
    currentPrice: z.number().finite(),
    updatedAt: z.string().min(1),
    fullJson: valueInvestingAnalysisSchema,
  })
  .strict();
