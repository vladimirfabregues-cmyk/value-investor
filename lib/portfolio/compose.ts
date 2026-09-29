/**
 * Pure composition of every simulated book from a signal history and market
 * data. No I/O — this is what the tests exercise and what the I/O build wrapper
 * (build.ts) calls after fetching data.
 */

import { simulate, type MarketData } from "@/lib/portfolio/engine";
import { computeMetrics, type PortfolioMetrics } from "@/lib/portfolio/metrics";
import type { SignalHistory } from "@/lib/portfolio/signals";
import { LAB_RULES, LAB_STRATEGIES, labRebalanceDates, labTargets } from "@/lib/portfolio/lab";
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

/** What one book trades, and when — everything but the prices. */
export interface BookPlan {
  strategy: StrategyId;
  rebalanceDates: string[];
  targets: Map<string, string[]>;
  maxWeight?: number;
}

export function planBooks(signals: SignalHistory): BookPlan[] {
  const inception = signals.inceptionDate;
  const core: BookPlan[] = [
    {
      strategy: "BUY_HOLD",
      rebalanceDates: [inception],
      targets: new Map([[inception, signals.strongBuysByDate.get(inception) ?? []]]),
    },
    { strategy: "REBALANCED", rebalanceDates: signals.rebalanceDates, targets: signals.strongBuysByDate },
    { strategy: "BENCHMARK", rebalanceDates: [inception], targets: new Map([[inception, [BENCHMARK_TICKER]]]) },
  ];
  const lab = LAB_STRATEGIES.map((s): BookPlan => {
    const rebalanceDates = labRebalanceDates(signals.calendar, inception, s.frequency);
    return { strategy: s.id, rebalanceDates, targets: labTargets(s, signals, rebalanceDates), maxWeight: s.maxWeight };
  });
  return [...core, ...lab];
}

export interface PriceNeed {
  from: string;
  to: string;
}

/**
 * The window of prices each ticker needs: from a week before it is first
 * targeted (so a closed market still has a prior close) to the rebalance that
 * sells it, or `today` if any book still holds it.
 */
export function priceNeeds(plans: BookPlan[], today: string): Map<string, PriceNeed> {
  const needs = new Map<string, PriceNeed>();
  for (const plan of plans) {
    plan.rebalanceDates.forEach((date, i) => {
      const heldUntil = plan.rebalanceDates[i + 1] ?? today;
      for (const ticker of plan.targets.get(date) ?? []) {
        const from = isoDay(new Date(Date.parse(date) - 7 * DAY_MS));
        const need = needs.get(ticker);
        needs.set(ticker, {
          from: need && need.from < from ? need.from : from,
          to: need && need.to > heldUntil ? need.to : heldUntil,
        });
      }
    });
  }
  return needs;
}

export interface ComputedPortfolios {
  results: SimulationResult[];
  metrics: Partial<Record<StrategyId, PortfolioMetrics>>;
}

export function computePortfolios(signals: SignalHistory, market: MarketData, today: string): ComputedPortfolios {
  const inception = signals.inceptionDate;
  const markDates = [...new Set([...weeklyGrid(inception, today), ...signals.calendar.filter((d) => d >= inception)])].sort();
  const frozenFx: MarketData = { ...market, fxToGbp: (currency) => market.fxToGbp(currency, inception) };

  const run = (plan: BookPlan, m: MarketData) =>
    simulate({
      strategy: plan.strategy,
      capitalGbp: PORTFOLIO_CAPITAL_GBP,
      inceptionDate: inception,
      markDates,
      market: m,
      costs: PORTFOLIO_COSTS,
      minTradeGbp: MIN_TRADE_GBP,
      rebalanceDates: plan.rebalanceDates,
      strongBuysByDate: plan.targets,
      maxWeight: plan.maxWeight,
    });

  const plans = planBooks(signals);
  const runs = plans.map((plan) => ({ plan, result: run(plan, market), frozen: run(plan, frozenFx) }));
  const benchmark = runs.find((r) => r.plan.strategy === "BENCHMARK")!.result;

  const metrics: ComputedPortfolios["metrics"] = {};
  for (const { plan, result, frozen } of runs) {
    metrics[plan.strategy] = computeMetrics(result, {
      benchmark: plan.strategy === "BENCHMARK" ? undefined : benchmark,
      fxFrozen: frozen,
      fixedOn: LAB_RULES.fixedOn,
    });
  }
  return { results: runs.map((r) => r.result), metrics };
}
