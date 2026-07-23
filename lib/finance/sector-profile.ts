// Sector-aware scoring profiles — one per GICS sector.
// Each profile controls DCF assumptions, composite-score weights, and which
// metrics are structurally meaningful for the sector.

export type GicsSector =
  | "Communication Services"
  | "Consumer Discretionary"
  | "Consumer Staples"
  | "Energy"
  | "Financials"
  | "Health Care"
  | "Industrials"
  | "Information Technology"
  | "Materials"
  | "Real Estate"
  | "Utilities";

export interface SectorProfile {
  /** True for banks/REITs/utilities where high leverage is structural, not a red flag */
  highLeverageNormal: boolean;
  /** D/E above this threshold triggers severe_balance_sheet_weakness (default 1.5) */
  severeDebtEquityThreshold: number;
  /** Banks don't use traditional current-ratio liquidity tests */
  currentRatioMeaningful: boolean;
  /** Banks fund with deposits — EBIT/interest coverage is structurally <1 and is NOT a distress signal */
  interestCoverageMeaningful: boolean;
  /** Gross margin is undefined for banks, holding companies, and REITs */
  grossMarginMeaningful: boolean;
  /** Standard FCF is not a primary metric for banks (use ROE/P/B instead) */
  fcfMeaningful: boolean;
  /**
   * Which intrinsic-value model anchors the margin-of-safety calculation:
   *  - "dcf": discounted free cash flow blended with the Graham number (default)
   *  - "nav": net asset value (book value per share) — for REITs / property funds
   *  - "ddm": dividend-discount (Gordon growth) — for regulated utilities
   *  - "pbroe": justified P/B from normalized ROE — for banks, insurers, asset
   *    managers, where FCF is float/deposit timing rather than owner earnings
   */
  intrinsicMethod: "dcf" | "nav" | "ddm" | "pbroe";
  /** Composite-score component weights — must sum to 1.0 */
  compositeWeights: { valuation: number; health: number; quality: number; mos: number };
  /** DCF discount rate (%) — reflects sector risk premium */
  discountRatePct: number;
  /** DCF terminal growth rate (%) */
  terminalGrowthPct: number;
  /** DCF FCF growth cap (%) */
  maxGrowthCapPct: number;
}

const DEFAULTS: SectorProfile = {
  highLeverageNormal: false,
  severeDebtEquityThreshold: 1.5,
  currentRatioMeaningful: true,
  interestCoverageMeaningful: true,
  grossMarginMeaningful: true,
  fcfMeaningful: true,
  intrinsicMethod: "dcf",
  compositeWeights: { valuation: 0.30, health: 0.25, quality: 0.25, mos: 0.20 },
  discountRatePct: 10,
  terminalGrowthPct: 2.5,
  maxGrowthCapPct: 8,
};

// Per-sector overrides merged on top of DEFAULTS
const SECTOR_OVERRIDES: Partial<Record<GicsSector, Partial<SectorProfile>>> = {

  // Banks, insurers, asset managers ─ leveraged by design; judged on P/B & ROE
  "Financials": {
    highLeverageNormal: true,
    severeDebtEquityThreshold: 15,   // 8-12× is routine for banks
    currentRatioMeaningful: false,   // banks fund with deposits, not working capital
    interestCoverageMeaningful: false, // interest expense ≈ EBIT for banks; coverage <1 is normal
    grossMarginMeaningful: false,    // net-interest margin, not gross margin
    fcfMeaningful: false,            // regulatory capital, not FCF, constrains distribution
    intrinsicMethod: "pbroe",       // justified P/B on cycle-average ROE; never FCF-DCF
    compositeWeights: { valuation: 0.30, health: 0.25, quality: 0.30, mos: 0.15 },
    discountRatePct: 9,
    terminalGrowthPct: 2.5,
    maxGrowthCapPct: 7,
  },

  // REITs — valued on net asset value (P/NAV), not cash-flow DCF. Property
  // reinvestment makes reported FCF structurally low/negative, so FCF is neither
  // a valuation basis nor a distress signal here.
  "Real Estate": {
    highLeverageNormal: true,
    severeDebtEquityThreshold: 3.5,  // 1.5-3× is normal for property funds
    currentRatioMeaningful: false,
    grossMarginMeaningful: false,
    fcfMeaningful: false,            // FFO/NAV, not FCF
    intrinsicMethod: "nav",         // anchor to book value (≈ NAV)
    compositeWeights: { valuation: 0.25, health: 0.30, quality: 0.20, mos: 0.25 },
    discountRatePct: 8,
    terminalGrowthPct: 2.0,
    maxGrowthCapPct: 6,
  },

  // Regulated monopolies — stable, dividend-centric returns. Heavy ongoing capex
  // makes FCF lumpy/negative during build-out, so value via a dividend-discount
  // model rather than FCF-DCF, and don't treat lumpy FCF as distress.
  "Utilities": {
    highLeverageNormal: true,
    severeDebtEquityThreshold: 2.5,
    fcfMeaningful: false,           // capex-driven FCF swings are structural
    intrinsicMethod: "ddm",        // dividend-discount (Gordon growth)
    compositeWeights: { valuation: 0.30, health: 0.25, quality: 0.25, mos: 0.20 },
    discountRatePct: 7.5,
    terminalGrowthPct: 2.0,
    maxGrowthCapPct: 5,
  },

  // Commodity-linked cyclicals — EV/EBITDA dominates; higher risk premium
  "Energy": {
    compositeWeights: { valuation: 0.30, health: 0.30, quality: 0.20, mos: 0.20 },
    discountRatePct: 11,
    terminalGrowthPct: 2.0,
    maxGrowthCapPct: 8,
  },

  // Cyclical mining / chemicals — similar to Energy
  "Materials": {
    compositeWeights: { valuation: 0.30, health: 0.30, quality: 0.20, mos: 0.20 },
    discountRatePct: 10,
    terminalGrowthPct: 2.0,
    maxGrowthCapPct: 7,
  },

  // R&D-heavy; many profitable companies still burn FCF; pipeline value matters
  "Health Care": {
    compositeWeights: { valuation: 0.25, health: 0.25, quality: 0.30, mos: 0.20 },
    discountRatePct: 11,
    terminalGrowthPct: 3.0,
    maxGrowthCapPct: 10,
  },

  // High-growth, asset-light; P/FCF and quality weighted more heavily
  "Information Technology": {
    compositeWeights: { valuation: 0.25, health: 0.20, quality: 0.30, mos: 0.25 },
    discountRatePct: 12,
    terminalGrowthPct: 3.0,
    maxGrowthCapPct: 12,
  },

  // Media & telecom — mix of growth and incumbents
  "Communication Services": {
    discountRatePct: 10,
    terminalGrowthPct: 2.5,
    maxGrowthCapPct: 8,
  },

  // Defensive staples — stable but slow; lower discount rate
  "Consumer Staples": {
    discountRatePct: 8.5,
    terminalGrowthPct: 2.5,
    maxGrowthCapPct: 6,
  },

  // Consumer cyclicals — standard parameters
  "Consumer Discretionary": {
    discountRatePct: 10,
    terminalGrowthPct: 2.5,
    maxGrowthCapPct: 8,
  },

  // Industrial manufacturers / services — standard parameters
  "Industrials": {
    discountRatePct: 10,
    terminalGrowthPct: 2.5,
    maxGrowthCapPct: 8,
  },
};

/**
 * Equity-risk size premium (percentage points) added to the sector cost of
 * equity. Smaller companies carry materially higher equity risk, so a single
 * sector rate flatters small-cap valuations — most acutely for financials,
 * whose intrinsic value is a justified P/B computed directly on this rate:
 * a 2pp cut to the rate can lift the fair multiple ~25%.
 *
 * Thresholds mirror the screener's market-cap tiers. An unknown size is treated
 * as small-cap risk rather than assumed large — the conservative default.
 */
export function costOfEquitySizePremiumPct(marketCap: number | null | undefined): number {
  if (marketCap === null || marketCap === undefined || !Number.isFinite(marketCap) || marketCap <= 0) {
    return 1.5;
  }
  if (marketCap < 300_000_000) return 2.0; // micro
  if (marketCap < 2_000_000_000) return 1.5; // small
  if (marketCap < 10_000_000_000) return 0.5; // mid
  return 0; // large / mega
}

export function getSectorProfile(sector: string | null | undefined): SectorProfile {
  if (!sector) return { ...DEFAULTS };
  const overrides = SECTOR_OVERRIDES[sector as GicsSector];
  if (!overrides) return { ...DEFAULTS };
  return { ...DEFAULTS, ...overrides };
}

/**
 * Yahoo Finance returns its own sector taxonomy.
 * Map the most common divergences to GICS names used by our system.
 */
const YAHOO_TO_GICS: Record<string, string> = {
  "Technology": "Information Technology",
  "Financial Services": "Financials",
  "Finance": "Financials",
  "Healthcare": "Health Care",
  "Consumer Cyclical": "Consumer Discretionary",
  "Consumer Defensive": "Consumer Staples",
  "Basic Materials": "Materials",
};

export function normalizeYahooSector(yahooSector: string | null | undefined): string | undefined {
  if (!yahooSector) return undefined;
  return YAHOO_TO_GICS[yahooSector] ?? yahooSector;
}

/** US-listed tickers have no exchange suffix (.L, .PA, etc.) */
export function isUSTicker(ticker: string): boolean {
  return !ticker.includes(".");
}

// ── Security-type classification ─────────────────────────────────────────────

export type SecurityType = "operating" | "closed_end_fund";

const FUND_NAME_PATTERN = /\b(investment trust|trust plc|fund|investments?\s+(plc|limited|ltd)|capital partners)\b/i;

/**
 * Distinguish closed-end funds / investment trusts from operating companies.
 * Their income statement is mark-to-market portfolio revaluation, so EPS-based
 * valuation is meaningless — they must be valued on discount to NAV.
 *
 * Signals (Yahoo gives no explicit flag for UK trusts):
 *  - industry literally "Closed-End Fund …" (US CEFs)
 *  - industry "Asset Management" AND (fund-like name OR wildly swinging
 *    "revenue", the signature of revaluation gains being booked as income).
 *    The revenue test keeps genuine operating managers (e.g. Impax) out.
 */
export function classifySecurityType(input: {
  companyName: string;
  industry?: string | null;
  revenueCagrPct?: number | null;
}): SecurityType {
  const industry = input.industry ?? "";
  if (industry.startsWith("Closed-End Fund")) return "closed_end_fund";
  if (industry === "Asset Management") {
    const nameLooksLikeFund = FUND_NAME_PATTERN.test(input.companyName);
    const revenueLooksLikeMarks =
      input.revenueCagrPct !== null &&
      input.revenueCagrPct !== undefined &&
      Math.abs(input.revenueCagrPct) > 40;
    if (nameLooksLikeFund || revenueLooksLikeMarks) return "closed_end_fund";
  }
  return "operating";
}
