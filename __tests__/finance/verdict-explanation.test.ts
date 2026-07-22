import { describe, it, expect } from "vitest";

import { calculateValueMetrics } from "@/lib/finance/scoring";
import { buildVerdictExplanation } from "@/lib/finance/verdict-explanation";
import type { NormalizedFinancialDataset } from "@/types/finance";

/** Healthy mid-cap operating company, priced far below intrinsic value. */
const healthy: NormalizedFinancialDataset = {
  ticker: "TEST",
  company_name: "Test Corp",
  currency: "USD",
  price: 5,
  market_cap: 1_000_000_000,
  enterprise_value: 1_020_000_000,
  shares_outstanding: 20_000_000,
  as_of_date: "2026-01-01",
  source_name: "test",
  latest: {
    revenue: 390_000_000, ebitda: 100_000_000, ebit: 90_000_000, net_income: 70_000_000,
    diluted_eps: 4.5, bvps: 20, free_cash_flow: 60_000_000, total_debt: 50_000_000,
    total_equity: 100_000_000, cash_and_equivalents: 30_000_000, current_assets: 80_000_000,
    current_liabilities: 40_000_000, interest_expense: 5_000_000, gross_margin_pct: 70,
    operating_margin_pct: 35, roe_pct: 30, roic_pct: 25,
  },
  history_5y: {
    revenue: [300_000_000, 320_000_000, 345_000_000, 365_000_000, 390_000_000],
    free_cash_flow: [40_000_000, 45_000_000, 50_000_000, 55_000_000, 60_000_000],
    diluted_eps: [2.5, 3.0, 3.5, 4.0, 4.5],
    gross_margin_pct: [65, 67, 68, 69, 70],
    operating_margin_pct: [30, 31, 32, 33, 35],
    roe_pct: [25, 26, 27, 28, 30],
    roic_pct: [20, 21, 22, 23, 25],
  },
};

describe("buildVerdictExplanation", () => {
  it("agrees with the verdict the scoring engine produced", () => {
    const m = calculateValueMetrics(healthy);
    const e = buildVerdictExplanation(m);
    // One authoritative result — the panel must never disagree with the badge
    expect(e.final_verdict).toBe(m.suggested_verdict);
    expect(e.overall_score).toBe(Math.round(m.composite_score));
  });

  it("reports a check for each scored component plus the valuation gap", () => {
    const e = buildVerdictExplanation(calculateValueMetrics(healthy));
    const names = e.checks.map((c) => c.name);
    expect(names).toContain("Valuation");
    expect(names).toContain("Financial health");
    expect(names).toContain("Business quality");
    expect(e.checks.length).toBe(4);
  });

  it("names the overriding gate when a hard gate fires", () => {
    // D/E of 3 trips the severe balance-sheet gate for a default-sector company
    const weak = {
      ...healthy,
      latest: { ...healthy.latest, total_debt: 300_000_000, total_equity: 100_000_000 },
    };
    const m = calculateValueMetrics(weak);
    const e = buildVerdictExplanation(m);

    expect(m.suggested_verdict).toBe("AVOID");
    expect(e.hard_gates.length).toBeGreaterThan(0);
    // the explanation must say *which* gate overrode the score, not just that one did
    expect(e.explanation.toLowerCase()).toContain("hard gate");
    expect(e.hard_gates.some((g) => /balance-sheet/i.test(g.name))).toBe(true);
    // and the corresponding check must read as failed, not passed
    const health = e.checks.find((c) => c.name === "Financial health");
    expect(health?.status).toBe("fail");
  });

  it("describes an overvalued company as a premium, never a negative margin", () => {
    const expensive = { ...healthy, price: 10_000 };
    const e = buildVerdictExplanation(calculateValueMetrics(expensive));
    const gapCheck = e.checks.find((c) => /premium|margin of safety/i.test(c.name));
    expect(gapCheck?.name).toBe("Premium to estimated value");
    expect(gapCheck?.detail).toMatch(/above estimated value/i);
    expect(e.explanation).not.toMatch(/-\d|−\d/);
  });

  it("surfaces the valuation model actually used", () => {
    const e = buildVerdictExplanation(calculateValueMetrics(healthy));
    expect(e.valuation_method).toBe("dcf");
    expect(e.valuation_method_label.length).toBeGreaterThan(0);
  });

  it("states that all checks passed when nothing is wrong", () => {
    const e = buildVerdictExplanation(calculateValueMetrics(healthy));
    if (e.hard_gates.length === 0 && e.checks.every((c) => c.status !== "fail")) {
      expect(e.explanation).toMatch(/every component check passed/i);
    }
  });
});
