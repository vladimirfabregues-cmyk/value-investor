import { describe, it, expect } from "vitest";

import { calculateValueMetrics, DEFAULT_VALUE_ASSUMPTIONS } from "@/lib/finance/scoring";
import type { NormalizedFinancialDataset } from "@/types/finance";

// Realistic mid-cap scale: the verdict pipeline now has institutional gates
// (micro-cap illiquidity below ~100M market cap), so fixtures must represent
// a genuinely screenable company.
const baseDataset: NormalizedFinancialDataset = {
  ticker: "TEST",
  company_name: "Test Corp",
  currency: "USD",
  price: 50,
  market_cap: 1_000_000_000,
  enterprise_value: 1_020_000_000,
  shares_outstanding: 20_000_000,
  as_of_date: "2025-01-01",
  source_name: "test",
  latest: {
    revenue: 390_000_000,
    ebitda: 100_000_000,
    ebit: 90_000_000,
    net_income: 70_000_000,
    diluted_eps: 4.5,
    bvps: 20,
    free_cash_flow: 80_000_000,
    total_debt: 50_000_000,
    total_equity: 100_000_000,
    cash_and_equivalents: 30_000_000,
    current_assets: 80_000_000,
    current_liabilities: 40_000_000,
    interest_expense: 5_000_000,
    gross_margin_pct: 45,
    operating_margin_pct: 25,
    roe_pct: 20,
    roic_pct: 18,
  },
  history_5y: {
    revenue: [300_000_000, 320_000_000, 345_000_000, 365_000_000, 390_000_000],
    free_cash_flow: [50_000_000, 60_000_000, 65_000_000, 72_000_000, 80_000_000],
    diluted_eps: [2.5, 3.0, 3.5, 4.0, 4.5],
    gross_margin_pct: [42, 43, 44, 44, 45],
    operating_margin_pct: [22, 23, 23, 24, 25],
    roe_pct: [17, 18, 19, 19, 20],
    roic_pct: [15, 16, 17, 17, 18],
  },
};

describe("calculateValueMetrics", () => {
  it("returns all expected top-level fields", () => {
    const result = calculateValueMetrics(baseDataset);
    expect(result).toHaveProperty("ticker", "TEST");
    expect(result).toHaveProperty("valuation");
    expect(result).toHaveProperty("financial_health");
    expect(result).toHaveProperty("business_quality");
    expect(result).toHaveProperty("intrinsic_value");
    expect(result).toHaveProperty("suggested_verdict");
    expect(result).toHaveProperty("composite_score");
    expect(result).toHaveProperty("diagnostics");
  });

  it("composite score is within 0–100", () => {
    const result = calculateValueMetrics(baseDataset);
    expect(result.composite_score).toBeGreaterThanOrEqual(0);
    expect(result.composite_score).toBeLessThanOrEqual(100);
  });

  it("margin of safety is positive when price < blended intrinsic value", () => {
    const cheapDataset: NormalizedFinancialDataset = {
      ...baseDataset,
      price: 10, // far below intrinsic value
    };
    const result = calculateValueMetrics(cheapDataset);
    expect(result.intrinsic_value.margin_of_safety_pct).not.toBeNull();
    expect(result.intrinsic_value.margin_of_safety_pct!).toBeGreaterThan(0);
  });

  it("margin of safety is negative when price > blended intrinsic value", () => {
    const expensiveDataset: NormalizedFinancialDataset = {
      ...baseDataset,
      price: 10_000, // far above intrinsic value
    };
    const result = calculateValueMetrics(expensiveDataset);
    expect(result.intrinsic_value.margin_of_safety_pct!).toBeLessThan(0);
  });

  it("returns AVOID for severe balance sheet weakness", () => {
    const weakDataset: NormalizedFinancialDataset = {
      ...baseDataset,
      price: 5, // cheap
      latest: {
        ...baseDataset.latest,
        total_debt: 300_000_000,
        total_equity: 100_000_000, // D/E = 3 → severe weakness
      },
    };
    const result = calculateValueMetrics(weakDataset);
    expect(result.suggested_verdict).toBe("AVOID");
  });

  it("returns STRONG_BUY for deep value with high quality", () => {
    // FCF sized so the DCF (~46/share) corroborates the Graham number (~45)
    // within the 30% triangulation tolerance required for top conviction.
    const strongBuyDataset: NormalizedFinancialDataset = {
      ...baseDataset,
      price: 5, // very cheap vs intrinsic value
      latest: {
        ...baseDataset.latest,
        roic_pct: 25,
        roe_pct: 30,
        gross_margin_pct: 70,
        operating_margin_pct: 35,
        free_cash_flow: 60_000_000,
      },
      history_5y: {
        ...baseDataset.history_5y,
        free_cash_flow: [40_000_000, 45_000_000, 50_000_000, 55_000_000, 60_000_000],
        gross_margin_pct: [65, 67, 68, 69, 70],
        operating_margin_pct: [30, 31, 32, 33, 35],
        roe_pct: [25, 26, 27, 28, 30],
        roic_pct: [20, 21, 22, 23, 25],
      },
    };
    const result = calculateValueMetrics(strongBuyDataset);
    expect(result.suggested_verdict).toBe("STRONG_BUY");
  });

  it("includes assumptions in diagnostics, with the size premium applied to the cost of equity", () => {
    const result = calculateValueMetrics(baseDataset);
    // The reported rate is the one actually used: $1B market cap → small-cap
    // tier → +1.5pp equity-risk premium on the 10% base.
    expect(result.diagnostics.assumptions).toEqual({
      ...DEFAULT_VALUE_ASSUMPTIONS,
      discount_rate_pct: 11.5,
    });
  });

  it("respects custom assumptions", () => {
    const conservativeAssumptions = {
      ...DEFAULT_VALUE_ASSUMPTIONS,
      discount_rate_pct: 15,
    };
    const result = calculateValueMetrics(baseDataset, conservativeAssumptions);
    // Higher discount rate → lower DCF value per share
    const defaultResult = calculateValueMetrics(baseDataset);

    const conservativeDcf = result.intrinsic_value.dcf_value_per_share;
    const defaultDcf = defaultResult.intrinsic_value.dcf_value_per_share;

    if (conservativeDcf !== null && defaultDcf !== null) {
      expect(conservativeDcf).toBeLessThan(defaultDcf);
    }
  });

  it("blended value weights DCF at 70% and Graham at 30%", () => {
    const result = calculateValueMetrics(baseDataset);
    const { dcf_value_per_share, graham_value_per_share, blended_intrinsic_value_per_share } =
      result.intrinsic_value;

    if (
      dcf_value_per_share !== null &&
      graham_value_per_share !== null &&
      blended_intrinsic_value_per_share !== null
    ) {
      const expected = dcf_value_per_share * 0.7 + graham_value_per_share * 0.3;
      expect(blended_intrinsic_value_per_share).toBeCloseTo(expected, 1);
    }
  });

  it("handles missing FCF gracefully", () => {
    const noFcfDataset: NormalizedFinancialDataset = {
      ...baseDataset,
      latest: { ...baseDataset.latest, free_cash_flow: null },
      history_5y: {
        ...baseDataset.history_5y,
        free_cash_flow: [null, null, null, null, null],
      },
    };
    const result = calculateValueMetrics(noFcfDataset);
    expect(result.intrinsic_value.dcf_value_per_share).toBeNull();
    // Graham value should still be computed from EPS and BVPS
    expect(result.intrinsic_value.graham_value_per_share).not.toBeNull();
  });
});
