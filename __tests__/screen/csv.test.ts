import { describe, expect, it } from "vitest";

import { buildScreenCsv } from "@/lib/screener/csv";
import type { ScreenResultRecord } from "@/lib/db/screen-queries";

const row = (over: Partial<ScreenResultRecord> = {}): ScreenResultRecord => ({
  id: "id1",
  ticker: "ALL",
  companyName: "The Allstate Corporation",
  currency: "USD",
  price: 212.88,
  marketCap: 5.6e10,
  sector: "Financials",
  verdictLabel: "STRONG_BUY",
  compositeScore: 84,
  valuationScore: 88,
  healthScore: 82,
  qualityScore: 76,
  moatScore: 75,
  marginOfSafety: 42.7,
  pe: 5.6,
  pb: null,
  ps: null,
  evEbitda: null,
  priceFcf: null,
  grahamNumber: null,
  screenerIndex: "SP500",
  screenerAt: new Date("2026-04-24"),
  verdictCaps: null,
  errorMessage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...over,
});

const ctx = {
  market: "S&P 500",
  filters: "Sector: Financials",
  runDate: "24 Apr 2026",
  exportedAt: "10 Aug 2026",
  verdictDisplay: (l: string) => ({ STRONG_BUY: "Strong buy" }[l] ?? l),
};

describe("buildScreenCsv", () => {
  it("writes a self-describing header with market, filters and run date", () => {
    const csv = buildScreenCsv([row()], ctx);
    expect(csv).toContain("# Market: S&P 500");
    expect(csv).toContain("# Filters: Sector: Financials");
    expect(csv).toContain("# Screen run: 24 Apr 2026");
  });

  it("emits the column header and one line per row, with the display verdict", () => {
    const csv = buildScreenCsv([row(), row({ ticker: "MSFT", verdictLabel: "AVOID" })], ctx);
    const lines = csv.split("\n");
    const headerIdx = lines.findIndex((l) => l.startsWith("Ticker,"));
    expect(headerIdx).toBeGreaterThan(-1);
    expect(lines.slice(headerIdx + 1)).toHaveLength(2);
    expect(lines[headerIdx + 1]).toContain("Strong buy");
  });

  it("signs the margin column (positive discount) and blanks nulls", () => {
    const csv = buildScreenCsv([row({ marginOfSafety: -30.7, pe: null })], ctx);
    const dataLine = csv.split("\n").at(-1)!;
    expect(dataLine).toContain("-30.7"); // premium as a negative
    // P/E null → empty cell (two consecutive commas somewhere)
    expect(dataLine).toMatch(/,,/);
  });

  it("escapes commas and quotes per RFC 4180", () => {
    const csv = buildScreenCsv([row({ companyName: 'Acme, "Big" Inc.' })], ctx);
    expect(csv).toContain('"Acme, ""Big"" Inc."');
  });
});
