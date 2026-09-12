/**
 * Turn the screener's weekly `ScreenSnapshot` history into the rebalance
 * timeline the engine consumes.
 *
 * Each weekly refresh stamps one snapshot batch per index, so a "run" is a
 * cluster of timestamps within a few days. We bucket snapshots by ISO week and,
 * for each week, take the union of Strong Buys across every market — that is the
 * Strong-Buy list as of that rebalance. The execution date is the latest
 * snapshot date in the week (when the run actually finished).
 */

export interface SnapshotRow {
  ticker: string;
  currency: string;
  screenerIndex: string;
  /** ISO datetime the snapshot was taken. */
  screenerAt: string;
  verdictLabel: string;
}

export interface SecurityMetaLite {
  currency: string;
  /** UK main-market listing → stamp duty on buys (AIM / non-UK exempt). */
  stampDutyApplies: boolean;
}

export interface SignalHistory {
  inceptionDate: string;
  /** Rebalance (execution) dates, oldest → newest. */
  rebalanceDates: string[];
  /** Strong-Buy tickers as of each rebalance date. */
  strongBuysByDate: Map<string, string[]>;
  /** Per-ticker metadata for costing and FX. */
  securities: Map<string, SecurityMetaLite>;
}

// LSE main-market indices attract 0.5% stamp duty on purchases; AIM is exempt,
// as are the non-UK markets.
const STAMP_DUTY_INDICES = new Set(["FTSE100", "FTSE250"]);

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

/**
 * @param rows every ScreenSnapshot row (any order). Only STRONG_BUY rows drive
 *             purchases, but all rows contribute security metadata.
 */
export function buildSignalHistory(rows: SnapshotRow[]): SignalHistory {
  const securities = new Map<string, SecurityMetaLite>();
  for (const r of rows) {
    const existing = securities.get(r.ticker);
    const stampDutyApplies = (existing?.stampDutyApplies ?? false) || STAMP_DUTY_INDICES.has(r.screenerIndex);
    securities.set(r.ticker, { currency: r.currency, stampDutyApplies });
  }

  // Bucket Strong Buys by ISO week; track the week's latest date + ticker set.
  const byWeek = new Map<string, { date: string; tickers: Set<string> }>();
  for (const r of rows) {
    if (r.verdictLabel !== "STRONG_BUY") continue;
    const key = isoWeekKey(r.screenerAt);
    const date = isoDate(r.screenerAt);
    const bucket = byWeek.get(key);
    if (bucket) {
      if (date > bucket.date) bucket.date = date;
      bucket.tickers.add(r.ticker);
    } else {
      byWeek.set(key, { date, tickers: new Set([r.ticker]) });
    }
  }

  const buckets = [...byWeek.values()].sort((a, b) => a.date.localeCompare(b.date));
  const rebalanceDates = buckets.map((b) => b.date);
  const strongBuysByDate = new Map<string, string[]>(
    buckets.map((b) => [b.date, [...b.tickers].sort()]),
  );

  return {
    inceptionDate: rebalanceDates[0] ?? isoDate(new Date().toISOString()),
    rebalanceDates,
    strongBuysByDate,
    securities,
  };
}
