import { describe, it, expect } from "vitest";

import { buildSignalHistory, type SnapshotRow } from "@/lib/portfolio/signals";

const row = (over: Partial<SnapshotRow>): SnapshotRow => ({
  ticker: "AAA.L",
  currency: "GBP",
  screenerIndex: "SP500",
  screenerAt: "2026-01-06T06:00:00.000Z",
  verdictLabel: "STRONG_BUY",
  compositeScore: 70,
  ...over,
});

describe("buildSignalHistory", () => {
  const rows: SnapshotRow[] = [
    // Week 1 (Mon 5 Jan FTSE250, Tue 6 Jan SP500) — same ISO week.
    row({ ticker: "AAA.L", screenerIndex: "FTSE250", screenerAt: "2026-01-05T06:00:00Z" }),
    row({ ticker: "BBB", currency: "USD", screenerIndex: "SP500", screenerAt: "2026-01-06T06:00:00Z" }),
    row({ ticker: "CCC", screenerIndex: "SP500", screenerAt: "2026-01-06T06:00:00Z", verdictLabel: "BUY" }),
    row({ ticker: "EEE.L", screenerIndex: "AIM", screenerAt: "2026-01-05T06:00:00Z", verdictLabel: "BUY" }),
    // Week 2 (Mon 12 Jan) — AAA falls off, DDD appears.
    row({ ticker: "AAA.L", screenerIndex: "FTSE250", screenerAt: "2026-01-12T06:00:00Z", verdictLabel: "WATCH" }),
    row({ ticker: "DDD.PA", currency: "EUR", screenerIndex: "CAC40", screenerAt: "2026-01-12T06:00:00Z" }),
    // Week 3 — no Strong Buy anywhere, but the screener still ran.
    row({ ticker: "CCC", screenerIndex: "SP500", screenerAt: "2026-01-19T06:00:00Z", verdictLabel: "HOLD", compositeScore: 40 }),
  ];

  const h = buildSignalHistory(rows);

  it("buckets Strong Buys by ISO week and unions across markets", () => {
    expect(h.rebalanceDates).toEqual(["2026-01-06", "2026-01-12"]);
    expect(h.strongBuysByDate.get("2026-01-06")).toEqual(["AAA.L", "BBB"]); // CCC was only BUY
    expect(h.strongBuysByDate.get("2026-01-12")).toEqual(["DDD.PA"]); // AAA dropped to WATCH
  });

  it("keeps a calendar of every run week, with or without a Strong Buy", () => {
    expect(h.calendar).toEqual(["2026-01-06", "2026-01-12", "2026-01-19"]);
    expect(h.ratingsByDate.get("2026-01-06")?.get("CCC")).toEqual({ verdict: "BUY", score: 70 });
    expect(h.ratingsByDate.get("2026-01-19")?.get("CCC")).toEqual({ verdict: "HOLD", score: 40 });
  });

  it("sets inception to the first Strong-Buy week and charges stamp duty on London main-market names only", () => {
    expect(h.inceptionDate).toBe("2026-01-06");
    expect(h.securities.get("AAA.L")?.stampDutyApplies).toBe(true); // London, not AIM
    expect(h.securities.get("EEE.L")?.stampDutyApplies).toBe(false); // AIM is exempt
    expect(h.securities.get("BBB")?.stampDutyApplies).toBe(false);
    expect(h.securities.get("BBB")?.currency).toBe("USD");
    expect(h.securities.get("DDD.PA")?.currency).toBe("EUR");
  });

  it("uses a ticker's latest rating when it is rated twice in one week", () => {
    const twice = buildSignalHistory([
      row({ ticker: "XXX", screenerAt: "2026-01-05T06:00:00Z", verdictLabel: "BUY", compositeScore: 60 }),
      row({ ticker: "XXX", screenerAt: "2026-01-07T06:00:00Z", verdictLabel: "HOLD", compositeScore: 45 }),
    ]);
    expect(twice.ratingsByDate.get("2026-01-07")?.get("XXX")).toEqual({ verdict: "HOLD", score: 45 });
  });
});
