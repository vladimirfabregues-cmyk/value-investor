/**
 * Rating scorecard: grade the screener's ratings by what happened next.
 *
 * Every weekly snapshot row is one rating. Its forward return over h weeks is
 * measured from the snapshot prices themselves and compared with the average
 * name in the same index rated that same week (the "cohort"), so a US small
 * cap is judged against US small caps and the market's own move drops out.
 * Snapshot prices exclude dividends; within one market that difference is
 * small and roughly shared, so relative figures are barely affected.
 *
 * Pure: no I/O. build.ts loads the rows and persists the result.
 */

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
}

export const HORIZONS = [4, 13, 26, 52] as const;
export const VERDICTS = ["STRONG_BUY", "BUY", "WATCH", "HOLD", "AVOID"] as const;
const SUB_SCORES = ["valuationScore", "healthScore", "qualityScore", "moatScore"] as const;
/** A cohort smaller than this has no meaningful "average name". */
const MIN_COHORT = 20;
/** A price ratio beyond this is a data error (e.g. pence/pounds flip), not a move. */
const MAX_RATIO = 5;
const CASES = 8;

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
}

export interface HorizonResult {
  weeks: number;
  observations: number;
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
  cases: { weeks: number; best: CaseRow[]; worst: CaseRow[]; missed: CaseRow[] } | null;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MONDAY_EPOCH = Date.parse("1970-01-05T00:00:00Z");
const weekOf = (iso: string) => Math.floor((Date.parse(iso) - MONDAY_EPOCH) / WEEK_MS);

const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

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

interface Obs {
  row: ScoreRow;
  week: number;
  fwd: number;
  excess: number;
  gapClosed: number | null;
}

export function computeScorecard(rows: ScoreRow[]): Scorecard {
  // One rating per (ticker, index, week): the latest.
  const series = new Map<string, Map<number, ScoreRow>>();
  for (const r of rows) {
    if (!(r.price > 0)) continue;
    const key = `${r.ticker}|${r.index}`;
    const w = weekOf(r.at);
    const byWeek = series.get(key) ?? new Map<number, ScoreRow>();
    const seen = byWeek.get(w);
    if (!seen || r.at > seen.at) byWeek.set(w, r);
    series.set(key, byWeek);
  }
  const dates = rows.map((r) => r.at.slice(0, 10)).sort();
  let badPrices = 0;

  const horizons: HorizonResult[] = [];
  const obsByHorizon = new Map<number, Obs[]>();
  for (const h of HORIZONS) {
    // Raw forward returns, grouped into cohorts (index × start week).
    const cohorts = new Map<string, { row: ScoreRow; week: number; fwd: number }[]>();
    for (const byWeek of series.values()) {
      for (const [w, row] of byWeek) {
        const later = byWeek.get(w + h) ?? byWeek.get(w + h + 1) ?? byWeek.get(w + h - 1);
        if (!later) continue;
        const ratio = later.price / row.price;
        if (ratio > MAX_RATIO || ratio < 1 / MAX_RATIO) {
          if (h === HORIZONS[0]) badPrices++;
          continue;
        }
        const key = `${row.index}|${w}`;
        const list = cohorts.get(key) ?? [];
        list.push({ row, week: w, fwd: ratio - 1 });
        cohorts.set(key, list);
      }
    }

    const obs: Obs[] = [];
    const ic: number[] = [];
    const subIc = Object.fromEntries(SUB_SCORES.map((k) => [k, [] as number[]])) as Record<(typeof SUB_SCORES)[number], number[]>;
    for (const list of cohorts.values()) {
      if (list.length < MIN_COHORT) continue;
      const avg = mean(list.map((x) => x.fwd))!;
      const withExcess = list.map((x) => {
        const fv = x.row.fairValue;
        const gap = fv !== null && fv > 0 ? fv - x.row.price : null;
        return {
          ...x,
          excess: x.fwd - avg,
          gapClosed: gap !== null && gap > 0 ? (x.row.price * x.fwd) / gap : null,
        };
      });
      obs.push(...withExcess);
      const c = spearman(withExcess.map((x) => x.row.score), withExcess.map((x) => x.excess));
      if (c !== null) ic.push(c);
      for (const k of SUB_SCORES) {
        const has = withExcess.filter((x) => x.row[k] !== null);
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
        cohorts: new Set(xs.map((o) => `${o.row.index}|${o.week}`)).size,
        meanExcess: mean(ex),
        medianExcess: median(ex),
        hitRate: ex.length ? ex.filter((e) => e > 0).length / ex.length : null,
      };
    });

    // Red flags: compare flagged names with unflagged names of the same verdict,
    // so a flag is not blamed for the verdict it caused.
    const flagNames = new Set(obs.flatMap((o) => (o.row.caps ? o.row.caps.split(",") : [])));
    const flags = [...flagNames].sort().map((flag): FlagStat => {
      const flagged = obs.filter((o) => o.row.caps?.split(",").includes(flag));
      const diffs: number[] = [];
      let n = 0;
      for (const v of VERDICTS) {
        const f = flagged.filter((o) => o.row.verdict === v).map((o) => o.excess);
        const u = obs.filter((o) => o.row.verdict === v && !o.row.caps?.split(",").includes(flag)).map((o) => o.excess);
        if (f.length && u.length) {
          diffs.push(...f.map((x) => x - mean(u)!));
          n += f.length;
        }
      }
      return { flag, n, difference: mean(diffs) };
    });

    const gaps = obs
      .filter((o) => (o.row.verdict === "STRONG_BUY" || o.row.verdict === "BUY") && o.gapClosed !== null)
      .map((o) => o.gapClosed!);

    horizons.push({
      weeks: h,
      observations: obs.length,
      byVerdict,
      scoreIc: { mean: mean(ic), cohorts: ic.length },
      subScoreIc: Object.fromEntries(
        SUB_SCORES.map((k) => [k, { mean: mean(subIc[k]), cohorts: subIc[k].length }]),
      ) as HorizonResult["subScoreIc"],
      flags,
      fairValue: { n: gaps.length, medianGapClosed: median(gaps) },
    });
  }

  // Hits and misses at the longest horizon with enough data, one entry per company.
  const caseHorizon = [...HORIZONS].reverse().find((h) => (obsByHorizon.get(h)?.length ?? 0) >= 50);
  let cases: Scorecard["cases"] = null;
  if (caseHorizon) {
    const toCase = (o: Obs): CaseRow => ({
      ticker: o.row.ticker,
      index: o.row.index,
      date: o.row.at.slice(0, 10),
      verdict: o.row.verdict,
      score: o.row.score,
      caps: o.row.caps,
      excess: o.excess,
    });
    const firstPerTicker = (xs: Obs[]) => {
      const seen = new Map<string, Obs>();
      for (const o of [...xs].sort((a, b) => a.week - b.week)) if (!seen.has(o.row.ticker)) seen.set(o.row.ticker, o);
      return [...seen.values()];
    };
    const all = obsByHorizon.get(caseHorizon)!;
    const bought = firstPerTicker(all.filter((o) => o.row.verdict === "STRONG_BUY" || o.row.verdict === "BUY"));
    const shunned = firstPerTicker(all.filter((o) => o.row.verdict === "HOLD" || o.row.verdict === "AVOID"));
    const byExcess = (a: Obs, b: Obs) => b.excess - a.excess;
    // With few names the two lists would repeat each other, so split them.
    const ranked = [...bought].sort(byExcess);
    const top = Math.min(CASES, Math.ceil(ranked.length / 2));
    cases = {
      weeks: caseHorizon,
      best: ranked.slice(0, top).map(toCase),
      worst: ranked.slice(top).reverse().slice(0, CASES).map(toCase),
      missed: [...shunned].sort(byExcess).slice(0, CASES).map(toCase),
    };
  }

  return {
    ratingsFrom: dates[0] ?? null,
    ratingsTo: dates.at(-1) ?? null,
    ratings: rows.length,
    badPrices,
    horizons,
    cases,
  };
}
