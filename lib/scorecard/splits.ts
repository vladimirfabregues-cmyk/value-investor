/**
 * Share splits for companies whose raw snapshot price jumped by a split-like
 * factor, confirmed against Yahoo and cached in SplitCheck. Only suspicious
 * jumps are looked up, so this costs a handful of calls a week, not one per
 * company.
 */

import YahooFinance from "yahoo-finance2";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import type { SplitCandidate, SplitEvent } from "@/lib/scorecard/compute";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const MAX_LOOKUPS = 80;

const toMap = (rows: { ticker: string; splits: Prisma.JsonValue }[]) =>
  new Map(
    rows
      .map((r) => [r.ticker, r.splits as unknown as SplitEvent[]] as const)
      .filter(([, s]) => Array.isArray(s) && s.length > 0),
  );

/** Known splits for these tickers, from the cache only (no network). */
export async function loadSplits(tickers: string[]): Promise<Map<string, SplitEvent[]>> {
  return toMap(await prisma.splitCheck.findMany({ where: { ticker: { in: tickers } } }));
}

/** Look up candidates not checked since their latest jump; return every known split. */
export async function resolveSplits(candidates: SplitCandidate[], deadline: number): Promise<Map<string, SplitEvent[]>> {
  const known = new Map((await prisma.splitCheck.findMany()).map((c) => [c.ticker, c]));
  let lookups = 0;
  for (const c of candidates) {
    const k = known.get(c.ticker);
    if (k && k.checkedAt.toISOString() >= c.lastJumpAt) continue;
    if (Date.now() >= deadline || lookups >= MAX_LOOKUPS) break;
    lookups++;
    try {
      const from = new Date(Date.parse(c.firstRated) - 7 * 86_400_000).toISOString().slice(0, 10);
      const chart = await yf.chart(c.ticker, { period1: from, interval: "1wk" });
      const splits: SplitEvent[] = Object.values(chart.events?.splits ?? {})
        .map((s) => ({ at: new Date(s.date).toISOString(), ratio: s.denominator ? s.numerator / s.denominator : 1 }))
        .filter((s) => s.ratio > 0 && s.ratio !== 1);
      const data = { splits: splits as unknown as Prisma.InputJsonValue, checkedAt: new Date() };
      const row = await prisma.splitCheck.upsert({ where: { ticker: c.ticker }, create: { ticker: c.ticker, ...data }, update: data });
      known.set(c.ticker, row);
    } catch {
      // Delisted or throttled: the fate lookup covers the former; the next run retries the latter.
    }
  }
  return toMap([...known.values()]);
}
