import { describe, it, expect } from "vitest";

import { simulate, type MarketData, type SimulationInput } from "@/lib/portfolio/engine";
import { tradeCost, DEFAULT_COSTS, type CostModel } from "@/lib/portfolio/costs";
import { computeMetrics } from "@/lib/portfolio/metrics";

const ZERO_COSTS: CostModel = { commissionPct: 0, commissionMinGbp: 0, fxSpreadPct: 0, ukStampDutyPct: 0 };

interface MockConfig {
  securities: Record<string, { currency: string; stampDutyApplies?: boolean }>;
  prices: Record<string, Record<string, number>>;
  fx?: Record<string, Record<string, number>>;
  dividends?: Record<string, { date: string; amountLocal: number }[]>;
  splits?: Record<string, { date: string; ratio: number }[]>;
}

/** Nearest value on or before `date` from a {date: value} map. */
function onOrBefore(series: Record<string, number> | undefined, date: string): number | null {
  if (!series) return null;
  let best: number | null = null;
  for (const d of Object.keys(series).sort()) {
    if (d <= date) best = series[d];
  }
  return best;
}

function mockMarket(cfg: MockConfig): MarketData {
  return {
    priceOn: (ticker, date) => onOrBefore(cfg.prices[ticker], date),
    fxToGbp: (currency, date) => (currency === "GBP" ? 1 : onOrBefore(cfg.fx?.[currency], date) ?? 1),
    dividendsBetween: (ticker, from, to) =>
      (cfg.dividends?.[ticker] ?? []).filter((d) => d.date > from && d.date <= to),
    splitsBetween: (ticker, from, to) =>
      (cfg.splits?.[ticker] ?? []).filter((s) => s.date > from && s.date <= to),
    security: (ticker) => ({
      currency: cfg.securities[ticker]?.currency ?? "GBP",
      stampDutyApplies: cfg.securities[ticker]?.stampDutyApplies ?? false,
    }),
  };
}

describe("tradeCost", () => {
  it("applies the commission floor", () => {
    expect(tradeCost({ side: "BUY", notionalGbp: 100, isForeign: false, stampDutyApplies: false }).commissionGbp).toBe(1);
    expect(tradeCost({ side: "BUY", notionalGbp: 5000, isForeign: false, stampDutyApplies: false }).commissionGbp).toBe(5);
  });
  it("charges FX spread only on foreign legs", () => {
    expect(tradeCost({ side: "BUY", notionalGbp: 1000, isForeign: true, stampDutyApplies: false }).fxSpreadGbp).toBe(5);
    expect(tradeCost({ side: "BUY", notionalGbp: 1000, isForeign: false, stampDutyApplies: false }).fxSpreadGbp).toBe(0);
  });
  it("charges UK stamp duty on buys only", () => {
    expect(tradeCost({ side: "BUY", notionalGbp: 1000, isForeign: false, stampDutyApplies: true }).stampDutyGbp).toBe(5);
    expect(tradeCost({ side: "SELL", notionalGbp: 1000, isForeign: false, stampDutyApplies: true }).stampDutyGbp).toBe(0);
  });
});

function buyHoldInput(over: Partial<SimulationInput>): SimulationInput {
  return {
    strategy: "BUY_HOLD",
    capitalGbp: 10000,
    inceptionDate: "2025-01-01",
    rebalanceDates: ["2025-01-01"],
    strongBuysByDate: new Map([["2025-01-01", ["AAA"]]]),
    markDates: ["2025-01-01", "2025-02-01"],
    market: mockMarket({ securities: { AAA: { currency: "GBP" } }, prices: { AAA: { "2025-01-01": 100, "2025-02-01": 120 } } }),
    costs: ZERO_COSTS,
    ...over,
  };
}

describe("simulate — buy & hold", () => {
  it("deploys the full capital at inception with zero costs, then holds", () => {
    const r = simulate(buyHoldInput({}));
    expect(r.valuations[0].totalGbp).toBeCloseTo(10000, 6);
    expect(r.valuations[0].cashGbp).toBeCloseTo(0, 6);
    expect(r.holdings).toHaveLength(1);
    expect(r.holdings[0].shares).toBeCloseTo(100, 6);
    // +20% price move, no further trades.
    expect(r.valuations.at(-1)!.totalGbp).toBeCloseTo(12000, 6);
    expect(r.transactions.filter((t) => t.type === "BUY")).toHaveLength(1);
    expect(r.transactions.filter((t) => t.type === "SELL")).toHaveLength(0);
  });

  it("keeps cash non-negative and books costs under the default cost model", () => {
    const r = simulate(
      buyHoldInput({
        strongBuysByDate: new Map([["2025-01-01", ["AAA", "BBB"]]]),
        market: mockMarket({
          securities: { AAA: { currency: "GBP", stampDutyApplies: true }, BBB: { currency: "GBP" } },
          prices: { AAA: { "2025-01-01": 100 }, BBB: { "2025-01-01": 100 } },
        }),
        costs: DEFAULT_COSTS,
      }),
    );
    expect(r.valuations[0].cashGbp).toBeGreaterThanOrEqual(0);
    expect(r.costsGbp).toBeGreaterThan(0);
    // Stamp duty (0.5%) applies to AAA's buy but not BBB's.
    const aaaBuy = r.transactions.find((t) => t.type === "BUY" && t.ticker === "AAA")!;
    const bbbBuy = r.transactions.find((t) => t.type === "BUY" && t.ticker === "BBB")!;
    expect(aaaBuy.costGbp).toBeGreaterThan(bbbBuy.costGbp);
  });

  it("credits dividends as cash", () => {
    const r = simulate(
      buyHoldInput({
        market: mockMarket({
          securities: { AAA: { currency: "GBP" } },
          prices: { AAA: { "2025-01-01": 100, "2025-02-01": 100 } },
          dividends: { AAA: [{ date: "2025-01-15", amountLocal: 5 }] },
        }),
      }),
    );
    expect(r.dividendsGbp).toBeCloseTo(500, 6); // 100 shares × £5
    expect(r.valuations.at(-1)!.totalGbp).toBeCloseTo(10500, 6);
  });

  it("reflects FX movements in a foreign holding", () => {
    const r = simulate(
      buyHoldInput({
        market: mockMarket({
          securities: { AAA: { currency: "USD" } },
          prices: { AAA: { "2025-01-01": 100, "2025-02-01": 100 } }, // flat in USD
          fx: { USD: { "2025-01-01": 0.8, "2025-02-01": 0.9 } }, // GBP strengthens the position
        }),
      }),
    );
    // 10000/(100*0.8)=125 shares; end value 125*100*0.9 = 11250.
    expect(r.valuations.at(-1)!.totalGbp).toBeCloseTo(11250, 4);
  });

  it("adjusts share count on a stock split", () => {
    const r = simulate(
      buyHoldInput({
        market: mockMarket({
          securities: { AAA: { currency: "GBP" } },
          prices: { AAA: { "2025-01-01": 100, "2025-02-01": 50 } }, // halves on a 2:1 split
          splits: { AAA: [{ date: "2025-01-20", ratio: 2 }] },
        }),
      }),
    );
    expect(r.holdings[0].shares).toBeCloseTo(200, 6);
    expect(r.valuations.at(-1)!.totalGbp).toBeCloseTo(10000, 6); // value continuous
  });
});

describe("simulate — weekly rebalanced", () => {
  it("sells names that drop off Strong Buy and equal-weights the current set", () => {
    const dates = ["2025-01-01", "2025-02-01", "2025-03-01"];
    const r = simulate({
      strategy: "REBALANCED",
      capitalGbp: 10000,
      inceptionDate: "2025-01-01",
      rebalanceDates: dates,
      strongBuysByDate: new Map([
        ["2025-01-01", ["AAA"]],
        ["2025-02-01", ["AAA", "BBB"]],
        ["2025-03-01", ["BBB"]],
      ]),
      markDates: dates,
      market: mockMarket({
        securities: { AAA: { currency: "GBP" }, BBB: { currency: "GBP" } },
        prices: {
          AAA: { "2025-01-01": 100, "2025-02-01": 100, "2025-03-01": 100 },
          BBB: { "2025-01-01": 100, "2025-02-01": 100, "2025-03-01": 100 },
        },
      }),
      costs: ZERO_COSTS,
    });
    // Ends fully in BBB (AAA no longer Strong Buy), value preserved (flat prices).
    expect(r.holdings).toHaveLength(1);
    expect(r.holdings[0].ticker).toBe("BBB");
    expect(r.holdings[0].shares).toBeCloseTo(100, 6);
    expect(r.valuations.at(-1)!.totalGbp).toBeCloseTo(10000, 6);
    expect(r.transactions.some((t) => t.type === "SELL" && t.ticker === "AAA")).toBe(true);
  });
});

describe("computeMetrics", () => {
  it("derives returns, unrealised P&L and a benchmark comparison", () => {
    const portfolio = simulate(buyHoldInput({})); // +20% → 12000
    const benchmark = simulate(
      buyHoldInput({
        strongBuysByDate: new Map([["2025-01-01", ["BENCH"]]]),
        market: mockMarket({ securities: { BENCH: { currency: "GBP" } }, prices: { BENCH: { "2025-01-01": 100, "2025-02-01": 110 } } }),
      }),
    ); // +10%
    const m = computeMetrics(portfolio, benchmark);
    expect(m.currentValueGbp).toBeCloseTo(12000, 6);
    expect(m.totalReturnPct).toBeCloseTo(0.2, 6);
    expect(m.unrealisedGbp).toBeCloseTo(2000, 6); // 12000 mkt − 10000 basis
    expect(m.benchmarkReturnPct).toBeCloseTo(0.1, 6);
  });
});
