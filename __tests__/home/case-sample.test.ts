import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { COMPANY_CASE_SAMPLE, confidenceKey } from "@/lib/home/case-sample";

/**
 * Provenance guard: the homepage company sample must remain a faithful
 * extract of the committed analysis record — never fabricated, never drifted.
 * This reads the same JSON the app was seeded from and asserts field parity.
 */
describe("company case sample provenance", () => {
  const rows: Array<{ ticker: string; fullJson: string; [k: string]: unknown }> = JSON.parse(
    readFileSync(join(process.cwd(), "prisma/seed-data/Analysis.json"), "utf8"),
  );
  const row = rows.find((r) => r.ticker === COMPANY_CASE_SAMPLE.ticker);
  const j = row ? JSON.parse(row.fullJson) : null;

  it("the source record exists", () => {
    expect(row).toBeTruthy();
    expect(j).toBeTruthy();
  });

  it("every displayed number matches the committed record", () => {
    expect(COMPANY_CASE_SAMPLE.companyName).toBe(row!.companyName);
    expect(COMPANY_CASE_SAMPLE.currency).toBe(row!.currency);
    expect(COMPANY_CASE_SAMPLE.currentPrice).toBe(row!.currentPrice);
    expect(COMPANY_CASE_SAMPLE.confidencePct).toBe(row!.confidencePct);
    expect(COMPANY_CASE_SAMPLE.marginOfSafetyPct).toBe(row!.marginOfSafetyPct);
    expect(COMPANY_CASE_SAMPLE.modelledLow).toBe(j.intrinsic_value.graham_value_per_share);
    expect(COMPANY_CASE_SAMPLE.modelledHigh).toBe(j.intrinsic_value.dcf_value_per_share);
    expect(COMPANY_CASE_SAMPLE.blendedValue).toBe(j.intrinsic_value.blended_intrinsic_value_per_share);
    expect(COMPANY_CASE_SAMPLE.resilienceBand).toBe(j.financial_health.verdict);
    expect(COMPANY_CASE_SAMPLE.resilienceScore).toBe(j.financial_health.health_score);
    expect(COMPANY_CASE_SAMPLE.fcfConsistencyScore).toBe(j.financial_health.fcf_consistency_score);
    expect(COMPANY_CASE_SAMPLE.revenueStabilityScore).toBe(j.business_quality.revenue_stability_score);
    expect(COMPANY_CASE_SAMPLE.keyLimitation).toBe(j.thesis.key_risk);
    expect(COMPANY_CASE_SAMPLE.source.title).toBe(j.sources[0].title);
    expect(COMPANY_CASE_SAMPLE.source.url).toBe(j.sources[0].url);
  });

  it("as-of date matches the record's analysis date", () => {
    expect(COMPANY_CASE_SAMPLE.asOfIso).toBe(new Date(row!.analysisDate as number).toISOString().slice(0, 10));
  });

  it("is honestly labelled and shows both a price and a modelled range", () => {
    expect(COMPANY_CASE_SAMPLE.provenance).toBe("archived");
    expect(COMPANY_CASE_SAMPLE.currentPrice).toBeGreaterThan(0);
    expect(COMPANY_CASE_SAMPLE.modelledHigh).toBeGreaterThan(COMPANY_CASE_SAMPLE.modelledLow);
  });

  it("confidence banding mirrors the analysis-summary thresholds", () => {
    expect(confidenceKey(83)).toBe("high");
    expect(confidenceKey(60)).toBe("medium");
    expect(confidenceKey(40)).toBe("low");
  });
});
