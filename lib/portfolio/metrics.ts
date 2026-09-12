/**
 * Headline performance metrics derived from a simulation result. Gross vs. net
 * is inherent: the value series already has every cost, dividend and FX effect
 * baked in, so `totalReturn` is the net figure; `dividendsGbp` and `costsGbp`
 * expose the pieces, and a gross figure is net + costs.
 */

import type { SimulationResult } from "@/lib/portfolio/types";

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
}

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

function yearsBetween(from: string, to: string): number {
  return (Date.parse(to) - Date.parse(from)) / YEAR_MS;
}

export function computeMetrics(result: SimulationResult, benchmark?: SimulationResult): PortfolioMetrics {
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
  };
}
