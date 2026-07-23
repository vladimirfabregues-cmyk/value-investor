/**
 * Geometry for the trend sparklines (§8).
 *
 * Pure and unit-tested: given a series and a viewBox size, it returns the
 * coordinates to plot. The y-domain always includes zero, which is the whole
 * point — a trend axis that starts at the data's minimum instead of zero
 * exaggerates small changes into dramatic swings (the "misleading truncated
 * axis" the brief forbids).
 */

export interface TrendPoint {
  /** Position in the original series (so labels line up with gaps) */
  index: number;
  x: number;
  y: number;
  value: number;
}

export interface TrendGeometry {
  /** All plotted points (nulls dropped) */
  points: TrendPoint[];
  /** Contiguous runs of non-null points, so gaps break the line rather than bridging it */
  runs: TrendPoint[][];
  /** y of the zero line within the viewBox */
  zeroY: number;
  min: number;
  max: number;
  width: number;
  height: number;
}

export interface TrendGeometryOptions {
  width?: number;
  height?: number;
  padX?: number;
  padY?: number;
}

/**
 * @returns geometry, or `null` when the series has no finite value to plot
 *   (the caller renders an empty state rather than an axis of zeros).
 */
export function buildTrendGeometry(
  values: Array<number | null>,
  { width = 100, height = 40, padX = 2, padY = 5 }: TrendGeometryOptions = {},
): TrendGeometry | null {
  const finite = values.map((v) => (v !== null && Number.isFinite(v) ? v : null));
  const nums = finite.filter((v): v is number => v !== null);
  if (nums.length === 0) return null;

  // Always anchor the domain at zero so the baseline is meaningful.
  let min = Math.min(0, ...nums);
  let max = Math.max(0, ...nums);
  if (min === max) max = min + 1; // all-zero series: avoid divide-by-zero

  const n = finite.length;
  const innerW = width - 2 * padX;
  const innerH = height - 2 * padY;
  const xFor = (i: number) => (n === 1 ? width / 2 : padX + (i / (n - 1)) * innerW);
  const yFor = (v: number) => padY + (1 - (v - min) / (max - min)) * innerH;

  const plotted = finite
    .map((v, index) => (v === null ? null : { index, x: xFor(index), y: yFor(v), value: v }))
    .filter((p): p is TrendPoint => p !== null);

  const runs: TrendPoint[][] = [];
  let current: TrendPoint[] = [];
  let prevIndex = -2;
  for (const p of plotted) {
    if (p.index === prevIndex + 1) current.push(p);
    else {
      if (current.length) runs.push(current);
      current = [p];
    }
    prevIndex = p.index;
  }
  if (current.length) runs.push(current);

  return { points: plotted, runs, zeroY: yFor(0), min, max, width, height };
}

/** SVG polyline `points` attribute for a run, e.g. "2,30 25,18 …". */
export function polylinePoints(run: TrendPoint[]): string {
  return run.map((p) => `${round(p.x)},${round(p.y)}`).join(" ");
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Signed change from the first to the last plotted value, in percent, or null. */
export function trendChangePct(values: Array<number | null>): number | null {
  const nums = values.filter((v): v is number => v !== null && Number.isFinite(v));
  if (nums.length < 2) return null;
  const first = nums[0];
  const last = nums[nums.length - 1];
  if (first === 0) return null;
  return ((last - first) / Math.abs(first)) * 100;
}
