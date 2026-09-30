/**
 * Monthly report: gathers the month's evidence from what is already stored
 * (simulated books and their diagnostics, the scorecard, snapshots, the ETF
 * zone's digest), grades the written-down claims, and freezes the result in
 * ReportArchive when the report is sent so later months can compare.
 */

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { BRAND } from "@/lib/brand";
import { LAB_RULES } from "@/lib/portfolio/lab";
import type { PortfolioMetrics } from "@/lib/portfolio/metrics";
import type { Transaction, ValuationPoint } from "@/lib/portfolio/types";
import { summarizeAttribution, type AttributionSummary, type Concentration, type Profile } from "@/lib/portfolio/analytics";
import { getScorecard } from "@/lib/scorecard/build";
import type { CaseRow, OutcomeCounts, Pattern, VerdictStat } from "@/lib/scorecard/compute";
import { evaluateClaims, proposals, type ClaimResult, type EtfForward } from "@/lib/report/claims";
import { DECISION_LOG, type DecisionEntry } from "@/lib/report/decisions";
import { median, strength, summarize, type SeriesPoint, type Strength, type Summary } from "@/lib/stats";

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
  rolling?: { m3: number | null; m6: number | null; m12: number | null };
}

export interface SwitchStat extends Summary {
  weeks: number;
  soldMean: number | null;
  boughtMean: number | null;
}

export interface BookDiagnostics {
  strategy: string;
  month: AttributionSummary | null;
  sinceFixed: AttributionSummary | null;
  concentration: Concentration | null;
  profile: Profile | null;
  switches: SwitchStat[];
  /** Actual minus kept-opening-book return, this month. */
  tradingMonth: number | null;
  /** Average of the same, over full months since the rules were fixed. */
  tradingAvg: number | null;
  tradingMonths: number;
}

export interface FlagAudit {
  flag: string;
  weeks: number;
  /** Flagged minus unflagged (same rating) relative return, per week. */
  weeklyMean: number | null;
  t: number | null;
  strength: Strength;
}

export interface Opportunity {
  index: string;
  rated: number;
  buyShare: number;
  buyShareChange: number | null;
  medianMos: number | null;
  medianMosChange: number | null;
}

export interface EtfSummary {
  asOf: string;
  comparedWith: string;
  portfolioMonth: string;
  books: { strategy: string; monthReturnPct: number | null; totalReturnPct: number; annualisedPct: number | null; maxDrawdownPct: number }[];
  leaderChanges: { groupId: string; from: string; to: string; score: number }[];
  groups: number;
  forwardTest?: EtfForward[];
}

export interface MonthlyReport {
  version?: 2;
  month: string;
  periodStart: string;
  periodEnd: string;
  builtAt: string;
  claims?: ClaimResult[];
  decisions?: { proposed: string[]; watching: string[]; log: DecisionEntry[] };
  books: BookLine[];
  diagnostics?: BookDiagnostics[];
  scorecard: {
    ratings: number;
    horizons: { weeks: number; observations: number; byVerdict: VerdictStat[]; scoreIc: number | null }[];
    flags?: unknown[];
    spread?: { points: SeriesPoint[]; summary: Summary; strength: Strength };
    ic?: { summary: Summary; strength: Strength };
    flagAudit?: FlagAudit[];
    best: CaseRow[];
    worst: CaseRow[];
    missed?: CaseRow[];
    flaglessLosers?: CaseRow[];
    patterns?: { missed: Pattern | null; flaglessLosers: Pattern | null };
    outcomes?: OutcomeCounts | null;
    caseWeeks?: number | null;
  } | null;
  opportunities?: Opportunity[];
  strongBuys: { joined: string[]; left: string[]; current: string[] };
  health: { runWeeks: number; fullRunWeeks: number; badPrices: number | null };
  integrity?: { modelVersions: { version: string; ratings: number; buyShare: number }[] };
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

const DAY_MS = 86_400_000;
const shiftMonths = (date: string, n: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
};
const valueAt = (valuations: ValuationPoint[], date: string) => valuations.filter((v) => v.date <= date).at(-1)?.totalGbp ?? null;
const change = (a: number | null, b: number | null) => (a !== null && b !== null && b > 0 ? a / b - 1 : null);

function maxDrawdown(values: number[]): number | null {
  if (!values.length) return null;
  let peak = -Infinity;
  let worst = 0;
  for (const v of values) {
    peak = Math.max(peak, v);
    if (peak > 0) worst = Math.max(worst, (peak - v) / peak);
  }
  return worst;
}

const WEEK_MS = 7 * DAY_MS;
const weekOfDate = (d: Date) => Math.floor((d.getTime() - Date.parse("1970-01-05T00:00:00Z")) / WEEK_MS);

/** Share rated Buy or better, and median margin of safety, per index: latest full run vs the one before the month. */
async function opportunities(start: string, end: string): Promise<Opportunity[]> {
  const runs = await prisma.screenSnapshot.groupBy({
    by: ["screenerIndex", "screenerAt"],
    where: { screenerAt: { gte: new Date(Date.parse(start) - 60 * DAY_MS), lt: new Date(end) } },
    _count: { _all: true },
  });
  const byIndex = new Map<string, { at: Date; n: number }[]>();
  for (const r of runs) byIndex.set(r.screenerIndex, [...(byIndex.get(r.screenerIndex) ?? []), { at: r.screenerAt, n: r._count._all }]);
  const pairs: { index: string; now: Date; before: Date | null }[] = [];
  for (const [index, list] of byIndex) {
    const max = Math.max(...list.map((r) => r.n));
    const full = list.filter((r) => r.n >= max * 0.5).sort((a, b) => a.at.getTime() - b.at.getTime());
    const now = full.at(-1);
    if (!now) continue;
    const before = full.filter((r) => r.at < new Date(start)).at(-1) ?? null;
    pairs.push({ index, now: now.at, before: before?.at ?? null });
  }
  if (!pairs.length) return [];
  const rows = await prisma.screenSnapshot.findMany({
    where: { OR: pairs.flatMap((p) => [{ screenerIndex: p.index, screenerAt: p.now }, ...(p.before ? [{ screenerIndex: p.index, screenerAt: p.before }] : [])]) },
    select: { screenerIndex: true, screenerAt: true, verdictLabel: true, marginOfSafety: true },
  });
  const stats = (index: string, at: Date | null) => {
    if (!at) return null;
    const rs = rows.filter((r) => r.screenerIndex === index && r.screenerAt.getTime() === at.getTime());
    if (!rs.length) return null;
    return {
      rated: rs.length,
      buyShare: rs.filter((r) => r.verdictLabel === "STRONG_BUY" || r.verdictLabel === "BUY").length / rs.length,
      medianMos: median(rs.map((r) => r.marginOfSafety).filter((m): m is number => m !== null)),
    };
  };
  return pairs
    .map((p) => {
      const now = stats(p.index, p.now)!;
      const before = stats(p.index, p.before);
      return {
        index: p.index,
        rated: now.rated,
        buyShare: now.buyShare,
        buyShareChange: before ? now.buyShare - before.buyShare : null,
        medianMos: now.medianMos,
        medianMosChange: before && now.medianMos !== null && before.medianMos !== null ? now.medianMos - before.medianMos : null,
      };
    })
    .sort((a, b) => b.buyShare - a.buyShare);
}

export async function buildMonthlyReport(month: string, now: Date = new Date()): Promise<MonthlyReport> {
  const { start, end } = monthBounds(month);
  const lastDay = new Date(Date.parse(end) - DAY_MS).toISOString().slice(0, 10);
  const dayBefore = new Date(Date.parse(start) - DAY_MS).toISOString().slice(0, 10);

  const stored = await prisma.simPortfolio.findMany();
  const bookData = new Map(
    stored.map((r) => [r.strategy, { valuations: r.valuations as unknown as ValuationPoint[], metrics: r.metrics as unknown as PortfolioMetrics }]),
  );

  const books = stored.map((r): BookLine => {
    const valuations = (r.valuations as unknown as ValuationPoint[]).filter((v) => v.date <= lastDay);
    const tx = r.transactions as unknown as Transaction[];
    const v1 = valueAt(valuations, lastDay);
    const v0 = valueAt(valuations, dayBefore) ?? (r.inceptionDate <= lastDay ? r.capitalGbp : null);
    const back = (months: number) => {
      const from = shiftMonths(lastDay, -months);
      return from >= r.inceptionDate ? change(v1, valueAt(valuations, from)) : null;
    };
    return {
      strategy: r.strategy,
      valueGbp: v1 ?? r.capitalGbp,
      monthPct: change(v1, v0),
      sinceFixedPct: r.inceptionDate <= LAB_RULES.fixedOn && lastDay >= LAB_RULES.fixedOn ? change(v1, valueAt(valuations, LAB_RULES.fixedOn)) : null,
      sinceInceptionPct: change(v1, r.capitalGbp) ?? 0,
      maxDrawdownPct: maxDrawdown(valuations.map((v) => v.totalGbp)),
      costsPct: tx.filter((t) => t.date <= lastDay).reduce((s, t) => s + t.costGbp, 0) / r.capitalGbp,
      holdings: (r.holdings as unknown[]).length,
      tradesInMonth: tx.filter((t) => (t.type === "BUY" || t.type === "SELL") && t.date >= start && t.date < end).length,
      rolling: { m3: back(3), m6: back(6), m12: back(12) },
    };
  });
  books.sort((a, b) => (b.sinceFixedPct ?? -Infinity) - (a.sinceFixedPct ?? -Infinity));

  const fixedMonth = LAB_RULES.fixedOn.slice(0, 7);
  const diagnostics = stored
    .filter((r) => r.strategy !== "BENCHMARK")
    .map((r): BookDiagnostics => {
      const a = (r.metrics as unknown as PortfolioMetrics).analytics;
      const valueAdded = (a?.trading ?? []).filter((m) => m.month > fixedMonth && m.month <= month).map((m) => m.actual - m.frozen);
      const thisMonth = a?.trading.find((m) => m.month === month);
      return {
        strategy: r.strategy,
        month: a ? summarizeAttribution(a.attribution, dayBefore, lastDay) : null,
        sinceFixed: a ? summarizeAttribution(a.attribution, LAB_RULES.fixedOn, lastDay) : null,
        concentration: a?.concentration ?? null,
        profile: a?.profile ?? null,
        switches: (a?.selling ?? []).map((s) => ({ ...summarize(s.diffs), weeks: s.weeks, soldMean: s.soldMean, boughtMean: s.boughtMean })),
        tradingMonth: thisMonth ? thisMonth.actual - thisMonth.frozen : null,
        tradingAvg: valueAdded.length ? valueAdded.reduce((s, x) => s + x, 0) / valueAdded.length : null,
        tradingMonths: valueAdded.length,
      };
    });

  // Strong Buy list: first vs last weekly run of the month.
  const sb = await prisma.screenSnapshot.findMany({
    where: { verdictLabel: "STRONG_BUY", screenerAt: { gte: new Date(start), lt: new Date(end) } },
    select: { ticker: true, screenerAt: true },
  });
  const byWeek = new Map<number, Set<string>>();
  for (const r of sb) {
    const w = weekOfDate(r.screenerAt);
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
  for (const c of counts) perWeek.set(weekOfDate(c.screenerAt), (perWeek.get(weekOfDate(c.screenerAt)) ?? 0) + c._count._all);
  const typical = Math.max(0, ...perWeek.values());

  const versions = await prisma.screenSnapshot.groupBy({
    by: ["modelVersion", "verdictLabel"],
    where: { screenerAt: { gte: new Date(start), lt: new Date(end) } },
    _count: { _all: true },
  });
  const byVersion = new Map<string, { ratings: number; buy: number }>();
  for (const v of versions) {
    const key = v.modelVersion ?? "1.0.0 (not recorded)";
    const e = byVersion.get(key) ?? { ratings: 0, buy: 0 };
    e.ratings += v._count._all;
    if (v.verdictLabel === "STRONG_BUY" || v.verdictLabel === "BUY") e.buy += v._count._all;
    byVersion.set(key, e);
  }

  const sc = await getScorecard();
  const h = (weeks: number) => sc?.data.horizons.find((x) => x.weeks === weeks);

  let etf: EtfSummary | null = null;
  try {
    const res = await fetch(`${BRAND.origin}/etf/api/report-summary`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (res.ok) etf = (await res.json()) as EtfSummary;
  } catch {
    etf = null;
  }

  const claims = evaluateClaims({ scorecard: sc?.data ?? null, books: bookData, etfForward: etf?.forwardTest ?? [] });
  const spreadSeries = sc?.data.weekly?.spread ?? [];
  let cum = 0;
  const spreadPoints = spreadSeries.map((p) => ({ date: p.date, value: (cum += p.value), n: p.n }));
  const spreadSummary = summarize(spreadSeries.map((p) => p.value));
  const icSummary = summarize((sc?.data.weekly?.ic ?? []).map((p) => p.value));

  return {
    version: 2,
    month,
    periodStart: start,
    periodEnd: lastDay,
    builtAt: now.toISOString(),
    claims,
    decisions: { ...proposals(claims), log: DECISION_LOG },
    books,
    diagnostics,
    scorecard: sc
      ? {
          ratings: sc.data.ratings,
          horizons: [4, 13].flatMap((w) => {
            const x = h(w);
            return x ? [{ weeks: w, observations: x.observations, byVerdict: x.byVerdict, scoreIc: x.scoreIc.mean }] : [];
          }),
          spread: { points: spreadPoints, summary: spreadSummary, strength: strength(spreadSummary) },
          ic: { summary: icSummary, strength: strength(icSummary) },
          flagAudit: Object.entries(sc.data.weekly?.flags ?? {})
            .map(([flag, series]): FlagAudit => {
              const s = summarize(series.map((p) => p.value));
              return { flag, weeks: s.n, weeklyMean: s.mean, t: s.t, strength: strength(s) };
            })
            .sort((a, b) => b.weeks - a.weeks),
          best: sc.data.cases?.best.slice(0, 5) ?? [],
          worst: sc.data.cases?.worst.slice(0, 5) ?? [],
          missed: sc.data.cases?.missed.slice(0, 5) ?? [],
          flaglessLosers: sc.data.cases?.flaglessLosers.slice(0, 5) ?? [],
          patterns: sc.data.cases?.patterns ?? { missed: null, flaglessLosers: null },
          outcomes: h(4)?.outcomes ?? null,
          caseWeeks: sc.data.cases?.weeks ?? null,
        }
      : null,
    opportunities: await opportunities(start, end),
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
    integrity: {
      modelVersions: [...byVersion].map(([version, e]) => ({ version, ratings: e.ratings, buyShare: e.ratings ? e.buy / e.ratings : 0 })),
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
