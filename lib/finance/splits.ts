/**
 * Yahoo's `defaultKeyStatistics.lastSplitFactor` / `lastSplitDate` → a split
 * event. The factor reads "new:old" ("2:1" forward, "1:4" reverse); the date
 * arrives as epoch seconds, a Date or a string depending on validation.
 */

export interface LastSplit {
  /** Noon UTC on the split date: between Asian and US opens, a fair guess for any market. */
  at: string;
  /** New shares per old share (1:4 reverse split → 0.25). */
  ratio: number;
}

export function parseLastSplit(factor: unknown, date: unknown): LastSplit | null {
  if (typeof factor !== "string") return null;
  const m = factor.match(/^\s*(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)\s*$/);
  if (!m) return null;
  const ratio = Number(m[1]) / Number(m[2]);
  if (!(ratio > 0) || ratio === 1 || !Number.isFinite(ratio)) return null;
  let ms: number;
  if (typeof date === "number") ms = date > 1e12 ? date : date * 1000;
  else if (date instanceof Date) ms = date.getTime();
  else if (typeof date === "string") ms = Date.parse(date);
  else return null;
  if (!Number.isFinite(ms)) return null;
  return { at: `${new Date(ms).toISOString().slice(0, 10)}T12:00:00.000Z`, ratio };
}
