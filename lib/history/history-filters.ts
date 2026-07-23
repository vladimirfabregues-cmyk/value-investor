/**
 * Searching, filtering and grouping for the History panel.
 *
 * Pure functions over the summaries the server already sent, so narrowing the
 * list is instant and needs no round trip. Everything here keys on the full
 * security identity (market + ticker); a ticker on its own is ambiguous across
 * markets and must never be used to identify an entry.
 */

import { exchangeByCode, securityKey } from "@/lib/finance/exchanges";
import type { SavedAnalysisSummary, VerdictLabel } from "@/types/analysis";

export const VERDICT_ORDER: VerdictLabel[] = [
  "STRONG_BUY",
  "BUY",
  "WATCH",
  "HOLD",
  "AVOID",
];

export interface HistoryFilters {
  /** Free text over ticker, company name and market */
  query: string;
  /** Empty means "no verdict filter", not "match nothing" */
  verdicts: VerdictLabel[];
  /** Exchange codes; empty means all markets */
  exchanges: string[];
}

export const EMPTY_FILTERS: HistoryFilters = {
  query: "",
  verdicts: [],
  exchanges: [],
};

export function hasActiveFilters(filters: HistoryFilters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.verdicts.length > 0 ||
    filters.exchanges.length > 0
  );
}

/** Identity of the security an entry describes, e.g. "XLON:DPLM.L". */
export function entrySecurityKey(item: SavedAnalysisSummary): string {
  return securityKey({ exchange: item.exchange, ticker: item.ticker });
}

/** Every string a text search should be able to match an entry on. */
function searchableText(item: SavedAnalysisSummary): string {
  const exchange = exchangeByCode(item.exchange);
  return [
    item.ticker,
    item.companyName,
    item.exchange,
    exchange?.shortCode,
    exchange?.name,
    exchange?.country,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterHistory(
  items: SavedAnalysisSummary[],
  filters: HistoryFilters,
): SavedAnalysisSummary[] {
  const query = filters.query.trim().toLowerCase();
  const verdicts = new Set(filters.verdicts);
  const exchanges = new Set(filters.exchanges);

  return items.filter((item) => {
    if (verdicts.size > 0 && !verdicts.has(item.finalVerdictLabel)) return false;
    if (exchanges.size > 0 && !exchanges.has(item.exchange)) return false;
    if (query && !searchableText(item).includes(query)) return false;
    return true;
  });
}

export interface FacetCount<T> {
  value: T;
  label: string;
  count: number;
}

/** Verdict facets in severity order, including only verdicts actually present. */
export function verdictFacets(items: SavedAnalysisSummary[]): FacetCount<VerdictLabel>[] {
  const counts = new Map<VerdictLabel, number>();
  for (const item of items) {
    counts.set(item.finalVerdictLabel, (counts.get(item.finalVerdictLabel) ?? 0) + 1);
  }

  return VERDICT_ORDER.filter((verdict) => counts.has(verdict)).map((verdict) => ({
    value: verdict,
    label: verdict.replace("_", " "),
    count: counts.get(verdict)!,
  }));
}

/** Market facets, most-analysed first, then alphabetical for stability. */
export function exchangeFacets(items: SavedAnalysisSummary[]): FacetCount<string>[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.exchange, (counts.get(item.exchange) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([code, count]) => ({
      value: code,
      label: exchangeByCode(code)?.shortCode ?? code,
      count,
    }))
    .sort((a, b) => (b.count - a.count) || a.label.localeCompare(b.label));
}

// ── Date grouping ───────────────────────────────────────────────────────────

export interface HistoryGroup {
  /** Stable key for React; independent of the display label */
  id: string;
  label: string;
  items: SavedAnalysisSummary[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight local time, so "Today" means the calendar day, not 24 hours ago. */
function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

const BUCKETS: { id: string; label: string; maxDaysAgo: number }[] = [
  { id: "today", label: "Today", maxDaysAgo: 0 },
  { id: "yesterday", label: "Yesterday", maxDaysAgo: 1 },
  { id: "week", label: "Previous 7 days", maxDaysAgo: 7 },
  { id: "month", label: "Previous 30 days", maxDaysAgo: 30 },
];

const OLDER = { id: "older", label: "Earlier" };

/**
 * Bucket entries by how recently they were run, preserving the order they
 * arrived in (newest first). Empty buckets are dropped.
 */
export function groupHistoryByDate(
  items: SavedAnalysisSummary[],
  now: Date = new Date(),
): HistoryGroup[] {
  const today = startOfDay(now);
  const groups = new Map<string, HistoryGroup>();

  for (const item of items) {
    const created = new Date(item.createdAt);
    const daysAgo = Number.isNaN(created.getTime())
      ? Number.POSITIVE_INFINITY
      : Math.round((today - startOfDay(created)) / DAY_MS);

    const bucket = BUCKETS.find((candidate) => daysAgo <= candidate.maxDaysAgo) ?? OLDER;
    const existing = groups.get(bucket.id);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(bucket.id, { id: bucket.id, label: bucket.label, items: [item] });
    }
  }

  const order = [...BUCKETS.map((bucket) => bucket.id), OLDER.id];
  return order
    .map((id) => groups.get(id))
    .filter((group): group is HistoryGroup => group !== undefined);
}
