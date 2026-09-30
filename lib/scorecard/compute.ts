/**
 * Rating scorecard: grade the screener's ratings by what happened next.
 *
 * Every weekly snapshot row is one rating. Its forward return over h weeks is
 * measured from the snapshot prices plus the forward dividend yield recorded
 * with it, and compared with the average name in the same index rated that
 * same week (the "cohort"), so a US small cap is judged against US small caps
 * and the market's own move drops out.
 *
 * A company that stops being rated does not silently drop out: given its fate
 * (still trading, taken over, or failed), its ratings keep an outcome. Without
 * that, the scorecard would forget exactly the failures a value screen most
 * needs to count.
 *
 * Pure: no I/O. build.ts loads the rows and fates and persists the result.
 */

import { median, type SeriesPoint } from "@/lib/stats";

export interface ScoreRow {
  ticker: string;
  index: string;
  /** ISO datetime of the rating. */
  at: string;
  verdict: string;
  score: number;
  price: number;
  caps: string | null;
  valuationScore: number | null;
  healthScore: number | null;
  qualityScore: number | null;
  moatScore: number | null;
  fairValue: number | null;
  /** Forward dividend yield as a fraction; null before it was recorded. */
  dividendYield: number | null;
  marginOfSafety: number | null;
  sector: string | null;
}

export type FateStatus = "TRADING" | "TAKEOVER" | "FAILURE";

export interface Fate {
  status: FateStatus;
  /** ISO date of the last rating. */
  lastRated: string;
  /** Weekly closes after the last rating (TRADING only), in snapshot price units. */
  closes?: { date: string; price: number }[] | null;
}

export const HORIZONS = [4, 13, 26, 52] as const;
export const VERDICTS = ["STRONG_BUY", "BUY", "WATCH", "HOLD", "AVOID"] as const;
const BUYISH = new Set(["STRONG_BUY", "BUY"]);
const SUB_SCORES = ["valuationScore", "healthScore", "qualityScore", "moatScore"] as const;
/** A cohort smaller than this has no meaningful "average name". */
const MIN_COHORT = 20;
/** A price ratio beyond this is a data error (e.g. pence/pounds flip), not a move. */
const MAX_RATIO = 5;
/** A yield above this is a data error, not a dividend. */
const MAX_YIELD = 0.25;
/** Missing from this many full runs of its index → treated as no longer rated. */
const VANISH_RUNS = 3;
const CASES = 8;

export type Via = "snapshot" | "gap" | "trading" | "takeover" | "failure";

export interface OutcomeCounts {
  /** Price found in a later snapshot at the horizon (±1 week). */
  snapshot: number;
  /** Price found within ±2 weeks (the company skipped a run). */
  gap: number;
  /** No longer rated but still trading: price taken from Yahoo. */
  trading: number;
  /** Delisted near its last price: treated as cashed out at that price. */
  takeover: number;
  /** Delisted after a collapse: treated as a total loss. */
  failure: number;
  /** Due but no outcome found yet. */
  missing: number;
  badPrice: number;
}

export interface VerdictStat {
  verdict: string;
  n: number;
  cohorts: number;
  meanExcess: number | null;
  medianExcess: number | null;
  hitRate: number | null;
}

export interface IcStat {
  /** Average within-cohort rank correlation between the score and the excess return. */
  mean: number | null;
  cohorts: number;
}

export interface FlagStat {
  flag: string;
  n: number;
  /** Flagged names' mean excess minus unflagged names' with the same verdict. */
  difference: number | null;
}

export interface CaseRow {
  ticker: string;
  index: string;
  date: string;
  verdict: string;
  score: number;
  caps: string | null;
  excess: number;
  mos: number | null;
  sector: string | null;
}

export interface Pattern {
  sector: string;
  share: number;
  n: number;
}

export interface HorizonResult {
  weeks: number;
  observations: number;
  outcomes: OutcomeCounts;
  byVerdict: VerdictStat[];
  scoreIc: IcStat;
  subScoreIc: Record<(typeof SUB_SCORES)[number], IcStat>;
  flags: FlagStat[];
  /** Buy-or-better ratings with a fair value: median share of the price-to-value gap closed. */
  fairValue: { n: number; medianGapClosed: number | null };
}

export interface Scorecard {
  ratingsFrom: string | null;
  ratingsTo: string | null;
  ratings: number;
  badPrices: number;
  horizons: HorizonResult[];
  /** One value per week from 1-week outcomes, for evidence that builds week by week. */
  weekly: {
    /** Buy-or-better minus Avoid, relative to their own index. */
    spread: SeriesPoint[];
    /** Rank correlation between score and relative return. */
    ic: SeriesPoint[];
    /** Per flag: flagged minus unflagged names with the same verdict. */
    flags: Record<string, SeriesPoint[]>;
    /** Among the cheapest third: high quality minus low quality. */
    qualityValue: SeriesPoint[];
  };
  /** Equal-weighted 1-week price return of each index, keyed by the starting week. */
  indexWeekly: { index: string; week: string; mean: number; n: number }[];
  cases: {
    weeks: number;
    best: CaseRow[];
    worst: CaseRow[];
    missed: CaseRow[];
    flaglessLosers: CaseRow[];
    patterns: { missed: Pattern | null; flaglessLosers: Pattern | null };
  } | null;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MONDAY_EPOCH = Date.parse("1970-01-05T00:00:00Z");
export const weekOf = (iso: string) => Math.floor((Date.parse(iso) - MONDAY_EPOCH) / WEEK_MS);
export const weekStart = (w: number) => new Date(MONDAY_EPOCH + w * WEEK_MS).toISOString().slice(0, 10);

const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);

function ranks(xs: number[]): number[] {
  const order = xs.map((x, i) => [x, i] as const).sort((a, b) => a[0] - b[0]);
  const r = new Array<number>(xs.length);
  for (let i = 0; i < order.length; ) {
    let j = i;
    while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
    for (let k = i; k <= j; k++) r[order[k][1]] = (i + j) / 2;
    i = j + 1;
  }
  return r;
}

/** Spearman rank correlation; null when either side has no spread. */
export function spearman(a: number[], b: number[]): number | null {
  if (a.length < 3) return null;
  const ra = ranks(a);
  const rb = ranks(b);
  const ma = mean(ra)!;
  const mb = mean(rb)!;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < ra.length; i++) {
    num += (ra[i] - ma) * (rb[i] - mb);
    da += (ra[i] - ma) ** 2;
    db += (rb[i] - mb) ** 2;
  }
  return da > 0 && db > 0 ? num / Math.sqrt(da * db) : null;
}

// ── History context ─────────────────────────────────────────────────────────

interface Series {
  ticker: string;
  index: string;
  byWeek: Map<number, ScoreRow>;
  last: ScoreRow;
  lastWeek: number;
}

interface Context {
  series: Map<string, Series>;
  tickerLastWeek: Map<string, number>;
  /** Weeks each index had a full run (at least half its usual coverage). */
  fullWeeks: Map<string, number[]>;
  /** Latest full-run week per index: outcomes after it are not due yet. */
  dueWeek: Map<string, number>;
  fates: Map<string, Fate>;
}

function buildContext(rows: ScoreRow[], fates: Map<string, Fate>): Context {
  const series = new Map<string, Series>();
  const tickerLastWeek = new Map<string, number>();
  const perIndexWeek = new Map<string, Map<number, Set<string>>>();
  for (const r of rows) {
    if (!(r.price > 0)) continue;
    const w = weekOf(r.at);
    const key = `${r.ticker}|${r.index}`;
    let s = series.get(key);
    if (!s) {
      s = { ticker: r.ticker, index: r.index, byWeek: new Map(), last: r, lastWeek: w };
      series.set(key, s);
    }
    const seen = s.byWeek.get(w);
    if (!seen || r.at > seen.at) s.byWeek.set(w, r);
    if (w > s.lastWeek || (w === s.lastWeek && r.at > s.last.at)) {
      s.last = r;
      s.lastWeek = w;
    }
    tickerLastWeek.set(r.ticker, Math.max(tickerLastWeek.get(r.ticker) ?? -Infinity, w));
    const byWeek = perIndexWeek.get(r.index) ?? new Map<number, Set<string>>();
    byWeek.set(w, (byWeek.get(w) ?? new Set()).add(r.ticker));
    perIndexWeek.set(r.index, byWeek);
  }
  const fullWeeks = new Map<string, number[]>();
  const dueWeek = new Map<string, number>();
  for (const [index, byWeek] of perIndexWeek) {
    const max = Math.max(...[...byWeek.values()].map((s) => s.size));
    const full = [...byWeek].filter(([, s]) => s.size >= max * 0.5).map(([w]) => w).sort((a, b) => a - b);
    fullWeeks.set(index, full);
    dueWeek.set(index, full.at(-1) ?? -Infinity);
  }
  return { series, tickerLastWeek, fullWeeks, dueWeek, fates };
}

export interface Vanished {
  ticker: string;
  /** ISO date of its last rating. */
  lastRated: string;
  lastPrice: number;
  /** Highest price in the eight weeks before it vanished. */
  peakPrice: number;
}

/** Companies missing from the last VANISH_RUNS full runs of every index they belonged to. */
export function findVanished(rows: ScoreRow[]): Vanished[] {
  const ctx = buildContext(rows, new Map());
  const byTicker = new Map<string, Series[]>();
  for (const s of ctx.series.values()) byTicker.set(s.ticker, [...(byTicker.get(s.ticker) ?? []), s]);
  const out: Vanished[] = [];
  for (const [ticker, list] of byTicker) {
    const lastWeek = ctx.tickerLastWeek.get(ticker)!;
    const gone = list.every((s) => (ctx.fullWeeks.get(s.index) ?? []).filter((w) => w > lastWeek).length >= VANISH_RUNS);
    if (!gone) continue;
    const latest = list.map((s) => s.last).sort((a, b) => b.at.localeCompare(a.at))[0];
    const recent = list.flatMap((s) => [...s.byWeek].filter(([w]) => w >= lastWeek - 8).map(([, r]) => r.price));
    out.push({ ticker, lastRated: latest.at.slice(0, 10), lastPrice: latest.price, peakPrice: Math.max(...recent) });
  }
  return out;
}

// ── Outcomes ────────────────────────────────────────────────────────────────

interface Outcome {
  ret: number;
  /** Price-only part (no dividends), for index averages and fair-value checks. */
  priceRet: number;
  via: Via;
}

function outcome(ctx: Context, s: Series, row: ScoreRow, w: number, h: number): Outcome | "notDue" | "missing" | "bad" {
  const target = w + h;
  if (target > (ctx.dueWeek.get(s.index) ?? -Infinity)) return "notDue";
  const y = row.dividendYield !== null && row.dividendYield >= 0 && row.dividendYield <= MAX_YIELD ? row.dividendYield : 0;
  const fromPrice = (p: number, weeks: number, via: Via): Outcome | "bad" => {
    const ratio = p / row.price;
    if (!(ratio <= MAX_RATIO && ratio >= 1 / MAX_RATIO)) return "bad";
    return { ret: ratio - 1 + (y * weeks) / 52, priceRet: ratio - 1, via };
  };
  // The weekly series must stay exactly one week long; longer horizons tolerate a skipped run.
  const tries: [number, Via][] =
    h === 1 ? [[0, "snapshot"]] : [[0, "snapshot"], [1, "snapshot"], [-1, "snapshot"], [2, "gap"], [-2, "gap"]];
  for (const [d, via] of tries) {
    if (target + d <= w) continue;
    const later = s.byWeek.get(target + d);
    if (later) return fromPrice(later.price, h, via);
  }
  const fate = ctx.fates.get(s.ticker);
  if (fate && (ctx.tickerLastWeek.get(s.ticker) ?? Infinity) < target) {
    if (fate.status === "FAILURE") return { ret: -1, priceRet: -1, via: "failure" };
    if (fate.status === "TAKEOVER") return fromPrice(s.last.price, Math.max(0, s.lastWeek - w), "takeover");
    const close = fate.closes?.find((c) => Math.abs(weekOf(c.date) - target) <= 1);
    if (close) return fromPrice(close.price, h, "trading");
  }
  return "missing";
}

interface Obs {
  row: ScoreRow;
  index: string;
  week: number;
  ret: number;
  priceRet: number;
  excess: number;
}

function observe(ctx: Context, h: number): { cohorts: Map<string, Obs[]>; counts: OutcomeCounts } {
  const counts: OutcomeCounts = { snapshot: 0, gap: 0, trading: 0, takeover: 0, failure: 0, missing: 0, badPrice: 0 };
  const raw = new Map<string, Obs[]>();
  for (const s of ctx.series.values()) {
    for (const [w, row] of s.byWeek) {
      const o = outcome(ctx, s, row, w, h);
      if (o === "notDue") continue;
      if (o === "missing") {
        counts.missing++;
        continue;
      }
      if (o === "bad") {
        counts.badPrice++;
        continue;
      }
      counts[o.via]++;
      const key = `${s.index}|${w}`;
      const list = raw.get(key) ?? [];
      list.push({ row, index: s.index, week: w, ret: o.ret, priceRet: o.priceRet, excess: 0 });
      raw.set(key, list);
    }
  }
  const cohorts = new Map<string, Obs[]>();
  for (const [key, list] of raw) {
    if (list.length < MIN_COHORT) continue;
    const avg = mean(list.map((x) => x.ret))!;
    cohorts.set(key, list.map((x) => ({ ...x, excess: x.ret - avg })));
  }
  return { cohorts, counts };
}

const flagsOf = (row: ScoreRow) => (row.caps ? row.caps.split(",") : []);

/** Flagged names' excess minus the average unflagged name with the same verdict. */
function flagDifferences(obs: Obs[], flag: string): number[] {
  const out: number[] = [];
  for (const v of VERDICTS) {
    const same = obs.filter((o) => o.row.verdict === v);
    const flagged = same.filter((o) => flagsOf(o.row).includes(flag));
    const other = mean(same.filter((o) => !flagsOf(o.row).includes(flag)).map((o) => o.excess));
    if (flagged.length && other !== null) out.push(...flagged.map((o) => o.excess - other));
  }
  return out;
}

function pattern(rows: CaseRow[]): Pattern | null {
  if (rows.length < 4) return null;
  const counts = new Map<string, number>();
  for (const r of rows) if (r.sector) counts.set(r.sector, (counts.get(r.sector) ?? 0) + 1);
  const [top] = [...counts].sort((a, b) => b[1] - a[1]);
  return top && top[1] / rows.length >= 0.5 ? { sector: top[0], share: top[1] / rows.length, n: rows.length } : null;
}

// ── Scorecard ───────────────────────────────────────────────────────────────

export function computeScorecard(rows: ScoreRow[], fates: Map<string, Fate> = new Map()): Scorecard {
  const ctx = buildContext(rows, fates);
  const dates = rows.map((r) => r.at.slice(0, 10)).sort();

  const horizons: HorizonResult[] = [];
  const obsByHorizon = new Map<number, Obs[]>();
  let badPrices = 0;
  for (const h of HORIZONS) {
    const { cohorts, counts } = observe(ctx, h);
    if (h === HORIZONS[0]) badPrices = counts.badPrice;
    const obs: Obs[] = [];
    const ic: number[] = [];
    const subIc = Object.fromEntries(SUB_SCORES.map((k) => [k, [] as number[]])) as Record<(typeof SUB_SCORES)[number], number[]>;
    for (const list of cohorts.values()) {
      obs.push(...list);
      const c = spearman(list.map((x) => x.row.score), list.map((x) => x.excess));
      if (c !== null) ic.push(c);
      for (const k of SUB_SCORES) {
        const has = list.filter((x) => x.row[k] !== null);
        if (has.length < MIN_COHORT) continue;
        const s = spearman(has.map((x) => x.row[k]!), has.map((x) => x.excess));
        if (s !== null) subIc[k].push(s);
      }
    }
    obsByHorizon.set(h, obs);

    const byVerdict = VERDICTS.map((v): VerdictStat => {
      const xs = obs.filter((o) => o.row.verdict === v);
      const ex = xs.map((o) => o.excess);
      return {
        verdict: v,
        n: xs.length,
        cohorts: new Set(xs.map((o) => `${o.index}|${o.week}`)).size,
        meanExcess: mean(ex),
        medianExcess: median(ex),
        hitRate: ex.length ? ex.filter((e) => e > 0).length / ex.length : null,
      };
    });

    const flagNames = [...new Set(obs.flatMap((o) => flagsOf(o.row)))].sort();
    const flags = flagNames.map((flag): FlagStat => {
      const diffs = flagDifferences(obs, flag);
      return { flag, n: diffs.length, difference: mean(diffs) };
    });

    const gaps = obs
      .filter((o) => BUYISH.has(o.row.verdict) && o.row.fairValue !== null && o.row.fairValue > o.row.price)
      .map((o) => (o.row.price * o.priceRet) / (o.row.fairValue! - o.row.price));

    horizons.push({
      weeks: h,
      observations: obs.length,
      outcomes: counts,
      byVerdict,
      scoreIc: { mean: mean(ic), cohorts: ic.length },
      subScoreIc: Object.fromEntries(
        SUB_SCORES.map((k) => [k, { mean: mean(subIc[k]), cohorts: subIc[k].length }]),
      ) as HorizonResult["subScoreIc"],
      flags,
      fairValue: { n: gaps.length, medianGapClosed: median(gaps) },
    });
  }

  // Weekly series from 1-week outcomes: independent weeks, so evidence can be
  // judged on how consistently each week points the same way.
  const { cohorts: weekCohorts } = observe(ctx, 1);
  const byWeek = new Map<number, Obs[][]>();
  for (const list of weekCohorts.values()) byWeek.set(list[0].week, [...(byWeek.get(list[0].week) ?? []), list]);
  const weekly: Scorecard["weekly"] = { spread: [], ic: [], flags: {}, qualityValue: [] };
  const indexWeekly: Scorecard["indexWeekly"] = [];
  for (const [w, lists] of [...byWeek].sort((a, b) => a[0] - b[0])) {
    const date = weekStart(w);
    const all = lists.flat();
    for (const list of lists) {
      indexWeekly.push({ index: list[0].index, week: date, mean: mean(list.map((x) => x.priceRet))!, n: list.length });
    }

    const buy = all.filter((o) => BUYISH.has(o.row.verdict)).map((o) => o.excess);
    const avoid = all.filter((o) => o.row.verdict === "AVOID").map((o) => o.excess);
    if (buy.length >= 5 && avoid.length >= MIN_COHORT) {
      weekly.spread.push({ date, value: mean(buy)! - mean(avoid)!, n: buy.length });
    }

    let icSum = 0;
    let icN = 0;
    for (const list of lists) {
      const c = spearman(list.map((x) => x.row.score), list.map((x) => x.excess));
      if (c !== null) {
        icSum += c * list.length;
        icN += list.length;
      }
    }
    if (icN > 0) weekly.ic.push({ date, value: icSum / icN, n: icN });

    for (const flag of new Set(all.flatMap((o) => flagsOf(o.row)))) {
      const diffs = flagDifferences(all, flag);
      if (diffs.length >= 5) (weekly.flags[flag] ??= []).push({ date, value: mean(diffs)!, n: diffs.length });
    }

    let qvSum = 0;
    let qvN = 0;
    for (const list of lists) {
      const scored = list.filter((x) => x.row.valuationScore !== null && x.row.qualityScore !== null);
      if (scored.length < 30) continue;
      const cheap = [...scored].sort((a, b) => b.row.valuationScore! - a.row.valuationScore!).slice(0, Math.floor(scored.length / 3));
      const byQuality = [...cheap].sort((a, b) => b.row.qualityScore! - a.row.qualityScore!);
      const third = Math.floor(byQuality.length / 3);
      if (third < 3) continue;
      const diff = mean(byQuality.slice(0, third).map((x) => x.excess))! - mean(byQuality.slice(-third).map((x) => x.excess))!;
      qvSum += diff * cheap.length;
      qvN += cheap.length;
    }
    if (qvN > 0) weekly.qualityValue.push({ date, value: qvSum / qvN, n: qvN });
  }

  // Hits and misses at the longest horizon with enough data, one entry per company.
  const caseHorizon = [...HORIZONS].reverse().find((h) => (obsByHorizon.get(h)?.length ?? 0) >= 50);
  let cases: Scorecard["cases"] = null;
  if (caseHorizon) {
    const toCase = (o: Obs): CaseRow => ({
      ticker: o.row.ticker,
      index: o.index,
      date: o.row.at.slice(0, 10),
      verdict: o.row.verdict,
      score: o.row.score,
      caps: o.row.caps,
      excess: o.excess,
      mos: o.row.marginOfSafety,
      sector: o.row.sector,
    });
    const firstPerTicker = (xs: Obs[]) => {
      const seen = new Map<string, Obs>();
      for (const o of [...xs].sort((a, b) => a.week - b.week)) if (!seen.has(o.row.ticker)) seen.set(o.row.ticker, o);
      return [...seen.values()];
    };
    const all = obsByHorizon.get(caseHorizon)!;
    const bought = firstPerTicker(all.filter((o) => BUYISH.has(o.row.verdict)));
    const shunned = firstPerTicker(all.filter((o) => o.row.verdict === "HOLD" || o.row.verdict === "AVOID"));
    const byExcess = (a: Obs, b: Obs) => b.excess - a.excess;
    // With few names the two lists would repeat each other, so split them.
    const ranked = [...bought].sort(byExcess);
    const top = Math.min(CASES, Math.ceil(ranked.length / 2));
    const missed = [...shunned].sort(byExcess).slice(0, CASES).map(toCase);
    const flaglessLosers = ranked.filter((o) => !o.row.caps && o.excess < 0).reverse().slice(0, CASES).map(toCase);
    cases = {
      weeks: caseHorizon,
      best: ranked.slice(0, top).map(toCase),
      worst: ranked.slice(top).reverse().slice(0, CASES).map(toCase),
      missed,
      flaglessLosers,
      patterns: { missed: pattern(missed), flaglessLosers: pattern(flaglessLosers) },
    };
  }

  return {
    ratingsFrom: dates[0] ?? null,
    ratingsTo: dates.at(-1) ?? null,
    ratings: rows.length,
    badPrices,
    horizons,
    weekly,
    indexWeekly,
    cases,
  };
}
