import { getFinanceProvider } from "@/lib/finance/mock-provider";
import { calculateValueMetrics } from "@/lib/finance/scoring";
import { appendScreenSnapshot, upsertScreenResult } from "@/lib/db/screen-queries";
import type { ScreenableCompany } from "@/lib/screener/cac40";

/**
 * The screen is run in bounded chunks, driven by the client, so each request
 * finishes well inside the serverless time limit and the whole universe
 * completes across many short calls rather than one long one that gets killed.
 */
export interface ChunkResult {
  processed: number;
  errors: number;
  lastTicker: string;
}

/** How many companies are fetched at once within a chunk. */
const CONCURRENCY = 6;
/** A short stagger between waves keeps the upstream provider from throttling. */
const WAVE_STAGGER_MS = 150;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1200): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(delayMs * (attempt + 1));
    }
  }
  throw new Error("unreachable");
}

/** Fetch, score and persist a single company. Returns whether it succeeded. */
async function screenCompany(
  company: ScreenableCompany,
  screenerIndex: string,
  screenerAt: Date,
): Promise<boolean> {
  const provider = getFinanceProvider();
  const { ticker, sector } = company;
  try {
    const dataset = await withRetry(() => provider.getCompanySnapshot(ticker));
    const effectiveSector = dataset.sector ?? sector;
    const metrics = calculateValueMetrics(dataset, undefined, effectiveSector);

    // The two writes are independent, so run them together.
    await Promise.all([
      upsertScreenResult({
        ticker: dataset.ticker,
        companyName: dataset.company_name,
        currency: dataset.currency,
        price: dataset.price,
        marketCap: dataset.market_cap > 0 ? dataset.market_cap : null,
        sector: dataset.sector ?? sector,
        screenerIndex,
        verdictLabel: metrics.suggested_verdict,
        compositeScore: metrics.composite_score,
        valuationScore: metrics.valuation.valuation_score,
        healthScore: metrics.financial_health.health_score,
        qualityScore: metrics.business_quality.quality_score,
        moatScore: metrics.business_quality.moat_score,
        marginOfSafety: metrics.intrinsic_value.margin_of_safety_pct,
        pe: metrics.valuation.pe,
        pb: metrics.valuation.pb,
        ps: metrics.valuation.ps,
        evEbitda: metrics.valuation.ev_ebitda,
        priceFcf: metrics.valuation.price_fcf,
        grahamNumber: metrics.valuation.graham_number,
        screenerAt,
        verdictCaps:
          metrics.diagnostics.verdict_caps.length > 0
            ? metrics.diagnostics.verdict_caps.join(",")
            : null,
        errorMessage: null,
      }),
      appendScreenSnapshot({
        ticker: dataset.ticker,
        screenerIndex,
        screenerAt,
        verdictLabel: metrics.suggested_verdict,
        compositeScore: metrics.composite_score,
        marginOfSafety: metrics.intrinsic_value.margin_of_safety_pct,
        price: dataset.price,
        currency: dataset.currency,
        sector: dataset.sector ?? sector ?? null,
        verdictCaps:
          metrics.diagnostics.verdict_caps.length > 0
            ? metrics.diagnostics.verdict_caps.join(",")
            : null,
      }),
    ]);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await upsertScreenResult({
      ticker,
      companyName: ticker,
      currency: "EUR",
      price: 0,
      marketCap: null,
      sector,
      screenerIndex,
      verdictLabel: "UNKNOWN",
      compositeScore: 0,
      valuationScore: 0,
      healthScore: 0,
      qualityScore: 0,
      moatScore: 0,
      marginOfSafety: null,
      pe: null,
      pb: null,
      ps: null,
      evEbitda: null,
      priceFcf: null,
      grahamNumber: null,
      screenerAt,
      errorMessage: message,
    }).catch(() => {
      /* a failed error-row write must not abort the chunk */
    });
    return false;
  }
}

/**
 * Screen one bounded slice `[offset, offset + limit)` of a universe, fetching
 * `CONCURRENCY` companies at a time. `screenerAt` is supplied by the caller and
 * shared across every chunk of a run so the rows carry one consistent run time.
 */
export async function runScreenChunk(options: {
  companies: ScreenableCompany[];
  offset: number;
  limit: number;
  screenerIndex: string;
  screenerAt: Date;
}): Promise<ChunkResult> {
  const { companies, offset, limit, screenerIndex, screenerAt } = options;
  const slice = companies.slice(offset, offset + limit);

  let processed = 0;
  let errors = 0;
  let lastTicker = "";

  for (let i = 0; i < slice.length; i += CONCURRENCY) {
    const wave = slice.slice(i, i + CONCURRENCY);
    const outcomes = await Promise.all(
      wave.map(async (company) => ({ ok: await screenCompany(company, screenerIndex, screenerAt), ticker: company.ticker })),
    );
    for (const outcome of outcomes) {
      processed++;
      if (!outcome.ok) errors++;
      lastTicker = outcome.ticker;
    }
    if (i + CONCURRENCY < slice.length) await sleep(WAVE_STAGGER_MS);
  }

  return { processed, errors, lastTicker };
}
