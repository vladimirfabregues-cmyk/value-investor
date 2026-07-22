/**
 * The markets this application actually supports.
 *
 * Every entry here is backed by a real constituent list and a Yahoo Finance
 * ticker convention — nothing is listed purely for presentation. The Yahoo
 * suffix is what makes a symbol resolvable, and the exchange code is what we
 * persist as half of a security's identity.
 */

export interface Exchange {
  /** Stable identifier persisted alongside the ticker. Never change these. */
  code: string;
  name: string;
  /** Familiar short form shown next to the name, e.g. "LSE" */
  shortCode: string;
  country: string;
  currency: string;
  /** Suffix Yahoo Finance expects; empty string for US listings */
  yahooSuffix: string;
}

export const EXCHANGES: Exchange[] = [
  // United States — Yahoo uses bare symbols, so NYSE/Nasdaq/AMEX share one entry.
  // The precise venue is captured from the data provider at analysis time.
  { code: "US",   name: "United States (NYSE / Nasdaq)", shortCode: "US",   country: "United States",  currency: "USD", yahooSuffix: "" },
  { code: "XLON", name: "London Stock Exchange",         shortCode: "LSE",  country: "United Kingdom", currency: "GBP", yahooSuffix: ".L" },
  { code: "XPAR", name: "Euronext Paris",                shortCode: "EPA",  country: "France",         currency: "EUR", yahooSuffix: ".PA" },
  { code: "XETR", name: "Xetra",                         shortCode: "ETR",  country: "Germany",        currency: "EUR", yahooSuffix: ".DE" },
  { code: "XFRA", name: "Frankfurt Stock Exchange",      shortCode: "FRA",  country: "Germany",        currency: "EUR", yahooSuffix: ".F" },
  { code: "XSWX", name: "SIX Swiss Exchange",            shortCode: "SIX",  country: "Switzerland",    currency: "CHF", yahooSuffix: ".SW" },
  { code: "XSTO", name: "Nasdaq Stockholm",              shortCode: "STO",  country: "Sweden",         currency: "SEK", yahooSuffix: ".ST" },
  { code: "XCSE", name: "Nasdaq Copenhagen",             shortCode: "CPH",  country: "Denmark",        currency: "DKK", yahooSuffix: ".CO" },
  { code: "XOSL", name: "Oslo Børs",                     shortCode: "OSL",  country: "Norway",         currency: "NOK", yahooSuffix: ".OL" },
  { code: "XHEL", name: "Nasdaq Helsinki",               shortCode: "HEL",  country: "Finland",        currency: "EUR", yahooSuffix: ".HE" },
  { code: "XMIL", name: "Borsa Italiana",                shortCode: "MIL",  country: "Italy",          currency: "EUR", yahooSuffix: ".MI" },
  { code: "XMAD", name: "Bolsa de Madrid",               shortCode: "BME",  country: "Spain",          currency: "EUR", yahooSuffix: ".MC" },
  { code: "XAMS", name: "Euronext Amsterdam",            shortCode: "AMS",  country: "Netherlands",    currency: "EUR", yahooSuffix: ".AS" },
  { code: "XBRU", name: "Euronext Brussels",             shortCode: "BRU",  country: "Belgium",        currency: "EUR", yahooSuffix: ".BR" },
  { code: "XLIS", name: "Euronext Lisbon",               shortCode: "LIS",  country: "Portugal",       currency: "EUR", yahooSuffix: ".LS" },
  { code: "XDUB", name: "Euronext Dublin",               shortCode: "DUB",  country: "Ireland",        currency: "EUR", yahooSuffix: ".IR" },
  { code: "XWBO", name: "Wiener Börse",                  shortCode: "VIE",  country: "Austria",        currency: "EUR", yahooSuffix: ".VI" },
  { code: "XATH", name: "Athens Stock Exchange",         shortCode: "ATH",  country: "Greece",         currency: "EUR", yahooSuffix: ".AT" },
  { code: "XTKS", name: "Tokyo Stock Exchange",          shortCode: "TSE",  country: "Japan",          currency: "JPY", yahooSuffix: ".T" },
];

export const DEFAULT_EXCHANGE_CODE = "US";

const BY_CODE = new Map(EXCHANGES.map((e) => [e.code, e]));
// Longest suffix first so ".L" never shadows a longer suffix.
const BY_SUFFIX = [...EXCHANGES]
  .filter((e) => e.yahooSuffix !== "")
  .sort((a, b) => b.yahooSuffix.length - a.yahooSuffix.length);

export function exchangeByCode(code: string | null | undefined): Exchange | undefined {
  return code ? BY_CODE.get(code) : undefined;
}

/**
 * Derive the exchange from a Yahoo ticker's suffix. Used to backfill records
 * saved before exchanges were tracked, and to keep old links working.
 */
export function inferExchangeFromTicker(ticker: string): Exchange {
  const upper = ticker.trim().toUpperCase();
  for (const exchange of BY_SUFFIX) {
    if (upper.endsWith(exchange.yahooSuffix.toUpperCase())) return exchange;
  }
  return BY_CODE.get(DEFAULT_EXCHANGE_CODE)!;
}

/** Strip the exchange suffix, e.g. "DPLM.L" → "DPLM". */
export function baseSymbol(ticker: string): string {
  const exchange = inferExchangeFromTicker(ticker);
  const upper = ticker.trim().toUpperCase();
  return exchange.yahooSuffix
    ? upper.slice(0, upper.length - exchange.yahooSuffix.length)
    : upper;
}

/**
 * Build the ticker Yahoo can resolve from a market choice plus a symbol the
 * user typed. Accepts a symbol with or without the suffix already attached.
 */
export function toYahooTicker(exchangeCode: string, symbol: string): string {
  const exchange = exchangeByCode(exchangeCode) ?? BY_CODE.get(DEFAULT_EXCHANGE_CODE)!;
  const clean = symbol.trim().toUpperCase();
  if (!clean) return "";
  if (!exchange.yahooSuffix) return clean;
  return clean.endsWith(exchange.yahooSuffix.toUpperCase())
    ? clean
    : `${clean}${exchange.yahooSuffix}`;
}

// ── Security identity ───────────────────────────────────────────────────────

/**
 * A security is identified by market *and* symbol. Ticker alone is ambiguous
 * across markets, so nothing may key on it by itself.
 */
export interface SecurityIdentity {
  exchange: string; // Exchange["code"]
  ticker: string;   // Yahoo-resolvable ticker, e.g. "DPLM.L"
}

/** Stable string form for cache keys and URLs, e.g. "XLON:DPLM.L". */
export function securityKey(identity: SecurityIdentity): string {
  return `${identity.exchange}:${identity.ticker.toUpperCase()}`;
}

/**
 * Resolve an identity from whatever a caller supplies. An absent or unknown
 * exchange is inferred from the ticker, which keeps pre-existing links and
 * saved analyses working.
 */
export function resolveSecurity(
  ticker: string,
  exchangeCode?: string | null,
): SecurityIdentity {
  const known = exchangeByCode(exchangeCode);
  if (known) {
    return { exchange: known.code, ticker: toYahooTicker(known.code, ticker) };
  }
  const inferred = inferExchangeFromTicker(ticker);
  return { exchange: inferred.code, ticker: ticker.trim().toUpperCase() };
}

/** Short display form, e.g. "DPLM.L · LSE". */
export function formatSecurityLabel(identity: SecurityIdentity): string {
  const exchange = exchangeByCode(identity.exchange);
  return exchange ? `${identity.ticker} · ${exchange.shortCode}` : identity.ticker;
}
