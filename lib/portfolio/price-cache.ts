/**
 * Price histories for the portfolio build, cached in the database.
 *
 * A name no longer held by any book only needs the prices up to its sale, so a
 * cached copy is final. A name still held is re-downloaded in full each run:
 * Yahoo back-adjusts for splits, so appending to an old copy could splice two
 * different price scales together.
 *
 * Downloads stop at `deadline`; whatever is left is reported as pending and
 * the caller retries later, picking up from the cache. That lets the first
 * backfill of hundreds of names finish across several short serverless calls.
 */

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import type { PriceNeed } from "@/lib/portfolio/compose";
import { fetchTickerHistory, type TickerHistory } from "@/lib/portfolio/market-history";

const CONCURRENCY = 5;

export interface LoadedHistories {
  histories: TickerHistory[];
  /** Not attempted before the deadline — run again. */
  pending: string[];
  /** Download failed and nothing usable was cached. */
  failed: string[];
  /** Download failed; an older cached copy is used instead. */
  stale: string[];
  downloaded: number;
}

interface CachedRow {
  ticker: string;
  currency: string;
  fromDate: string;
  toDate: string;
  prices: Prisma.JsonValue;
  dividends: Prisma.JsonValue;
}

const fromCache = (c: CachedRow): TickerHistory => ({
  ticker: c.ticker,
  currency: c.currency,
  prices: c.prices as unknown as TickerHistory["prices"],
  dividends: c.dividends as unknown as TickerHistory["dividends"],
  splits: [],
});

export async function loadHistories(
  needs: Map<string, PriceNeed>,
  today: string,
  deadline: number,
): Promise<LoadedHistories> {
  const tickers = [...needs.keys()];
  const cached = new Map(
    (await prisma.priceSeries.findMany({ where: { ticker: { in: tickers } } })).map((c) => [c.ticker, c as CachedRow]),
  );

  const out: LoadedHistories = { histories: [], pending: [], failed: [], stale: [], downloaded: 0 };
  const queue: string[] = [];
  for (const ticker of tickers) {
    const need = needs.get(ticker)!;
    const c = cached.get(ticker);
    const live = need.to >= today;
    const usable = c && c.fromDate <= need.from && (live ? c.toDate >= today : c.toDate >= need.to);
    if (usable) out.histories.push(fromCache(c));
    else queue.push(ticker);
  }

  const worker = async () => {
    for (;;) {
      if (Date.now() >= deadline) return;
      const ticker = queue.shift();
      if (!ticker) return;
      const need = needs.get(ticker)!;
      const h = await fetchTickerHistory(ticker, need.from, today);
      if (h && h.prices.length > 0) {
        const data = {
          currency: h.currency,
          fromDate: need.from,
          toDate: today,
          prices: h.prices as unknown as Prisma.InputJsonValue,
          dividends: h.dividends as unknown as Prisma.InputJsonValue,
          fetchedAt: new Date(),
        };
        await prisma.priceSeries.upsert({ where: { ticker }, create: { ticker, ...data }, update: data });
        out.histories.push(h);
        out.downloaded += 1;
        continue;
      }
      const c = cached.get(ticker);
      if (c && c.fromDate <= need.from) {
        out.histories.push(fromCache(c));
        out.stale.push(ticker);
      } else {
        out.failed.push(ticker);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  out.pending = queue;
  return out;
}
