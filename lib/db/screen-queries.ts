import { prisma } from "@/lib/db/client";

export interface ScreenResultRecord {
  id: string;
  ticker: string;
  companyName: string;
  currency: string;
  price: number;
  marketCap: number | null;
  sector: string | null;
  verdictLabel: string;
  compositeScore: number;
  valuationScore: number;
  healthScore: number;
  qualityScore: number;
  moatScore: number;
  marginOfSafety: number | null;
  pe: number | null;
  pb: number | null;
  ps: number | null;
  evEbitda: number | null;
  priceFcf: number | null;
  grahamNumber: number | null;
  screenerIndex: string;
  screenerAt: Date;
  verdictCaps: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScreenResultFilters {
  screenerIndex?: string;
  sector?: string;
  verdict?: string;
  minCompositeScore?: number;
  marketCapTier?: "micro" | "small" | "mid" | "large" | "mega";
  sortBy?: "compositeScore" | "marginOfSafety" | "ticker";
  sortDir?: "asc" | "desc";
  limit?: number;
}

const MARKET_CAP_RANGES: Record<
  NonNullable<ScreenResultFilters["marketCapTier"]>,
  { gte?: number; lt?: number }
> = {
  micro: { lt: 300_000_000 },
  small: { gte: 300_000_000, lt: 2_000_000_000 },
  mid: { gte: 2_000_000_000, lt: 10_000_000_000 },
  large: { gte: 10_000_000_000, lt: 200_000_000_000 },
  mega: { gte: 200_000_000_000 },
};

export async function upsertScreenResult(data: {
  ticker: string;
  companyName: string;
  currency: string;
  price: number;
  marketCap: number | null;
  sector: string | null;
  verdictLabel: string;
  compositeScore: number;
  valuationScore: number;
  healthScore: number;
  qualityScore: number;
  moatScore: number;
  marginOfSafety: number | null;
  pe: number | null;
  pb: number | null;
  ps: number | null;
  evEbitda: number | null;
  priceFcf: number | null;
  grahamNumber: number | null;
  screenerIndex: string;
  screenerAt: Date;
  verdictCaps?: string | null;
  errorMessage: string | null;
}): Promise<void> {
  await prisma.screenResult.upsert({
    where: {
      ticker_screenerIndex: { ticker: data.ticker, screenerIndex: data.screenerIndex },
    },
    create: data,
    update: data,
  });
}

/** Append-only point-in-time record for backtesting — never updated, only inserted. */
export async function appendScreenSnapshot(data: {
  ticker: string;
  screenerIndex: string;
  screenerAt: Date;
  verdictLabel: string;
  compositeScore: number;
  marginOfSafety: number | null;
  price: number;
  currency: string;
  sector: string | null;
  verdictCaps: string | null;
}): Promise<void> {
  await prisma.screenSnapshot.create({ data });
}

export async function getScreenResults(
  filters: ScreenResultFilters = {},
): Promise<ScreenResultRecord[]> {
  const { screenerIndex, sector, verdict, minCompositeScore, marketCapTier, sortBy = "compositeScore", sortDir = "desc", limit = 500 } = filters;

  const marketCapRange = marketCapTier ? MARKET_CAP_RANGES[marketCapTier] : undefined;

  const rows = await prisma.screenResult.findMany({
    where: {
      ...(screenerIndex ? { screenerIndex } : {}),
      ...(sector ? { sector } : {}),
      ...(verdict ? { verdictLabel: verdict } : {}),
      ...(minCompositeScore !== undefined ? { compositeScore: { gte: minCompositeScore } } : {}),
      ...(marketCapRange
        ? {
            marketCap: {
              not: null,
              ...(marketCapRange.gte !== undefined ? { gte: marketCapRange.gte } : {}),
              ...(marketCapRange.lt !== undefined ? { lt: marketCapRange.lt } : {}),
            },
          }
        : {}),
      errorMessage: null,
    },
    orderBy: { [sortBy]: sortDir },
    take: limit,
  });

  return rows;
}

export async function getScreenResultsCount(): Promise<number> {
  return prisma.screenResult.count({ where: { errorMessage: null } });
}

export async function getScreenMeta(screenerIndex?: string): Promise<{ lastRunAt: Date | null; totalScreened: number; totalErrors: number }> {
  const where = screenerIndex ? { screenerIndex } : {};
  const [latest, totalScreened, totalErrors] = await Promise.all([
    prisma.screenResult.findFirst({ where, orderBy: { screenerAt: "desc" } }),
    prisma.screenResult.count({ where: { ...where, errorMessage: null } }),
    prisma.screenResult.count({ where: { ...where, NOT: { errorMessage: null } } }),
  ]);

  return {
    lastRunAt: latest?.screenerAt ?? null,
    totalScreened,
    totalErrors,
  };
}
