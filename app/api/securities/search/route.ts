import { NextResponse, type NextRequest } from "next/server";
import YahooFinance from "yahoo-finance2";

import { prisma } from "@/lib/db/client";
import {
  fromProviderQuote,
  fromScreenedRow,
  rankResults,
  type SecuritySearchResult,
} from "@/lib/finance/security-search";
import { exchangeByCode } from "@/lib/finance/exchanges";

export const dynamic = "force-dynamic";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

/** Provider search is best-effort; a slow lookup must not block the response. */
const PROVIDER_TIMEOUT_MS = 3500;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]).catch(() => null);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const query = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const exchangeParam = req.nextUrl.searchParams.get("exchange");
  const exchange = exchangeByCode(exchangeParam)?.code ?? null;

  if (query.length < 1) {
    return NextResponse.json({ results: [], query, exchange });
  }

  const candidates: SecuritySearchResult[] = [];

  // 1. Our own screened universe — fast, has company names, no external call.
  try {
    const rows = await prisma.screenResult.findMany({
      where: {
        errorMessage: null,
        OR: [
          { ticker: { startsWith: query, mode: "insensitive" } },
          { companyName: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { ticker: true, companyName: true, sector: true, currency: true },
      take: 60,
      distinct: ["ticker"],
    });
    for (const row of rows) {
      const result = fromScreenedRow(row);
      if (result) candidates.push(result);
    }
  } catch {
    // Database unavailable — fall through to the provider alone.
  }

  // 2. The provider, for anything outside the screened universe.
  const providerResult = await withTimeout(
    yf.search(query, { quotesCount: 15, newsCount: 0 }, { validateResult: false }) as Promise<{
      quotes?: unknown[];
    }>,
    PROVIDER_TIMEOUT_MS,
  );
  if (providerResult?.quotes) {
    for (const quote of providerResult.quotes) {
      const result = fromProviderQuote(quote as Parameters<typeof fromProviderQuote>[0]);
      if (result) candidates.push(result);
    }
  }

  const results = rankResults(candidates, { query, exchange, limit: 10 });

  return NextResponse.json({ results, query, exchange });
}
