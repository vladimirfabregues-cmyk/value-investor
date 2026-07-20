import { z } from "zod";

export const analyzeRequestSchema = z
  .object({
    ticker: z
      .string()
      .trim()
      .min(1)
      .max(10)
      .regex(/^[A-Z0-9.\-]+$/i, "Ticker must contain only letters, digits, dots, or hyphens.")
      .transform((v) => v.toUpperCase()),
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
    sources: z.array(analysisSourceSchema),
  })
  .strict();

export const savedAnalysisSummarySchema = z
  .object({
    id: z.string().min(1),
    ticker: z.string().min(1),
    companyName: z.string().min(1),
    analysisDate: z.string().min(1),
    finalVerdictLabel: z.enum(["STRONG_BUY", "BUY", "WATCH", "HOLD", "AVOID"]),
    confidencePct: z.number().finite().min(0).max(100),
    marginOfSafetyPct: nullableFiniteNumberSchema,
    oneLineVerdict: z.string().min(1),
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
