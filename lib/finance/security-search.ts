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
  /** Market capitalisation, when known — the discriminator for same-ticker
   *  collisions across markets (a listed group dwarfs a lookalike micro-cap). */
  marketCap: number | null;
  /** The largest-cap listing for this company among the current results. */
  isPrimary?: boolean;
  /** Where the match came from: already screened by us, or the live provider */
  source: "screened" | "provider";
}

/** A row from our own screened universe. */
export interface ScreenedRow {
  ticker: string;
  companyName: string;
  sector: string | null;
  currency: string | null;
  marketCap?: number | null;
}

/** A quote as returned by the data provider's search. */
export interface ProviderQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
  marketCap?: number | null;
}

function toResult(
  ticker: string,
  name: string,
  sector: string | null,
  currency: string | null,
  marketCap: number | null,
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
    marketCap: marketCap ?? null,
    source,
  };
}

export function fromScreenedRow(row: ScreenedRow): SecuritySearchResult | null {
  return toResult(row.ticker, row.companyName, row.sector, row.currency, row.marketCap ?? null, "screened");
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
    quote.marketCap ?? null,
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
  /** Optional market *filter*. Ticker-first search spans all markets by
   *  default; this only narrows results when the user explicitly asks. */
  exchange?: string | null;
  limit?: number;
}

/** Normalised company name, for grouping listings of the same issuer. */
function nameKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Rank across all covered markets (unless an optional exchange filter is set),
 * drop non-matches, and dedupe by the full security identity.
 *
 * Market cap is the tie-breaker within the same match quality: a listed group
 * outranks a same-ticker micro-cap lookalike (the GLE / Société Générale
 * collision). The largest-cap listing of each company is flagged `isPrimary`.
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
      // Larger market cap first; unknown caps sort last.
      const ca = a.result.marketCap ?? -1;
      const cb = b.result.marketCap ?? -1;
      if (ca !== cb) return cb - ca;
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

  // Flag a primary listing ONLY where a company has more than one listing in
  // the results — the badge exists to disambiguate (e.g. SAN vs SAN.MC), not to
  // decorate every single-listing row. Results are cap-sorted within a match
  // tier, so the first sighting of a name is its largest-cap listing.
  const nameCounts = new Map<string, number>();
  for (const result of out) {
    const key = nameKey(result.name);
    if (key) nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
  }
  const flagged = new Set<string>();
  for (const result of out) {
    const key = nameKey(result.name);
    if (!key || (nameCounts.get(key) ?? 0) < 2) continue;
    if (!flagged.has(key)) {
      flagged.add(key);
      result.isPrimary = true;
    }
  }
  return out;
}

/** Compact market-cap label, e.g. "$1.9T", "€54.3B", "£420M". */
export function formatMarketCap(
  cap: number | null,
  currency: string | null,
  locale: "en" | "fr" = "en",
): string | null {
  if (cap === null || !Number.isFinite(cap) || cap <= 0) return null;
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "";
  const units: Array<[number, string]> = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
  ];
  for (const [scale, suffix] of units) {
    if (cap >= scale) {
      const v = cap / scale;
      const s = v.toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", {
        maximumFractionDigits: v >= 100 ? 0 : 1,
      });
      return `${sym}${s}${suffix}`;
    }
  }
  return `${sym}${Math.round(cap).toLocaleString(locale === "fr" ? "fr-FR" : "en-GB")}`;
}

/** Human-readable context line, e.g. "London Stock Exchange (LSE) · United Kingdom". */
export function describeResultMarket(result: SecuritySearchResult): string {
  const exchange = exchangeByCode(result.exchange);
  const label = exchange ? `${exchange.name} (${exchange.shortCode})` : result.exchange;
  return result.country ? `${label} · ${result.country}` : label;
}
