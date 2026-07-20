import { NextResponse } from "next/server";

import { getHistorySummaries } from "@/lib/db/queries";
import type { HistoryResponse } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getHistorySummaries();

  return NextResponse.json<HistoryResponse>({
    items,
  });
}
