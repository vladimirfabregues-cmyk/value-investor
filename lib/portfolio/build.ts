/**
 * I/O wrapper that builds and persists the simulated portfolios. The weekly job
 * runs this: read the screener snapshot history, load market history, compute
 * (via the pure compose.ts), and upsert one `SimPortfolio` row per book.
 */

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { buildMarketData, fetchFxSeries, type FxPoint } from "@/lib/portfolio/market-history";
import { buildSignalHistory, type SnapshotRow } from "@/lib/portfolio/signals";
import { computePortfolios, planBooks, priceNeeds } from "@/lib/portfolio/compose";
import { BENCHMARK_TICKER } from "@/lib/portfolio/config";
import { loadHistories } from "@/lib/portfolio/price-cache";
import type { SnapshotPrices } from "@/lib/portfolio/analytics";
import { getScorecard } from "@/lib/scorecard/build";
import { capturedSplits, mergeSplits, weekOf, type SplitEvent } from "@/lib/scorecard/compute";
import { loadSplits } from "@/lib/scorecard/splits";

const isoDay = (d: Date): string => d.toISOString().slice(0, 10);

/** Stop starting downloads after this long, leaving time to compute and save. */
const DOWNLOAD_BUDGET_MS = 30_000;

/** Market data is incomplete for now; nothing was saved and a later run can finish the job. */
export class BuildPendingError extends Error {}

export interface BuildSummary {
  inception: string;
  today: string;
  books: number;
  tickers: number;
  downloaded: number;
  failed: string[];
  stale: string[];
}

/** Most local index first: a London name in both FTSE 250 and MSCI Europe Small Cap is judged against the FTSE 250. */
const HOME_ORDER = ["FTSE100", "FTSE250", "AIM", "SP500", "SP400", "RUSSELLMID", "RUSSELL2000", "CAC40", "EUSC", "TOPIXSMALL"];

function snapshotPrices(
  rows: { ticker: string; screenerIndex: string; screenerAt: Date; price: number; sector: string | null }[],
  splits: Map<string, SplitEvent[]>,
): { snap: SnapshotPrices } {
  const prices = new Map<string, Map<number, { at: number; price: number }>>();
  const home = new Map<string, string>();
  const sector = new Map<string, { at: number; sector: string }>();
  for (const r of rows) {
    const at = r.screenerAt.getTime();
    const iso = r.screenerAt.toISOString();
    const w = weekOf(iso);
    // Snapshot prices are raw: restate them in today's shares, as the scorecard does.
    const factor = (splits.get(r.ticker) ?? []).filter((s) => s.at > iso).reduce((f, s) => f * s.ratio, 1);
    const byWeek = prices.get(r.ticker) ?? new Map();
    if (!byWeek.get(w) || byWeek.get(w)!.at < at) byWeek.set(w, { at, price: r.price / factor });
    prices.set(r.ticker, byWeek);
    const h = home.get(r.ticker);
    if (!h || HOME_ORDER.indexOf(r.screenerIndex) < HOME_ORDER.indexOf(h)) home.set(r.ticker, r.screenerIndex);
    if (r.sector && (!sector.get(r.ticker) || sector.get(r.ticker)!.at < at)) sector.set(r.ticker, { at, sector: r.sector });
  }
  return {
    snap: {
      price: (t, w) => prices.get(t)?.get(w)?.price ?? null,
      homeIndex: (t) => home.get(t) ?? null,
      sector: (t) => sector.get(t)?.sector ?? null,
    },
  };
}

/** Full build: read snapshots → load market history → compute → persist. */
export async function buildPortfolios(now: Date = new Date()): Promise<BuildSummary> {
  const started = Date.now();

  // Only names ever rated Buy or better can be bought by any book, so only
  // their rating history is needed (not the whole ~6,000-name universe).
  const eligible = await prisma.screenSnapshot.findMany({
    where: { verdictLabel: { in: ["STRONG_BUY", "BUY"] } },
    select: { ticker: true },
    distinct: ["ticker"],
  });
  const rows = await prisma.screenSnapshot.findMany({
    where: { ticker: { in: eligible.map((e) => e.ticker) } },
    select: {
      ticker: true, currency: true, screenerIndex: true, screenerAt: true, verdictLabel: true, compositeScore: true,
      price: true, sector: true, lastSplitAt: true, lastSplitRatio: true,
    },
  });
  const snapshotRows: SnapshotRow[] = rows.map((r) => ({ ...r, screenerAt: r.screenerAt.toISOString() }));

  const signals = buildSignalHistory(snapshotRows);
  const today = isoDay(now);
  const inception = signals.inceptionDate;

  const needs = priceNeeds(planBooks(signals), today);
  const loaded = await loadHistories(needs, today, started + DOWNLOAD_BUDGET_MS);

  // A missing download must not be simulated as "never bought" and saved over
  // the last good build, so any shortfall aborts without persisting.
  if (loaded.pending.length > 0) {
    throw new BuildPendingError(`${loaded.pending.length} of ${needs.size} price histories still to download; run again`);
  }
  if (loaded.failed.includes(BENCHMARK_TICKER)) {
    throw new BuildPendingError(`Benchmark ${BENCHMARK_TICKER} price history unavailable; nothing persisted`);
  }
  if (loaded.failed.length > Math.max(3, needs.size * 0.2)) {
    throw new BuildPendingError(
      `${loaded.failed.length} of ${needs.size} price downloads failed (Yahoo may be throttling); nothing persisted`,
    );
  }

  const earliest = [...needs.values()].reduce((m, n) => (n.from < m ? n.from : m), today);
  const currencies = new Set(loaded.histories.map((h) => h.currency).filter((c) => c !== "GBP"));
  const fx = new Map<string, FxPoint[]>();
  for (const c of currencies) {
    const series = await fetchFxSeries(c, earliest, today);
    if (series.length === 0) throw new BuildPendingError(`FX series ${c}GBP unavailable; nothing persisted`);
    fx.set(c, series);
  }

  const stampDuty = new Map<string, boolean>();
  for (const [ticker, meta] of signals.securities) stampDuty.set(ticker, meta.stampDutyApplies);
  stampDuty.set(BENCHMARK_TICKER, false); // ETFs are stamp-duty exempt

  const market = buildMarketData({ histories: loaded.histories, fx, stampDuty });
  const scorecard = await getScorecard();
  const indexWeekly = new Map((scorecard?.data.indexWeekly ?? []).map((p) => [`${p.index}|${p.week}`, p.mean]));
  const splits = mergeSplits(await loadSplits([...new Set(rows.map((r) => r.ticker))]), capturedSplits(rows));
  const computed = computePortfolios(signals, market, today, { ...snapshotPrices(rows, splits), indexWeekly, lastWeek: Math.max(...rows.map((r) => weekOf(r.screenerAt.toISOString()))) });

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

  return {
    inception,
    today,
    books: computed.results.length,
    tickers: needs.size,
    downloaded: loaded.downloaded,
    failed: loaded.failed,
    stale: loaded.stale,
  };
}
