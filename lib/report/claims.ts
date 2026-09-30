/**
 * The claims the Casebook rests on, written down on CLAIMS_STATED_ON before
 * the evidence arrived, and graded every month. Ratings claims use every
 * rating the (unchanged) model has made; lab claims use only weeks after the
 * lab rules were fixed. Never reword a claim after the fact — add a new one.
 */

import { LAB_RULES } from "@/lib/portfolio/lab";
import type { PortfolioMetrics } from "@/lib/portfolio/metrics";
import type { ValuationPoint } from "@/lib/portfolio/types";
import type { Scorecard } from "@/lib/scorecard/compute";
import { weekOf } from "@/lib/scorecard/compute";
import { claimStatus, strength, summarize, type ClaimStatus, type SeriesPoint, type Strength, type Summary } from "@/lib/stats";

export const CLAIMS_STATED_ON = "2026-09-30";

export interface ClaimResult {
  id: number;
  text: string;
  status: ClaimStatus;
  strength: Strength;
  /** The number behind the status, in words. */
  metric: string;
  n: number;
  /** What the evidence is measured on. */
  basis: string;
}

export interface EtfForward {
  groupId: string;
  month: string;
  top: string;
  topReturn: number;
  peersReturn: number;
}

export interface ClaimInputs {
  scorecard: Scorecard | null;
  books: Map<string, { valuations: ValuationPoint[]; metrics: PortfolioMetrics }>;
  etfForward: EtfForward[];
}

const pts = (x: number | null | undefined, d = 1) => (x === null || x === undefined ? "—" : `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(d)} pts`);

/** One return per week (last value of each week), from `from` onwards. */
export function weeklyReturns(valuations: ValuationPoint[], from: string): Map<number, number> {
  const lastPerWeek = new Map<number, number>();
  for (const v of valuations) if (v.date >= from) lastPerWeek.set(weekOf(`${v.date}T12:00:00Z`), v.totalGbp);
  const weeks = [...lastPerWeek.keys()].sort((a, b) => a - b);
  const out = new Map<number, number>();
  for (let i = 1; i < weeks.length; i++) out.set(weeks[i], lastPerWeek.get(weeks[i])! / lastPerWeek.get(weeks[i - 1])! - 1);
  return out;
}

/** Weekly return of book A minus book B since the lab rules were fixed. */
function bookGap(inp: ClaimInputs, a: string, b: string): number[] {
  const ra = inp.books.get(a);
  const rb = inp.books.get(b);
  if (!ra || !rb) return [];
  const wa = weeklyReturns(ra.valuations, LAB_RULES.fixedOn);
  const wb = weeklyReturns(rb.valuations, LAB_RULES.fixedOn);
  return [...wa].filter(([w]) => wb.has(w)).map(([w, r]) => r - wb.get(w)!);
}

const values = (s: SeriesPoint[] | undefined) => (s ?? []).map((p) => p.value);
const annual = (s: Summary) => (s.mean === null ? null : s.mean * 52);

function result(
  id: number,
  text: string,
  s: Summary,
  status: ClaimStatus,
  metric: string,
  basis: string,
): ClaimResult {
  return { id, text, status, strength: strength(s), metric, n: s.n, basis };
}

export function evaluateClaims(inp: ClaimInputs): ClaimResult[] {
  const w = inp.scorecard?.weekly;
  const out: ClaimResult[] = [];

  const spread = summarize(values(w?.spread));
  out.push(result(1, "Buy-rated companies beat Avoid-rated ones in the same market by at least 2 points a year.",
    spread, claimStatus(spread, 0.02 / 52), `${pts(annual(spread))} a year`, "weekly Buy-minus-Avoid gap, all ratings"));

  const ic = summarize(values(w?.ic));
  out.push(result(2, "A higher overall score leads to a better relative return.",
    ic, claimStatus(ic), ic.mean === null ? "—" : `rank correlation ${ic.mean >= 0 ? "+" : "−"}${Math.abs(ic.mean).toFixed(3)} a week`,
    "weekly score-vs-return rank correlation"));

  const capped = summarize(bookGap(inp, "LAB_TOP20", "REBALANCED"));
  const dd = (k: string) => inp.books.get(k)?.metrics.maxDrawdownPct;
  out.push(result(3, "Capped, diversified books beat the uncapped Strong Buy rule once risk is counted.",
    capped, claimStatus(capped),
    `${pts(annual(capped))} a year; worst fall ${pts(-(dd("LAB_TOP20") ?? 0))} vs ${pts(-(dd("REBALANCED") ?? 0))}`,
    "Top 20 capped minus Strong Buy only, weekly, since the rules were fixed"));

  const monthly = bookGap(inp, "LAB_MONTHLY", "LAB_TOP20");
  const sticky = bookGap(inp, "LAB_STICKY", "LAB_TOP20");
  const slow = summarize(monthly.map((x, i) => (sticky[i] !== undefined ? (x + sticky[i]) / 2 : x)));
  out.push(result(4, "Slower trading (monthly, or selling only on a downgrade) beats weekly trading after costs.",
    slow, claimStatus(slow), `${pts(annual(slow))} a year`, "average of monthly and slow-selling minus weekly Top 20, since the rules were fixed"));

  // Claim 5 holds when flagged names do worse, so it is graded on the negated gap.
  const byDate = new Map<string, number[]>();
  for (const series of Object.values(w?.flags ?? {})) for (const p of series) byDate.set(p.date, [...(byDate.get(p.date) ?? []), p.value]);
  const flagWeeks = [...byDate.values()].map((xs) => -(xs.reduce((s, x) => s + x, 0) / xs.length));
  const flags = summarize(flagWeeks);
  const perFlag = Object.values(w?.flags ?? {}).map((s) => summarize(values(s)));
  const warning = perFlag.filter((s) => s.mean !== null && s.mean < 0).length;
  out.push(result(5, "The red flags warn of weaker results.",
    flags, claimStatus(flags), `${warning} of ${perFlag.length} flags point the right way; flagged names ${pts(flags.mean === null ? null : -flags.mean * 52)} a year vs unflagged`,
    "weekly flagged-minus-unflagged gap, same rating"));

  const qv = summarize(values(w?.qualityValue));
  out.push(result(6, "Cheap and high-quality beats cheap alone.",
    qv, claimStatus(qv), `${pts(annual(qv))} a year`, "cheapest third: high minus low quality, weekly (sub-scores from 5 Oct 2026)"));

  // Claim 7 says stock picking is NOT what drives Japan: it is contradicted by a
  // consistently positive selection effect.
  const jp = inp.books.get("LAB_JP")?.metrics.analytics?.attribution ?? [];
  const since = jp.filter((p) => p.date > LAB_RULES.fixedOn);
  const sel = summarize(since.map((p) => p.selection));
  const sum = (k: "currency" | "market" | "selection") => since.reduce((s, p) => s + p[k], 0);
  let jpStatus: ClaimStatus;
  if (sel.n < 12 || sel.t === null) jpStatus = "too early";
  else if (sel.t >= 2.5 && sel.n >= 26) jpStatus = "rejected";
  else if (sel.t >= 1.5) jpStatus = "leaning no";
  else if (sel.n >= 26 && sel.t < 1) jpStatus = "established";
  else jpStatus = "leaning yes";
  out.push(result(7, "Japan's lead comes from the yen and its market, not from stock picking.",
    sel, jpStatus, `since fixed: currency ${pts(sum("currency"))}, market ${pts(sum("market"))}, picking ${pts(sum("selection"))}`,
    "Japan book's weekly stock-picking effect, since the rules were fixed"));

  const etf = summarize(inp.etfForward.map((o) => o.topReturn - o.peersReturn));
  out.push(result(8, "The top-ranked ETF in each exposure group beats its peers after costs.",
    etf, claimStatus(etf), etf.mean === null ? "—" : `${pts(etf.mean, 2)} a month on average`, "group-months since rankings were first saved (29 Sept 2026)"));

  return out;
}

/** What each claim would justify once it meets the evidence bar. */
const ACTIONS: Record<number, { established?: string; rejected?: string }> = {
  1: { rejected: "The core rating edge is not showing: review the valuation model before relying on ratings." },
  2: { rejected: "Scores do not rank outcomes: review how the overall score is weighted." },
  3: { established: "Use position caps (Top 20, capped) as the basis for any real-money version." },
  4: { established: "Move the default trading rhythm to monthly or sell-on-downgrade.", rejected: "Keep weekly trading: slower rhythms did not pay for themselves." },
  5: { rejected: "Review the red flags: flagged companies did no worse than unflagged ones." },
  6: { established: "Give business quality more weight among cheap companies." },
  7: { rejected: "Japanese stock picking adds real value: a Japan-tilted book deserves a closer look." },
  8: { rejected: "Review the ETF scoring: top-ranked funds did not beat their peers." },
};

export function proposals(claims: ClaimResult[]): { proposed: string[]; watching: string[] } {
  const proposed: string[] = [];
  const watching: string[] = [];
  for (const c of claims) {
    const action = c.status === "established" ? ACTIONS[c.id]?.established : c.status === "rejected" ? ACTIONS[c.id]?.rejected : undefined;
    if (action) proposed.push(`Claim ${c.id}: ${action}`);
    else if (c.status === "leaning yes" || c.status === "leaning no") watching.push(`Claim ${c.id} is ${c.status} (${c.metric}); not yet at the evidence bar.`);
  }
  return { proposed, watching };
}
