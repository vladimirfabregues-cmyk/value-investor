import { describe, it, expect } from "vitest";

import {
  clamp,
  computeBusinessQuality,
  computeFinancialHealth,
  computeRevenueStabilityScore,
  computeValuationRatios,
  computeValuationScore,
  marginOfSafetyScore,
  positiveSeriesRatio,
  roundTo,
  safeDivide,
  scoreBand,
  weightedAverage,
} from "@/lib/finance/ratios";
import type { FinancialSnapshot, FinancialHistory5Y } from "@/types/finance";

// ─── Helpers ────────────────────────────────────────────────────────────────

const baseSnapshot: FinancialSnapshot = {
  revenue: 390_000,
  ebitda: 100_000,
  ebit: 90_000,
  net_income: 70_000,
  diluted_eps: 4.5,
  bvps: 20,
  free_cash_flow: 80_000,
  total_debt: 50_000,
  total_equity: 100_000,
  cash_and_equivalents: 30_000,
  current_assets: 80_000,
  current_liabilities: 40_000,
  interest_expense: 5_000,
  gross_margin_pct: 45,
  operating_margin_pct: 25,
  roe_pct: 20,
  roic_pct: 18,
};

const baseHistory: FinancialHistory5Y = {
  revenue: [300_000, 320_000, 345_000, 365_000, 390_000],
  free_cash_flow: [50_000, 60_000, 65_000, 72_000, 80_000],
  diluted_eps: [2.5, 3.0, 3.5, 4.0, 4.5],
  gross_margin_pct: [42, 43, 44, 44, 45],
  operating_margin_pct: [22, 23, 23, 24, 25],
  roe_pct: [17, 18, 19, 19, 20],
  roic_pct: [15, 16, 17, 17, 18],
};

// ─── roundTo ────────────────────────────────────────────────────────────────

describe("roundTo", () => {
  it("rounds to 2 decimal places by default", () => {
    expect(roundTo(1.2345)).toBe(1.23);
  });

  it("rounds to specified decimal places", () => {
    expect(roundTo(1.2345, 3)).toBe(1.235);
    expect(roundTo(1.2345, 0)).toBe(1);
  });

  it("returns null for null input", () => {
    expect(roundTo(null)).toBeNull();
  });

  it("returns null for non-finite values", () => {
    expect(roundTo(Infinity)).toBeNull();
    expect(roundTo(NaN)).toBeNull();
  });
});

// ─── clamp ──────────────────────────────────────────────────────────────────

describe("clamp", () => {
  it("clamps to default [0, 100]", () => {
    expect(clamp(-5)).toBe(0);
    expect(clamp(150)).toBe(100);
    expect(clamp(50)).toBe(50);
  });

  it("clamps to custom bounds", () => {
    expect(clamp(5, 10, 20)).toBe(10);
    expect(clamp(25, 10, 20)).toBe(20);
    expect(clamp(15, 10, 20)).toBe(15);
  });
});

// ─── safeDivide ─────────────────────────────────────────────────────────────

describe("safeDivide", () => {
  it("divides normally", () => {
    expect(safeDivide(10, 2)).toBe(5);
  });

  it("returns null on zero denominator", () => {
    expect(safeDivide(10, 0)).toBeNull();
  });

  it("returns null on null inputs", () => {
    expect(safeDivide(null, 2)).toBeNull();
    expect(safeDivide(10, null)).toBeNull();
  });

  it("returns null for non-finite values", () => {
    expect(safeDivide(Infinity, 2)).toBeNull();
    expect(safeDivide(10, NaN)).toBeNull();
  });
});

// ─── scoreBand ──────────────────────────────────────────────────────────────

describe("scoreBand", () => {
  it("maps score ranges to bands correctly", () => {
    expect(scoreBand(90)).toBe("elite");
    expect(scoreBand(85)).toBe("elite");
    expect(scoreBand(84)).toBe("strong");
    expect(scoreBand(70)).toBe("strong");
    expect(scoreBand(69)).toBe("mixed");
    expect(scoreBand(55)).toBe("mixed");
    expect(scoreBand(54)).toBe("weak");
    expect(scoreBand(40)).toBe("weak");
    expect(scoreBand(39)).toBe("poor");
    expect(scoreBand(0)).toBe("poor");
  });
});

// ─── weightedAverage ────────────────────────────────────────────────────────

describe("weightedAverage", () => {
  it("computes weighted average", () => {
    const result = weightedAverage([
      { value: 80, weight: 0.5 },
      { value: 60, weight: 0.5 },
    ]);
    expect(result).toBe(70);
  });

  it("ignores null values and adjusts weights", () => {
    const result = weightedAverage([
      { value: 80, weight: 0.5 },
      { value: null, weight: 0.3 },
      { value: 60, weight: 0.2 },
    ]);
    expect(result).toBeCloseTo((80 * 0.5 + 60 * 0.2) / 0.7, 5);
  });

  it("returns 50 when all values are null", () => {
    expect(weightedAverage([{ value: null, weight: 1 }])).toBe(50);
  });
});

// ─── positiveSeriesRatio ────────────────────────────────────────────────────

describe("positiveSeriesRatio", () => {
  it("returns 100 when all values are positive", () => {
    expect(positiveSeriesRatio([10, 20, 30])).toBe(100);
  });

  it("returns 0 when all values are zero or negative", () => {
    expect(positiveSeriesRatio([0, -5, -10])).toBe(0);
  });

  it("handles mixed series", () => {
    expect(positiveSeriesRatio([10, -5, 20, null])).toBeCloseTo(66.67, 1);
  });

  it("returns 0 when series is empty", () => {
    expect(positiveSeriesRatio([])).toBe(0);
  });
});

// ─── computeValuationRatios ─────────────────────────────────────────────────

describe("computeValuationRatios", () => {
  it("computes Graham Number correctly", () => {
    // sqrt(22.5 * 4.5 * 20) = sqrt(2025) = 45
    const result = computeValuationRatios({
      price: 50,
      marketCap: 1_000_000,
      enterpriseValue: 1_020_000,
      latest: baseSnapshot,
    });
    expect(result.graham_number).toBe(45);
  });

  it("returns null Graham Number when EPS is non-positive", () => {
    const result = computeValuationRatios({
      price: 50,
      marketCap: 1_000_000,
      enterpriseValue: 1_020_000,
      latest: { ...baseSnapshot, diluted_eps: 0 },
    });
    expect(result.graham_number).toBeNull();
  });

  it("returns null ratios when relevant inputs are null", () => {
    const result = computeValuationRatios({
      price: 50,
      marketCap: 1_000_000,
      enterpriseValue: 1_020_000,
      latest: { ...baseSnapshot, diluted_eps: null, bvps: null },
    });
    expect(result.pe).toBeNull();
    expect(result.pb).toBeNull();
    expect(result.graham_number).toBeNull();
  });

  it("computes P/E ratio", () => {
    const result = computeValuationRatios({
      price: 45,
      marketCap: 1_000_000,
      enterpriseValue: 1_020_000,
      latest: { ...baseSnapshot, diluted_eps: 3 },
    });
    expect(result.pe).toBe(15);
  });
});

// ─── computeValuationScore ───────────────────────────────────────────────────

describe("computeValuationScore", () => {
  it("gives a higher score for cheaper valuation", () => {
    const cheap = computeValuationScore({
      price: 30,
      ratios: computeValuationRatios({
        price: 30,
        marketCap: 500_000,
        enterpriseValue: 520_000,
        latest: { ...baseSnapshot, diluted_eps: 4, bvps: 25 },
      }),
      latest: { ...baseSnapshot, diluted_eps: 4, bvps: 25 },
    });
    const expensive = computeValuationScore({
      price: 200,
      ratios: computeValuationRatios({
        price: 200,
        marketCap: 3_000_000,
        enterpriseValue: 3_020_000,
        latest: { ...baseSnapshot, diluted_eps: 4, bvps: 25 },
      }),
      latest: { ...baseSnapshot, diluted_eps: 4, bvps: 25 },
    });
    expect(cheap).toBeGreaterThan(expensive);
  });

  it("returns 25 when no metrics available", () => {
    const score = computeValuationScore({
      price: 100,
      ratios: {
        pe: null,
        pb: null,
        ps: null,
        ev_ebitda: null,
        price_fcf: null,
        graham_number: null,
      },
      latest: {
        ...baseSnapshot,
        diluted_eps: null,
        bvps: null,
        revenue: null,
        ebitda: null,
        free_cash_flow: null,
      },
    });
    expect(score).toBe(25);
  });
});

// ─── computeFinancialHealth ──────────────────────────────────────────────────

describe("computeFinancialHealth", () => {
  it("computes health score for healthy company", () => {
    const result = computeFinancialHealth({
      latest: baseSnapshot,
      history: baseHistory,
    });
    expect(result.health_score).toBeGreaterThan(60);
    expect(result.severe_balance_sheet_weakness).toBe(false);
    expect(result.debt_equity).toBe(0.5);
    expect(result.current_ratio).toBe(2);
    expect(result.interest_coverage).toBe(18);
  });

  it("flags severe balance sheet weakness on high debt", () => {
    const result = computeFinancialHealth({
      latest: { ...baseSnapshot, total_debt: 200_000, total_equity: 100_000 },
      history: baseHistory,
    });
    expect(result.severe_balance_sheet_weakness).toBe(true);
  });

  it("flags severe weakness on low current ratio", () => {
    const result = computeFinancialHealth({
      latest: { ...baseSnapshot, current_assets: 30_000, current_liabilities: 40_000 },
      history: baseHistory,
    });
    expect(result.severe_balance_sheet_weakness).toBe(true);
  });

  it("returns null metrics when inputs are null", () => {
    const result = computeFinancialHealth({
      latest: {
        ...baseSnapshot,
        total_equity: null,
        current_liabilities: null,
        interest_expense: null,
      },
      history: baseHistory,
    });
    expect(result.debt_equity).toBeNull();
    expect(result.current_ratio).toBeNull();
    expect(result.interest_coverage).toBeNull();
  });
});

// ─── computeRevenueStabilityScore ───────────────────────────────────────────

describe("computeRevenueStabilityScore", () => {
  it("gives high score for slow steady growing revenue", () => {
    // ~2% per step keeps per-step penalty small, resulting in a high score
    const score = computeRevenueStabilityScore([100, 102, 104, 106, 108]);
    expect(score).toBeGreaterThan(85);
  });

  it("gives low score for volatile revenue", () => {
    const score = computeRevenueStabilityScore([100, 50, 150, 40, 120]);
    expect(score).toBeLessThan(50);
  });

  it("penalizes when latest is far below peak", () => {
    const score = computeRevenueStabilityScore([200, 210, 220, 230, 100]);
    expect(score).toBeLessThan(50);
  });

  it("returns 45 for fewer than 3 data points", () => {
    expect(computeRevenueStabilityScore([100, 110])).toBe(45);
    expect(computeRevenueStabilityScore([])).toBe(45);
  });
});

// ─── computeBusinessQuality ──────────────────────────────────────────────────

describe("computeBusinessQuality", () => {
  it("gives high quality score for high-quality company", () => {
    const result = computeBusinessQuality({
      latest: baseSnapshot,
      history: baseHistory,
    });
    expect(result.quality_score).toBeGreaterThan(60);
    expect(result.weak_business_profile).toBe(false);
  });

  it("flags weak business profile for low ROIC", () => {
    const result = computeBusinessQuality({
      latest: { ...baseSnapshot, roic_pct: 3, operating_margin_pct: 3 },
      history: baseHistory,
    });
    expect(result.weak_business_profile).toBe(true);
  });

  it("moat score is within 0–100", () => {
    const result = computeBusinessQuality({
      latest: baseSnapshot,
      history: baseHistory,
    });
    expect(result.moat_score).toBeGreaterThanOrEqual(0);
    expect(result.moat_score).toBeLessThanOrEqual(100);
  });
});

// ─── marginOfSafetyScore ────────────────────────────────────────────────────

describe("marginOfSafetyScore", () => {
  it("returns 30 for null MOS", () => {
    expect(marginOfSafetyScore(null)).toBe(30);
  });

  it("scores MOS bands correctly", () => {
    expect(marginOfSafetyScore(45)).toBe(90);
    expect(marginOfSafetyScore(30)).toBe(75);
    expect(marginOfSafetyScore(15)).toBe(60);
    expect(marginOfSafetyScore(0)).toBe(45);
    expect(marginOfSafetyScore(-15)).toBe(20);
  });
});
