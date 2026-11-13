import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// The report page must render both a newly built report and the reports
// frozen before the readiness dashboard, ranges and sector split existed.
const db = vi.hoisted(() => ({
  simPortfolio: { findMany: vi.fn() },
  screenSnapshot: { findMany: vi.fn(), groupBy: vi.fn() },
  scorecardResult: { findUnique: vi.fn() },
  reportArchive: { findUnique: vi.fn(), upsert: vi.fn() },
}));
vi.mock("@/lib/db/client", () => ({ prisma: db }));

import ReportPage from "@/app/value/report/page";
import { buildMonthlyReport, type MonthlyReport } from "@/lib/report/data";

/** Weekly values from 11 June, growing at `weekly` (plus a wobble) each week. */
function series(weekly: number, wobble: number) {
  const out: { date: string; holdingsGbp: number; cashGbp: number; totalGbp: number }[] = [];
  let v = 10000;
  for (let d = Date.parse("2026-06-11T00:00:00Z"), i = 0; d <= Date.parse("2026-10-30T00:00:00Z"); d += 7 * 86_400_000, i++) {
    out.push({ date: new Date(d).toISOString().slice(0, 10), holdingsGbp: v, cashGbp: 0, totalGbp: v });
    v *= 1 + weekly + (i % 2 ? wobble : -wobble);
  }
  return out;
}

const analytics = {
  attribution: series(0, 0).slice(16).map((p) => ({ date: p.date, total: 0.002, currency: -0.001, market: 0.001, sector: 0.0005, selection: 0.0015, dividends: 0, costs: 0.0002 })),
  concentration: { holdings: 20, effectiveNames: 18.5, topSector: "Financials", topSectorWeight: 0.25, regions: { JP: 0.6, US: 0.4 }, cashWeight: 0, warning: false },
  profile: { closed: 4, open: 20, hitRate: 0.5, avgWin: 0.08, avgLoss: -0.05, medianWeeks: 5, topThreeShare: 0.3 },
  selling: [],
  trading: [],
};
const metrics = { initialGbp: 10000, currentValueGbp: 10500, totalReturnPct: 0.05, costsGbp: 10, analytics };
const book = (strategy: string, weekly: number, wobble: number) => ({
  strategy, inceptionDate: "2026-06-11", capitalGbp: 10000, valuations: series(weekly, wobble), holdings: [{ ticker: "A" }],
  transactions: [
    { date: "2026-10-05", type: "BUY", ticker: "A", grossGbp: 1000, costGbp: 5, cashDeltaGbp: -1005 },
    { date: "2026-10-12", type: "SELL", ticker: "A", grossGbp: 1100, costGbp: 5, cashDeltaGbp: 1095 },
  ],
  metrics: strategy === "BENCHMARK" ? { ...metrics, analytics: undefined } : metrics, builtAt: new Date(),
});
const scorecard = {
  ratings: 25000, ratingsFrom: "2026-06-10", ratingsTo: "2026-10-26", badPrices: 4,
  horizons: [{
    weeks: 4, observations: 800, scoreIc: { mean: 0.06, cohorts: 5 }, subScoreIc: {}, flags: [], fairValue: { n: 0, medianGapClosed: null },
    byVerdict: [{ verdict: "BUY", n: 620, meanExcess: 0.031, medianExcess: 0.02, hitRate: 0.63, range: { mean: 0.031, low: -0.01, high: 0.072, n: 4 } }],
    outcomes: { snapshot: 19751, gap: 3428, trading: 80, takeover: 76, failure: 1, missing: 597, noRun: 0 },
  }],
  weekly: { spread: [], ic: [], flags: {}, qualityValue: [] },
  cases: { weeks: 4, best: [], worst: [], missed: [], flaglessLosers: [] },
};

async function render(month: string) {
  const el = await ReportPage({ searchParams: Promise.resolve({ month }) });
  return renderToStaticMarkup(el);
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  db.screenSnapshot.findMany.mockResolvedValue([]);
  db.screenSnapshot.groupBy.mockResolvedValue([]);
  db.simPortfolio.findMany.mockResolvedValue([book("LAB_TOP20", 0.002, 0.01), book("LAB_US", 0.004, 0.015), book("BENCHMARK", 0.001, 0.008)]);
  db.scorecardResult.findUnique.mockResolvedValue({ data: scorecard, builtAt: new Date() });
});

describe("report page", () => {
  it("leads a new report with the readiness dashboard and keeps the back-test apart", async () => {
    db.reportArchive.findUnique.mockResolvedValue(null);
    const html = await render("2026-10");
    expect(html.indexOf("Investment readiness")).toBeLessThan(html.indexOf("Key findings"));
    expect(html).toContain("Research and observation — not a validated strategy");
    expect(html).toContain("Readiness test");
    expect(html).toContain("Prospective results: the honest test");
    expect(html).toContain("not evidence");
    expect(html).toContain("Sector bets");
    expect(html).toContain("95% range");
    expect(html).toContain("−1.0 to +7.2%"); // the Buy rating's range
    expect(html).not.toContain("Since June*");
  });

  it("builds sensible prospective figures", async () => {
    const r = await buildMonthlyReport("2026-10", new Date("2026-11-01T08:00:00Z"));
    const main = r.books.find((b) => b.strategy === "LAB_TOP20")!;
    expect(main.live!.weeks).toBe(4);
    expect(main.live!.vsBenchmarkRange).not.toBeNull();
    expect(main.live!.risk!.volatility).toBeGreaterThan(0);
    expect(main.live!.risk!.sharpe).toBeNull(); // under 26 weeks
    const vFixed = series(0.002, 0.01).filter((v) => v.date <= "2026-09-29").at(-1)!.totalGbp;
    expect(main.live!.spreadPct).toBeCloseTo((2100 * 0.003) / vFixed, 9);
    expect(main.live!.costsPct).toBeCloseTo(10 / vFixed, 9);
    expect(main.backtest!.from).toBe("2026-06-11");
    expect(main.rolling!.m3).toBeNull(); // the window would reach back into the back-test
    expect(r.readiness!.conditions).toHaveLength(6);
  });

  it("still renders a report frozen before these sections existed", async () => {
    const r = await buildMonthlyReport("2026-10");
    const old = JSON.parse(JSON.stringify(r)) as MonthlyReport;
    delete old.readiness;
    for (const b of old.books) {
      delete b.live;
      delete b.backtest;
    }
    for (const d of old.diagnostics ?? []) if (d.sinceFixed) delete (d.sinceFixed as { sector?: number }).sector;
    for (const h of old.scorecard!.horizons) for (const v of h.byVerdict) delete v.range;
    db.reportArchive.findUnique.mockResolvedValue({ data: old });
    const html = await render("2026-10");
    expect(html).not.toContain("Investment readiness");
    expect(html).toContain("Strategy lab: results since the rules were fixed");
    expect(html).not.toContain("Sector bets");
    expect(html).toContain("Key findings");
  });
});
