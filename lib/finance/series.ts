/**
 * Builds the persisted 5-year series for the trend charts (§8) from the
 * provider's in-memory history.
 *
 * Pure and I/O-free so the labelling logic can be tested directly. The history
 * arrays are already oldest-first and padded to a fixed length by the provider;
 * this attaches fiscal-year labels and drops the series entirely when there is
 * nothing worth plotting, so the UI shows an honest empty state rather than a
 * flat line of zeros.
 */

import type { FinancialHistory5Y } from "@/types/finance";
import type { AnalysisSeries } from "@/types/analysis";

/** Year of the latest fiscal period, from the statement date or the analysis date. */
function latestFiscalYear(latestPeriodIso: string | undefined, fallbackIso: string): number {
  const fromPeriod = latestPeriodIso ? new Date(latestPeriodIso) : null;
  if (fromPeriod && !Number.isNaN(fromPeriod.getTime())) return fromPeriod.getFullYear();
  const fromFallback = new Date(fallbackIso);
  return Number.isNaN(fromFallback.getTime()) ? new Date().getFullYear() : fromFallback.getFullYear();
}

/** True when an array has at least one finite, non-null value worth plotting. */
function hasData(values: Array<number | null> | undefined): boolean {
  return Array.isArray(values) && values.some((v) => v !== null && Number.isFinite(v));
}

/** Normalise to a plain (number | null)[] of the given length, right-aligned. */
function align(values: Array<number | null> | undefined, length: number): (number | null)[] {
  const source = Array.isArray(values) ? values : [];
  const trimmed = source.slice(-length).map((v) => (v !== null && Number.isFinite(v) ? v : null));
  const pad = Math.max(0, length - trimmed.length);
  return [...Array<null>(pad).fill(null), ...trimmed];
}

/**
 * @returns the series, or `undefined` when not one of the five metrics has any
 *   data — nothing to chart, so nothing is persisted.
 */
export function deriveSeries(
  history: FinancialHistory5Y,
  latestPeriodIso: string | undefined,
  analysisDateIso: string,
): AnalysisSeries | undefined {
  const metrics = [
    history.revenue,
    history.diluted_eps,
    history.free_cash_flow,
    history.operating_margin_pct,
    history.roic_pct,
  ];
  if (!metrics.some(hasData)) return undefined;

  // Length is driven by the longest metric so no real data point is dropped.
  const length = Math.max(1, ...metrics.map((m) => (Array.isArray(m) ? m.length : 0)));
  const latestYear = latestFiscalYear(latestPeriodIso, analysisDateIso);
  const period_labels = Array.from({ length }, (_, i) => String(latestYear - (length - 1 - i)));

  return {
    period_labels,
    revenue: align(history.revenue, length),
    diluted_eps: align(history.diluted_eps, length),
    free_cash_flow: align(history.free_cash_flow, length),
    operating_margin_pct: align(history.operating_margin_pct, length),
    roic_pct: align(history.roic_pct, length),
  };
}
