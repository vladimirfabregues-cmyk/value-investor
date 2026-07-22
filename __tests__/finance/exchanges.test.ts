import { describe, it, expect } from "vitest";

import {
  EXCHANGES,
  baseSymbol,
  exchangeByCode,
  formatSecurityLabel,
  inferExchangeFromTicker,
  resolveSecurity,
  securityKey,
  toYahooTicker,
} from "@/lib/finance/exchanges";

describe("exchange registry", () => {
  it("exposes only markets with a real ticker convention", () => {
    expect(EXCHANGES.length).toBeGreaterThan(0);
    for (const e of EXCHANGES) {
      expect(e.code).toMatch(/^[A-Z]{2,4}$/);
      expect(e.name.length).toBeGreaterThan(0);
      expect(e.shortCode.length).toBeGreaterThan(0);
      expect(e.currency).toMatch(/^[A-Z]{3}$/);
    }
  });

  it("has unique codes and no duplicate suffixes", () => {
    const codes = EXCHANGES.map((e) => e.code);
    expect(new Set(codes).size).toBe(codes.length);
    const suffixes = EXCHANGES.map((e) => e.yahooSuffix).filter(Boolean);
    expect(new Set(suffixes).size).toBe(suffixes.length);
  });
});

describe("security identity", () => {
  it("treats the same symbol on two markets as two distinct securities", () => {
    const us = resolveSecurity("ABC", "US");
    const uk = resolveSecurity("ABC", "XLON");

    expect(us.exchange).not.toBe(uk.exchange);
    expect(securityKey(us)).not.toBe(securityKey(uk));
    // ...and they resolve to different provider tickers
    expect(us.ticker).toBe("ABC");
    expect(uk.ticker).toBe("ABC.L");
  });

  it("builds provider tickers from market + symbol", () => {
    expect(toYahooTicker("US", "aapl")).toBe("AAPL");
    expect(toYahooTicker("XLON", "dplm")).toBe("DPLM.L");
    expect(toYahooTicker("XTKS", "7203")).toBe("7203.T");
    expect(toYahooTicker("XPAR", "mc")).toBe("MC.PA");
  });

  it("does not double-append a suffix already present", () => {
    expect(toYahooTicker("XLON", "DPLM.L")).toBe("DPLM.L");
    expect(toYahooTicker("XTKS", "7203.T")).toBe("7203.T");
  });

  it("infers the market from a suffix so older links keep working", () => {
    expect(inferExchangeFromTicker("DPLM.L").code).toBe("XLON");
    expect(inferExchangeFromTicker("MC.PA").code).toBe("XPAR");
    expect(inferExchangeFromTicker("7203.T").code).toBe("XTKS");
    expect(inferExchangeFromTicker("BETS-B.ST").code).toBe("XSTO");
    // bare symbols are US
    expect(inferExchangeFromTicker("AAPL").code).toBe("US");
  });

  it("resolves identity without an explicit market by inferring it", () => {
    const s = resolveSecurity("DPLM.L");
    expect(s.exchange).toBe("XLON");
    expect(s.ticker).toBe("DPLM.L");
  });

  it("prefers an explicit market over inference", () => {
    // user picked LSE and typed a bare symbol
    const s = resolveSecurity("DPLM", "XLON");
    expect(s.exchange).toBe("XLON");
    expect(s.ticker).toBe("DPLM.L");
  });

  it("falls back to inference when given an unknown market code", () => {
    const s = resolveSecurity("MC.PA", "NOT_A_REAL_EXCHANGE");
    expect(s.exchange).toBe("XPAR");
  });

  it("strips suffixes to recover the base symbol", () => {
    expect(baseSymbol("DPLM.L")).toBe("DPLM");
    expect(baseSymbol("7203.T")).toBe("7203");
    expect(baseSymbol("AAPL")).toBe("AAPL");
  });

  it("produces cache keys that cannot collide across markets", () => {
    const keys = new Set([
      securityKey(resolveSecurity("ABC", "US")),
      securityKey(resolveSecurity("ABC", "XLON")),
      securityKey(resolveSecurity("ABC", "XPAR")),
      securityKey(resolveSecurity("ABC", "XTKS")),
    ]);
    expect(keys.size).toBe(4);
  });

  it("labels a security with its exchange for display", () => {
    expect(formatSecurityLabel({ exchange: "XLON", ticker: "DPLM.L" })).toBe("DPLM.L · LSE");
    expect(exchangeByCode("XTKS")?.shortCode).toBe("TSE");
  });
});
