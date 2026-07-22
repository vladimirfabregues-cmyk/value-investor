import { describe, it, expect } from "vitest";

import {
  describeResultMarket,
  fromProviderQuote,
  fromScreenedRow,
  matchRank,
  rankResults,
  type SecuritySearchResult,
} from "@/lib/finance/security-search";

const screened = (ticker: string, companyName: string) =>
  fromScreenedRow({ ticker, companyName, sector: null, currency: null })!;

describe("normalising candidates", () => {
  it("derives the market from a screened row's ticker", () => {
    const r = screened("DPLM.L", "Diploma PLC");
    expect(r.exchange).toBe("XLON");
    expect(r.exchangeShortCode).toBe("LSE");
    expect(r.country).toBe("United Kingdom");
    expect(r.source).toBe("screened");
  });

  it("keeps provider equities and drops everything else", () => {
    expect(fromProviderQuote({ symbol: "AAPL", shortname: "Apple Inc.", quoteType: "EQUITY" })).not.toBeNull();
    // funds, indices and currencies are not analysable by this app
    expect(fromProviderQuote({ symbol: "^GSPC", shortname: "S&P 500", quoteType: "INDEX" })).toBeNull();
    expect(fromProviderQuote({ symbol: "VWRL.L", shortname: "Vanguard FTSE", quoteType: "ETF" })).toBeNull();
    expect(fromProviderQuote({ shortname: "No symbol" })).toBeNull();
  });

  it("falls back to the symbol when no name is provided", () => {
    expect(fromProviderQuote({ symbol: "XYZ", quoteType: "EQUITY" })!.name).toBe("XYZ");
  });
});

describe("ranking", () => {
  it("puts an exact ticker match first, then prefixes, then name matches", () => {
    expect(matchRank(screened("MC.PA", "LVMH"), "MC")).toBeLessThan(
      matchRank(screened("MCD", "McDonald's"), "MC"),
    );
    expect(matchRank(screened("AAPL", "Apple Inc."), "APPLE")).toBeLessThan(
      matchRank(screened("GRAN.L", "Grand Apple Holdings"), "APPLE"),
    );
  });

  it("finds companies by name, not just ticker", () => {
    const results = rankResults([screened("DPLM.L", "Diploma PLC")], {
      query: "diploma",
      exchange: "XLON",
    });
    expect(results).toHaveLength(1);
    expect(results[0].ticker).toBe("DPLM.L");
  });

  it("excludes non-matches entirely", () => {
    const results = rankResults([screened("AAPL", "Apple Inc.")], { query: "zzzz" });
    expect(results).toHaveLength(0);
  });
});

describe("market scoping", () => {
  const candidates: SecuritySearchResult[] = [
    screened("ABC", "Abcorp Inc."),      // US
    screened("ABC.L", "Abcorp PLC"),     // London
    screened("ABC.PA", "Abcorp SA"),     // Paris
  ];

  it("returns only securities from the selected market", () => {
    const uk = rankResults(candidates, { query: "ABC", exchange: "XLON" });
    expect(uk).toHaveLength(1);
    expect(uk[0].ticker).toBe("ABC.L");
    expect(uk[0].exchange).toBe("XLON");
  });

  it("never leaks a same-ticker company from another market", () => {
    for (const exchange of ["US", "XLON", "XPAR"]) {
      const scoped = rankResults(candidates, { query: "ABC", exchange });
      expect(scoped.every((r) => r.exchange === exchange)).toBe(true);
    }
  });

  it("returns every market when no market is specified", () => {
    expect(rankResults(candidates, { query: "ABC" })).toHaveLength(3);
  });

  it("yields an empty list when the market has no match — a real empty state", () => {
    // Abcorp is not listed in Tokyo
    expect(rankResults(candidates, { query: "ABC", exchange: "XTKS" })).toHaveLength(0);
  });
});

describe("deduplication and limits", () => {
  it("collapses duplicates of the same security identity", () => {
    const dupes = [
      screened("AAPL", "Apple Inc."),
      fromProviderQuote({ symbol: "AAPL", shortname: "Apple Inc.", quoteType: "EQUITY" })!,
    ];
    const results = rankResults(dupes, { query: "AAPL" });
    expect(results).toHaveLength(1);
    // our screened data wins — it carries sector and currency
    expect(results[0].source).toBe("screened");
  });

  it("respects the result limit", () => {
    const many = Array.from({ length: 40 }, (_, i) => screened(`TST${i}`, `Test Co ${i}`));
    expect(rankResults(many, { query: "TST", limit: 5 })).toHaveLength(5);
  });
});

describe("display context", () => {
  it("describes the market and country so results are distinguishable", () => {
    expect(describeResultMarket(screened("DPLM.L", "Diploma PLC"))).toBe(
      "London Stock Exchange (LSE) · United Kingdom",
    );
    expect(describeResultMarket(screened("7203.T", "Toyota"))).toContain("Japan");
  });
});
