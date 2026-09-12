/**
 * Historical market data for the portfolio simulation.
 *
 * Two concerns:
 *  - fetchers (I/O) that pull daily prices, dividend/split events and FX series
 *    from Yahoo, normalising LSE pence quotes ("GBp") to pounds;
 *  - buildMarketData (pure) that turns the fetched series into the engine's
 *    MarketData port with nearest-on-or-before lookups.
 *
 * The fetchers run in the background job, not on a page load. buildMarketData is
 * pure and unit-tested.
 */

import YahooFinance from "yahoo-finance2";

import type { MarketData } from "@/lib/portfolio/engine";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export interface TickerHistory {
  ticker: string;
  /** Normalised currency (GBp pence quotes become GBP). */
  currency: string;
  /** Daily closes in local currency, ascending by date. */
  prices: { date: string; price: number }[];
  dividends: { date: string; amountLocal: number }[];
  splits: { date: string; ratio: number }[];
}

export interface FxPoint {
  date: string;
  /** GBP per 1 unit of the foreign currency. */
  gbpPerUnit: number;
}

const iso = (d: Date | string): string => new Date(d).toISOString().slice(0, 10);

/** LSE quotes in pence ("GBp"); scale to pounds and report the currency as GBP. */
function normalizeCurrency(metaCurrency?: string): { currency: string; scale: number } {
  if (metaCurrency === "GBp") return { currency: "GBP", scale: 0.01 };
  return { currency: metaCurrency ?? "USD", scale: 1 };
}

/** Daily price/dividend/split history for one ticker; null on fetch failure. */
export async function fetchTickerHistory(
  ticker: string,
  from: string,
  to: string,
): Promise<TickerHistory | null> {
  try {
    const chart = await yf.chart(ticker, { period1: from, period2: to, interval: "1d" });
    const { currency, scale } = normalizeCurrency(chart.meta?.currency);
    const prices = (chart.quotes ?? [])
      .filter((q) => q.close != null && Number.isFinite(q.close))
      .map((q) => ({ date: iso(q.date), price: (q.close as number) * scale }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const dividends = Object.values(chart.events?.dividends ?? {})
      .map((d) => ({ date: iso(d.date), amountLocal: d.amount * scale }))
      .filter((d) => d.amountLocal > 0);
    const splits = Object.values(chart.events?.splits ?? {})
      .map((s) => ({ date: iso(s.date), ratio: s.denominator ? s.numerator / s.denominator : 1 }))
      .filter((s) => s.ratio > 0 && s.ratio !== 1);
    return { ticker, currency, prices, dividends, splits };
  } catch {
    return null;
  }
}

/** GBP-per-unit daily FX series; empty for GBP (always 1). */
export async function fetchFxSeries(currency: string, from: string, to: string): Promise<FxPoint[]> {
  if (currency === "GBP") return [];
  try {
    const chart = await yf.chart(`${currency}GBP=X`, { period1: from, period2: to, interval: "1d" });
    return (chart.quotes ?? [])
      .filter((q) => q.close != null && Number.isFinite(q.close))
      .map((q) => ({ date: iso(q.date), gbpPerUnit: q.close as number }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}

/** Binary search for the last entry with `date <= target`. */
function onOrBefore<T extends { date: string }>(sorted: T[], target: string): T | null {
  let lo = 0;
  let hi = sorted.length - 1;
  let best: T | null = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid].date <= target) {
      best = sorted[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

function eventsBetween<T extends { date: string }>(sorted: T[], from: string, to: string): T[] {
  return sorted.filter((e) => e.date > from && e.date <= to);
}

export interface BuildMarketDataInput {
  histories: TickerHistory[];
  /** currency → GBP-per-unit series (ascending). GBP need not be present. */
  fx: Map<string, FxPoint[]>;
  /** ticker → UK main-market flag (stamp duty on buys). */
  stampDuty: Map<string, boolean>;
}

/** Pure adapter: fetched series → the engine's MarketData port. */
export function buildMarketData(input: BuildMarketDataInput): MarketData {
  const byTicker = new Map(input.histories.map((h) => [h.ticker, h]));

  return {
    priceOn(ticker, date) {
      const h = byTicker.get(ticker);
      if (!h) return null;
      return onOrBefore(h.prices, date)?.price ?? null;
    },
    fxToGbp(currency, date) {
      if (currency === "GBP") return 1;
      const series = input.fx.get(currency);
      if (!series || series.length === 0) return 1;
      return onOrBefore(series, date)?.gbpPerUnit ?? series[0].gbpPerUnit;
    },
    dividendsBetween(ticker, from, to) {
      const h = byTicker.get(ticker);
      return h ? eventsBetween(h.dividends, from, to) : [];
    },
    splitsBetween(ticker, from, to) {
      const h = byTicker.get(ticker);
      return h ? eventsBetween(h.splits, from, to) : [];
    },
    security(ticker) {
      const h = byTicker.get(ticker);
      return {
        currency: h?.currency ?? "GBP",
        stampDutyApplies: input.stampDuty.get(ticker) ?? false,
      };
    },
  };
}
