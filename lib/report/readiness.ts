/**
 * The investor's question — "is this ready for real money?" — answered from
 * the month's figures, against a test written down before the answer was
 * known.
 *
 * MAIN_BOOK and READINESS_TEST were fixed on READINESS_STATED_ON. Judging
 * whichever book happens to lead each month would be luck dressed up as
 * evidence (with eight rulebooks one usually beats the benchmark by chance),
 * so the dashboard follows one pre-chosen book and the others are
 * alternatives. Never edit a condition after the fact — add a new one, dated.
 */

import type { Concentration } from "@/lib/portfolio/analytics";
import type { OutcomeCounts } from "@/lib/scorecard/compute";
import { DECISION_WEEKS, MIN_WEEKS, strength, summarize, type Interval, type RiskStats, type Strength } from "@/lib/stats";

export const READINESS_STATED_ON = "2026-11-13";

/** The strategy the readiness test judges, chosen on READINESS_STATED_ON. */
export const MAIN_BOOK = "LAB_TOP20";

/**
 * Bid-ask spread assumed on each trade, as a share of its value. Not modelled
 * by the engine (it trades at closing prices), so the test charges it here:
 * 0.3% is a cautious figure for the small and mid caps the books hold.
 */
export const SPREAD_PER_TRADE = 0.003;

export const READY = {
  weeks: 52,
  effectiveNames: 15,
  maxSector: 0.3,
} as const;

/** Prospective figures for one book, since the lab rules were fixed. */
export interface LiveStats {
  weeks: number;
  /** Book minus benchmark since the rules were fixed (compounded returns). */
  vsBenchmark: number | null;
  /** 95% range for that gap, from the weekly gaps. */
  vsBenchmarkRange: Interval | null;
  /** The weekly book-minus-benchmark gaps behind the range. */
  weeklyGaps: number[];
  maxDrawdownPct: number | null;
  risk: RiskStats | null;
  /** Modelled costs since the rules were fixed, share of the book's value then. */
  costsPct: number;
  /** Estimated bid-ask spreads on the same trades (SPREAD_PER_TRADE each). */
  spreadPct: number;
}

export type Tone = "good" | "neutral" | "caution" | "bad";

export interface DashboardRow {
  question: string;
  answer: string;
  detail: string;
  tone: Tone;
}

export interface ReadinessCondition {
  text: string;
  met: boolean;
  /** Where it stands now, in words. */
  current: string;
}

export interface Readiness {
  statedOn: string;
  mainBook: string;
  conditions: ReadinessCondition[];
  dashboard: DashboardRow[];
}

export interface ReadinessInputs {
  mainName: string;
  mainSinceFixed: number | null;
  benchSinceFixed: number | null;
  main: LiveStats | null;
  bench: LiveStats | null;
  concentration: Concentration | null;
  /** Other rulebooks' gap to the benchmark since the rules were fixed. */
  others: number[];
  outcomes: OutcomeCounts | null;
  badPrices: number | null;
  runWeeks: number;
  fullRunWeeks: number;
  fixedLabel: string;
}

const pct = (x: number | null | undefined, d = 1) => (x === null || x === undefined ? "—" : `${x >= 0 ? "+" : "−"}${(Math.abs(x) * 100).toFixed(d)}%`);
const pts = (x: number | null | undefined, d = 1) => (x === null || x === undefined ? "—" : `${x >= 0 ? "+" : "−"}${(Math.abs(x) * 100).toFixed(d)} pts`);
const pct0 = (x: number) => `${Math.round(x * 100)}%`;
const weeksText = (n: number) => `${n} week${n === 1 ? "" : "s"}`;
export const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const REGION: Record<string, string> = { US: "US", UK: "UK", EU: "Europe", JP: "Japan" };

/** "−6.0 to +8.8 pts" around the compounded gap (the weekly range's half-widths). */
export function gapRange(live: LiveStats | null): { low: number; high: number } | null {
  const r = live?.vsBenchmarkRange;
  if (!r || live?.vsBenchmark === null || live?.vsBenchmark === undefined) return null;
  return { low: live.vsBenchmark - (r.mean - r.low), high: live.vsBenchmark + (r.high - r.mean) };
}

const CONFIDENCE: Record<Strength, string> = { "too early": "Low", "no clear signal": "Low", suggestive: "Moderate", strong: "High" };

export function assessReadiness(inp: ReadinessInputs): Readiness {
  const m = inp.main;
  const weeks = m?.weeks ?? 0;
  const afterSpreads = m?.vsBenchmark !== null && m?.vsBenchmark !== undefined ? m.vsBenchmark - m.spreadPct : null;
  const range = gapRange(m);
  const c = inp.concentration;

  const conditions: ReadinessCondition[] = [
    {
      text: `At least 12 months of results since the rules were fixed (${inp.fixedLabel}).`,
      met: weeks >= READY.weeks,
      current: `${weeksText(weeks)} of ${READY.weeks}`,
    },
    {
      text: "The main strategy beats the benchmark after modelled costs and estimated bid-ask spreads.",
      met: afterSpreads !== null && afterSpreads > 0,
      current: afterSpreads === null ? "no result yet" : `${pts(m!.vsBenchmark)} less ${pts(m!.spreadPct)} spreads = ${pts(afterSpreads)}`,
    },
    {
      text: "The 95% range for that lead, after spreads, lies wholly above zero.",
      met: range !== null && range.low - m!.spreadPct > 0,
      current: range ? `${pts(range.low - m!.spreadPct)} to ${pts(range.high - m!.spreadPct)}` : "needs at least 3 weeks",
    },
    {
      text: "Its worst fall since the rules were fixed is no deeper than the benchmark's.",
      met: m?.maxDrawdownPct != null && inp.bench?.maxDrawdownPct != null && m.maxDrawdownPct <= inp.bench.maxDrawdownPct,
      current: m?.maxDrawdownPct != null ? `${pct(-m.maxDrawdownPct)} vs ${pct(-(inp.bench?.maxDrawdownPct ?? 0))}` : "no result yet",
    },
    {
      text: `At least ${READY.effectiveNames} effective positions.`,
      met: (c?.effectiveNames ?? 0) >= READY.effectiveNames,
      current: c?.effectiveNames != null ? c.effectiveNames.toFixed(1) : "—",
    },
    {
      text: `No sector above ${pct0(READY.maxSector)} of the book.`,
      met: c?.topSectorWeight != null && c.topSectorWeight <= READY.maxSector,
      current: c?.topSector ? `${c.topSector} ${pct0(c.topSectorWeight ?? 0)}` : "—",
    },
  ];
  const metCount = conditions.filter((x) => x.met).length;

  const gaps = summarize(m?.weeklyGaps ?? []);
  const evidence = strength(gaps);
  const decided = weeks >= DECISION_WEEKS && conditions[1].met && conditions[2].met;

  const edge: DashboardRow = {
    question: "Is there a demonstrated edge, measured only since the rules were fixed?",
    answer: decided ? "Yes" : weeks < MIN_WEEKS ? "Not yet — too early" : "Not yet",
    detail: decided
      ? `The main strategy leads the benchmark after costs and spreads, and the 95% range excludes zero.`
      : weeks < MIN_WEEKS
        ? `${weeksText(weeks)} of results; nothing counts as evidence before ${MIN_WEEKS}.`
        : `The lead${afterSpreads === null ? "" : ` (${pts(afterSpreads)} after spreads)`} is not yet clear of chance.`,
    tone: decided ? "good" : "caution",
  };

  const history: DashboardRow = {
    question: "How much prospective history is there?",
    answer: weeksText(weeks),
    detail: `Since ${inp.fixedLabel}. Earlier results are a back-test, chosen after seeing them, and are not evidence. The test needs ${READY.weeks} weeks; a claim needs ${DECISION_WEEKS}.`,
    tone: weeks >= READY.weeks ? "good" : "neutral",
  };

  const ahead = inp.others.filter((x) => x > 0).length;
  const result: DashboardRow = {
    question: `How has the main strategy (${inp.mainName}) done?`,
    answer: inp.mainSinceFixed === null ? "No result yet" : `${pct(inp.mainSinceFixed)} vs benchmark ${pct(inp.benchSinceFixed)}`,
    detail:
      m?.vsBenchmark == null
        ? "Chosen in advance; the other rulebooks are alternatives, not candidates to cherry-pick."
        : `${pts(m.vsBenchmark)} against the benchmark${range ? ` (95% range ${pts(range.low)} to ${pts(range.high)})` : ""}. Chosen in advance; ${ahead} of ${inp.others.length} alternative rulebooks are ahead of the benchmark, which by itself proves nothing.`,
    tone: m?.vsBenchmark == null ? "neutral" : m.vsBenchmark > 0 ? "neutral" : "caution",
  };

  const topRegion = c ? Object.entries(c.regions).sort((a, b) => b[1] - a[1])[0] : undefined;
  const riskBits = [
    topRegion ? `${REGION[topRegion[0]] ?? topRegion[0]} ${pct0(topRegion[1])} of the book` : null,
    c?.topSector ? `largest sector ${c.topSector} ${pct0(c.topSectorWeight ?? 0)}` : null,
    c?.effectiveNames != null ? `${c.effectiveNames.toFixed(1)} effective positions` : null,
  ].filter(Boolean);
  const vol = m?.risk?.volatility;
  const benchVol = inp.bench?.risk?.volatility;
  const risk: DashboardRow = {
    question: "What is the main risk?",
    answer: riskBits[0] ? String(riskBits[0]).replace(/^./, (x) => x.toUpperCase()) : "Not measured yet",
    detail: [
      ...riskBits.slice(1),
      vol != null ? `volatility ${pct0(vol)} a year vs benchmark ${benchVol != null ? pct0(benchVol) : "—"}` : null,
      m?.maxDrawdownPct != null ? `worst fall ${pct(-m.maxDrawdownPct)} vs ${pct(-(inp.bench?.maxDrawdownPct ?? 0))}` : null,
    ]
      .filter(Boolean)
      .join("; ")
      .replace(/^./, (x) => x.toUpperCase()) + ".",
    tone: topRegion && topRegion[1] > 0.5 ? "caution" : "neutral",
  };

  const implementation: DashboardRow = {
    question: "How far can the simulation be trusted as a real-money result?",
    answer: "Low to moderate",
    detail: `Trades are simulated at weekly closing prices. Commission, FX and stamp duty are modelled (${pts(-(m?.costsPct ?? 0))} so far); bid-ask spreads are estimated at ${(SPREAD_PER_TRADE * 100).toFixed(1)}% a trade (${pts(-(m?.spreadPct ?? 0))}), not measured.`,
    tone: "caution",
  };

  const statistical: DashboardRow = {
    question: "How confident are the statistics?",
    answer: CONFIDENCE[evidence],
    detail:
      evidence === "too early"
        ? `${weeksText(gaps.n)} of weekly results; ranges stay wide until about ${DECISION_WEEKS}.`
        : `${weeksText(gaps.n)}; the weekly lead over the benchmark is ${evidence === "no clear signal" ? "not distinguishable from chance" : evidence === "suggestive" ? "suggestive but not decisive" : "consistent"}.`,
    tone: evidence === "strong" ? "good" : evidence === "suggestive" ? "neutral" : "caution",
  };

  const o = inp.outcomes;
  const resolved = o ? o.snapshot + o.gap + o.trading + o.takeover + o.failure : 0;
  const missingShare = o && resolved + o.missing > 0 ? o.missing / (resolved + o.missing) : null;
  const allFull = inp.runWeeks > 0 && inp.fullRunWeeks === inp.runWeeks;
  const dataLevel = missingShare === null ? "Unknown" : missingShare <= 0.01 && allFull ? "Good" : missingShare <= 0.05 ? "Fair, improving" : "Weak";
  const data: DashboardRow = {
    question: "How reliable is the data?",
    answer: dataLevel,
    detail: [
      o ? `${o.missing.toLocaleString("en-GB")} of ${(resolved + o.missing).toLocaleString("en-GB")} four-week rating outcomes unresolved (${((missingShare ?? 0) * 100).toFixed(1)}%)` : null,
      inp.badPrices !== null ? `${inp.badPrices} price pair(s) excluded as errors` : null,
      inp.runWeeks ? `${inp.fullRunWeeks} of ${inp.runWeeks} week(s) fully screened this month` : "no screener runs this month yet",
    ]
      .filter(Boolean)
      .join("; ") + ".",
    tone: dataLevel === "Good" ? "good" : dataLevel === "Weak" ? "bad" : "neutral",
  };

  const ready = metCount === conditions.length;
  const status: DashboardRow = {
    question: "Recommended status",
    answer: ready ? "Ready for a small real-money trial" : weeks < READY.weeks ? "Research and observation — not a validated strategy" : "Not ready",
    detail: `${metCount} of ${conditions.length} readiness conditions met (written down on ${longDate(READINESS_STATED_ON)}, before the answer was known).`,
    tone: ready ? "good" : "caution",
  };

  return { statedOn: READINESS_STATED_ON, mainBook: MAIN_BOOK, conditions, dashboard: [edge, history, result, risk, implementation, statistical, data, status] };
}
