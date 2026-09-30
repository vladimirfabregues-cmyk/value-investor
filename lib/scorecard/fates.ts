/**
 * What became of companies that stopped being rated, cached in TickerFate.
 *
 * Still quoted on Yahoo → TRADING (just no longer screened; its later prices
 * give its ratings an outcome). No longer quoted → delisted, and we cannot
 * tell a takeover from a failure directly, so we use the price path: a stock
 * that vanished near its recent price was most likely bought out at that
 * price; one that vanished after halving is treated as a total loss. That
 * rule is deliberately conservative — a failure counts in full.
 */

import YahooFinance from "yahoo-finance2";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import type { Fate, FateStatus, Vanished } from "@/lib/scorecard/compute";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const DAY_MS = 86_400_000;
/** "Still trading" can change (a later delisting), so it is re-checked after this. */
const RECHECK_DAYS = 28;
const MAX_LOOKUPS = 40;

type Stored = { status: string; lastRated: string; closes: Prisma.JsonValue; checkedAt: Date };
const toFate = (c: Stored): Fate => ({
  status: c.status as FateStatus,
  lastRated: c.lastRated,
  closes: (c.closes as Fate["closes"]) ?? null,
});

/** Delisted near its recent price → most likely taken over; after a collapse → failure. */
export function classifyDelisted(v: Vanished): FateStatus {
  return v.lastPrice >= 0.5 * v.peakPrice ? "TAKEOVER" : "FAILURE";
}

async function lookUp(v: Vanished): Promise<Fate | null> {
  const from = new Date(Date.parse(v.lastRated) - 14 * DAY_MS).toISOString().slice(0, 10);
  try {
    const chart = await yf.chart(v.ticker, { period1: from, interval: "1wk" });
    // Snapshot prices are in pounds for London listings; Yahoo quotes them in pence.
    const scale = chart.meta?.currency === "GBp" ? 0.01 : 1;
    const closes = (chart.quotes ?? [])
      .filter((q) => q.close != null && Number.isFinite(q.close))
      .map((q) => ({ date: new Date(q.date).toISOString().slice(0, 10), price: (q.close as number) * scale }))
      .filter((c) => c.date > v.lastRated);
    const latest = closes.at(-1);
    if (latest && Date.parse(latest.date) - Date.parse(v.lastRated) >= 21 * DAY_MS) {
      return { status: "TRADING", lastRated: v.lastRated, closes };
    }
    return { status: classifyDelisted(v), lastRated: v.lastRated };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // A "no data" answer means the symbol is gone; anything else (throttling,
    // network) is unknown and left for the next weekly run.
    return /delisted|no data found|not found|404/i.test(message)
      ? { status: classifyDelisted(v), lastRated: v.lastRated }
      : null;
  }
}

export async function resolveFates(vanished: Vanished[], deadline: number): Promise<Map<string, Fate>> {
  const cached = new Map(
    (await prisma.tickerFate.findMany({ where: { ticker: { in: vanished.map((v) => v.ticker) } } })).map((c) => [c.ticker, c]),
  );
  const fates = new Map<string, Fate>();
  let lookups = 0;
  for (const v of vanished) {
    const c = cached.get(v.ticker);
    const sameEpisode = c && c.lastRated === v.lastRated;
    const fresh = sameEpisode && (c.status !== "TRADING" || Date.now() - c.checkedAt.getTime() < RECHECK_DAYS * DAY_MS);
    if (fresh) {
      fates.set(v.ticker, toFate(c));
      continue;
    }
    const fate = Date.now() < deadline && lookups < MAX_LOOKUPS ? (lookups++, await lookUp(v)) : null;
    if (fate) {
      const data = {
        status: fate.status,
        lastRated: fate.lastRated,
        closes: (fate.closes ?? undefined) as Prisma.InputJsonValue | undefined,
        checkedAt: new Date(),
      };
      await prisma.tickerFate.upsert({ where: { ticker: v.ticker }, create: { ticker: v.ticker, ...data }, update: data });
      fates.set(v.ticker, fate);
    } else if (sameEpisode) {
      fates.set(v.ticker, toFate(c)); // stale but better than nothing
    }
  }
  return fates;
}
