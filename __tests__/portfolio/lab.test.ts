import { describe, it, expect } from "vitest";

import { fullRunDates, labRebalanceDates, labTargets, regionOf, type LabStrategy } from "@/lib/portfolio/lab";
import type { Rating, SignalHistory } from "@/lib/portfolio/signals";

type Week = Record<string, [verdict: string, score: number]>;

function history(weeks: Record<string, Week>): SignalHistory {
  const calendar = Object.keys(weeks).sort();
  return {
    inceptionDate: calendar[0],
    calendar,
    rebalanceDates: calendar,
    strongBuysByDate: new Map(),
    ratingsByDate: new Map(
      calendar.map((d) => [
        d,
        new Map(Object.entries(weeks[d]).map(([t, [verdict, score]]): [string, Rating] => [t, { verdict, score }])),
      ]),
    ),
    securities: new Map(),
  };
}

const rank = (over: Partial<LabStrategy> = {}): LabStrategy => ({
  id: "LAB_TOP20",
  maxHoldings: 2,
  maxWeight: 0.5,
  sell: "RANK",
  frequency: "WEEKLY",
  ...over,
});

describe("regionOf", () => {
  it("reads the market from the listing suffix", () => {
    expect(regionOf("AAPL")).toBe("US");
    expect(regionOf("BRK-B")).toBe("US");
    expect(regionOf("VOD.L")).toBe("UK");
    expect(regionOf("7203.T")).toBe("JP");
    expect(regionOf("BETS-B.ST")).toBe("EU");
    expect(regionOf("AIR.PA")).toBe("EU");
  });
});

describe("labRebalanceDates", () => {
  const calendar = ["2026-06-01", "2026-06-08", "2026-06-29", "2026-07-06", "2026-07-13", "2026-08-03"];
  it("trades every run week, or the first run of each month", () => {
    expect(labRebalanceDates(calendar, "2026-06-08", "WEEKLY")).toEqual(calendar.slice(1));
    expect(labRebalanceDates(calendar, "2026-06-08", "MONTHLY")).toEqual(["2026-06-08", "2026-07-06", "2026-08-03"]);
  });
});

describe("labTargets — ranked", () => {
  const h = history({
    "2026-06-01": { A: ["STRONG_BUY", 90], B: ["BUY", 80], C: ["BUY", 80], D: ["WATCH", 99], "E.L": ["BUY", 95] },
  });

  it("holds the best-scored Buy-or-better names, ties broken by ticker", () => {
    expect(labTargets(rank(), h, h.calendar).get("2026-06-01")).toEqual(["E.L", "A"]);
    expect(labTargets(rank({ maxHoldings: 3 }), h, h.calendar).get("2026-06-01")).toEqual(["E.L", "A", "B"]);
  });

  it("filters to one region", () => {
    expect(labTargets(rank({ region: "UK" }), h, h.calendar).get("2026-06-01")).toEqual(["E.L"]);
    expect(labTargets(rank({ region: "JP" }), h, h.calendar).get("2026-06-01")).toEqual([]);
  });

  it("carries a rating forward when a name is not re-rated, until it is three weeks stale", () => {
    const carry = history({
      "2026-06-01": { A: ["BUY", 90], B: ["BUY", 80] },
      "2026-06-08": { B: ["BUY", 80] }, // A missed a week
      "2026-06-29": { B: ["BUY", 80] }, // A last rated 28 days ago
    });
    const t = labTargets(rank(), carry, carry.calendar);
    expect(t.get("2026-06-08")).toEqual(["A", "B"]);
    expect(t.get("2026-06-29")).toEqual(["B"]);
  });
});

describe("labTargets — slow selling", () => {
  const sticky = rank({ id: "LAB_STICKY", sell: "DOWNGRADE" });
  const h = history({
    "2026-06-01": { A: ["BUY", 90], B: ["BUY", 80], C: ["BUY", 70] },
    "2026-06-08": { A: ["WATCH", 60], B: ["BUY", 80], C: ["BUY", 99] },
    "2026-06-15": { A: ["HOLD", 50], B: ["BUY", 80], C: ["BUY", 99] },
  });
  const t = labTargets(sticky, h, h.calendar);

  it("keeps a holding rated Watch even when a better name appears", () => {
    expect(t.get("2026-06-01")).toEqual(["A", "B"]);
    expect(t.get("2026-06-08")).toEqual(["A", "B"]);
  });

  it("sells on Hold and refills the slot from the top of the list", () => {
    expect(t.get("2026-06-15")).toEqual(["B", "C"]);
  });

  it("only trades on its own rebalance dates, while still tracking every week's ratings", () => {
    const monthly = labTargets({ ...sticky, frequency: "MONTHLY" }, h, ["2026-06-01"]);
    expect([...monthly.keys()]).toEqual(["2026-06-01"]);
  });
});

describe("fullRunDates", () => {
  it("skips weeks that rated far fewer names than a normal run", () => {
    const h = history({
      "2026-06-01": { A: ["BUY", 90], B: ["BUY", 80], C: ["BUY", 70], D: ["HOLD", 50] },
      "2026-06-08": { A: ["BUY", 90] }, // one market screened ad hoc
      "2026-06-15": { A: ["BUY", 90], B: ["BUY", 80], C: ["HOLD", 60] },
    });
    const full = fullRunDates(h);
    expect([...full]).toEqual(["2026-06-01", "2026-06-15"]);
    expect(labRebalanceDates(h.calendar, "2026-06-01", "MONTHLY", full)).toEqual(["2026-06-01"]);
    expect(labRebalanceDates(h.calendar, "2026-06-01", "WEEKLY", full)).toEqual(["2026-06-01", "2026-06-15"]);
  });
});
