import { describe, it, expect, vi, beforeEach } from "vitest";

// The report must build from whatever is stored — including rows written by
// older code, before the diagnostics and weekly series existed.
const db = vi.hoisted(() => ({
  simPortfolio: { findMany: vi.fn() },
  screenSnapshot: { findMany: vi.fn(), groupBy: vi.fn() },
  scorecardResult: { findUnique: vi.fn() },
  reportArchive: { findUnique: vi.fn(), upsert: vi.fn() },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

import { buildMonthlyReport } from "@/lib/report/data";
import { headlines } from "@/lib/report/headlines";

const valuations = [
  { date: "2026-09-29", holdingsGbp: 9000, cashGbp: 1000, totalGbp: 10000 },
  { date: "2026-10-12", holdingsGbp: 9300, cashGbp: 1000, totalGbp: 10300 },
  { date: "2026-10-26", holdingsGbp: 9500, cashGbp: 1000, totalGbp: 10500 },
];
const oldMetrics = { initialGbp: 10000, currentValueGbp: 10500, totalReturnGbp: 500, totalReturnPct: 0.05, grossReturnGbp: 510, grossReturnPct: 0.051, realisedGbp: 0, unrealisedGbp: 500, dividendsGbp: 0, costsGbp: 10, annualisedPct: null, benchmarkReturnPct: 0.03 };
const book = (strategy: string, metrics: object) => ({
  strategy, inceptionDate: "2026-06-11", capitalGbp: 10000, valuations, holdings: [{ ticker: "A" }], transactions: [], metrics, builtAt: new Date(),
});
const oldScorecard = {
  ratings: 25000, ratingsFrom: "2026-06-10", ratingsTo: "2026-09-29", badPrices: 0,
  horizons: [{ weeks: 4, observations: 800, byVerdict: [], scoreIc: { mean: 0.06, cohorts: 5 }, subScoreIc: {}, flags: [], fairValue: { n: 0, medianGapClosed: null } }],
  cases: { weeks: 4, best: [], worst: [], missed: [] },
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  db.screenSnapshot.findMany.mockResolvedValue([]);
  db.screenSnapshot.groupBy.mockResolvedValue([]);
});

describe("buildMonthlyReport", () => {
  it("builds from rows written before diagnostics and weekly series existed", async () => {
    db.simPortfolio.findMany.mockResolvedValue([book("LAB_TOP20", oldMetrics), book("BENCHMARK", oldMetrics)]);
    db.scorecardResult.findUnique.mockResolvedValue({ data: oldScorecard, builtAt: new Date() });
    const r = await buildMonthlyReport("2026-10", new Date("2026-11-01T08:00:00Z"));
    expect(r.claims).toHaveLength(8);
    expect(r.claims!.every((c) => c.status === "too early")).toBe(true);
    expect(r.books.find((b) => b.strategy === "LAB_TOP20")!.sinceFixedPct).toBeCloseTo(0.05, 9);
    expect(r.diagnostics![0].sinceFixed).toBeNull();
    expect(r.scorecard!.flaglessLosers).toEqual([]);
    expect(r.etf).toBeNull();
    expect(headlines(r, null).length).toBeGreaterThan(0);
  });

  it("builds with nothing stored at all", async () => {
    db.simPortfolio.findMany.mockResolvedValue([]);
    db.scorecardResult.findUnique.mockResolvedValue(null);
    const r = await buildMonthlyReport("2026-10");
    expect(r.books).toEqual([]);
    expect(r.scorecard).toBeNull();
  });
});
