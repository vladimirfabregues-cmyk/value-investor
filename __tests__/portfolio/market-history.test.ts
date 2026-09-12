import { describe, it, expect } from "vitest";

import { buildMarketData, type TickerHistory, type FxPoint } from "@/lib/portfolio/market-history";

const AAPL: TickerHistory = {
  ticker: "AAPL",
  currency: "USD",
  prices: [
    { date: "2025-01-06", price: 100 },
    { date: "2025-01-08", price: 110 },
    { date: "2025-01-10", price: 120 },
  ],
  dividends: [{ date: "2025-01-09", amountLocal: 0.25 }],
  splits: [{ date: "2025-01-07", ratio: 2 }],
};

const fx = new Map<string, FxPoint[]>([
  ["USD", [
    { date: "2025-01-06", gbpPerUnit: 0.8 },
    { date: "2025-01-10", gbpPerUnit: 0.75 },
  ]],
]);

const market = buildMarketData({ histories: [AAPL], fx, stampDuty: new Map([["AAPL", false]]) });

describe("buildMarketData", () => {
  it("returns the nearest price on or before a date", () => {
    expect(market.priceOn("AAPL", "2025-01-06")).toBe(100);
    expect(market.priceOn("AAPL", "2025-01-09")).toBe(110); // carries forward from the 8th
    expect(market.priceOn("AAPL", "2025-01-05")).toBeNull(); // before first listing
    expect(market.priceOn("UNKNOWN", "2025-01-10")).toBeNull();
  });

  it("looks up FX on or before, and returns 1 for GBP", () => {
    expect(market.fxToGbp("GBP", "2025-01-10")).toBe(1);
    expect(market.fxToGbp("USD", "2025-01-07")).toBe(0.8);
    expect(market.fxToGbp("USD", "2025-01-10")).toBe(0.75);
    expect(market.fxToGbp("EUR", "2025-01-10")).toBe(1); // unknown ccy → identity
  });

  it("returns events in the half-open (from, to] window", () => {
    expect(market.dividendsBetween("AAPL", "2025-01-06", "2025-01-10")).toEqual([{ date: "2025-01-09", amountLocal: 0.25 }]);
    expect(market.dividendsBetween("AAPL", "2025-01-09", "2025-01-10")).toEqual([]); // exclusive lower bound
    expect(market.splitsBetween("AAPL", "2025-01-06", "2025-01-08")).toEqual([{ date: "2025-01-07", ratio: 2 }]);
  });

  it("exposes normalized security metadata", () => {
    expect(market.security("AAPL")).toEqual({ currency: "USD", stampDutyApplies: false });
  });
});
