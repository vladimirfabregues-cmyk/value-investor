import { NextResponse, type NextRequest } from "next/server";

import { findLatestSummaryBySecurity } from "@/lib/db/queries";
import { exchangeByCode } from "@/lib/finance/exchanges";
import type { SecurityLookupResponse } from "@/types/api";

export const dynamic = "force-dynamic";

/**
 * The most recent saved analysis of one security, or `null`.
 *
 * The Compare page uses this to answer a question the history list alone
 * cannot: the user has searched the whole supported universe and picked a
 * company — has it ever been analysed? A miss is a normal, expected answer,
 * not an error, so it returns 200 with `analysis: null`.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ticker = (req.nextUrl.searchParams.get("ticker") ?? "").trim();
  const exchangeParam = req.nextUrl.searchParams.get("exchange");

  if (!ticker) {
    return NextResponse.json({ error: "A ticker is required." }, { status: 400 });
  }

  // An unrecognised market is inferred from the ticker suffix downstream
  // rather than rejected, which keeps older links working.
  const exchange = exchangeByCode(exchangeParam)?.code ?? null;

  try {
    const analysis = await findLatestSummaryBySecurity(ticker, exchange);
    return NextResponse.json<SecurityLookupResponse>({ analysis });
  } catch (error) {
    console.error("Security lookup failed", error);
    return NextResponse.json(
      { error: "Unable to look up saved analyses for this company." },
      { status: 500 },
    );
  }
}
