import { describe, it, expect } from "vitest";

import {
  calculateSimplifiedDcf,
  deriveGrowthRatePct,
  estimateFcfCagr,
  selectConservativeFcfBasis,
} from "@/lib/finance/dcf";
import type { FinancialSnapshot } from "@/types/finance";
import type { ValueCalculationAssumptions } from "@/types/finance";

const defaultAssumptions: ValueCalculationAssumptions = {
  discount_rate_pct: 10,
  terminal_growth_pct: 2.5,
  max_growth_cap_pct: 8,
  use_conservative_fcf_basis: true,
};

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

// ─── estimateFcfCagr ────────────────────────────────────────────────────────

describe("estimateFcfCagr", () => {
  it("computes CAGR for growing FCF series", () => {
    // 50 → 100 over 4 periods = 18.92% CAGR
    const cagr = estimateFcfCagr([50_000, 60_000, 72_000, 87_000, 100_000]);
    expect(cagr).not.toBeNull();
    expect(cagr!).toBeCloseTo(18.92, 0);
  });

  it("returns null for fewer than 2 positive values", () => {
    expect(estimateFcfCagr([null, null, null])).toBeNull();
    expect(estimateFcfCagr([10_000])).toBeNull();
  });

  it("skips null values when computing CAGR", () => {
    // First = index 0 (50k), last = index 4 (100k), periods = 4
    const cagr = estimateFcfCagr([50_000, null, null, null, 100_000]);
    expect(cagr).not.toBeNull();
    expect(cagr!).toBeCloseTo(18.92, 0);
  });

  it("returns null when all periods are 0 (index delta = 0)", () => {
    expect(estimateFcfCagr([100_000])).toBeNull();
  });
});

// ─── selectConservativeFcfBasis ─────────────────────────────────────────────

describe("selectConservativeFcfBasis", () => {
  it("takes minimum of latest vs trailing-3 average when conservative=true", () => {
    // trailing 3 avg = (60+70+80)/3 = 70; latest=80 → min=70
    const basis = selectConservativeFcfBasis(80_000, [50_000, 60_000, 70_000, 80_000], true);
    expect(basis).toBeCloseTo(70_000);
  });

  it("takes latest when conservative=false", () => {
    const basis = selectConservativeFcfBasis(80_000, [50_000, 60_000, 70_000, 80_000], false);
    expect(basis).toBe(80_000);
  });

  it("falls back to trailing average when latestFcf is null", () => {
    const basis = selectConservativeFcfBasis(null, [60_000, 70_000, 80_000], true);
    expect(basis).toBeCloseTo(70_000);
  });

  it("returns null when history is empty and latest is null", () => {
    expect(selectConservativeFcfBasis(null, [], true)).toBeNull();
  });
});

// ─── deriveGrowthRatePct ────────────────────────────────────────────────────

describe("deriveGrowthRatePct", () => {
  it("clamps growth to max_growth_cap_pct", () => {
    // ~10% per step growth — CAGR exceeds 8% cap, not volatile (each step < 35%)
    const rate = deriveGrowthRatePct(
      [100_000, 110_000, 121_000, 133_000, 146_000],
      defaultAssumptions,
    );
    expect(rate).toBe(8);
  });

  it("caps to 2 when history contains negative values", () => {
    const rate = deriveGrowthRatePct([10_000, -5_000, 10_000, 12_000, 14_000], defaultAssumptions);
    expect(rate).toBeLessThanOrEqual(2);
  });

  it("caps to 0.5 when two or more negatives in history", () => {
    const rate = deriveGrowthRatePct(
      [-5_000, -3_000, 10_000, 12_000, 14_000],
      defaultAssumptions,
    );
    expect(rate).toBeLessThanOrEqual(0.5);
  });

  it("returns null when all values are null (no usable data)", () => {
    const rate = deriveGrowthRatePct([null, null, null], defaultAssumptions);
    expect(rate).toBeNull();
  });

  it("defaults to 3 when only one value exists (no CAGR possible)", () => {
    // Single positive value → CAGR = null → growth defaults to 3, clamped by max 8
    const rate = deriveGrowthRatePct([null, null, 10_000], defaultAssumptions);
    expect(rate).toBe(3);
  });
});

// ─── calculateSimplifiedDcf ─────────────────────────────────────────────────

describe("calculateSimplifiedDcf", () => {
  it("produces a positive DCF value for profitable company", () => {
    const result = calculateSimplifiedDcf({
      latest: baseSnapshot,
      historyFcf: [50_000, 60_000, 65_000, 72_000, 80_000],
      sharesOutstanding: 1_000,
      assumptions: defaultAssumptions,
    });
    expect(result.dcf_value_per_share).not.toBeNull();
    expect(result.dcf_value_per_share!).toBeGreaterThan(0);
  });

  it("returns null dcf when FCF is null", () => {
    const result = calculateSimplifiedDcf({
      latest: { ...baseSnapshot, free_cash_flow: null },
      historyFcf: [null, null, null],
      sharesOutstanding: 1_000,
      assumptions: defaultAssumptions,
    });
    expect(result.dcf_value_per_share).toBeNull();
  });

  it("returns null dcf when FCF is negative", () => {
    const result = calculateSimplifiedDcf({
      latest: { ...baseSnapshot, free_cash_flow: -10_000 },
      historyFcf: [-5_000, -3_000, -10_000],
      sharesOutstanding: 1_000,
      assumptions: defaultAssumptions,
    });
    expect(result.dcf_value_per_share).toBeNull();
  });

  it("adds cash and subtracts debt in equity value calculation", () => {
    // Two companies identical except one has more cash
    const withMoreCash = calculateSimplifiedDcf({
      latest: { ...baseSnapshot, cash_and_equivalents: 100_000, total_debt: 0 },
      historyFcf: [50_000, 60_000, 65_000, 72_000, 80_000],
      sharesOutstanding: 1_000,
      assumptions: defaultAssumptions,
    });
    const withLessCash = calculateSimplifiedDcf({
      latest: { ...baseSnapshot, cash_and_equivalents: 10_000, total_debt: 0 },
      historyFcf: [50_000, 60_000, 65_000, 72_000, 80_000],
      sharesOutstanding: 1_000,
      assumptions: defaultAssumptions,
    });
    expect(withMoreCash.dcf_value_per_share!).toBeGreaterThan(
      withLessCash.dcf_value_per_share!,
    );
  });

  it("caps terminal growth rate below discount rate", () => {
    // Even if terminal_growth_pct > discount_rate_pct, it should be capped
    const result = calculateSimplifiedDcf({
      latest: baseSnapshot,
      historyFcf: [50_000, 60_000, 65_000, 72_000, 80_000],
      sharesOutstanding: 1_000,
      assumptions: { ...defaultAssumptions, terminal_growth_pct: 15, discount_rate_pct: 10 },
    });
    // Should still produce a finite result (terminal growth capped to discount_rate - 1%)
    expect(result.dcf_value_per_share).not.toBeNull();
    expect(Number.isFinite(result.dcf_value_per_share!)).toBe(true);
  });
});
