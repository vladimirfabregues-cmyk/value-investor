/**
 * Monthly report: gathers the month's key results from what is already stored
 * (simulated books, scorecard, snapshots, the ETF zone's digest) and freezes
 * them in ReportArchive when the report is sent, so the next month can show
 * what changed.
 */

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { getScorecard } from "@/lib/scorecard/build";
import type { CaseRow, FlagStat, VerdictStat } from "@/lib/scorecard/compute";
import type { PortfolioMetrics } from "@/lib/portfolio/metrics";
import type { Transaction, ValuationPoint } from "@/lib/portfolio/types";
import { BRAND } from "@/lib/brand";

export interface BookLine {
  strategy: string;
  valueGbp: number;
  monthPct: number | null;
  sinceFixedPct: number | null;
  sinceInceptionPct: number;
  maxDrawdownPct: number | null;
  costsPct: number;
  holdings: number;
  tradesInMonth: number;
}

export interface EtfSummary {
  asOf: string;
  comparedWith: string;
  portfolioMonth: string;
  books: { strategy: string; monthReturnPct: number | null; totalReturnPct: number; annualisedPct: number | null; maxDrawdownPct: number }[];
  leaderChanges: { groupId: string; from: string; to: string; score: number }[];
  groups: number;
}

export interface MonthlyReport {
  month: string;
  periodStart: string;
  periodEnd: string;
  builtAt: string;
  books: BookLine[];
  scorecard: {
    ratings: number;
    horizons: { weeks: number; observations: number; byVerdict: VerdictStat[]; scoreIc: number | null }[];
    flags: FlagStat[];
    best: CaseRow[];
    worst: CaseRow[];
  } | null;
  strongBuys: { joined: string[]; left: string[]; current: string[] };
  health: { runWeeks: number; fullRunWeeks: number; badPrices: number | null };
  etf: EtfSummary | null;
}

/** "2026-11" → first day of that month and of the next, as ISO dates. */
export function monthBounds(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1)).toISOString().slice(0, 10);
  const end = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  return { start, end };
}

/** The calendar month before `now`, e.g. run on 1 Dec → "2026-11". */
export function previousMonth(now: Date = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return d.toISOString().slice(0, 7);
}

/** Value at the last mark on or before `date`. */
function valueAt(valuations: ValuationPoint[], date: string): number | null {
  return valuations.filter((v) => v.date <= date).at(-1)?.totalGbp ?? null;
}

const WEEK_MS = 7 * 86_400_000;
const weekOf = (d: Date) => Math.floor((d.getTime() - Date.parse("1970-01-05T00:00:00Z")) / WEEK_MS);

export async function buildMonthlyReport(month: string, now: Date = new Date()): Promise<MonthlyReport> {
  const { start, end } = monthBounds(month);
  const lastDay = new Date(Date.parse(end) - 86_400_000).toISOString().slice(0, 10);
  const dayBefore = new Date(Date.parse(start) - 86_400_000).toISOString().slice(0, 10);

  // Books: month return from the stored value curves.
  const books = (await prisma.simPortfolio.findMany()).map((r): BookLine => {
    const valuations = r.valuations as unknown as ValuationPoint[];
    const m = r.metrics as unknown as PortfolioMetrics;
    const v0 = valueAt(valuations, dayBefore) ?? (r.inceptionDate <= lastDay ? r.capitalGbp : null);
    const v1 = valueAt(valuations, lastDay);
    const tx = r.transactions as unknown as Transaction[];
    return {
      strategy: r.strategy,
      valueGbp: v1 ?? m.currentValueGbp,
      monthPct: v0 && v1 ? v1 / v0 - 1 : null,
      sinceFixedPct: m.sinceFixedPct ?? null,
      sinceInceptionPct: m.totalReturnPct,
      maxDrawdownPct: m.maxDrawdownPct ?? null,
      costsPct: m.costsGbp / m.initialGbp,
      holdings: (r.holdings as unknown[]).length,
      tradesInMonth: tx.filter((t) => (t.type === "BUY" || t.type === "SELL") && t.date >= start && t.date < end).length,
    };
  });
  books.sort((a, b) => (b.monthPct ?? -Infinity) - (a.monthPct ?? -Infinity));

  // Strong Buy list: first vs last weekly run of the month.
  const sb = await prisma.screenSnapshot.findMany({
    where: { verdictLabel: "STRONG_BUY", screenerAt: { gte: new Date(start), lt: new Date(end) } },
    select: { ticker: true, screenerAt: true },
  });
  const byWeek = new Map<number, Set<string>>();
  for (const r of sb) {
    const w = weekOf(r.screenerAt);
    byWeek.set(w, (byWeek.get(w) ?? new Set()).add(r.ticker));
  }
  const weeks = [...byWeek.keys()].sort((a, b) => a - b);
  const first = byWeek.get(weeks[0]) ?? new Set<string>();
  const last = byWeek.get(weeks.at(-1)!) ?? new Set<string>();

  // Data health: how many weeks the screener ran, and how many covered most of the market.
  const counts = await prisma.screenSnapshot.groupBy({
    by: ["screenerAt"],
    where: { screenerAt: { gte: new Date(start), lt: new Date(end) } },
    _count: { _all: true },
  });
  const perWeek = new Map<number, number>();
  for (const c of counts) perWeek.set(weekOf(c.screenerAt), (perWeek.get(weekOf(c.screenerAt)) ?? 0) + c._count._all);
  const typical = Math.max(0, ...perWeek.values());

  const sc = await getScorecard();
  const h = (weeks: number) => sc?.data.horizons.find((x) => x.weeks === weeks);

  let etf: EtfSummary | null = null;
  try {
    const res = await fetch(`${BRAND.origin}/etf/api/report-summary`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (res.ok) etf = (await res.json()) as EtfSummary;
  } catch {
    etf = null;
  }

  return {
    month,
    periodStart: start,
    periodEnd: lastDay,
    builtAt: now.toISOString(),
    books,
    scorecard: sc
      ? {
          ratings: sc.data.ratings,
          horizons: [4, 13].flatMap((w) => {
            const x = h(w);
            return x ? [{ weeks: w, observations: x.observations, byVerdict: x.byVerdict, scoreIc: x.scoreIc.mean }] : [];
          }),
          flags: (h(4)?.flags ?? []).filter((f) => f.n >= 50).sort((a, b) => Math.abs(b.difference ?? 0) - Math.abs(a.difference ?? 0)).slice(0, 5),
          best: sc.data.cases?.best.slice(0, 5) ?? [],
          worst: sc.data.cases?.worst.slice(0, 5) ?? [],
        }
      : null,
    strongBuys: {
      joined: [...last].filter((t) => !first.has(t)).sort(),
      left: [...first].filter((t) => !last.has(t)).sort(),
      current: [...last].sort(),
    },
    health: {
      runWeeks: perWeek.size,
      fullRunWeeks: [...perWeek.values()].filter((n) => n >= typical * 0.5).length,
      badPrices: sc?.data.badPrices ?? null,
    },
    etf,
  };
}

/** Frozen report for `month` if it was sent, otherwise built live (a preview). */
export async function getMonthlyReport(month: string): Promise<{ report: MonthlyReport; frozen: boolean }> {
  const row = await prisma.reportArchive.findUnique({ where: { month } });
  if (row) return { report: row.data as unknown as MonthlyReport, frozen: true };
  return { report: await buildMonthlyReport(month), frozen: false };
}

export async function getArchivedReport(month: string): Promise<MonthlyReport | null> {
  const row = await prisma.reportArchive.findUnique({ where: { month } });
  return row ? (row.data as unknown as MonthlyReport) : null;
}

export async function archiveMonthlyReport(month: string): Promise<MonthlyReport> {
  const report = await buildMonthlyReport(month);
  const data = report as unknown as Prisma.InputJsonValue;
  await prisma.reportArchive.upsert({
    where: { month },
    create: { month, data, builtAt: new Date(report.builtAt) },
    update: { data, builtAt: new Date(report.builtAt) },
  });
  return report;
}
