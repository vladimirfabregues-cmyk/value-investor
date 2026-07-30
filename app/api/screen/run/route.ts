import { runScreenChunk } from "@/lib/screener/batch";
import { AIM_COMPANIES } from "@/lib/screener/aim";
import { CAC40_COMPANIES } from "@/lib/screener/cac40";
import { FTSE100_COMPANIES } from "@/lib/screener/ftse100";
import { FTSE250_COMPANIES } from "@/lib/screener/ftse250";
import { MSCI_EU_SC_COMPANIES } from "@/lib/screener/msci_eu_sc";
import { RUSSELL2000_COMPANIES } from "@/lib/screener/russell2000";
import { RUSSELLMID_COMPANIES } from "@/lib/screener/russellmid";
import { SP400_COMPANIES } from "@/lib/screener/sp400";
import { SP500_COMPANIES } from "@/lib/screener/sp500";
import { TOPIXSMALL_COMPANIES } from "@/lib/screener/topixsmall";
import type { ScreenableCompany } from "@/lib/screener/cac40";

// Kept within the free serverless ceiling; the client walks the universe in
// chunks, so no single request needs to run long.
export const maxDuration = 60;

/** Companies processed per request — a chunk sized to finish comfortably in time. */
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 60;

const UNIVERSES: Record<string, ScreenableCompany[]> = {
  AIM: AIM_COMPANIES,
  CAC40: CAC40_COMPANIES,
  FTSE100: FTSE100_COMPANIES,
  FTSE250: FTSE250_COMPANIES,
  RUSSELL2000: RUSSELL2000_COMPANIES,
  RUSSELLMID: RUSSELLMID_COMPANIES,
  SP400: SP400_COMPANIES,
  TOPIXSMALL: TOPIXSMALL_COMPANIES,
  EUSC: MSCI_EU_SC_COMPANIES,
  SP500: SP500_COMPANIES,
};

export async function POST(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const index = searchParams.get("index") ?? "SP500";
  const companies = UNIVERSES[index] ?? SP500_COMPANIES;

  const offset = Math.max(0, Number.parseInt(searchParams.get("offset") ?? "0", 10) || 0);
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(MAX_LIMIT, Math.max(1, limitParam))
    : DEFAULT_LIMIT;

  // One run time, shared across every chunk, so the rows read as a single run.
  const atParam = searchParams.get("at");
  const parsedAt = atParam ? new Date(atParam) : new Date();
  const screenerAt = Number.isNaN(parsedAt.getTime()) ? new Date() : parsedAt;

  const total = companies.length;

  try {
    const { processed, errors, lastTicker } = await runScreenChunk({
      companies,
      offset,
      limit,
      screenerIndex: index,
      screenerAt,
    });

    const nextOffset = offset + processed;
    return Response.json({
      ok: true,
      index,
      total,
      processed,
      errors,
      lastTicker,
      nextOffset,
      done: nextOffset >= total,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
