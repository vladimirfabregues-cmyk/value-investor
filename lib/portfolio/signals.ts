/**
 * Turn the screener's weekly `ScreenSnapshot` history into the rebalance
 * timeline the engine consumes.
 *
 * Each weekly refresh stamps one snapshot batch per index, so a "run" is a
 * cluster of timestamps within a few days. We bucket snapshots by ISO week; the
 * week's execution date is the latest snapshot date in it (when the run
 * actually finished). Every book shares this one calendar, so their value
 * curves are marked on the same days and compare directly.
 */

export interface SnapshotRow {
  ticker: string;
  currency: string;
  screenerIndex: string;
  /** ISO datetime the snapshot was taken. */
  screenerAt: string;
  verdictLabel: string;
  compositeScore: number;
}

export interface SecurityMetaLite {
  currency: string;
  /** UK main-market listing → stamp duty on buys (AIM / non-UK exempt). */
  stampDutyApplies: boolean;
}

export interface Rating {
  verdict: string;
  score: number;
}

export interface SignalHistory {
  inceptionDate: string;
  /** Execution date of every weekly run, oldest → newest. */
  calendar: string[];
  /** Calendar dates of the weeks that had at least one Strong Buy. */
  rebalanceDates: string[];
  /** Strong-Buy tickers as of each rebalance date (union across markets). */
  strongBuysByDate: Map<string, string[]>;
  /** Every rating taken in each calendar week: date → ticker → latest rating. */
  ratingsByDate: Map<string, Map<string, Rating>>;
  /** Per-ticker metadata for costing and FX. */
  securities: Map<string, SecurityMetaLite>;
}

const isoDate = (iso: string) => iso.slice(0, 10);

/** ISO week key like "2026-W37", so timestamps in the same week bucket together. */
function isoWeekKey(iso: string): string {
  const d = new Date(iso);
  // ISO week: Thursday-anchored.
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week =
    1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

interface WeekBucket {
  date: string;
  strongBuys: Set<string>;
  /** ticker → latest row seen this week (a ticker can sit in several indices). */
  latest: Map<string, SnapshotRow>;
}

/**
 * @param rows snapshot rows (any order). STRONG_BUY rows drive the original
 *             books; every row feeds the weekly ratings and security metadata.
 */
export function buildSignalHistory(rows: SnapshotRow[]): SignalHistory {
  const aim = new Set(rows.filter((r) => r.screenerIndex === "AIM").map((r) => r.ticker));
  const securities = new Map<string, SecurityMetaLite>();
  for (const r of rows) {
    // Stamp duty is charged on UK main-market shares; AIM is exempt. Keyed off
    // the listing (".L") rather than the index, because MSCI Europe Small Cap
    // also holds London main-market names.
    securities.set(r.ticker, { currency: r.currency, stampDutyApplies: r.ticker.endsWith(".L") && !aim.has(r.ticker) });
  }

  const byWeek = new Map<string, WeekBucket>();
  for (const r of rows) {
    const key = isoWeekKey(r.screenerAt);
    const date = isoDate(r.screenerAt);
    let bucket = byWeek.get(key);
    if (!bucket) {
      bucket = { date, strongBuys: new Set(), latest: new Map() };
      byWeek.set(key, bucket);
    }
    if (date > bucket.date) bucket.date = date;
    if (r.verdictLabel === "STRONG_BUY") bucket.strongBuys.add(r.ticker);
    const seen = bucket.latest.get(r.ticker);
    if (
      !seen ||
      r.screenerAt > seen.screenerAt ||
      (r.screenerAt === seen.screenerAt && r.compositeScore > seen.compositeScore)
    ) {
      bucket.latest.set(r.ticker, r);
    }
  }

  const buckets = [...byWeek.values()].sort((a, b) => a.date.localeCompare(b.date));
  const calendar = buckets.map((b) => b.date);
  const withStrongBuys = buckets.filter((b) => b.strongBuys.size > 0);
  const ratingsByDate = new Map(
    buckets.map((b) => [
      b.date,
      new Map([...b.latest].map(([ticker, r]) => [ticker, { verdict: r.verdictLabel, score: r.compositeScore }])),
    ]),
  );

  return {
    inceptionDate: withStrongBuys[0]?.date ?? isoDate(new Date().toISOString()),
    calendar,
    rebalanceDates: withStrongBuys.map((b) => b.date),
    strongBuysByDate: new Map(withStrongBuys.map((b) => [b.date, [...b.strongBuys].sort()])),
    ratingsByDate,
    securities,
  };
}
