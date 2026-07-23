import { describe, it, expect } from "vitest";

import { buildDataStatus } from "@/lib/finance/data-status";
import { VALUATION_MODEL_VERSION } from "@/lib/finance/model-version";
import { dataStatusSchema, valueInvestingAnalysisSchema } from "@/lib/validation/analysis";
import type { FinancialSnapshot, NormalizedFinancialDataset, ValueMetricsResult } from "@/types/finance";

function snapshot(overrides: Partial<FinancialSnapshot> = {}): FinancialSnapshot {
  return {
    revenue: 1000, ebitda: 200, ebit: 180, net_income: 120, diluted_eps: 4,
    bvps: 20, free_cash_flow: 90, total_debt: 300, total_equity: 600,
    cash_and_equivalents: 100, current_assets: 400, current_liabilities: 200,
    interest_expense: 20, gross_margin_pct: 40, operating_margin_pct: 18,
    roe_pct: 20, roic_pct: 15, dividend_per_share: 1.5,
    ...overrides,
  };
}

function dataset(overrides: Partial<NormalizedFinancialDataset> = {}): NormalizedFinancialDataset {
  return {
    ticker: "AAPL",
    company_name: "Apple Inc.",
    currency: "USD",
    price: 100,
    market_cap: 1_000_000,
    enterprise_value: 1_100_000,
    shares_outstanding: 10_000,
    latest: snapshot(),
    history_5y: {
      revenue: [], free_cash_flow: [], diluted_eps: [],
      gross_margin_pct: [], operating_margin_pct: [], roe_pct: [], roic_pct: [],
    },
    as_of_date: "2026-07-20T12:00:00.000Z",
    source_name: "Yahoo Finance (yahoo-finance2)",
    ...overrides,
  };
}

function metrics(overrides: {
  intrinsic_method?: ValueMetricsResult["intrinsic_value"]["intrinsic_method"];
  data_quality_notes?: string[];
  assumptions?: Partial<ValueMetricsResult["diagnostics"]["assumptions"]>;
} = {}): ValueMetricsResult {
  // The builder reads only intrinsic_method + diagnostics.{assumptions, notes};
  // a focused object cast keeps the test readable without 40 lines of defaults.
  return {
    intrinsic_value: { intrinsic_method: overrides.intrinsic_method ?? "dcf" },
    diagnostics: {
      data_quality_notes: overrides.data_quality_notes ?? [],
      assumptions: {
        discount_rate_pct: 10,
        terminal_growth_pct: 2.5,
        max_growth_cap_pct: 8,
        use_conservative_fcf_basis: true,
        ...overrides.assumptions,
      },
    },
  } as unknown as ValueMetricsResult;
}

describe("buildDataStatus — price timing", () => {
  it("prefers the quote timestamp over fetch time", () => {
    const status = buildDataStatus(
      dataset({ provenance: { price_as_of: "2026-07-20T20:00:00.000Z" } }),
      metrics(),
      "US",
    );
    expect(status.price_as_of).toBe("2026-07-20T20:00:00.000Z");
  });

  it("falls back to fetch time when the provider gives no quote timestamp", () => {
    expect(buildDataStatus(dataset(), metrics(), "US").price_as_of).toBe(
      "2026-07-20T12:00:00.000Z",
    );
  });

  it("maps market state to how the price should be read", () => {
    const state = (marketState?: string) =>
      buildDataStatus(dataset({ provenance: { market_state: marketState } }), metrics(), "US").price_state;

    expect(state("REGULAR")).toBe("delayed"); // never claim "live" on a delayed feed
    expect(state("CLOSED")).toBe("closed");
    expect(state("PRE")).toBe("prepost");
    expect(state("POST")).toBe("prepost");
    expect(state(undefined)).toBe("asof");
    expect(state("SOMETHING_NEW")).toBe("asof");
  });
});

describe("buildDataStatus — missing fields", () => {
  it("reports no missing fields when the core inputs are present", () => {
    expect(buildDataStatus(dataset(), metrics(), "US").missing_fields).toEqual([]);
  });

  it("lists absent core inputs by human label", () => {
    const status = buildDataStatus(
      dataset({ latest: snapshot({ revenue: null, bvps: null }) }),
      metrics(),
      "US",
    );
    expect(status.missing_fields).toEqual(["Revenue", "Book value per share"]);
  });

  it("counts absent free cash flow as missing only for DCF-based valuations", () => {
    const noFcf = dataset({ latest: snapshot({ free_cash_flow: null }) });
    expect(buildDataStatus(noFcf, metrics({ intrinsic_method: "dcf" }), "US").missing_fields).toContain(
      "Free cash flow",
    );
    // For banks/insurers (pbroe) FCF is structurally absent — not a data gap.
    expect(
      buildDataStatus(noFcf, metrics({ intrinsic_method: "pbroe" }), "US").missing_fields,
    ).not.toContain("Free cash flow");
    expect(
      buildDataStatus(noFcf, metrics({ intrinsic_method: "nav" }), "US").missing_fields,
    ).not.toContain("Free cash flow");
  });
});

describe("buildDataStatus — sources and disclosure", () => {
  it("names a single source when EDGAR was not consulted", () => {
    const status = buildDataStatus(dataset(), metrics(), "US");
    expect(status.sources).toEqual(["Yahoo Finance (yahoo-finance2)"]);
    expect(status.edgar_supplemented).toBe(false);
  });

  it("discloses when SEC EDGAR filled gaps", () => {
    const status = buildDataStatus(
      dataset({ provenance: { edgar_supplemented: true } }),
      metrics(),
      "US",
    );
    expect(status.edgar_supplemented).toBe(true);
    expect(status.sources).toEqual([
      "Yahoo Finance (yahoo-finance2)",
      "SEC EDGAR (XBRL company facts)",
    ]);
  });

  it("passes through the engine's data-quality notes verbatim", () => {
    const notes = ["Interest coverage unavailable", "FCF estimated from OCF"];
    expect(
      buildDataStatus(dataset(), metrics({ data_quality_notes: notes }), "US").data_quality_notes,
    ).toEqual(notes);
  });
});

describe("buildDataStatus — model provenance", () => {
  it("stamps the engine version and the assumptions actually used", () => {
    const status = buildDataStatus(
      dataset(),
      metrics({ assumptions: { discount_rate_pct: 9 } }),
      "XLON",
    );
    expect(status.model_version).toBe(VALUATION_MODEL_VERSION);
    expect(status.assumptions?.discount_rate_pct).toBe(9);
    expect(status.exchange).toBe("XLON");
    expect(status.currency).toBe("USD");
  });

  it("carries statement periods and timezone through when present", () => {
    const status = buildDataStatus(
      dataset({
        provenance: {
          income_statement_period: "2025-12-31",
          balance_sheet_period: "2026-03-31",
          price_timezone: "America/New_York",
        },
      }),
      metrics(),
      "US",
    );
    expect(status.income_statement_period).toBe("2025-12-31");
    expect(status.balance_sheet_period).toBe("2026-03-31");
    expect(status.price_timezone).toBe("America/New_York");
  });
});

describe("data-status schema", () => {
  it("accepts a freshly built status", () => {
    const status = buildDataStatus(dataset(), metrics(), "US");
    expect(() => dataStatusSchema.parse(status)).not.toThrow();
  });

  it("keeps data_status optional so pre-provenance analyses still parse", () => {
    const legacy = {
      ticker: "AAPL",
      company_name: "Apple Inc.",
      currency: "USD",
      current_price: 100,
      analysis_date: "2026-01-01T00:00:00.000Z",
      valuation: { pe: 20, pb: 5, ps: 6, ev_ebitda: 15, price_fcf: 22, graham_number: 60, valuation_score: 50, verdict: "mixed", summary: "x" },
      financial_health: { debt_equity: 1, current_ratio: 1.1, interest_coverage: 20, fcf_consistency_score: 80, health_score: 70, verdict: "strong", summary: "x" },
      business_quality: { roe_pct: 30, roic_pct: 25, gross_margin_pct: 44, operating_margin_pct: 30, revenue_stability_score: 85, moat_score: 80, quality_score: 88, verdict: "strong", summary: "x" },
      intrinsic_value: { dcf_value_per_share: 90, graham_value_per_share: 60, blended_intrinsic_value_per_share: 90, margin_of_safety_pct: -10, summary: "x" },
      thesis: { bull_case: ["a"], bear_case: ["b"], red_flags: [], key_risk: "x" },
      final_verdict: { label: "HOLD", confidence_pct: 70, one_line_verdict: "x", reasoning: "x" },
      sources: [{ title: "Yahoo", url: "https://finance.yahoo.com", used_for: "prices" }],
    };
    expect(() => valueInvestingAnalysisSchema.parse(legacy)).not.toThrow();
  });
});
