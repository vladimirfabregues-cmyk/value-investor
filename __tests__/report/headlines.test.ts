import { describe, it, expect } from "vitest";

import { monthBounds, previousMonth, type MonthlyReport } from "@/lib/report/data";
import { headlines } from "@/lib/report/headlines";
import { evaluateClaims, proposals, weeklyReturns } from "@/lib/report/claims";
import { claimStatus, summarize } from "@/lib/stats";
import type { Scorecard } from "@/lib/scorecard/compute";

const book = (strategy: string, sinceFixedPct: number, monthPct = 0) => ({
  strategy, valueGbp: 10000, monthPct, sinceFixedPct, sinceInceptionPct: 0, maxDrawdownPct: 0, costsPct: 0, holdings: 20, tradesInMonth: 3,
});
const report = (spreadWeeks: number): MonthlyReport => ({
  version: 2,
  month: "2026-11", periodStart: "2026-11-01", periodEnd: "2026-11-30", builtAt: "2026-12-01T08:00:00Z",
  claims: [],
  books: [book("LAB_JP", 0.05), book("BENCHMARK", 0.02), book("LAB_US", -0.01)],
  diagnostics: [
    {
      strategy: "LAB_JP",
      month: null,
      sinceFixed: { total: 0.05, currency: 0.02, market: 0.02, selection: 0.012, dividends: 0.002, costs: 0.004, other: 0, weeks: 9 },
      concentration: { holdings: 3, effectiveNames: 2.5, topSector: "Financials", topSectorWeight: 0.7, regions: { JP: 1 }, cashWeight: 0, warning: true },
      profile: null, switches: [], tradingMonth: null, tradingAvg: null, tradingMonths: 0,
    },
  ],
  scorecard: {
    ratings: 50000, horizons: [], best: [], worst: [],
    spread: { points: [], summary: summarize(Array.from({ length: spreadWeeks }, (_, i) => 0.001 + (i % 2 ? 0.0002 : -0.0002))), strength: spreadWeeks < 12 ? "too early" : "strong" },
    outcomes: { snapshot: 9000, gap: 10, trading: 3, takeover: 2, failure: 1, missing: 40, badPrice: 0 },
  },
  strongBuys: { joined: [], left: [], current: [] },
  health: { runWeeks: 4, fullRunWeeks: 4, badPrices: 0 },
  etf: null,
});

describe("month helpers", () => {
  it("bounds a month and finds the previous one across a year end", () => {
    expect(monthBounds("2026-12")).toEqual({ start: "2026-12-01", end: "2027-01-01" });
    expect(previousMonth(new Date("2027-01-01T08:00:00Z"))).toBe("2026-12");
  });
});

describe("headlines", () => {
  const h = headlines(report(30), null);
  it("leads with results since the rules were fixed and where they came from", () => {
    expect(h.some((l) => l.includes("best Japan only +5.0%") && l.includes("1 of 2 rulebooks are ahead"))).toBe(true);
    expect(h.some((l) => l.includes("stock picking +1.2 pts"))).toBe(true);
  });
  it("warns about concentration and missing outcomes", () => {
    expect(h.some((l) => l.startsWith("Concentration warning: Japan only (effectively 2.5 positions; Financials 70%)"))).toBe(true);
    expect(h.some((l) => l.includes("1 rating(s) of failed companies counted as total losses"))).toBe(true);
  });
  it("only states a ratings finding once there are enough weeks", () => {
    expect(h.some((l) => l.startsWith("Buy-rated companies have beaten Avoid-rated ones by +5.2 pts a year"))).toBe(true);
    expect(headlines(report(5), null).some((l) => l.startsWith("Too early to judge the ratings: 5 week(s)"))).toBe(true);
  });
});

describe("claims", () => {
  const weeks = (n: number, value: (i: number) => number) =>
    Array.from({ length: n }, (_, i) => ({ date: `w${i}`, value: value(i) }));
  const card = (n: number): Scorecard =>
    ({ weekly: { spread: weeks(n, (i) => 0.001 + (i % 2 ? 0.0002 : -0.0002)), ic: [], flags: {}, qualityValue: [] } }) as unknown as Scorecard;

  it("grades claim 1 from too early, to leaning, to established", () => {
    const status = (n: number) => evaluateClaims({ scorecard: card(n), books: new Map(), etfForward: [] })[0].status;
    expect(status(8)).toBe("too early");
    expect(status(20)).toBe("leaning yes"); // strong but not yet 26 weeks
    expect(status(30)).toBe("established");
  });

  it("needs the edge to clear the stated size, not just be positive", () => {
    const small = summarize(Array.from({ length: 30 }, (_, i) => 0.0002 + (i % 2 ? 0.00005 : -0.00005)));
    expect(claimStatus(small, 0.02 / 52)).toBe("leaning yes"); // ~1 pt a year: real but below 2
  });

  it("turns only decided claims into proposals", () => {
    const claims = evaluateClaims({ scorecard: card(30), books: new Map(), etfForward: [] });
    const { proposed, watching } = proposals(claims);
    expect(proposed).toEqual([]); // claim 1 established has no action attached; nothing rejected
    expect(watching).toEqual([]);
    const rejected = proposals([{ ...claims[0], status: "rejected" }]);
    expect(rejected.proposed[0]).toContain("review the valuation model");
  });

  it("reads one return per week from a value curve", () => {
    const r = weeklyReturns(
      [
        { date: "2026-10-05", holdingsGbp: 0, cashGbp: 0, totalGbp: 100 },
        { date: "2026-10-08", holdingsGbp: 0, cashGbp: 0, totalGbp: 105 },
        { date: "2026-10-12", holdingsGbp: 0, cashGbp: 0, totalGbp: 110 },
      ],
      "2026-09-29",
    );
    expect([...r.values()]).toHaveLength(1);
    expect([...r.values()][0]).toBeCloseTo(110 / 105 - 1, 9);
  });
});
