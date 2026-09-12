/**
 * Domain model for the simulated "Strong Buy" portfolio (paper trading).
 *
 * Everything is accounted for in the base currency (GBP). Foreign holdings are
 * converted at the FX rate on the transaction/mark date, with an explicit FX
 * spread charged on the way in and out (see costs.ts). The engine is a pure
 * function of injected market data (prices, dividends, splits, FX), so it can
 * be unit-tested without any network or database.
 */

export const BASE_CURRENCY = "GBP" as const;

export type Currency = string; // ISO-4217 code, e.g. "USD", "GBP", "EUR", "JPY"

export type StrategyId = "BUY_HOLD" | "REBALANCED";

export interface Security {
  ticker: string;
  currency: Currency;
  /** Exchange code (e.g. "XLON", "AIM", "US"), used for market-specific costs. */
  exchange?: string;
}

export type TxType = "BUY" | "SELL" | "DIVIDEND" | "FEE";

/** A single portfolio movement, fully costed in GBP. */
export interface Transaction {
  /** ISO date (YYYY-MM-DD) the movement is booked on. */
  date: string;
  type: TxType;
  ticker?: string;
  /** Signed share quantity: positive on a buy, negative on a sell. */
  shares?: number;
  /** Execution price per share in the security's local currency. */
  priceLocal?: number;
  currency?: Currency;
  /** GBP per 1 unit of `currency` applied to this movement (1 for GBP). */
  fxToGbp?: number;
  /** Value before costs, in GBP: buy consideration, sale proceeds, or dividend. */
  grossGbp: number;
  /** All costs charged on this movement (commission + FX spread + stamp duty). */
  costGbp: number;
  /** Net effect on cash, in GBP: negative on a buy, positive on a sell/dividend. */
  cashDeltaGbp: number;
  note?: string;
}

/** A current position, with its GBP cost basis for realised-gain accounting. */
export interface Holding {
  ticker: string;
  currency: Currency;
  shares: number;
  /** Total GBP paid to acquire the current shares (incl. costs), for P&L. */
  costBasisGbp: number;
}

/** Portfolio value at a point in time, split into holdings and cash. */
export interface ValuationPoint {
  date: string;
  holdingsGbp: number;
  cashGbp: number;
  totalGbp: number;
}

export interface SimulationResult {
  strategy: StrategyId;
  inceptionDate: string;
  capitalGbp: number;
  transactions: Transaction[];
  /** Time series of portfolio value, oldest first. */
  valuations: ValuationPoint[];
  /** Final open positions. */
  holdings: Holding[];
  /** Realised gains/losses booked on sales, in GBP (net of the sale's costs). */
  realisedGbp: number;
  /** Total cash dividends received, in GBP (net of any FX spread). */
  dividendsGbp: number;
  /** Total of every cost charged across the run, in GBP. */
  costsGbp: number;
}
