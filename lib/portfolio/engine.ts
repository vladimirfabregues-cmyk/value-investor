/**
 * Pure simulation engine for the Strong-Buy paper portfolio.
 *
 * Both strategies share one rebalance routine and differ only in *when* they
 * rebalance:
 *  - BUY_HOLD    → rebalances once, at inception (buys the basket, then holds);
 *  - REBALANCED  → rebalances on every scheduled date (sells names that are no
 *                  longer Strong Buy, equal-weights the current set).
 *
 * The engine takes all market data through the injected `MarketData` port, so
 * it runs deterministically in tests with no network or database. Everything is
 * accounted for in GBP.
 */

import { BASE_CURRENCY } from "@/lib/portfolio/types";
import type {
  Currency,
  Holding,
  SimulationResult,
  StrategyId,
  Transaction,
  ValuationPoint,
} from "@/lib/portfolio/types";
import { DEFAULT_COSTS, dividendFxCost, tradeCost, type CostModel } from "@/lib/portfolio/costs";

export interface SecurityMeta {
  currency: Currency;
  /** UK main-market buy → stamp duty applies (AIM / non-UK exempt). */
  stampDutyApplies: boolean;
}

/** Everything the engine needs to know about the market, injected. */
export interface MarketData {
  /** Local-currency close on `date` (nearest available on/before); null if unpriced. */
  priceOn(ticker: string, date: string): number | null;
  /** GBP per 1 unit of `currency` on `date` (1 for GBP). */
  fxToGbp(currency: Currency, date: string): number;
  /** Cash dividends per share (local ccy) with ex-date in the half-open (from, to]. */
  dividendsBetween(ticker: string, from: string, to: string): { date: string; amountLocal: number }[];
  /** Split ratios (new per old share) with date in (from, to]. */
  splitsBetween(ticker: string, from: string, to: string): { date: string; ratio: number }[];
  security(ticker: string): SecurityMeta;
}

export interface SimulationInput {
  strategy: StrategyId;
  capitalGbp: number;
  /** ISO date the portfolio is created and the basket first bought. */
  inceptionDate: string;
  /** Rebalance dates, oldest → newest, each including inception at the front. */
  rebalanceDates: string[];
  /** Strong-Buy tickers as of each rebalance date (keyed by the date string). */
  strongBuysByDate: Map<string, string[]>;
  /** Dates to record a valuation at (e.g. a weekly or daily grid). */
  markDates: string[];
  market: MarketData;
  costs?: CostModel;
  /** Skip rebalancing trades whose GBP notional is below this, to avoid churn. */
  minTradeGbp?: number;
}

interface Position {
  shares: number;
  currency: Currency;
  costBasisGbp: number;
}

const isForeign = (c: Currency) => c !== BASE_CURRENCY;

/** Unique, ascending list of ISO date strings. */
function sortedUnique(dates: string[]): string[] {
  return [...new Set(dates)].sort();
}

export function simulate(input: SimulationInput): SimulationResult {
  const costs = input.costs ?? DEFAULT_COSTS;
  const minTrade = input.minTradeGbp ?? 0;
  const { market } = input;

  const rebalanceSet = new Set(input.rebalanceDates);
  const positions = new Map<string, Position>();
  const transactions: Transaction[] = [];
  let cashGbp = input.capitalGbp;
  let realisedGbp = 0;
  let dividendsGbp = 0;
  let costsGbp = 0;
  const valuations: ValuationPoint[] = [];

  // Every date the engine must act on, in order.
  const timeline = sortedUnique([
    input.inceptionDate,
    ...input.rebalanceDates,
    ...input.markDates,
  ]).filter((d) => d >= input.inceptionDate);

  let prev = input.inceptionDate;

  for (const date of timeline) {
    // 1) Corporate actions since the previous processed date.
    if (date > input.inceptionDate) {
      applyCorporateActions(prev, date);
    }

    // 2) Rebalance if this is a rebalance date.
    if (rebalanceSet.has(date)) {
      const targets = input.strongBuysByDate.get(date) ?? [];
      rebalanceTo(targets, date);
    }

    // 3) Record a valuation mark.
    valuations.push(mark(date));

    prev = date;
  }

  return {
    strategy: input.strategy,
    inceptionDate: input.inceptionDate,
    capitalGbp: input.capitalGbp,
    transactions,
    valuations,
    holdings: [...positions.entries()]
      .filter(([, p]) => p.shares > 1e-9)
      .map(([ticker, p]): Holding => ({
        ticker,
        currency: p.currency,
        shares: p.shares,
        costBasisGbp: p.costBasisGbp,
      })),
    realisedGbp,
    dividendsGbp,
    costsGbp,
  };

  // ── helpers (closures over the mutable run state) ──────────────────────────

  function applyCorporateActions(from: string, to: string) {
    for (const [ticker, pos] of positions) {
      if (pos.shares <= 0) continue;
      const foreign = isForeign(pos.currency);

      // Splits adjust the share count; value is continuous with the price drop.
      for (const s of market.splitsBetween(ticker, from, to)) {
        if (s.ratio > 0) pos.shares *= s.ratio;
      }

      // Dividends pay cash, converted to GBP at the ex-date FX (less FX spread).
      for (const d of market.dividendsBetween(ticker, from, to)) {
        const fx = market.fxToGbp(pos.currency, d.date);
        const grossGbp = pos.shares * d.amountLocal * fx;
        if (grossGbp <= 0) continue;
        const fxCost = dividendFxCost(grossGbp, foreign, costs);
        const netGbp = grossGbp - fxCost;
        cashGbp += netGbp;
        dividendsGbp += netGbp;
        costsGbp += fxCost;
        transactions.push({
          date: d.date,
          type: "DIVIDEND",
          ticker,
          priceLocal: d.amountLocal,
          currency: pos.currency,
          fxToGbp: fx,
          grossGbp,
          costGbp: fxCost,
          cashDeltaGbp: netGbp,
        });
      }
    }
  }

  function priceGbp(ticker: string, currency: Currency, date: string): number | null {
    const local = market.priceOn(ticker, date);
    if (local === null || !Number.isFinite(local)) return null;
    return local * market.fxToGbp(currency, date);
  }

  function portfolioValue(date: string): number {
    let holdings = 0;
    for (const [ticker, pos] of positions) {
      if (pos.shares <= 0) continue;
      const pv = priceGbp(ticker, pos.currency, date);
      if (pv !== null) holdings += pos.shares * pv;
    }
    return holdings + cashGbp;
  }

  function mark(date: string): ValuationPoint {
    let holdings = 0;
    for (const [ticker, pos] of positions) {
      if (pos.shares <= 0) continue;
      const pv = priceGbp(ticker, pos.currency, date);
      if (pv !== null) holdings += pos.shares * pv;
    }
    return { date, holdingsGbp: holdings, cashGbp, totalGbp: holdings + cashGbp };
  }

  function buy(ticker: string, shares: number, date: string) {
    const meta = market.security(ticker);
    const pv = priceGbp(ticker, meta.currency, date);
    if (pv === null || shares <= 0) return;
    const notional = shares * pv;
    const c = tradeCost(
      { side: "BUY", notionalGbp: notional, isForeign: isForeign(meta.currency), stampDutyApplies: meta.stampDutyApplies },
      costs,
    );
    cashGbp -= notional + c.totalGbp;
    costsGbp += c.totalGbp;
    const pos = positions.get(ticker) ?? { shares: 0, currency: meta.currency, costBasisGbp: 0 };
    pos.shares += shares;
    pos.costBasisGbp += notional + c.totalGbp;
    positions.set(ticker, pos);
    transactions.push({
      date,
      type: "BUY",
      ticker,
      shares,
      priceLocal: market.priceOn(ticker, date) ?? undefined,
      currency: meta.currency,
      fxToGbp: market.fxToGbp(meta.currency, date),
      grossGbp: notional,
      costGbp: c.totalGbp,
      cashDeltaGbp: -(notional + c.totalGbp),
    });
  }

  function sell(ticker: string, shares: number, date: string) {
    const pos = positions.get(ticker);
    if (!pos || shares <= 0) return;
    const qty = Math.min(shares, pos.shares);
    const meta = market.security(ticker);
    const pv = priceGbp(ticker, pos.currency, date);
    if (pv === null || qty <= 0) return;
    const notional = qty * pv;
    const c = tradeCost(
      { side: "SELL", notionalGbp: notional, isForeign: isForeign(pos.currency), stampDutyApplies: meta.stampDutyApplies },
      costs,
    );
    const proceeds = notional - c.totalGbp;
    const soldBasis = pos.costBasisGbp * (qty / pos.shares);
    realisedGbp += proceeds - soldBasis;
    cashGbp += proceeds;
    costsGbp += c.totalGbp;
    pos.shares -= qty;
    pos.costBasisGbp -= soldBasis;
    if (pos.shares <= 1e-9) positions.delete(ticker);
    transactions.push({
      date,
      type: "SELL",
      ticker,
      shares: -qty,
      priceLocal: market.priceOn(ticker, date) ?? undefined,
      currency: pos.currency,
      fxToGbp: market.fxToGbp(pos.currency, date),
      grossGbp: notional,
      costGbp: c.totalGbp,
      cashDeltaGbp: proceeds,
    });
  }

  /** Move the book toward an equal-weight target over `targets` at `date`. */
  function rebalanceTo(targets: string[], date: string) {
    const priced = targets.filter((t) => priceGbp(t, market.security(t).currency, date) !== null);
    const total = portfolioValue(date);

    // Sell anything no longer targeted (raises cash before we buy).
    for (const [ticker, pos] of [...positions]) {
      if (pos.shares > 0 && !priced.includes(ticker)) sell(ticker, pos.shares, date);
    }

    if (priced.length === 0) return; // no targets → sit in cash

    const targetGbp = total / priced.length;

    // Trim overweight names first (more cash for the underweight ones).
    const buys: { ticker: string; shares: number; notional: number }[] = [];
    for (const ticker of priced) {
      const meta = market.security(ticker);
      const pv = priceGbp(ticker, meta.currency, date)!;
      const held = positions.get(ticker)?.shares ?? 0;
      const targetShares = targetGbp / pv;
      const delta = targetShares - held;
      const notional = Math.abs(delta * pv);
      if (notional < (input.minTradeGbp ?? 0)) continue;
      if (delta < 0) sell(ticker, -delta, date);
      else buys.push({ ticker, shares: delta, notional });
    }

    // Fund buys from available cash. Scale by total *outlay* (notional plus its
    // own costs) so commissions/FX/stamp-duty can never overdraw the cash line.
    const outlays = buys.map((b) => {
      const meta = market.security(b.ticker);
      const c = tradeCost(
        { side: "BUY", notionalGbp: b.notional, isForeign: isForeign(meta.currency), stampDutyApplies: meta.stampDutyApplies },
        costs,
      );
      return b.notional + c.totalGbp;
    });
    const requiredOutlay = outlays.reduce((s, o) => s + o, 0);
    const scale = requiredOutlay > cashGbp && requiredOutlay > 0 ? (cashGbp * 0.9999) / requiredOutlay : 1;
    for (const b of buys) {
      const shares = b.shares * scale;
      const pv = b.notional / b.shares;
      if (minTrade === 0 || shares * pv >= minTrade) buy(b.ticker, shares, date);
    }
  }
}
