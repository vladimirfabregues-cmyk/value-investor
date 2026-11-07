/**
 * Small statistics shared by the scorecard and the monthly report.
 *
 * Evidence is judged on weekly series (one value per week), so consistency is
 * measured across independent weeks rather than across overlapping ratings.
 */

export interface SeriesPoint {
  /** ISO date the value belongs to (start of the week, or month). */
  date: string;
  value: number;
  n?: number;
}

export interface Summary {
  n: number;
  mean: number | null;
  /** mean ÷ standard error: how consistently the value sits away from zero. */
  t: number | null;
  positiveShare: number | null;
}

export function summarize(values: number[]): Summary {
  const n = values.length;
  if (n === 0) return { n, mean: null, t: null, positiveShare: null };
  const mean = values.reduce((s, x) => s + x, 0) / n;
  const positiveShare = values.filter((x) => x > 0).length / n;
  if (n < 2) return { n, mean, t: null, positiveShare };
  const sd = Math.sqrt(values.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1));
  return { n, mean, t: sd > 0 ? mean / (sd / Math.sqrt(n)) : null, positiveShare };
}

/** Weeks of data before anything is read as evidence, and before a rule may change. */
export const MIN_WEEKS = 12;
export const DECISION_WEEKS = 26;
const STRONG_T = 2.5;
const SUGGESTIVE_T = 1.5;

export type Strength = "too early" | "no clear signal" | "suggestive" | "strong";

export function strength(s: Summary, minN = MIN_WEEKS): Strength {
  if (s.n < minN || s.t === null) return "too early";
  const t = Math.abs(s.t);
  if (t >= STRONG_T && s.n >= DECISION_WEEKS) return "strong";
  if (t >= SUGGESTIVE_T) return "suggestive";
  return "no clear signal";
}

export type ClaimStatus = "too early" | "inconclusive" | "leaning yes" | "leaning no" | "established" | "rejected";

/**
 * Grade a claim that `mean > threshold`. Established/rejected need the full
 * decision bar (DECISION_WEEKS of data, consistently one side of zero).
 */
export function claimStatus(s: Summary, threshold = 0, minN = MIN_WEEKS): ClaimStatus {
  if (s.n < minN || s.mean === null || s.t === null) return "too early";
  const decisive = s.n >= DECISION_WEEKS && Math.abs(s.t) >= STRONG_T;
  if (s.t > 0 && decisive && s.mean >= threshold) return "established";
  if (s.t < 0 && decisive) return "rejected";
  if (s.t >= SUGGESTIVE_T) return "leaning yes";
  if (s.t <= -SUGGESTIVE_T) return "leaning no";
  return "inconclusive";
}

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ── Uncertainty ─────────────────────────────────────────────────────────────

/** Two-sided 95% Student-t critical values, df 1–30; 1.96 beyond. */
const T95 = [12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.16, 2.145, 2.131, 2.12, 2.11, 2.101, 2.093, 2.086, 2.08, 2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042];
export const t95 = (df: number) => (df < 1 ? Infinity : df <= 30 ? T95[Math.floor(df) - 1] : 1.96);

export interface Interval {
  mean: number;
  low: number;
  high: number;
  /** Independent observations the range is based on. */
  n: number;
}

/**
 * 95% range for the mean of a series. `overlap` > 1 when consecutive values
 * share data (h-week returns started every week overlap by h−1 weeks), which
 * leaves only about n ÷ overlap independent observations.
 */
export function interval(values: number[], overlap = 1): Interval | null {
  const n = values.length;
  if (n < 3) return null;
  const mean = values.reduce((s, x) => s + x, 0) / n;
  const sd = Math.sqrt(values.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1));
  const eff = Math.max(2, n / Math.max(1, overlap));
  const half = t95(eff - 1) * (sd / Math.sqrt(eff));
  return { mean, low: mean - half, high: mean + half, n: Math.round(eff) };
}

/** The same range scaled (e.g. weekly → yearly ×52). */
export const scaleInterval = (i: Interval | null, k: number): Interval | null =>
  i && { ...i, mean: i.mean * k, low: i.low * k, high: i.high * k };

// ── Risk ────────────────────────────────────────────────────────────────────

/** Cash return assumed for Sharpe and Sortino (roughly UK Bank Rate, late 2026). */
export const CASH_RATE = 0.04;
const sd = (xs: number[]) => {
  const m = xs.reduce((s, x) => s + x, 0) / xs.length;
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
};

export interface RiskStats {
  weeks: number;
  /** Annualised standard deviation of weekly returns. */
  volatility: number | null;
  /** Annualised standard deviation of weekly returns minus the benchmark's. */
  trackingError: number | null;
  beta: number | null;
  /** Annualised excess over cash ÷ volatility; null before DECISION_WEEKS. */
  sharpe: number | null;
  /** Same, using only downside volatility; null before DECISION_WEEKS. */
  sortino: number | null;
}

/** Risk of a weekly return series against a benchmark series of the same weeks. */
export function riskStats(book: number[], bench: number[]): RiskStats {
  const n = Math.min(book.length, bench.length);
  const b = book.slice(0, n);
  const m = bench.slice(0, n);
  if (n < 3) return { weeks: n, volatility: null, trackingError: null, beta: null, sharpe: null, sortino: null };
  const vol = sd(b) * Math.sqrt(52);
  const te = sd(b.map((x, i) => x - m[i])) * Math.sqrt(52);
  const mb = b.reduce((s, x) => s + x, 0) / n;
  const mm = m.reduce((s, x) => s + x, 0) / n;
  const cov = b.reduce((s, x, i) => s + (x - mb) * (m[i] - mm), 0) / (n - 1);
  const varM = m.reduce((s, x) => s + (x - mm) ** 2, 0) / (n - 1);
  let sharpe: number | null = null;
  let sortino: number | null = null;
  if (n >= DECISION_WEEKS) {
    const cashWeek = CASH_RATE / 52;
    const excess = (mb - cashWeek) * 52;
    sharpe = vol > 0 ? excess / vol : null;
    const down = Math.sqrt(b.reduce((s, x) => s + Math.min(0, x - cashWeek) ** 2, 0) / n) * Math.sqrt(52);
    sortino = down > 0 ? excess / down : null;
  }
  return { weeks: n, volatility: vol, trackingError: te, beta: varM > 0 ? cov / varM : null, sharpe, sortino };
}
