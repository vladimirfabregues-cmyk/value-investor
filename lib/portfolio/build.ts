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
export async function buildPortfolios(now: Date = new Date()): Promise<{ inception: string; today: string; tickers: number }> {
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

  const tickers = [...signals.securities.keys()];
  const histories = await fetchHistories(tickers, inception, today);
  const benchHistory = await fetchTickerHistory(BENCHMARK_TICKER, inception, today);
  const all = benchHistory ? [...histories, benchHistory] : histories;

  const currencies = new Set(all.map((h) => h.currency).filter((c) => c !== "GBP"));
  const fx = new Map<string, FxPoint[]>();
  for (const c of currencies) fx.set(c, await fetchFxSeries(c, inception, today));

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

  return { inception, today, tickers: tickers.length };
}
