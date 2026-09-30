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
