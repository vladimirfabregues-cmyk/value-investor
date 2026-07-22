/**
 * Search logic for finding a security by ticker or company name.
 *
 * Pure functions only — no I/O — so ranking and market-scoping can be tested
 * directly. The API route supplies the raw rows from our screened universe and
 * from the data provider; this module normalises, scopes, ranks and dedupes.
 */

import { exchangeByCode, inferExchangeFromTicker } from "@/lib/finance/exchanges";

export interface SecuritySearchResult {
  /** Provider-resolvable ticker, e.g. "DPLM.L" */
  ticker: string;
  /** Our exchange code — with `ticker` this is the security identity */
  exchange: string;
  exchangeName: string;
  exchangeShortCode: string;
  country: string;
  name: string;
  sector: string | null;
  currency: string | null;
  /** Where the match came from: already screened by us, or the live provider */
  source: "screened" | "provider";
}

/** A row from our own screened universe. */
export interface ScreenedRow {
  ticker: string;
  companyName: string;
  sector: string | null;
  currency: string | null;
}

/** A quote as returned by the data provider's search. */
export interface ProviderQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
}

function toResult(
  ticker: string,
  name: string,
  sector: string | null,
  currency: string | null,
  source: SecuritySearchResult["source"],
): SecuritySearchResult | null {
  const clean = (ticker ?? "").trim().toUpperCase();
  if (!clean) return null;
  const exchange = inferExchangeFromTicker(clean);
  return {
    ticker: clean,
    exchange: exchange.code,
    exchangeName: exchange.name,
    exchangeShortCode: exchange.shortCode,
    country: exchange.country,
    name: (name ?? "").trim() || clean,
    sector: sector ?? null,
    currency: currency ?? exchange.currency ?? null,
    source,
  };
}

export function fromScreenedRow(row: ScreenedRow): SecuritySearchResult | null {
  return toResult(row.ticker, row.companyName, row.sector, row.currency, "screened");
}

export function fromProviderQuote(quote: ProviderQuote): SecuritySearchResult | null {
  // Only equities are analysable; funds, indices and currencies are not.
  if (quote.quoteType && quote.quoteType !== "EQUITY") return null;
  if (!quote.symbol) return null;
  return toResult(
    quote.symbol,
    quote.longname ?? quote.shortname ?? quote.symbol,
    null,
    null,
    "provider",
  );
}

/**
 * Lower is better. Exact ticker beats ticker prefix, which beats a company
 * name starting with the query, which beats a name merely containing it.
 */
export function matchRank(result: SecuritySearchResult, query: string): number {
  const q = query.trim().toUpperCase();
  if (!q) return 99;
  const ticker = result.ticker.toUpperCase();
  const bare = ticker.split(".")[0];
  const name = result.name.toUpperCase();

  if (ticker === q || bare === q) return 0;
  if (bare.startsWith(q)) return 1;
  if (name.startsWith(q)) return 2;
  if (name.includes(q)) return 3;
  if (ticker.includes(q)) return 4;
  return 99;
}

export interface RankOptions {
  query: string;
  /** When set, results from other markets are dropped entirely */
  exchange?: string | null;
  limit?: number;
}

/**
 * Scope to the selected market, drop non-matches, rank, and dedupe by the full
 * security identity so the same company never appears twice.
 *
 * Scoping is a hard filter, not a sort: it is what stops the app silently
 * offering a company from the wrong exchange.
 */
export function rankResults(
  candidates: SecuritySearchResult[],
  { query, exchange, limit = 10 }: RankOptions,
): SecuritySearchResult[] {
  const scoped = exchange
    ? candidates.filter((c) => c.exchange === exchange)
    : candidates;

  const ranked = scoped
    .map((result) => ({ result, rank: matchRank(result, query) }))
    .filter((entry) => entry.rank < 99)
    .sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      // Prefer companies we've already screened — richer data, no extra call.
      if (a.result.source !== b.result.source) {
        return a.result.source === "screened" ? -1 : 1;
      }
      return a.result.name.localeCompare(b.result.name);
    });

  const seen = new Set<string>();
  const out: SecuritySearchResult[] = [];
  for (const { result } of ranked) {
    const key = `${result.exchange}:${result.ticker}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(result);
    if (out.length >= limit) break;
  }
  return out;
}

/** Human-readable context line, e.g. "London Stock Exchange (LSE) · United Kingdom". */
export function describeResultMarket(result: SecuritySearchResult): string {
  const exchange = exchangeByCode(result.exchange);
  const label = exchange ? `${exchange.name} (${exchange.shortCode})` : result.exchange;
  return result.country ? `${label} · ${result.country}` : label;
}
