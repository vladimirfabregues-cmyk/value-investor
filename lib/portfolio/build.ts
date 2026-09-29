/**
 * I/O wrapper that builds and persists the simulated portfolios. The weekly job
 * runs this: read the screener snapshot history, fetch market history, compute
 * (via the pure compose.ts), and upsert one `SimPortfolio` row per strategy.
 */

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { buildMarketData, fetchFxSeries, fetchTickerHistory, type FxPoint, type TickerHistory } from "@/lib/portfolio/market-history";
import { buildSignalHistory, type SnapshotRow } from "@/lib/portfolio/signals";
import { computePortfolios } from "@/lib/portfolio/compose";
import { BENCHMARK_TICKER } from "@/lib/portfolio/config";

const isoDay = (d: Date): string => d.toISOString().slice(0, 10);

/** Fetch histories for many tickers with a small concurrency pool. */
async function fetchHistories(tickers: string[], from: string, to: string): Promise<TickerHistory[]> {
  const out: TickerHistory[] = [];
  const queue = [...tickers];
  const workers = Array.from({ length: 4 }, async () => {
    for (;;) {
      const ticker = queue.shift();
      if (!ticker) break;
      const h = await fetchTickerHistory(ticker, from, to);
      if (h) out.push(h);
    }
  });
  await Promise.all(workers);
  return out;
}

/** Full build: read snapshots → fetch market history → compute → persist. */
export async function buildPortfolios(
  now: Date = new Date(),
): Promise<{ inception: string; today: string; tickers: number; priced: number }> {
  const rows = await prisma.screenSnapshot.findMany({
    select: { ticker: true, currency: true, screenerIndex: true, screenerAt: true, verdictLabel: true },
  });
  const snapshotRows: SnapshotRow[] = rows.map((r) => ({
    ticker: r.ticker,
    currency: r.currency,
    screenerIndex: r.screenerIndex,
    screenerAt: r.screenerAt.toISOString(),
    verdictLabel: r.verdictLabel,
  }));

  const signals = buildSignalHistory(snapshotRows);
  const today = isoDay(now);
  const inception = signals.inceptionDate;

  // Only names that were ever Strong Buy are ever traded, so only they need
  // price history — fetching the whole screened universe is wasteful and
  // invites rate-limiting. (Metadata for every ticker still lives in signals.)
  const tickers = [...new Set([...signals.strongBuysByDate.values()].flat())];
  // Start a week early so a name whose market was shut on a rebalance day still
  // has a prior close to trade at.
  const from = isoDay(new Date(Date.parse(inception) - 7 * 24 * 60 * 60 * 1000));
  const histories = await fetchHistories(tickers, from, today);
  const benchHistory = await fetchTickerHistory(BENCHMARK_TICKER, from, today);

  // A failed market-data fetch would otherwise simulate as an all-cash book and
  // overwrite the last good build with zeros — refuse to persist instead.
  const priced = histories.filter((h) => h.prices.length > 0).length;
  if (!benchHistory || benchHistory.prices.length === 0) {
    throw new Error(`Benchmark ${BENCHMARK_TICKER} price history unavailable; nothing persisted`);
  }
  if (tickers.length > 0 && priced < Math.ceil(tickers.length / 2)) {
    throw new Error(`Only ${priced}/${tickers.length} Strong-Buy price histories fetched; nothing persisted`);
  }
  const all = [...histories, benchHistory];

  const currencies = new Set(all.map((h) => h.currency).filter((c) => c !== "GBP"));
  const fx = new Map<string, FxPoint[]>();
  for (const c of currencies) {
    const series = await fetchFxSeries(c, from, today);
    if (series.length === 0) throw new Error(`FX series ${c}GBP unavailable; nothing persisted`);
    fx.set(c, series);
  }

  const stampDuty = new Map<string, boolean>();
  for (const [ticker, meta] of signals.securities) stampDuty.set(ticker, meta.stampDutyApplies);
  stampDuty.set(BENCHMARK_TICKER, false); // ETFs are stamp-duty exempt

  const market = buildMarketData({ histories: all, fx, stampDuty });
  const computed = computePortfolios(signals, market, today);

  const json = (v: unknown): Prisma.InputJsonValue => v as Prisma.InputJsonValue;
  const builtAt = now;
  for (const result of computed.results) {
    const fields = {
      inceptionDate: result.inceptionDate,
      capitalGbp: result.capitalGbp,
      valuations: json(result.valuations),
      holdings: json(result.holdings),
      transactions: json(result.transactions),
      metrics: json(computed.metrics[result.strategy]),
      builtAt,
    };
    await prisma.simPortfolio.upsert({
      where: { strategy: result.strategy },
      create: { strategy: result.strategy, ...fields },
      update: fields,
    });
  }

  return { inception, today, tickers: tickers.length, priced };
}
