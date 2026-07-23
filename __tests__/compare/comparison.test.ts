import { describe, it, expect } from "vitest";

import { buildComparison, countUnavailableRows } from "@/lib/compare/comparison";
import type { SavedAnalysisRecord, ValueInvestingAnalysis } from "@/types/analysis";

function analysis(overrides: Partial<ValueInvestingAnalysis> = {}): ValueInvestingAnalysis {
  return {
    ticker: "AAPL",
    exchange: "US",
    sector: "Information Technology",
    company_name: "Apple Inc.",
    currency: "USD",
    current_price: 100,
    analysis_date: "2026-07-20T00:00:00.000Z",
    valuation: {
      pe: 20, pb: 5, ps: 6, ev_ebitda: 15, price_fcf: 22,
      graham_number: 60, valuation_score: 50, verdict: "Full", summary: "Full price.",
    },
    financial_health: {
      debt_equity: 1.2, current_ratio: 1.1, interest_coverage: 20,
      fcf_consistency_score: 80, health_score: 70, verdict: "Solid", summary: "Solid.",
    },
    business_quality: {
      roe_pct: 30, roic_pct: 25, gross_margin_pct: 44, operating_margin_pct: 30,
      revenue_stability_score: 85, moat_score: 80, quality_score: 88,
      verdict: "Excellent", summary: "Excellent.",
    },
    intrinsic_value: {
      dcf_value_per_share: 90, graham_value_per_share: 60,
      blended_intrinsic_value_per_share: 90, margin_of_safety_pct: -10,
      summary: "Blended.",
    },
    thesis: {
      bull_case: ["Ecosystem"], bear_case: ["China risk"], red_flags: [],
      key_risk: "Handset replacement cycles lengthen.",
    },
    final_verdict: {
      label: "HOLD", confidence_pct: 70,
      one_line_verdict: "Great business, full price.", reasoning: "Reasoning.",
    },
    verdict_explanation: {
      final_verdict: "HOLD", overall_score: 65, valuation_method: "dcf",
      valuation_method_label: "Discounted cash flow, cross-checked against the Graham number",
      checks: [], hard_gates: [], explanation: "Explanation.",
    },
    sources: [{ title: "Yahoo Finance", url: "https://finance.yahoo.com", used_for: "Prices" }],
    ...overrides,
  };
}

function record(
  overrides: Partial<SavedAnalysisRecord> = {},
  analysisOverrides: Partial<ValueInvestingAnalysis> = {},
): SavedAnalysisRecord {
  const full = analysis(analysisOverrides);
  return {
    id: "id-1",
    ticker: full.ticker,
    exchange: full.exchange!,
    companyName: full.company_name,
    analysisDate: full.analysis_date,
    finalVerdictLabel: full.final_verdict.label,
    confidencePct: full.final_verdict.confidence_pct,
    marginOfSafetyPct: full.intrinsic_value.margin_of_safety_pct,
    oneLineVerdict: full.final_verdict.one_line_verdict,
    verdictReason: "All checks passed",
    createdAt: full.analysis_date,
    currency: full.currency,
    currentPrice: full.current_price,
    updatedAt: full.analysis_date,
    fullJson: full,
    ...overrides,
  };
}

function findRow(comparison: ReturnType<typeof buildComparison>, id: string) {
  return comparison.sections.flatMap((section) => section.rows).find((row) => row.id === id);
}

describe("buildComparison structure", () => {
  it("orders sections by decision priority", () => {
    const comparison = buildComparison(record(), record({ id: "id-2" }));
    expect(comparison.sections.map((section) => section.id)).toEqual([
      "verdict",
      "fundamentals",
      "risks",
      "provenance",
    ]);
  });

  it("never reports an overall winner, only per-metric direction", () => {
    const comparison = buildComparison(record(), record({ id: "id-2" }));
    expect(comparison).not.toHaveProperty("winner");
    expect(comparison).not.toHaveProperty("overallScore");
  });
});

describe("differences", () => {
  it("expresses the difference as right relative to left", () => {
    const left = record({}, { business_quality: { ...analysis().business_quality, roe_pct: 20 } });
    const right = record({ id: "id-2" }, {
      business_quality: { ...analysis().business_quality, roe_pct: 30 },
    });

    const row = findRow(buildComparison(left, right), "roe")!;
    expect(row.absoluteDelta).toBe("+10pp");
    expect(row.relativeDelta).toBe("+50%");
    expect(row.favours).toBe("right");
  });

  it("differences percentages in points, not percent", () => {
    const left = record({}, { final_verdict: { ...analysis().final_verdict, confidence_pct: 40 } });
    const right = record({ id: "id-2" }, {
      final_verdict: { ...analysis().final_verdict, confidence_pct: 60 },
    });

    expect(findRow(buildComparison(left, right), "confidence")!.absoluteDelta).toBe("+20pp");
  });

  it("favours the lower side on metrics where lower is better", () => {
    const left = record({}, { valuation: { ...analysis().valuation, pe: 10 } });
    const right = record({ id: "id-2" }, { valuation: { ...analysis().valuation, pe: 30 } });

    const row = findRow(buildComparison(left, right), "pe")!;
    expect(row.favours).toBe("left");
    expect(row.absoluteDelta).toBe("+20");
  });

  it("takes no side when a metric has no better direction", () => {
    expect(findRow(buildComparison(record(), record({ id: "id-2" })), "price")!.favours).toBeNull();
  });

  // Relative change is a ratio-scale idea. Margin of safety is signed, so a
  // base near zero makes the percentage explode into noise.
  it("omits a relative difference when either side is negative", () => {
    const left = record({}, {
      intrinsic_value: { ...analysis().intrinsic_value, margin_of_safety_pct: -3 },
    });
    const right = record({ id: "id-2" }, {
      intrinsic_value: { ...analysis().intrinsic_value, margin_of_safety_pct: -62 },
    });

    const row = findRow(buildComparison(left, right), "margin")!;
    expect(row.absoluteDelta).toBe("−59pp");
    expect(row.relativeDelta).toBeNull();
    // The direction is still knowable: a 3% premium beats a 62% one.
    expect(row.favours).toBe("left");
  });

  it("omits a relative difference when the left value is zero", () => {
    const left = record({}, { business_quality: { ...analysis().business_quality, roe_pct: 0 } });
    const right = record({ id: "id-2" }, {
      business_quality: { ...analysis().business_quality, roe_pct: 5 },
    });

    const row = findRow(buildComparison(left, right), "roe")!;
    expect(row.absoluteDelta).toBe("+5pp");
    expect(row.relativeDelta).toBeNull();
  });

  it("leaves the difference blank when one side has no figure", () => {
    const right = record({ id: "id-2" }, { valuation: { ...analysis().valuation, pe: null } });
    const row = findRow(buildComparison(record(), right), "pe")!;

    expect(row.right).toBe("—");
    expect(row.absoluteDelta).toBeNull();
    expect(row.empty).toBe(false);
  });
});

describe("hiding unavailable metrics", () => {
  it("drops rows where neither company has a figure", () => {
    const blank = { ...analysis().valuation, ev_ebitda: null };
    const left = record({}, { valuation: blank });
    const right = record({ id: "id-2" }, { valuation: blank });

    expect(findRow(buildComparison(left, right), "ev-ebitda")).toBeUndefined();
    expect(findRow(buildComparison(left, right, { hideUnavailable: false }), "ev-ebitda")).toBeDefined();
    expect(countUnavailableRows(left, right)).toBeGreaterThanOrEqual(1);
  });

  it("keeps a row when only one company has a figure", () => {
    const left = record({}, { valuation: { ...analysis().valuation, ev_ebitda: 12 } });
    const right = record({ id: "id-2" }, { valuation: { ...analysis().valuation, ev_ebitda: null } });

    expect(findRow(buildComparison(left, right), "ev-ebitda")).toBeDefined();
  });
});

describe("currency handling", () => {
  const euro = record({ id: "id-2", currency: "EUR" }, {
    ticker: "AIR.PA", exchange: "XPAR", company_name: "Airbus SE", currency: "EUR",
  });

  it("refuses to subtract prices reported in different currencies", () => {
    const row = findRow(buildComparison(record(), euro), "price")!;
    expect(row.absoluteDelta).toBeNull();
    expect(row.note).toContain("not directly comparable");
  });

  it("still compares ratios and percentages across currencies", () => {
    const row = findRow(buildComparison(record(), euro), "roe")!;
    expect(row.absoluteDelta).not.toBeNull();
  });

  it("warns that the currencies differ", () => {
    const warning = buildComparison(record(), euro).warnings.find((w) => w.id === "currency")!;
    expect(warning.level).toBe("blocking");
    expect(warning.detail).toContain("USD");
    expect(warning.detail).toContain("EUR");
  });

  it("says nothing about currency when both report in the same one", () => {
    const comparison = buildComparison(record(), record({ id: "id-2" }));
    expect(comparison.warnings.find((w) => w.id === "currency")).toBeUndefined();
  });
});

describe("comparability warnings", () => {
  it("flags companies valued by different models", () => {
    const nav = record({ id: "id-2" }, {
      verdict_explanation: {
        ...analysis().verdict_explanation!,
        valuation_method: "nav",
        valuation_method_label: "Net asset value (book value ≈ NAV), blended with an FFO capitalisation",
      },
    });

    const warning = buildComparison(record(), nav).warnings.find((w) => w.id === "method")!;
    expect(warning.level).toBe("caution");
    expect(warning.detail).toContain("not like-for-like");
  });

  it("flags different sectors rather than declaring a winner", () => {
    const other = record({ id: "id-2" }, { sector: "Real Estate" });
    const warning = buildComparison(record(), other).warnings.find((w) => w.id === "sector")!;
    expect(warning.detail).toContain("better investment");
  });

  it("flags analyses run far apart", () => {
    const stale = record({ id: "id-2", analysisDate: "2026-01-10T00:00:00.000Z" });
    expect(buildComparison(record(), stale).warnings.find((w) => w.id === "dates")).toBeDefined();
  });

  it("does not flag analyses run days apart", () => {
    const recent = record({ id: "id-2", analysisDate: "2026-07-18T00:00:00.000Z" });
    expect(buildComparison(record(), recent).warnings.find((w) => w.id === "dates")).toBeUndefined();
  });

  it("flags an analysis that predates structured verdict explanations", () => {
    const old = record({ id: "id-2" }, { verdict_explanation: undefined });
    const warning = buildComparison(record(), old).warnings.find((w) => w.id === "explanation")!;
    expect(warning.detail).toContain("AAPL");
  });

  it("raises no warnings for two like-for-like analyses", () => {
    expect(buildComparison(record(), record({ id: "id-2" })).warnings).toEqual([]);
  });
});

describe("valuation gap row", () => {
  it("labels a negative margin of safety as a premium", () => {
    const row = findRow(buildComparison(record(), record({ id: "id-2" })), "margin")!;
    expect(row.left).toBe("10.0% premium");
  });

  it("labels a positive margin of safety as a margin", () => {
    const cheap = record({ id: "id-2" }, {
      intrinsic_value: { ...analysis().intrinsic_value, margin_of_safety_pct: 25 },
    });
    expect(findRow(buildComparison(record(), cheap), "margin")!.right).toBe("25.0% margin");
  });

  it("still differences the gap in percentage points", () => {
    const cheap = record({ id: "id-2" }, {
      intrinsic_value: { ...analysis().intrinsic_value, margin_of_safety_pct: 25 },
    });
    const row = findRow(buildComparison(record(), cheap), "margin")!;
    expect(row.absoluteDelta).toBe("+35pp");
    expect(row.favours).toBe("right");
  });
});
