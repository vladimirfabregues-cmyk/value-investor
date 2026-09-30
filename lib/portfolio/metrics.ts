/**
 * Headline performance metrics derived from a simulation result. Gross vs. net
 * is inherent: the value series already has every cost, dividend and FX effect
 * baked in, so `totalReturn` is the net figure; `dividendsGbp` and `costsGbp`
 * expose the pieces, and a gross figure is net + costs.
 */

import type { SimulationResult } from "@/lib/portfolio/types";
import type { BookAnalytics } from "@/lib/portfolio/analytics";

export interface PortfolioMetrics {
  initialGbp: number;
  currentValueGbp: number;
  /** Net total return (after all costs, dividends, FX). */
  totalReturnGbp: number;
  totalReturnPct: number;
  /** Return before costs are deducted — a "no-friction" reference. */
  grossReturnGbp: number;
  grossReturnPct: number;
  realisedGbp: number;
  unrealisedGbp: number;
  dividendsGbp: number;
  costsGbp: number;
  /** CAGR; null until at least a little time has elapsed. */
  annualisedPct: number | null;
  /** Benchmark's net total return over the same window; null if not supplied. */
  benchmarkReturnPct: number | null;
  // Optional: absent on rows built before the strategy lab existed.
  /** Largest peak-to-trough fall of the value curve, as a positive fraction. */
  maxDrawdownPct?: number;
  /** Number of buys and sells. */
  trades?: number;
  /** Gross value bought and sold, as a multiple of the starting capital. */
  turnover?: number;
  /** Return as booked minus the return had exchange rates stayed at their inception level. */
  fxEffectPct?: number | null;
  /** Return since the lab rules were fixed; null if the book started after that date. */
  sinceFixedPct?: number | null;
  /** Return split, concentration, trade outcomes; absent on the benchmark. */
  analytics?: BookAnalytics;
}

export interface MetricsOptions {
  benchmark?: SimulationResult;
  /** The same book re-run with exchange rates frozen at inception. */
  fxFrozen?: SimulationResult;
  /** ISO date the comparison rules were fixed. */
  fixedOn?: string;
}

function maxDrawdown(values: number[]): number {
  let peak = -Infinity;
  let worst = 0;
  for (const v of values) {
    peak = Math.max(peak, v);
    if (peak > 0) worst = Math.max(worst, (peak - v) / peak);
  }
  return worst;
}

function sinceDate(result: SimulationResult, date: string): number | null {
  const base = result.valuations.filter((v) => v.date <= date).at(-1);
  const last = result.valuations.at(-1);
  return base && last && base.totalGbp > 0 ? last.totalGbp / base.totalGbp - 1 : null;
}

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

function yearsBetween(from: string, to: string): number {
  return (Date.parse(to) - Date.parse(from)) / YEAR_MS;
}

export function computeMetrics(result: SimulationResult, options: MetricsOptions = {}): PortfolioMetrics {
  const { benchmark, fxFrozen, fixedOn } = options;
  const initial = result.capitalGbp;
  const last = result.valuations.at(-1);
  const current = last?.totalGbp ?? initial;

  const totalReturnGbp = current - initial;
  const holdingsCostBasis = result.holdings.reduce((s, h) => s + h.costBasisGbp, 0);
  const unrealisedGbp = (last?.holdingsGbp ?? 0) - holdingsCostBasis;

  // Gross = net with the frictional costs added back (dividends are part of the
  // real return, so they stay in).
  const grossReturnGbp = totalReturnGbp + result.costsGbp;

  const years = yearsBetween(result.inceptionDate, last?.date ?? result.inceptionDate);
  const annualisedPct = years > 0 && initial > 0 ? Math.pow(current / initial, 1 / years) - 1 : null;

  let benchmarkReturnPct: number | null = null;
  if (benchmark) {
    const b0 = benchmark.capitalGbp;
    const b1 = benchmark.valuations.at(-1)?.totalGbp ?? b0;
    benchmarkReturnPct = b0 > 0 ? (b1 - b0) / b0 : null;
  }

  const trades = result.transactions.filter((t) => t.type === "BUY" || t.type === "SELL");
  const frozenValue = fxFrozen?.valuations.at(-1)?.totalGbp;

  return {
    initialGbp: initial,
    currentValueGbp: current,
    totalReturnGbp,
    totalReturnPct: initial > 0 ? totalReturnGbp / initial : 0,
    grossReturnGbp,
    grossReturnPct: initial > 0 ? grossReturnGbp / initial : 0,
    realisedGbp: result.realisedGbp,
    unrealisedGbp,
    dividendsGbp: result.dividendsGbp,
    costsGbp: result.costsGbp,
    annualisedPct,
    benchmarkReturnPct,
    maxDrawdownPct: maxDrawdown(result.valuations.map((v) => v.totalGbp)),
    trades: trades.length,
    turnover: initial > 0 ? trades.reduce((s, t) => s + Math.abs(t.grossGbp), 0) / initial : 0,
    fxEffectPct: frozenValue !== undefined && initial > 0 ? (current - frozenValue) / initial : null,
    sinceFixedPct: fixedOn && result.inceptionDate <= fixedOn ? sinceDate(result, fixedOn) : null,
  };
}
