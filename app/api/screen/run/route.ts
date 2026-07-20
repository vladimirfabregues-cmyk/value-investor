import { runBatchScreen } from "@/lib/screener/batch";
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
import type { BatchScreenEvent } from "@/lib/screener/batch";

export const maxDuration = 300;

export async function POST(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const index = searchParams.get("index") ?? "SP500";

  const companies =
    index === "AIM"        ? AIM_COMPANIES :
    index === "CAC40"      ? CAC40_COMPANIES :
    index === "FTSE100"    ? FTSE100_COMPANIES :
    index === "FTSE250"    ? FTSE250_COMPANIES :
    index === "RUSSELL2000" ? RUSSELL2000_COMPANIES :
    index === "RUSSELLMID" ? RUSSELLMID_COMPANIES :
    index === "SP400"      ? SP400_COMPANIES :
    index === "TOPIXSMALL" ? TOPIXSMALL_COMPANIES :
    index === "EUSC"       ? MSCI_EU_SC_COMPANIES :
    SP500_COMPANIES;

  const encoder = new TextEncoder();

  function sseEvent(event: BatchScreenEvent): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await runBatchScreen(
          (event) => { controller.enqueue(sseEvent(event)); },
          { screenerIndex: index, companies },
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", message })}\n\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
