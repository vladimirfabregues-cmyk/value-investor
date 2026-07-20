import YahooFinance from "yahoo-finance2";

import { FinanceProviderError, type FinanceProvider } from "@/lib/finance/provider";
import { normalizeTickerInput } from "@/lib/finance/normalize";
import { fetchEdgarSupplement } from "@/lib/finance/edgar-supplement";
import { getSectorProfile, isUSTicker, normalizeYahooSector } from "@/lib/finance/sector-profile";
import type { FinancialHistory5Y, FinancialSnapshot, NormalizedFinancialDataset } from "@/types/finance";

// ─── local Yahoo Finance type interfaces ────────────────────────────────────
// validateResult:false makes the SDK return `unknown`; these interfaces restore type safety
// for the fields we actually consume.

interface YFPrice {
  regularMarketPrice?: number;
  marketCap?: number;
  currency?: string;
  longName?: string;
  shortName?: string;
  sharesOutstanding?: number;
}

interface YFFinancialData {
  totalRevenue?: number;
  ebitda?: number;
  grossMargins?: number;
  operatingMargins?: number;
  freeCashflow?: number;
  totalDebt?: number;
  returnOnEquity?: number;
  interestExpense?: number;
  currentRatio?: number;
  netIncomeToCommon?: number;
  /** Currency of the financial statements (may differ from listing currency, e.g. SHEL.L: USD vs GBp) */
  financialCurrency?: string;
}

interface YFKeyStats {
  trailingEps?: number;
  bookValue?: number;
  enterpriseValue?: number;
  sharesOutstanding?: number;
}

interface YFSummaryProfile {
  sector?: string;
  industry?: string;
}

interface YFSummaryDetail {
  dividendRate?: number;
  trailingAnnualDividendRate?: number;
}

interface YFQuoteType {
  /** Date object (SDK revives it), ISO string, or epoch seconds/ms */
  firstTradeDateEpochUtc?: Date | number | string;
}

interface YFFinancialsRow {
  date?: string;
  totalRevenue?: number;
  grossProfit?: number;
  operatingIncome?: number;
  EBIT?: number;
  EBITDA?: number;
  netIncome?: number;
  dilutedEPS?: number;
  interestExpense?: number;
  taxRateForCalcs?: number;
}

interface YFBalanceSheetRow {
  date?: string;
  totalDebt?: number;
  stockholdersEquity?: number;
  commonStockEquity?: number;
  cashAndCashEquivalents?: number;
  cashCashEquivalentsAndShortTermInvestments?: number;
  currentAssets?: number;
  currentLiabilities?: number;
  investedCapital?: number;
  ordinarySharesNumber?: number;
  shareIssued?: number;
}

interface YFCashFlowRow {
  date?: string;
  freeCashFlow?: number;
  operatingCashFlow?: number;
  capitalExpenditure?: number;
}

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// ─── FX rates (for listings whose statements are reported in another currency) ──
// e.g. SHEL.L / HSBA.L trade in GBp but report in USD. Yahoo returns statement
// figures in financialCurrency, so they must be converted to the listing
// currency before any ratio or per-share comparison.
const fxCache = new Map<string, { rate: number; ts: number }>();
const FX_TTL_MS = 6 * 60 * 60 * 1000;

async function getFxRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;
  const key = `${from}${to}`;
  const cached = fxCache.get(key);
  if (cached && Date.now() - cached.ts < FX_TTL_MS) return cached.rate;

  const result = (await yf.quoteSummary(
    `${from}${to}=X`,
    { modules: ["price"] as never },
    { validateResult: false },
  )) as { price?: { regularMarketPrice?: number } };
  const rate = result.price?.regularMarketPrice;
  if (!rate || !Number.isFinite(rate) || rate <= 0) {
    // Failing loudly beats silently mixing currencies (a ~27% valuation error for USD/GBP).
    throw new FinanceProviderError(
      "PROVIDER_CONFIGURATION_ERROR",
      `Could not resolve FX rate ${from}→${to} needed to normalise statement currency.`,
      502,
    );
  }
  fxCache.set(key, { rate, ts: Date.now() });
  return rate;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function safeNum(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value) || value === 0) return null;
  return value;
}

function pct(value: number | null | undefined): number | null {
  const v = safeNum(value);
  return v === null ? null : v * 100;
}

/** Pad a series to exactly 5 elements with leading nulls (oldest-first convention). */
function padToFive(values: Array<number | null>): Array<number | null> {
  const leading = Math.max(0, 5 - values.length);
  return [...Array<null>(leading).fill(null), ...values.slice(-5)];
}

function fiveYearsAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 5);
  return d.toISOString().slice(0, 10);
}

async function fetchTimeSeries(
  ticker: string,
  module: "financials" | "balance-sheet" | "cash-flow",
): Promise<unknown[]> {
  try {
    const result = await yf.fundamentalsTimeSeries(
      ticker,
      { period1: fiveYearsAgo(), period2: new Date().toISOString().slice(0, 10), type: "annual", module },
      { validateResult: false },
    );
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

// ─── main provider ──────────────────────────────────────────────────────────

export class YahooFinanceProvider implements FinanceProvider {
  async getCompanySnapshot(ticker: string): Promise<NormalizedFinancialDataset> {
    const normalizedTicker = normalizeTickerInput(ticker);

    // Fetch all data in parallel
    let quoteSummaryRaw: unknown;
    try {
      quoteSummaryRaw = await yf.quoteSummary(
        normalizedTicker,
        { modules: ["price", "defaultKeyStatistics", "financialData", "summaryProfile", "summaryDetail", "quoteType"] as never },
        { validateResult: false },
      );
    } catch {
      throw new FinanceProviderError(
        "UNSUPPORTED_TICKER",
        `No data found for "${normalizedTicker}". Verify the ticker symbol and try again.`,
        404,
      );
    }

    const [financialsRaw, balanceSheetsRaw, cashFlowsRaw] = await Promise.all([
      fetchTimeSeries(normalizedTicker, "financials"),
      fetchTimeSeries(normalizedTicker, "balance-sheet"),
      fetchTimeSeries(normalizedTicker, "cash-flow"),
    ]);

    const qs = quoteSummaryRaw as {
      price?: YFPrice;
      financialData?: YFFinancialData;
      defaultKeyStatistics?: YFKeyStats;
      summaryProfile?: YFSummaryProfile;
      summaryDetail?: YFSummaryDetail;
      quoteType?: YFQuoteType;
    };
    const price = qs.price;
    const fd = qs.financialData;
    const ks = qs.defaultKeyStatistics;
    const sd = qs.summaryDetail;
    const sector = normalizeYahooSector(qs.summaryProfile?.sector);
    const industry = qs.summaryProfile?.industry;

    // First trade date → ISO date. The SDK may deliver a revived Date object,
    // an ISO string, or epoch seconds/ms depending on validation mode.
    const ftdRaw = qs.quoteType?.firstTradeDateEpochUtc;
    let firstTradeDate: string | undefined;
    if (ftdRaw instanceof Date) {
      firstTradeDate = Number.isNaN(ftdRaw.getTime()) ? undefined : ftdRaw.toISOString().slice(0, 10);
    } else if (typeof ftdRaw === "string") {
      const d = new Date(ftdRaw);
      firstTradeDate = Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
    } else if (typeof ftdRaw === "number" && Number.isFinite(ftdRaw)) {
      firstTradeDate = new Date(ftdRaw < 1e12 ? ftdRaw * 1000 : ftdRaw).toISOString().slice(0, 10);
    }

    if (!price?.regularMarketPrice) {
      throw new FinanceProviderError(
        "UNSUPPORTED_TICKER",
        `Yahoo Finance returned no price data for "${normalizedTicker}".`,
        404,
      );
    }

    // ── Currency normalisation ────────────────────────────────────────────
    // Two distinct problems:
    //  (a) UK prices arrive in GBp (pence) while everything else is GBP → ÷100.
    //  (b) Some listings report statements in a different currency entirely
    //      (SHEL.L / HSBA.L: price GBp, statements USD). Yahoo's per-share
    //      fields are then internally inconsistent (bookValue pre-converted,
    //      trailingEps not), so statement data is FX-converted here and EPS /
    //      BVPS are re-derived from the converted statements further below.
    const rawCurrency = price.currency ?? "USD";
    const isGBp = rawCurrency === "GBp";
    const normalizedCurrency = isGBp ? "GBP" : rawCurrency;
    const currentPrice = isGBp ? price.regularMarketPrice / 100 : price.regularMarketPrice;

    const financialCurrency = fd?.financialCurrency;
    const ccyMismatch = !!financialCurrency && financialCurrency !== normalizedCurrency;
    const fx = ccyMismatch ? await getFxRate(financialCurrency!, normalizedCurrency) : 1;
    const cv = (v: number | null | undefined): number | null => {
      const n = safeNum(v);
      return n === null ? null : n * fx;
    };

    // fundamentalsTimeSeries returns data oldest-first (ascending date).
    // Convert all monetary fields to the listing currency up front so every
    // downstream consumer (snapshot, history, ratios) sees one currency.
    const financials = (financialsRaw as YFFinancialsRow[]).map((f) =>
      fx === 1 ? f : {
        ...f,
        totalRevenue: cv(f.totalRevenue) ?? undefined,
        grossProfit: cv(f.grossProfit) ?? undefined,
        operatingIncome: cv(f.operatingIncome) ?? undefined,
        EBIT: cv(f.EBIT) ?? undefined,
        EBITDA: cv(f.EBITDA) ?? undefined,
        netIncome: cv(f.netIncome) ?? undefined,
        dilutedEPS: cv(f.dilutedEPS) ?? undefined,
        interestExpense: cv(f.interestExpense) ?? undefined,
      },
    );
    const balanceSheets = (balanceSheetsRaw as YFBalanceSheetRow[]).map((b) =>
      fx === 1 ? b : {
        ...b,
        totalDebt: cv(b.totalDebt) ?? undefined,
        stockholdersEquity: cv(b.stockholdersEquity) ?? undefined,
        commonStockEquity: cv(b.commonStockEquity) ?? undefined,
        cashAndCashEquivalents: cv(b.cashAndCashEquivalents) ?? undefined,
        cashCashEquivalentsAndShortTermInvestments: cv(b.cashCashEquivalentsAndShortTermInvestments) ?? undefined,
        currentAssets: cv(b.currentAssets) ?? undefined,
        currentLiabilities: cv(b.currentLiabilities) ?? undefined,
        investedCapital: cv(b.investedCapital) ?? undefined,
      },
    );
    const cashFlows = (cashFlowsRaw as YFCashFlowRow[]).map((c) =>
      fx === 1 ? c : {
        ...c,
        freeCashFlow: cv(c.freeCashFlow) ?? undefined,
        operatingCashFlow: cv(c.operatingCashFlow) ?? undefined,
        capitalExpenditure: cv(c.capitalExpenditure) ?? undefined,
      },
    );

    const latestBs = balanceSheets[balanceSheets.length - 1];
    const latestFin = financials[financials.length - 1];

    // ── Core market data ──────────────────────────────────────────────────
    // marketCap from the price module is already in the listing currency.
    const marketCap = price.marketCap ?? 0;
    const totalDebt = safeNum(latestBs?.totalDebt) ?? cv(fd?.totalDebt) ?? 0;
    const sharesOutstanding = ks?.sharesOutstanding ?? price.sharesOutstanding ?? 0;

    const bsCash = safeNum(latestBs?.cashCashEquivalentsAndShortTermInvestments ?? latestBs?.cashAndCashEquivalents);

    // Yahoo's enterpriseValue is currency-ambiguous for cross-currency listings —
    // recompute from components there; trust it only for single-currency names.
    let enterpriseValue: number;
    let cash: number | null;
    if (ccyMismatch) {
      enterpriseValue = marketCap + totalDebt - (bsCash ?? 0);
      cash = bsCash;
    } else {
      enterpriseValue = safeNum(ks?.enterpriseValue) ?? marketCap + totalDebt;
      const evCash = marketCap + totalDebt - enterpriseValue;
      cash = bsCash ?? (evCash > 0 ? evCash : null);
    }

    // ── Current snapshot ──────────────────────────────────────────────────
    const equity = safeNum(latestBs?.stockholdersEquity ?? latestBs?.commonStockEquity);
    const currentAssets = safeNum(latestBs?.currentAssets);
    const currentLiabilities = safeNum(latestBs?.currentLiabilities);

    // EBIT from series, else approximate from revenue × operating margin
    const latestEbit = safeNum(latestFin?.EBIT) ??
      (fd?.totalRevenue && fd?.operatingMargins ? cv(fd.totalRevenue * fd.operatingMargins) : null);

    // ROIC = NOPAT / invested_capital; NOPAT = EBIT × (1 − tax_rate)
    const taxRate = safeNum(latestFin?.taxRateForCalcs) ?? 0.21;
    const investedCapital = safeNum(latestBs?.investedCapital);
    const nopat = latestEbit !== null ? latestEbit * (1 - taxRate) : null;
    const roic = nopat !== null && investedCapital !== null && investedCapital > 0
      ? (nopat / investedCapital) * 100
      : null;

    // For cross-currency listings Yahoo's per-share fields are unreliable
    // (bookValue arrives pre-converted, trailingEps does not). Deriving both
    // from the FX-converted statements keeps every figure self-consistent.
    const niForEps = cv(fd?.netIncomeToCommon) ?? safeNum(latestFin?.netIncome);
    const derivedEps =
      ccyMismatch && niForEps !== null && sharesOutstanding > 0 ? niForEps / sharesOutstanding : null;
    const derivedBvps =
      ccyMismatch && equity !== null && sharesOutstanding > 0 ? equity / sharesOutstanding : null;

    // eslint-disable-next-line prefer-const
    let latest: FinancialSnapshot = {
      revenue: cv(fd?.totalRevenue),
      ebitda: cv(fd?.ebitda),
      ebit: latestEbit,
      // financialData.netIncomeToCommon is null for many REITs/funds; fall back
      // to the latest annual net income from the financials time series.
      net_income: cv(fd?.netIncomeToCommon) ?? safeNum(latestFin?.netIncome),
      diluted_eps: ccyMismatch ? (derivedEps ?? safeNum(ks?.trailingEps)) : safeNum(ks?.trailingEps),
      bvps: ccyMismatch ? (derivedBvps ?? safeNum(ks?.bookValue)) : safeNum(ks?.bookValue),
      free_cash_flow: cv(fd?.freeCashflow),
      total_debt: totalDebt || null,
      total_equity: equity,
      cash_and_equivalents: cash,
      current_assets: currentAssets,
      current_liabilities: currentLiabilities,
      interest_expense: safeNum(latestFin?.interestExpense) ?? (fd?.interestExpense ? Math.abs(fd.interestExpense * fx) : null),
      gross_margin_pct: pct(fd?.grossMargins),
      operating_margin_pct: pct(fd?.operatingMargins),
      roe_pct: pct(fd?.returnOnEquity),
      roic_pct: roic,
      // trailingAnnualDividendRate is reported in the statement currency for
      // cross-currency listings (verified: SHEL.L, HSBA.L) — convert it; the
      // forward dividendRate is already in the listing currency.
      dividend_per_share: ccyMismatch
        ? (cv(sd?.trailingAnnualDividendRate) ?? safeNum(sd?.dividendRate))
        : safeNum(sd?.trailingAnnualDividendRate ?? sd?.dividendRate),
    };

    // ── EDGAR supplement for US tickers missing critical financials ───────
    // Fetched before building history so its values can fill history gaps too.
    let edgarRevHistory: Array<number | null> | null = null;
    let edgarFcfHistory: Array<number | null> | null = null;
    let edgarEpsHistory: Array<number | null> | null = null;

    // FCF is structurally absent for banks/insurers, so a null FCF there is NOT a
    // missing-data signal — gate the FCF condition (and the FCF merge) on the
    // sector profile to avoid wasted EDGAR calls and misleading injected values.
    const sectorProfile = getSectorProfile(sector);
    const needsEdgarSupplement =
      isUSTicker(normalizedTicker) &&
      (latest.revenue === null ||
        latest.net_income === null ||
        (sectorProfile.fcfMeaningful && latest.free_cash_flow === null));

    if (needsEdgarSupplement) {
      const supp = await fetchEdgarSupplement(normalizedTicker);
      if (supp) {
        // Merge snapshot: fill nulls in latest with EDGAR values
        for (const [key, val] of Object.entries(supp.snapshot) as Array<[keyof FinancialSnapshot, number | null]>) {
          // Never inject FCF for sectors where it isn't a meaningful metric
          if (key === "free_cash_flow" && !sectorProfile.fcfMeaningful) continue;
          if (latest[key] === null && val !== null) {
            (latest as unknown as Record<string, unknown>)[key] = val;
          }
        }
        edgarRevHistory = supp.revenueHistory;
        if (sectorProfile.fcfMeaningful) edgarFcfHistory = supp.fcfHistory;
        edgarEpsHistory = supp.epsHistory;
      }
    }

    // ── History (oldest-first, padded to 5 years) ─────────────────────────
    const revenueHistory = financials.map((f) => safeNum(f.totalRevenue));
    const fcfHistory = cashFlows.map((c) => safeNum(c.freeCashFlow));
    const epsHistory = financials.map((f) => safeNum(f.dilutedEPS));

    const grossMarginHistory = financials.map((f) =>
      f.grossProfit && f.totalRevenue ? safeNum((f.grossProfit / f.totalRevenue) * 100) : null,
    );
    const opMarginHistory = financials.map((f) =>
      f.operatingIncome && f.totalRevenue ? safeNum((f.operatingIncome / f.totalRevenue) * 100) : null,
    );
    const roeHistory = financials.map((f, i) => {
      const bs = balanceSheets[i];
      const eq = safeNum(bs?.stockholdersEquity ?? bs?.commonStockEquity);
      const ni = safeNum(f.netIncome);
      return ni !== null && eq !== null && eq > 0 ? (ni / eq) * 100 : null;
    });
    const roicHistory = financials.map((f, i) => {
      const bs = balanceSheets[i];
      const ebit = safeNum(f.EBIT);
      const ic = safeNum(bs?.investedCapital);
      const tr = safeNum(f.taxRateForCalcs) ?? 0.21;
      if (ebit === null || ic === null || ic <= 0) return null;
      return (ebit * (1 - tr)) / ic * 100;
    });

    // Fall back to EDGAR history arrays when Yahoo returned all-null series
    const pickHistory = (
      yahooSeries: Array<number | null>,
      edgarSeries: Array<number | null> | null,
    ): Array<number | null> => {
      const hasYahoo = yahooSeries.some((v) => v !== null);
      return hasYahoo || !edgarSeries ? yahooSeries : edgarSeries;
    };

    // Earnings-quality and dilution inputs — already present in the fetched series
    const netIncomeHistory = financials.map((f) => safeNum(f.netIncome));
    const ocfHistory = cashFlows.map((c) => safeNum(c.operatingCashFlow));
    const sharesHistory = balanceSheets.map((b) => safeNum(b.ordinarySharesNumber ?? b.shareIssued));

    // For closed-end funds / investment trusts: historical price-to-NAV per
    // fiscal year, so the screener can anchor to the fund's own average
    // discount. One extra (monthly chart) call, made only for fund-like names.
    let cefPbHistory: Array<number | null> | undefined;
    const fundish = industry === "Asset Management" || (industry ?? "").startsWith("Closed-End Fund");
    if (fundish && balanceSheets.length > 0) {
      try {
        const chart = (await yf.chart(
          normalizedTicker,
          { period1: fiveYearsAgo(), interval: "1mo" },
          { validateResult: false },
        )) as { quotes?: Array<{ date?: Date | string; close?: number | null }> };
        const quotes = (chart.quotes ?? [])
          .map((q) => ({
            t: q.date ? new Date(q.date).getTime() : NaN,
            close: safeNum(q.close),
          }))
          .filter((q) => Number.isFinite(q.t) && q.close !== null);

        if (quotes.length > 0) {
          cefPbHistory = balanceSheets.map((b) => {
            const bvpsYear =
              safeNum(b.stockholdersEquity ?? b.commonStockEquity) !== null &&
              safeNum(b.ordinarySharesNumber ?? b.shareIssued) !== null
                ? (b.stockholdersEquity ?? b.commonStockEquity)! / (b.ordinarySharesNumber ?? b.shareIssued)!
                : null;
            if (bvpsYear === null || bvpsYear <= 0 || !b.date) return null;
            const target = new Date(b.date).getTime();
            // Closest monthly close to the fiscal year end
            let best: { t: number; close: number | null } | null = null;
            for (const q of quotes) {
              if (!best || Math.abs(q.t - target) < Math.abs(best.t - target)) best = q;
            }
            if (!best || best.close === null || Math.abs(best.t - target) > 60 * 86_400_000) return null;
            const px = isGBp ? best.close / 100 : best.close;
            return px / bvpsYear;
          });
        }
      } catch {
        cefPbHistory = undefined; // chart unavailable — scoring falls back to NAV parity
      }
    }

    const history_5y: FinancialHistory5Y = {
      revenue: padToFive(pickHistory(revenueHistory, edgarRevHistory)),
      free_cash_flow: padToFive(pickHistory(fcfHistory, edgarFcfHistory)),
      diluted_eps: padToFive(pickHistory(epsHistory, edgarEpsHistory)),
      gross_margin_pct: padToFive(grossMarginHistory),
      operating_margin_pct: padToFive(opMarginHistory),
      roe_pct: padToFive(roeHistory),
      roic_pct: padToFive(roicHistory),
      net_income: padToFive(netIncomeHistory),
      operating_cash_flow: padToFive(ocfHistory),
      shares_outstanding: padToFive(sharesHistory),
    };

    return {
      ticker: normalizedTicker,
      company_name: price.longName ?? price.shortName ?? normalizedTicker,
      currency: normalizedCurrency,
      sector,
      industry,
      first_trade_date: firstTradeDate,
      cef_pb_history: cefPbHistory,
      price: currentPrice,
      market_cap: marketCap,
      enterprise_value: enterpriseValue,
      shares_outstanding: sharesOutstanding,
      latest,
      history_5y,
      as_of_date: new Date().toISOString(),
      source_name: "Yahoo Finance (yahoo-finance2)",
    };
  }
}
