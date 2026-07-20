/**
 * SEC EDGAR XBRL supplement — fetches authoritative financial statement data
 * directly from SEC filings for US-listed companies.
 *
 * Used as a fallback when Yahoo Finance returns null for critical fields
 * (revenue, net income, or free cash flow). Only called for tickers without
 * an exchange suffix (i.e. US-listed stocks).
 *
 * Rate-limit strategy: each company needs at most 2 EDGAR calls (CIK lookup +
 * company facts). Results are cached in-process so repeat calls are free.
 */

import type { FinancialSnapshot } from "@/types/finance";

const EDGAR_UA = "ValueDesk research@valuedeskapp.com";
const TIMEOUT_MS = 6_000;

// ── in-process CIK cache ─────────────────────────────────────────────────────
const cikCache = new Map<string, string | null>();

function race<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("edgar_timeout")), ms),
    ),
  ]);
}

// ── CIK resolution via the official SEC ticker→CIK map ───────────────────────
// https://www.sec.gov/files/company_tickers.json is the authoritative directory
// (~10,400 entries, exact ticker match incl. class shares like MOG-A, BRK-B).
// Far more reliable than full-text search, which ranks by relevance and can
// resolve the wrong company. Fetched once per process and cached.

interface SecTickerEntry {
  cik_str: number;
  ticker: string;
  title: string;
}

let tickerMap: Map<string, string> | null = null;
let tickerMapPromise: Promise<Map<string, string> | null> | null = null;

async function loadTickerMap(): Promise<Map<string, string> | null> {
  if (tickerMap) return tickerMap;
  if (!tickerMapPromise) {
    tickerMapPromise = (async () => {
      try {
        const res = await race(
          fetch("https://www.sec.gov/files/company_tickers.json", {
            headers: { "User-Agent": EDGAR_UA },
          }),
          TIMEOUT_MS,
        );
        if (!res.ok) return null;
        const data = (await res.json()) as Record<string, SecTickerEntry>;
        const map = new Map<string, string>();
        for (const entry of Object.values(data)) {
          if (entry?.ticker) {
            map.set(entry.ticker.toUpperCase(), String(entry.cik_str).padStart(10, "0"));
          }
        }
        tickerMap = map;
        return map;
      } catch {
        return null;
      }
    })();
  }
  return tickerMapPromise;
}

async function resolveCIK(ticker: string): Promise<string | null> {
  if (cikCache.has(ticker)) return cikCache.get(ticker)!;

  const map = await loadTickerMap();
  // SEC map uses dash form for class shares (BRK-B, MOG-A); our tickers may use dots.
  const key = ticker.toUpperCase().replace(/\./g, "-");
  const cik = map?.get(key) ?? null;
  cikCache.set(ticker, cik);
  return cik;
}

// ── XBRL company facts ───────────────────────────────────────────────────────

interface XbrlFact {
  end: string;   // "2024-09-28"
  val: number;
  form: string;  // "10-K" | "10-Q"
  accn: string;
}
interface XbrlConcept {
  units?: { USD?: XbrlFact[]; pure?: XbrlFact[] };
}
interface CompanyFacts {
  facts?: { "us-gaap"?: Record<string, XbrlConcept> };
}

/** Most recent annual (10-K) value for an XBRL concept */
function latestAnnual(concept: XbrlConcept | undefined): number | null {
  const facts = [
    ...(concept?.units?.USD ?? []),
    ...(concept?.units?.pure ?? []),
  ]
    .filter((f) => f.form === "10-K")
    .sort((a, b) => b.end.localeCompare(a.end));
  const v = facts[0]?.val;
  return v !== undefined && Number.isFinite(v) ? v : null;
}

/** Up to n annual values, oldest-first, deduplicated by fiscal year */
function annualHistory(concept: XbrlConcept | undefined, n = 5): Array<number | null> {
  const facts = [
    ...(concept?.units?.USD ?? []),
    ...(concept?.units?.pure ?? []),
  ].filter((f) => f.form === "10-K");

  // Keep the latest filing per fiscal year
  const byYear = new Map<string, XbrlFact>();
  for (const f of facts.sort((a, b) => b.end.localeCompare(a.end))) {
    const yr = f.end.slice(0, 4);
    if (!byYear.has(yr)) byYear.set(yr, f);
  }

  const sorted = [...byYear.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-n)
    .map(([, f]) => f.val);

  const leading = Array<null>(Math.max(0, n - sorted.length)).fill(null);
  return [...leading, ...sorted];
}

// ── public API ───────────────────────────────────────────────────────────────

export interface EdgarSupplement {
  snapshot: Partial<FinancialSnapshot>;
  revenueHistory: Array<number | null>;
  fcfHistory: Array<number | null>;
  epsHistory: Array<number | null>;
}

/**
 * Fetch key financial metrics from EDGAR XBRL for a US-listed company.
 * Returns null if the company is not found or EDGAR is unreachable.
 */
export async function fetchEdgarSupplement(ticker: string): Promise<EdgarSupplement | null> {
  try {
    const cik = await resolveCIK(ticker);
    if (!cik) return null;

    const res = await race(
      fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {
        headers: { "User-Agent": EDGAR_UA },
      }),
      TIMEOUT_MS,
    );
    if (!res.ok) return null;

    const data = (await res.json()) as CompanyFacts;
    const g = data.facts?.["us-gaap"];
    if (!g) return null;

    // Revenue — try multiple GAAP concept names in priority order
    const revConcept =
      g["RevenueFromContractWithCustomerExcludingAssessedTax"] ??
      g["Revenues"] ??
      g["SalesRevenueNet"] ??
      g["SalesRevenueGoodsNet"] ??
      g["RevenueFromContractWithCustomerIncludingAssessedTax"];

    const niConcept  = g["NetIncomeLoss"] ?? g["ProfitLoss"];
    const ocfConcept = g["NetCashProvidedByUsedInOperatingActivities"];
    const capexConcept = g["PaymentsToAcquirePropertyPlantAndEquipment"];
    const equityConcept =
      g["StockholdersEquity"] ??
      g["StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest"];
    const cashConcept =
      g["CashAndCashEquivalentsAtCarryingValue"] ??
      g["CashCashEquivalentsAndShortTermInvestments"];
    const epsConcept = g["EarningsPerShareDiluted"] ?? g["EarningsPerShareBasic"];
    const bvpsConcept = g["BookValuePerShareWorking"];  // non-standard, rarely present
    const ebitdaConcept = g["EarningsBeforeInterestTaxesDepreciationAndAmortization"];
    const interestConcept =
      g["InterestExpense"] ?? g["InterestExpenseDebt"] ?? g["InterestAndDebtExpense"];
    const grossProfitConcept = g["GrossProfit"];
    const opIncomeConcept = g["OperatingIncomeLoss"];

    // Free cash flow = OCF − |CapEx|
    const latestOCF   = latestAnnual(ocfConcept);
    const latestCapex = latestAnnual(capexConcept);
    const latestFCF   =
      latestOCF !== null && latestCapex !== null
        ? latestOCF - Math.abs(latestCapex)
        : latestOCF; // OCF alone when CapEx unavailable

    const ocfHistory   = annualHistory(ocfConcept);
    const capexHistory = annualHistory(capexConcept);
    const fcfHistory   = ocfHistory.map((o, i) => {
      const c = capexHistory[i];
      if (o === null) return null;
      return c !== null ? o - Math.abs(c) : o;
    });

    // Gross / operating margin from raw dollar figures
    const latestRev       = latestAnnual(revConcept);
    const latestGrossProfit = latestAnnual(grossProfitConcept);
    const latestOpIncome  = latestAnnual(opIncomeConcept);
    const grossMarginPct  =
      latestGrossProfit !== null && latestRev !== null && latestRev > 0
        ? (latestGrossProfit / latestRev) * 100
        : null;
    const opMarginPct     =
      latestOpIncome !== null && latestRev !== null && latestRev > 0
        ? (latestOpIncome / latestRev) * 100
        : null;

    const snapshot: Partial<FinancialSnapshot> = {
      ...(latestRev   !== null && { revenue: latestRev }),
      ...(latestAnnual(niConcept)     !== null && { net_income: latestAnnual(niConcept)! }),
      ...(latestFCF   !== null && { free_cash_flow: latestFCF }),
      ...(latestAnnual(equityConcept) !== null && { total_equity: latestAnnual(equityConcept)! }),
      ...(latestAnnual(cashConcept)   !== null && { cash_and_equivalents: latestAnnual(cashConcept)! }),
      ...(latestAnnual(epsConcept)    !== null && { diluted_eps: latestAnnual(epsConcept)! }),
      ...(latestAnnual(bvpsConcept)   !== null && { bvps: latestAnnual(bvpsConcept)! }),
      ...(latestAnnual(ebitdaConcept) !== null && { ebitda: latestAnnual(ebitdaConcept)! }),
      ...(latestAnnual(interestConcept) !== null && {
        interest_expense: Math.abs(latestAnnual(interestConcept)!),
      }),
      ...(grossMarginPct !== null && { gross_margin_pct: grossMarginPct }),
      ...(opMarginPct    !== null && { operating_margin_pct: opMarginPct }),
    };

    return {
      snapshot,
      revenueHistory: annualHistory(revConcept),
      fcfHistory,
      epsHistory: annualHistory(epsConcept),
    };
  } catch {
    return null;
  }
}
