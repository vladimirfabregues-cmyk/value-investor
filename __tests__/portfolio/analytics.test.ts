import { describe, it, expect } from "vitest";

import { bookAnalytics, summarizeAttribution, type SnapshotPrices } from "@/lib/portfolio/analytics";
import { simulate, type MarketData } from "@/lib/portfolio/engine";
import { weekOf, weekStart } from "@/lib/scorecard/compute";
import type { CostModel } from "@/lib/portfolio/costs";

const ZERO: CostModel = { commissionPct: 0, commissionMinGbp: 0, fxSpreadPct: 0, ukStampDutyPct: 0 };
const calendar = ["2026-06-01", "2026-06-08", "2026-06-15", "2026-06-22", "2026-07-06", "2026-07-13"];
const w = (d: string) => weekOf(`${d}T12:00:00Z`);

// A.L: +10% in week one, then flat. B (USD): flat, but the dollar rises 10% in week one.
// C.L: bought on 15 Jun, sold on 6 Jul, then jumps 50%.
const prices: Record<string, Record<string, number>> = {
  "A.L": { "2026-06-01": 100, "2026-06-08": 110 },
  B: { "2026-06-01": 50 },
  "C.L": { "2026-06-01": 20, "2026-07-13": 30 },
};
const onOrBefore = (s: Record<string, number>, d: string) =>
  Object.keys(s).sort().filter((k) => k <= d).map((k) => s[k]).at(-1) ?? null;
const market: MarketData = {
  priceOn: (t, d) => onOrBefore(prices[t] ?? {}, d),
  fxToGbp: (c, d) => (c === "USD" ? (d >= "2026-06-08" ? 0.88 : 0.8) : 1),
  dividendsBetween: () => [],
  splitsBetween: () => [],
  security: (t) => ({ currency: t === "B" ? "USD" : "GBP", stampDutyApplies: false }),
};
const snap: SnapshotPrices = {
  price: (t, week) => {
    const d = calendar.find((c) => w(c) === week) ?? (week === w("2026-07-13") + 1 ? "2026-07-20" : null);
    return d ? onOrBefore(prices[t] ?? {}, d) : t === "C.L" && week > w("2026-07-13") ? 30 : null;
  },
  homeIndex: () => "IDX",
  sector: (t) => (t === "B" ? "Technology" : "Financials"),
};
const indexWeekly = new Map([[`IDX|${weekStart(w("2026-06-01"))}`, 0.05]]);

const result = simulate({
  strategy: "LAB_TOP20",
  capitalGbp: 10000,
  inceptionDate: "2026-06-01",
  rebalanceDates: ["2026-06-01", "2026-06-15", "2026-07-06"],
  strongBuysByDate: new Map([
    ["2026-06-01", ["A.L", "B"]],
    ["2026-06-15", ["A.L", "C.L"]],
    ["2026-07-06", ["A.L"]],
  ]),
  markDates: calendar,
  market,
  costs: ZERO,
});
const a = bookAnalytics(result, market, calendar, snap, indexWeekly, "2026-07-13", w("2026-07-13") + 30);

describe("return split", () => {
  it("separates currency, market and stock picking", () => {
    const week1 = a.attribution[0];
    expect(week1.total).toBeCloseTo(0.1, 9); // A +10% on half, B's dollar +10% on half
    expect(week1.currency).toBeCloseTo(0.05, 9);
    expect(week1.market).toBeCloseTo(0.05, 9); // the index rose 5%
    expect(week1.selection).toBeCloseTo(0, 9); // A beat it by 5, B lagged by 5
    const s = summarizeAttribution(a.attribution, "2026-06-01", "2026-06-08")!;
    expect(s.other).toBeCloseTo(0, 9);
  });
});

describe("concentration", () => {
  it("flags a book that is effectively one position", () => {
    expect(a.concentration.holdings).toBe(1);
    expect(a.concentration.effectiveNames).toBeCloseTo(1, 9);
    expect(a.concentration.regions).toEqual({ UK: 1 });
    expect(a.concentration.warning).toBe(true);
  });
});

describe("trade outcomes", () => {
  it("profiles closed positions", () => {
    expect(a.profile.closed).toBe(2); // B (+10% on the dollar) and C (flat)
    expect(a.profile.hitRate).toBe(0.5);
    expect(a.profile.avgWin).toBeCloseTo(0.1, 9);
    expect(a.profile.open).toBe(1);
  });

  it("checks what a replacement did against the name it replaced", () => {
    const four = a.selling.find((s) => s.weeks === 4)!;
    expect(four.diffs).toHaveLength(1); // B sold on 15 Jun, C bought instead
    expect(four.diffs[0]).toBeCloseTo(0.5, 9); // C +50% (by mid-July) vs B flat
  });

  it("measures what trading added against keeping the month's opening book", () => {
    const july = a.trading.find((m) => m.month === "2026-07")!;
    expect(july.frozen - july.actual).toBeGreaterThan(0); // selling C just before its jump cost money
  });
});
