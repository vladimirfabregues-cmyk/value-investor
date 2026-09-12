/**
 * Realistic transaction-cost model for the simulated portfolio.
 *
 * All figures are on the GBP value of the shares transacted:
 *  - commission: a percentage with a per-trade floor (both buys and sells);
 *  - FX spread: a retail markup charged whenever the security is not GBP,
 *    applied on the conversion in (buys, dividends) and out (sells);
 *  - UK stamp duty (SDRT): 0.5% on *buys* of UK main-market shares only —
 *    AIM shares and non-UK shares are exempt, and it never applies on sells.
 *
 * These are assumptions, deliberately kept in one place so the whole model can
 * be tuned without touching the engine.
 */

export interface CostModel {
  /** Commission as a fraction of consideration, e.g. 0.001 = 0.10%. */
  commissionPct: number;
  /** Minimum commission per trade, in GBP. */
  commissionMinGbp: number;
  /** FX conversion spread as a fraction, charged on non-GBP legs. */
  fxSpreadPct: number;
  /** UK stamp duty (SDRT) as a fraction, charged on UK main-market buys. */
  ukStampDutyPct: number;
}

export const DEFAULT_COSTS: CostModel = {
  commissionPct: 0.001,
  commissionMinGbp: 1,
  fxSpreadPct: 0.005,
  ukStampDutyPct: 0.005,
};

export interface TradeCostInput {
  side: "BUY" | "SELL";
  /** Absolute GBP value of the shares transacted, before costs. */
  notionalGbp: number;
  /** True when the security is denominated in a non-GBP currency. */
  isForeign: boolean;
  /** True for a UK main-market buy (AIM and non-UK are exempt). */
  stampDutyApplies: boolean;
}

export interface TradeCostBreakdown {
  commissionGbp: number;
  fxSpreadGbp: number;
  stampDutyGbp: number;
  totalGbp: number;
}

export function tradeCost(input: TradeCostInput, model: CostModel = DEFAULT_COSTS): TradeCostBreakdown {
  const notional = Math.abs(input.notionalGbp);
  const commissionGbp = notional > 0 ? Math.max(model.commissionMinGbp, notional * model.commissionPct) : 0;
  const fxSpreadGbp = input.isForeign ? notional * model.fxSpreadPct : 0;
  const stampDutyGbp = input.side === "BUY" && input.stampDutyApplies ? notional * model.ukStampDutyPct : 0;
  return {
    commissionGbp,
    fxSpreadGbp,
    stampDutyGbp,
    totalGbp: commissionGbp + fxSpreadGbp + stampDutyGbp,
  };
}

/** FX spread charged when a non-GBP cash dividend is converted to GBP. */
export function dividendFxCost(grossGbp: number, isForeign: boolean, model: CostModel = DEFAULT_COSTS): number {
  return isForeign ? Math.abs(grossGbp) * model.fxSpreadPct : 0;
}
