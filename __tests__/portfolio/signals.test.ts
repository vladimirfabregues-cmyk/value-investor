import { describe, it, expect } from "vitest";

import { buildSignalHistory, type SnapshotRow } from "@/lib/portfolio/signals";

const row = (over: Partial<SnapshotRow>): SnapshotRow => ({
  ticker: "AAA",
  currency: "GBP",
  screenerIndex: "SP500",
  screenerAt: "2026-01-06T06:00:00.000Z",
  verdictLabel: "STRONG_BUY",
  ...over,
});

describe("buildSignalHistory", () => {
  const rows: SnapshotRow[] = [
    // Week 1 (Mon 5 Jan FTSE250, Tue 6 Jan SP500) — same ISO week.
    row({ ticker: "AAA", screenerIndex: "FTSE250", screenerAt: "2026-01-05T06:00:00Z" }),
    row({ ticker: "BBB", currency: "USD", screenerIndex: "SP500", screenerAt: "2026-01-06T06:00:00Z" }),
    row({ ticker: "CCC", screenerIndex: "SP500", screenerAt: "2026-01-06T06:00:00Z", verdictLabel: "BUY" }),
    // Week 2 (Mon 12 Jan) — AAA falls off, DDD appears.
    row({ ticker: "AAA", screenerIndex: "FTSE250", screenerAt: "2026-01-12T06:00:00Z", verdictLabel: "WATCH" }),
    row({ ticker: "DDD", currency: "EUR", screenerIndex: "CAC40", screenerAt: "2026-01-12T06:00:00Z" }),
  ];

  const h = buildSignalHistory(rows);

  it("buckets Strong Buys by ISO week and unions across markets", () => {
    expect(h.rebalanceDates).toEqual(["2026-01-06", "2026-01-12"]);
    expect(h.strongBuysByDate.get("2026-01-06")).toEqual(["AAA", "BBB"]); // CCC was only BUY
    expect(h.strongBuysByDate.get("2026-01-12")).toEqual(["DDD"]); // AAA dropped to WATCH
  });

  it("sets inception to the first rebalance and flags UK stamp duty", () => {
    expect(h.inceptionDate).toBe("2026-01-06");
    expect(h.securities.get("AAA")?.stampDutyApplies).toBe(true); // FTSE250
    expect(h.securities.get("BBB")?.stampDutyApplies).toBe(false); // SP500
    expect(h.securities.get("BBB")?.currency).toBe("USD");
    expect(h.securities.get("DDD")?.currency).toBe("EUR");
  });
});
