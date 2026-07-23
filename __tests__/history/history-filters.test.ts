import { describe, it, expect } from "vitest";

import {
  EMPTY_FILTERS,
  entrySecurityKey,
  exchangeFacets,
  filterHistory,
  groupHistoryByDate,
  hasActiveFilters,
  verdictFacets,
} from "@/lib/history/history-filters";
import type { SavedAnalysisSummary, VerdictLabel } from "@/types/analysis";

function summary(overrides: Partial<SavedAnalysisSummary> = {}): SavedAnalysisSummary {
  return {
    id: overrides.id ?? "id-1",
    ticker: "AAPL",
    exchange: "US",
    companyName: "Apple Inc.",
    analysisDate: "2026-07-20T00:00:00.000Z",
    finalVerdictLabel: "HOLD" as VerdictLabel,
    confidencePct: 70,
    marginOfSafetyPct: 10,
    oneLineVerdict: "Fairly priced",
    verdictReason: "All checks passed",
    createdAt: "2026-07-20T00:00:00.000Z",
    ...overrides,
  };
}

const apple = summary({ id: "a", ticker: "AAPL", companyName: "Apple Inc.", exchange: "US" });
const diploma = summary({
  id: "b",
  ticker: "DPLM.L",
  companyName: "Diploma PLC",
  exchange: "XLON",
  finalVerdictLabel: "AVOID",
});
const airbus = summary({
  id: "c",
  ticker: "AIR.PA",
  companyName: "Airbus SE",
  exchange: "XPAR",
  finalVerdictLabel: "BUY",
});

const all = [apple, diploma, airbus];

describe("filterHistory", () => {
  it("returns everything when no filter is set", () => {
    expect(filterHistory(all, EMPTY_FILTERS)).toEqual(all);
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });

  it("matches on ticker, case-insensitively", () => {
    expect(filterHistory(all, { ...EMPTY_FILTERS, query: "dplm" })).toEqual([diploma]);
  });

  it("matches on company name", () => {
    expect(filterHistory(all, { ...EMPTY_FILTERS, query: "airbus" })).toEqual([airbus]);
  });

  it("matches on the market, by code, short code and full name", () => {
    expect(filterHistory(all, { ...EMPTY_FILTERS, query: "XLON" })).toEqual([diploma]);
    expect(filterHistory(all, { ...EMPTY_FILTERS, query: "lse" })).toEqual([diploma]);
    expect(filterHistory(all, { ...EMPTY_FILTERS, query: "euronext paris" })).toEqual([airbus]);
  });

  it("filters by verdict", () => {
    expect(filterHistory(all, { ...EMPTY_FILTERS, verdicts: ["AVOID"] })).toEqual([diploma]);
    expect(filterHistory(all, { ...EMPTY_FILTERS, verdicts: ["AVOID", "BUY"] })).toEqual([
      diploma,
      airbus,
    ]);
  });

  it("filters by market", () => {
    expect(filterHistory(all, { ...EMPTY_FILTERS, exchanges: ["XPAR"] })).toEqual([airbus]);
  });

  it("combines filters conjunctively", () => {
    expect(
      filterHistory(all, { query: "a", verdicts: ["BUY"], exchanges: ["XPAR"] }),
    ).toEqual([airbus]);
    expect(
      filterHistory(all, { query: "apple", verdicts: ["BUY"], exchanges: [] }),
    ).toEqual([]);
  });
});

describe("facets", () => {
  it("counts verdicts and returns them in severity order", () => {
    const facets = verdictFacets([...all, summary({ id: "d", finalVerdictLabel: "AVOID" })]);
    expect(facets.map((facet) => facet.value)).toEqual(["BUY", "HOLD", "AVOID"]);
    expect(facets.find((facet) => facet.value === "AVOID")!.count).toBe(2);
  });

  it("labels verdicts without underscores", () => {
    const facets = verdictFacets([summary({ finalVerdictLabel: "STRONG_BUY" })]);
    expect(facets[0].label).toBe("STRONG BUY");
  });

  it("counts markets, most analysed first, using familiar short codes", () => {
    const facets = exchangeFacets([...all, summary({ id: "d", exchange: "XLON" })]);
    expect(facets[0]).toEqual({ value: "XLON", label: "LSE", count: 2 });
  });
});

describe("groupHistoryByDate", () => {
  // Built from local calendar components: bucketing is defined in local time,
  // so fixed UTC instants would bucket differently depending on the runner's
  // time zone.
  function localDate(year: number, month: number, day: number, hour = 9): Date {
    return new Date(year, month - 1, day, hour, 0, 0);
  }

  function at(date: Date, id: string) {
    return summary({ id, createdAt: date.toISOString() });
  }

  const now = localDate(2026, 7, 22, 10);

  it("buckets entries by how recently they were run", () => {
    const groups = groupHistoryByDate(
      [
        at(localDate(2026, 7, 22), "today"),
        at(localDate(2026, 7, 21), "yesterday"),
        at(localDate(2026, 7, 18), "week"),
        at(localDate(2026, 7, 1), "month"),
        at(localDate(2026, 1, 1), "older"),
      ],
      now,
    );

    expect(groups.map((group) => group.id)).toEqual([
      "today",
      "yesterday",
      "week",
      "month",
      "older",
    ]);
    expect(groups.map((group) => group.label)).toEqual([
      "Today",
      "Yesterday",
      "Previous 7 days",
      "Previous 30 days",
      "Earlier",
    ]);
  });

  it("omits empty buckets", () => {
    const groups = groupHistoryByDate([at(localDate(2026, 1, 1), "old")], now);
    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe("older");
  });

  it("preserves the incoming order within a bucket", () => {
    const groups = groupHistoryByDate(
      [at(localDate(2026, 7, 22, 9), "first"), at(localDate(2026, 7, 22, 8), "second")],
      now,
    );
    expect(groups[0].items.map((item) => item.id)).toEqual(["first", "second"]);
  });

  it("treats 'today' as the calendar day, not the last 24 hours", () => {
    // 23:30 the previous evening is Yesterday, even though it is 10.5h ago.
    const groups = groupHistoryByDate([at(localDate(2026, 7, 21, 23), "late")], now);
    expect(groups[0].id).toBe("yesterday");
  });

  it("puts entries with an unparseable date in Earlier rather than dropping them", () => {
    const groups = groupHistoryByDate([summary({ id: "broken", createdAt: "not-a-date" })], now);
    expect(groups[0].id).toBe("older");
    expect(groups[0].items).toHaveLength(1);
  });
});

describe("entrySecurityKey", () => {
  it("identifies an entry by market and ticker together", () => {
    expect(entrySecurityKey(diploma)).toBe("XLON:DPLM.L");
  });

  it("distinguishes the same symbol on two markets", () => {
    const us = summary({ ticker: "ABC", exchange: "US" });
    const paris = summary({ ticker: "ABC", exchange: "XPAR" });
    expect(entrySecurityKey(us)).not.toBe(entrySecurityKey(paris));
  });
});
