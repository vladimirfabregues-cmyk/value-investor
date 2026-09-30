import { describe, it, expect } from "vitest";

import { monthBounds, previousMonth, type MonthlyReport } from "@/lib/report/data";
import { headlines } from "@/lib/report/headlines";

const verdict = (v: string, n: number, meanExcess: number) => ({ verdict: v, n, cohorts: 4, meanExcess, medianExcess: meanExcess, hitRate: 0.5 });
const book = (strategy: string, monthPct: number, sinceFixedPct = 0) => ({
  strategy, valueGbp: 10000, monthPct, sinceFixedPct, sinceInceptionPct: 0, maxDrawdownPct: 0, costsPct: 0, holdings: 20, tradesInMonth: 3,
});
const report = (buyN: number): MonthlyReport => ({
  month: "2026-11", periodStart: "2026-11-01", periodEnd: "2026-11-30", builtAt: "2026-12-01T08:00:00Z",
  books: [book("LAB_JP", 0.03, 0.05), book("BENCHMARK", 0.01, 0.02), book("LAB_US", -0.02, -0.01)],
  scorecard: { ratings: 50000, horizons: [{ weeks: 4, observations: 9000, scoreIc: 0.05, byVerdict: [verdict("BUY", buyN, 0.012), verdict("AVOID", 7000, -0.002)] }], flags: [], best: [], worst: [] },
  strongBuys: { joined: ["AAA"], left: [], current: ["AAA"] },
  health: { runWeeks: 4, fullRunWeeks: 4, badPrices: 3 },
  etf: null,
});

describe("month helpers", () => {
  it("bounds a month and finds the previous one across a year end", () => {
    expect(monthBounds("2026-12")).toEqual({ start: "2026-12-01", end: "2027-01-01" });
    expect(previousMonth(new Date("2027-01-01T08:00:00Z"))).toBe("2026-12");
  });
});

describe("headlines", () => {
  it("names the best and weakest rulebook against the benchmark", () => {
    const h = headlines(report(400), null);
    expect(h[0]).toContain("Japan only, +3.0%");
    expect(h[0]).toContain("US only, −2.0%");
    expect(h.some((l) => l.includes("1 of 2 rulebooks are ahead"))).toBe(true);
  });

  it("only states a ratings finding with enough Buy ratings", () => {
    expect(headlines(report(400), null).some((l) => l.includes("pointing the right way") && l.includes("1.4 points"))).toBe(true);
    expect(headlines(report(40), null).some((l) => l.startsWith("Too few Buy ratings"))).toBe(true);
  });
});
