import { NextResponse, type NextRequest } from "next/server";

import { getScreenResults, getScreenMeta } from "@/lib/db/screen-queries";
import type { ScreenResultFilters } from "@/lib/db/screen-queries";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;

  const filters: ScreenResultFilters = {
    screenerIndex: searchParams.get("index") ?? "SP500",
    sector: searchParams.get("sector") ?? undefined,
    verdict: searchParams.get("verdict") ?? undefined,
    verdicts: searchParams.get("verdicts")
      ? searchParams.get("verdicts")!.split(",").filter(Boolean)
      : undefined,
    minCompositeScore: searchParams.has("minScore")
      ? Number(searchParams.get("minScore"))
      : undefined,
    marketCapTier: (searchParams.get("marketCap") as ScreenResultFilters["marketCapTier"]) ?? undefined,
    sortBy: (searchParams.get("sortBy") as ScreenResultFilters["sortBy"]) ?? "compositeScore",
    sortDir: (searchParams.get("sortDir") as ScreenResultFilters["sortDir"]) ?? "desc",
    limit: searchParams.has("limit") ? Number(searchParams.get("limit")) : 500,
  };

  const [results, meta] = await Promise.all([
    getScreenResults(filters),
    getScreenMeta(filters.screenerIndex),
  ]);

  return NextResponse.json({ results, meta });
}
