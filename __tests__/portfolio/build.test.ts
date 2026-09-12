import { describe, it, expect } from "vitest";

import { computePortfolios, weeklyGrid } from "@/lib/portfolio/compose";
import { BENCHMARK_TICKER } from "@/lib/portfolio/config";
import type { MarketData } from "@/lib/portfolio/engine";
import type { SignalHistory } from "@/lib/portfolio/signals";

// Flat-priced GBP market for AAA, BBB and the benchmark, so the mechanics are
// easy to reason about (no price/FX/dividend movement).
const market: MarketData = {
  priceOn: () => 100,
  fxToGbp: () => 1,
  dividendsBetween: () => [],
  splitsBetween: () => [],
  security: () => ({ currency: "GBP", stampDutyApplies: false }),
};

const signals: SignalHistory = {
  inceptionDate: "2025-01-06",
  rebalanceDates: ["2025-01-06", "2025-01-13"],
  strongBuysByDate: new Map([
    ["2025-01-06", ["AAA"]],
    ["2025-01-13", ["BBB"]],
  ]),
  securities: new Map([
    ["AAA", { currency: "GBP", stampDutyApplies: false }],
    ["BBB", { currency: "GBP", stampDutyApplies: false }],
  ]),
};

describe("weeklyGrid", () => {
  it("emits weekly marks inclusive of both ends", () => {
    expect(weeklyGrid("2025-01-06", "2025-01-20")).toEqual(["2025-01-06", "2025-01-13", "2025-01-20"]);
  });
  it("appends today when it is not on the weekly cadence", () => {
    const g = weeklyGrid("2025-01-06", "2025-01-16");
    expect(g[0]).toBe("2025-01-06");
    expect(g.at(-1)).toBe("2025-01-16");
  });
});

describe("computePortfolios", () => {
  const { results } = computePortfolios(signals, market, "2025-01-20");
  const byStrategy = new Map(results.map((r) => [r.strategy, r]));

  it("produces all three books", () => {
    expect([...byStrategy.keys()].sort()).toEqual(["BENCHMARK", "BUY_HOLD", "REBALANCED"]);
  });

  it("buy-and-hold keeps the inception name; rebalanced follows the signal", () => {
    expect(byStrategy.get("BUY_HOLD")!.holdings.map((h) => h.ticker)).toEqual(["AAA"]);
    expect(byStrategy.get("REBALANCED")!.holdings.map((h) => h.ticker)).toEqual(["BBB"]);
    expect(byStrategy.get("REBALANCED")!.transactions.some((t) => t.type === "SELL" && t.ticker === "AAA")).toBe(true);
  });

  it("the benchmark holds the reference tracker", () => {
    expect(byStrategy.get("BENCHMARK")!.holdings.map((h) => h.ticker)).toEqual([BENCHMARK_TICKER]);
  });
});
