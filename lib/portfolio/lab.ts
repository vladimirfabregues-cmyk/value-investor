/**
 * Strategy lab: alternative rulebooks run through the same engine and signal
 * history as the original books, so a year on they can be compared on equal
 * terms.
 *
 * The list below was fixed on LAB_RULES.fixedOn, before any of its results were
 * known. Only performance after that date is an honest test: earlier figures
 * are a back-test, and the rules were chosen after seeing that period. Never
 * edit a rulebook in place — add a new one (and say when it was added), or the
 * comparison stops meaning anything.
 */

import type { Rating, SignalHistory } from "@/lib/portfolio/signals";

// v2 (30 Sept, before any out-of-sample week): trade only on full screener runs.
export const LAB_RULES = { version: 2, fixedOn: "2026-09-29" } as const;

export type Region = "US" | "UK" | "EU" | "JP";

export type LabStrategyId = "LAB_TOP20" | "LAB_STICKY" | "LAB_MONTHLY" | "LAB_US" | "LAB_UK" | "LAB_EU" | "LAB_JP";

export interface LabStrategy {
  id: LabStrategyId;
  /** Only names listed in this region; undefined = every market. */
  region?: Region;
  /** At most this many names held. */
  maxHoldings: number;
  /** No single name above this share of the book; the rest stays in cash. */
  maxWeight: number;
  /**
   * RANK: hold exactly the current top names (a name that slips out is sold).
   * DOWNGRADE: keep a holding until it is rated Hold or Avoid; only free slots
   * are refilled from the top of the list.
   */
  sell: "RANK" | "DOWNGRADE";
  frequency: "WEEKLY" | "MONTHLY";
}

const BASE = { maxHoldings: 20, maxWeight: 0.1, sell: "RANK", frequency: "WEEKLY" } as const;

export const LAB_STRATEGIES: LabStrategy[] = [
  { id: "LAB_TOP20", ...BASE },
  { id: "LAB_STICKY", ...BASE, sell: "DOWNGRADE" },
  { id: "LAB_MONTHLY", ...BASE, frequency: "MONTHLY" },
  { id: "LAB_US", ...BASE, region: "US" },
  { id: "LAB_UK", ...BASE, region: "UK" },
  { id: "LAB_EU", ...BASE, region: "EU" },
  { id: "LAB_JP", ...BASE, region: "JP" },
];

/** Verdicts a lab book may buy. */
const BUYABLE = new Set(["STRONG_BUY", "BUY"]);
/** Verdicts that make a DOWNGRADE book sell. */
const SELL_ON = new Set(["HOLD", "AVOID"]);
/** A rating older than this is treated as unknown (e.g. a delisted name). */
const MAX_RATING_AGE_DAYS = 21;

/** Where the shares trade, from the Yahoo suffix (no suffix = a US listing). */
export function regionOf(ticker: string): Region {
  const dot = ticker.lastIndexOf(".");
  if (dot < 0) return "US";
  const suffix = ticker.slice(dot + 1);
  if (suffix === "L") return "UK";
  if (suffix === "T") return "JP";
  return "EU";
}

/**
 * Weeks where the screener rated at least half as many names as its best
 * week. Before the weekly automation, indices were screened ad hoc, so many
 * weeks rated a single market; trading on those would sell everything whose
 * rating had gone stale and fill the book from one market.
 */
export function fullRunDates(signals: SignalHistory): Set<string> {
  const counts = signals.calendar.map((d) => signals.ratingsByDate.get(d)?.size ?? 0);
  const max = Math.max(0, ...counts);
  return new Set(signals.calendar.filter((_, i) => counts[i] >= max * 0.5));
}

/** Calendar dates the strategy trades on, from inception onwards (full runs only). */
export function labRebalanceDates(
  calendar: string[],
  inception: string,
  frequency: LabStrategy["frequency"],
  full?: Set<string>,
): string[] {
  const dates = calendar.filter((d) => d >= inception && (!full || full.has(d)));
  if (frequency === "WEEKLY") return dates;
  // First run of each calendar month.
  return dates.filter((d, i) => i === 0 || d.slice(0, 7) !== dates[i - 1].slice(0, 7));
}

const daysBetween = (from: string, to: string) => (Date.parse(to) - Date.parse(from)) / 86_400_000;

/**
 * Target holdings at each of the strategy's rebalance dates. Ratings carry
 * forward from earlier weeks (up to MAX_RATING_AGE_DAYS), so a name the screener
 * failed to re-rate this week is judged on its last known rating rather than
 * sold and re-bought on a data hiccup.
 */
export function labTargets(strategy: LabStrategy, signals: SignalHistory, rebalanceDates: string[]): Map<string, string[]> {
  const trading = new Set(rebalanceDates);
  const known = new Map<string, { rating: Rating; date: string }>();
  const targets = new Map<string, string[]>();
  let previous: string[] = [];

  for (const date of signals.calendar) {
    for (const [ticker, rating] of signals.ratingsByDate.get(date) ?? []) known.set(ticker, { rating, date });
    if (!trading.has(date)) continue;

    const current = (ticker: string): Rating | null => {
      const k = known.get(ticker);
      return k && daysBetween(k.date, date) <= MAX_RATING_AGE_DAYS ? k.rating : null;
    };

    const ranked = [...known.keys()]
      .filter((t) => !strategy.region || regionOf(t) === strategy.region)
      .map((t) => ({ t, r: current(t) }))
      .filter((x): x is { t: string; r: Rating } => x.r !== null && BUYABLE.has(x.r.verdict))
      .sort((a, b) => b.r.score - a.r.score || a.t.localeCompare(b.t))
      .map((x) => x.t);

    let next: string[];
    if (strategy.sell === "RANK") {
      next = ranked.slice(0, strategy.maxHoldings);
    } else {
      const kept = previous.filter((t) => {
        const r = current(t);
        return r !== null && !SELL_ON.has(r.verdict);
      });
      const fill = ranked.filter((t) => !kept.includes(t)).slice(0, Math.max(0, strategy.maxHoldings - kept.length));
      next = [...kept, ...fill];
    }

    targets.set(date, next);
    previous = next;
  }
  return targets;
}
