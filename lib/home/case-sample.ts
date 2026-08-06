/**
 * Deterministic company case sample for the homepage CaseAnatomy section.
 *
 * These values are NOT invented: they are extracted verbatim from an actual,
 * locally committed analysis result — `prisma/seed-data/Analysis.json`, the
 * row for ticker "ALL" (The Allstate Corporation), analysed 2026-04-24. The
 * accompanying test (`__tests__/home/case-sample.test.ts`) reads that JSON and
 * asserts every field below still matches the source, so the sample cannot
 * silently drift from — or fabricate beyond — the committed record.
 *
 * It is exposed as a plain static module (no database call, no external API)
 * so it can render on the landing page's critical path without latency, and is
 * honestly labelled in the UI as an *archived sample* with its source and
 * as-of date. No verdict/recommendation label is included by design.
 */

export const CASE_SAMPLE_SOURCE = {
  title: "Yahoo Finance (yahoo-finance2)",
  url: "https://finance.yahoo.com",
} as const;

/** Engine band vocabulary (matches the `bands`/`caseAnatomy.status` dictionaries). */
export type StatusBand = "elite" | "strong" | "mixed" | "weak" | "poor";

/** Whether an example reflects live, archived or purely illustrative data. */
export type Provenance = "current" | "archived" | "illustrative";

export interface CompanyCaseSample {
  companyName: string;
  ticker: string;
  currency: string;
  /** ISO (YYYY-MM-DD) as-of date of the underlying analysis. */
  asOfIso: string;
  provenance: Provenance;
  source: typeof CASE_SAMPLE_SOURCE;
  /** Both price and a modelled range exist in the record, so both may be shown. */
  currentPrice: number;
  modelledLow: number;
  modelledHigh: number;
  blendedValue: number;
  marginOfSafetyPct: number;
  /** Financial-health verdict word from the record. */
  resilienceBand: StatusBand;
  resilienceScore: number;
  /** Earnings quality proxied by free-cash-flow consistency (0–100). */
  fcfConsistencyScore: number;
  /** Cyclicality proxied by revenue stability (0–100). */
  revenueStabilityScore: number;
  confidencePct: number;
  /** Verbatim key-risk prose from the analysis (engine-generated, not translated). */
  keyLimitation: string;
  /** Recreates the full analysis from the ticker (works once data is live). */
  recreateHref: string;
}

export const COMPANY_CASE_SAMPLE: CompanyCaseSample = {
  companyName: "The Allstate Corporation",
  ticker: "ALL",
  currency: "USD",
  asOfIso: "2026-04-24",
  provenance: "archived",
  source: CASE_SAMPLE_SOURCE,
  currentPrice: 212.88,
  modelledLow: 306.93,
  modelledHigh: 399.16,
  blendedValue: 371.49,
  marginOfSafetyPct: 42.7,
  resilienceBand: "strong",
  resilienceScore: 82,
  fcfConsistencyScore: 100,
  revenueStabilityScore: 64,
  confidencePct: 83,
  keyLimitation:
    "Execution risk — future results may diverge from historical trends used in the deterministic model.",
  recreateHref: "/value?ticker=ALL",
};

/** Confidence band from a 0–100 pct — mirrors the analysis-summary thresholds. */
export function confidenceKey(pct: number): "high" | "medium" | "low" {
  if (pct >= 70) return "high";
  if (pct >= 55) return "medium";
  return "low";
}
