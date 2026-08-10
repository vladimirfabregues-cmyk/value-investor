/**
 * CSV export of the current (filtered) screener view.
 *
 * P5-4: the product's premise is an inspectable, challengeable case, but until
 * now nothing could leave the app. This builds a CSV of exactly the rows on
 * screen, with a header block recording the market, the applied filters and the
 * run date, so an exported file is self-describing and reproducible.
 *
 * Pure and locale-agnostic except for the caller-supplied verdict formatter, so
 * it can be unit-tested without a DOM or a database.
 */
import type { ScreenResultRecord } from "@/lib/db/screen-queries";
import { inferExchangeFromTicker } from "@/lib/finance/exchanges";

export interface ScreenCsvContext {
  market: string;
  /** Human-readable summary of the applied filters, e.g. "Sector: Financials". */
  filters: string;
  /** Screen run date (already formatted for display), or a dash. */
  runDate: string;
  /** Export timestamp (already formatted). */
  exportedAt: string;
  /** Localised verdict display label for a raw enum value. */
  verdictDisplay: (label: string) => string;
}

const COLUMNS = [
  "Ticker",
  "Company",
  "Exchange",
  "Currency",
  "Sector",
  "Conclusion",
  "Overall score",
  "Discount/(Premium) %",
  "Valuation",
  "Financial health",
  "Business quality",
  "P/E",
  "Price",
  "Market cap",
  "Conclusion caps",
] as const;

/** RFC-4180 field: quote when it contains a comma, quote or newline. */
function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function num(value: number | null | undefined, dp = 1): string {
  return value === null || value === undefined || !Number.isFinite(value)
    ? ""
    : value.toFixed(dp);
}

export function buildScreenCsv(rows: ScreenResultRecord[], ctx: ScreenCsvContext): string {
  const header = [
    "# The Investment Casebook — Market Screener export",
    `# Market: ${ctx.market}`,
    `# Filters: ${ctx.filters}`,
    `# Screen run: ${ctx.runDate}`,
    `# Exported: ${ctx.exportedAt}`,
  ];

  const lines = rows.map((r) =>
    [
      cell(r.ticker),
      cell(r.companyName),
      cell(inferExchangeFromTicker(r.ticker).shortCode),
      cell(r.currency),
      cell(r.sector),
      cell(ctx.verdictDisplay(r.verdictLabel)),
      num(r.compositeScore, 0),
      num(r.marginOfSafety, 1), // signed: positive = discount, negative = premium
      num(r.valuationScore, 0),
      num(r.healthScore, 0),
      num(r.qualityScore, 0),
      num(r.pe, 1),
      num(r.price, 2),
      r.marketCap === null ? "" : cell(Math.round(r.marketCap)),
      cell(r.verdictCaps ? r.verdictCaps.split(",").join(" · ") : ""),
    ].join(","),
  );

  return [...header, COLUMNS.join(","), ...lines].join("\n");
}
