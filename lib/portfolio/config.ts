import { DEFAULT_COSTS } from "@/lib/portfolio/costs";
import type { StrategyId } from "@/lib/portfolio/types";

/** Virtual capital seeded into each simulated portfolio. */
export const PORTFOLIO_CAPITAL_GBP = 10_000;

/**
 * Benchmark: a GBP-denominated, accumulating FTSE All-World tracker, so its
 * price is a total-return series (dividends reinvested) and needs no FX. It is
 * simulated as a one-holding buy-and-hold through the same engine.
 */
export const BENCHMARK_TICKER = "VWRP.L";

export const PORTFOLIO_COSTS = DEFAULT_COSTS;

/** Skip rebalancing trades below this GBP notional, to avoid churn. */
export const MIN_TRADE_GBP = 25;

export const PORTFOLIO_STRATEGIES = ["BUY_HOLD", "REBALANCED", "BENCHMARK"] as const;
export type PortfolioStrategy = (typeof PORTFOLIO_STRATEGIES)[number];

/** Only the two real strategies are compared; BENCHMARK is a reference line. */
export const COMPARISON_STRATEGIES: StrategyId[] = ["BUY_HOLD", "REBALANCED"];
