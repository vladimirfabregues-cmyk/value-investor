import { describe, it, expect } from "vitest";

import { computePortfolios, planBooks, priceNeeds, weeklyGrid } from "@/lib/portfolio/compose";
import { BENCHMARK_TICKER } from "@/lib/portfolio/config";
import { LAB_STRATEGIES } from "@/lib/portfolio/lab";
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
  calendar: ["2025-01-06", "2025-01-13"],
  rebalanceDates: ["2025-01-06", "2025-01-13"],
  strongBuysByDate: new Map([
    ["2025-01-06", ["AAA"]],
    ["2025-01-13", ["BBB"]],
  ]),
  ratingsByDate: new Map([
    [
      "2025-01-06",
      new Map([
        ["AAA", { verdict: "STRONG_BUY", score: 80 }],
        ["BBB", { verdict: "HOLD", score: 50 }],
      ]),
    ],
    [
      "2025-01-13",
      new Map([
        ["AAA", { verdict: "WATCH", score: 60 }],
        ["BBB", { verdict: "STRONG_BUY", score: 85 }],
      ]),
    ],
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

  it("produces the three original books plus every lab book", () => {
    expect([...byStrategy.keys()].sort()).toEqual(
      ["BENCHMARK", "BUY_HOLD", "REBALANCED", ...LAB_STRATEGIES.map((s) => s.id)].sort(),
    );
  });

  it("the slow-selling book keeps a name that drops to Watch; the ranked book swaps it", () => {
    expect(byStrategy.get("LAB_STICKY")!.holdings.map((h) => h.ticker).sort()).toEqual(["AAA", "BBB"]);
    expect(byStrategy.get("LAB_TOP20")!.holdings.map((h) => h.ticker)).toEqual(["BBB"]);
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

describe("priceNeeds", () => {
  it("spans a week before first purchase to the sale, or to today while still held", () => {
    const needs = priceNeeds(
      [
        {
          strategy: "REBALANCED",
          rebalanceDates: ["2025-01-06", "2025-01-13"],
          targets: new Map([
            ["2025-01-06", ["AAA"]],
            ["2025-01-13", ["BBB"]],
          ]),
        },
      ],
      "2025-01-20",
    );
    expect(needs.get("AAA")).toEqual({ from: "2024-12-30", to: "2025-01-13" });
    expect(needs.get("BBB")).toEqual({ from: "2025-01-06", to: "2025-01-20" });
  });

  it("covers every book's holdings, the benchmark included", () => {
    const needs = priceNeeds(planBooks(signals), "2025-01-20");
    expect([...needs.keys()].sort()).toEqual(["AAA", "BBB", BENCHMARK_TICKER].sort());
    expect(needs.get("AAA")!.to).toBe("2025-01-20"); // buy-and-hold never sells it
  });
});
