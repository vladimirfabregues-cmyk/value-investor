/**
 * Pure composition of the three simulated books from a signal history and
 * market data. No I/O — this is what the tests exercise and what the I/O build
 * wrapper (build.ts) calls after fetching data.
 */

import { simulate, type MarketData } from "@/lib/portfolio/engine";
import { computeMetrics, type PortfolioMetrics } from "@/lib/portfolio/metrics";
import type { SignalHistory } from "@/lib/portfolio/signals";
import { BENCHMARK_TICKER, MIN_TRADE_GBP, PORTFOLIO_CAPITAL_GBP, PORTFOLIO_COSTS } from "@/lib/portfolio/config";
import type { SimulationResult, StrategyId } from "@/lib/portfolio/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const isoDay = (d: Date): string => d.toISOString().slice(0, 10);

/** Weekly marks from inception to `today` (inclusive of both ends). */
export function weeklyGrid(inception: string, today: string): string[] {
  const dates: string[] = [];
  let t = Date.parse(inception);
  const end = Date.parse(today);
  while (t <= end) {
    dates.push(isoDay(new Date(t)));
    t += 7 * DAY_MS;
  }
  if (dates[dates.length - 1] !== today) dates.push(today);
  return dates;
}

export interface ComputedPortfolios {
  results: SimulationResult[]; // BUY_HOLD, REBALANCED, BENCHMARK
  metrics: Record<StrategyId, PortfolioMetrics>;
}

export function computePortfolios(signals: SignalHistory, market: MarketData, today: string): ComputedPortfolios {
  const inception = signals.inceptionDate;
  const markDates = [...new Set([...weeklyGrid(inception, today), ...signals.rebalanceDates])].sort();
  const common = {
    capitalGbp: PORTFOLIO_CAPITAL_GBP,
    inceptionDate: inception,
    markDates,
    market,
    costs: PORTFOLIO_COSTS,
    minTradeGbp: MIN_TRADE_GBP,
  };

  const buyHold = simulate({
    ...common,
    strategy: "BUY_HOLD",
    rebalanceDates: [inception],
    strongBuysByDate: new Map([[inception, signals.strongBuysByDate.get(inception) ?? []]]),
  });

  const rebalanced = simulate({
    ...common,
    strategy: "REBALANCED",
    rebalanceDates: signals.rebalanceDates,
    strongBuysByDate: signals.strongBuysByDate,
  });

  const benchmark = simulate({
    ...common,
    strategy: "BENCHMARK",
    rebalanceDates: [inception],
    strongBuysByDate: new Map([[inception, [BENCHMARK_TICKER]]]),
  });

  return {
    results: [buyHold, rebalanced, benchmark],
    metrics: {
      BUY_HOLD: computeMetrics(buyHold, benchmark),
      REBALANCED: computeMetrics(rebalanced, benchmark),
      BENCHMARK: computeMetrics(benchmark),
    },
  };
}
