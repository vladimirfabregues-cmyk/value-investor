import { getFinanceProvider } from "@/lib/finance/mock-provider";
import { calculateValueMetrics } from "@/lib/finance/scoring";
import { appendScreenSnapshot, upsertScreenResult } from "@/lib/db/screen-queries";
import { SP500_COMPANIES } from "@/lib/screener/sp500";
import type { ScreenableCompany } from "@/lib/screener/cac40";

export interface BatchScreenProgress {
  type: "progress";
  processed: number;
  total: number;
  ticker: string;
  status: "ok" | "error";
  message?: string;
}

export interface BatchScreenComplete {
  type: "complete";
  processed: number;
  errors: number;
  total: number;
  durationMs: number;
}

export type BatchScreenEvent = BatchScreenProgress | BatchScreenComplete;

const BATCH_SIZE = 2;
const BATCH_DELAY_MS = 1500;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 2000): Promise<T> {
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

export async function runBatchScreen(
  onEvent: (event: BatchScreenEvent) => void,
  options: { screenerIndex?: string; companies?: ScreenableCompany[] } = {},
): Promise<void> {
  const {
    screenerIndex = "SP500",
    companies = SP500_COMPANIES,
  } = options;

  const provider = getFinanceProvider();
  const startTime = Date.now();
  const total = companies.length;
  let processed = 0;
  let errors = 0;
  const screenerAt = new Date();

  const sectorMap = new Map(companies.map((c) => [c.ticker, c.sector]));

  for (let i = 0; i < companies.length; i += BATCH_SIZE) {
    const batch = companies.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async ({ ticker, sector }) => {
        try {
          const dataset = await withRetry(() => provider.getCompanySnapshot(ticker));
          // Use sector from the dataset (Yahoo summaryProfile) with company list as fallback
          const effectiveSector = dataset.sector ?? sector;
          const metrics = calculateValueMetrics(dataset, undefined, effectiveSector);

          await upsertScreenResult({
            ticker: dataset.ticker,
            companyName: dataset.company_name,
            currency: dataset.currency,
            price: dataset.price,
            marketCap: dataset.market_cap > 0 ? dataset.market_cap : null,
            // Prefer Yahoo's live sector; constituent lists may carry "Unknown"
            sector: dataset.sector ?? sectorMap.get(dataset.ticker) ?? sector,
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
            verdictCaps: metrics.diagnostics.verdict_caps.length > 0
              ? metrics.diagnostics.verdict_caps.join(",")
              : null,
            errorMessage: null,
          });

          // Point-in-time record for backtesting (append-only, never updated)
          await appendScreenSnapshot({
            ticker: dataset.ticker,
            screenerIndex,
            screenerAt,
            verdictLabel: metrics.suggested_verdict,
            compositeScore: metrics.composite_score,
            marginOfSafety: metrics.intrinsic_value.margin_of_safety_pct,
            price: dataset.price,
            currency: dataset.currency,
            sector: sectorMap.get(dataset.ticker) ?? sector ?? null,
            verdictCaps: metrics.diagnostics.verdict_caps.length > 0
              ? metrics.diagnostics.verdict_caps.join(",")
              : null,
          });

          processed++;
          onEvent({ type: "progress", processed, total, ticker: dataset.ticker, status: "ok" });
        } catch (err) {
          errors++;
          processed++;
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
          });

          onEvent({ type: "progress", processed, total, ticker, status: "error", message });
        }
      }),
    );

    if (i + BATCH_SIZE < companies.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  onEvent({
    type: "complete",
    processed,
    errors,
    total,
    durationMs: Date.now() - startTime,
  });
}
