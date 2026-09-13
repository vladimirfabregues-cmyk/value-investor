import { buildPortfolios } from "@/lib/portfolio/build";

// The build fetches price history only for names that were ever Strong Buy, so
// it is a short job — but give it the full serverless ceiling for headroom.
export const maxDuration = 60;

/**
 * Rebuild the simulated Strong-Buy portfolios from the screener snapshot
 * history and persist them.
 *
 * Triggered by the scheduled background job after the screener refresh, never
 * by visitors — it is guarded by the same shared secret as /api/screen/run so
 * the scheduler needs no additional credential, and in particular no database
 * URL outside Vercel.
 */
export async function POST(req: Request): Promise<Response> {
  const token = process.env.SCREEN_RUN_TOKEN;
  if (!token || req.headers.get("x-screen-token") !== token) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { inception, today, tickers } = await buildPortfolios();
    return Response.json({ ok: true, inception, today, tickers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portfolio build failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
