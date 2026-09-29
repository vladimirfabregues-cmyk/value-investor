import { BuildPendingError, buildPortfolios } from "@/lib/portfolio/build";

// Downloads stop well before this (see DOWNLOAD_BUDGET_MS) and resume on the
// next call from the price cache, so one call never needs the full ceiling.
export const maxDuration = 60;

/**
 * Rebuild the simulated portfolios from the screener snapshot history and
 * persist them.
 *
 * Triggered by the scheduled background job after the screener refresh, never
 * by visitors — it is guarded by the same shared secret as /api/screen/run so
 * the scheduler needs no additional credential, and in particular no database
 * URL outside Vercel.
 *
 * 503 = market data still loading or temporarily unavailable; nothing was
 * saved and calling again later finishes the job.
 */
export async function POST(req: Request): Promise<Response> {
  const token = process.env.SCREEN_RUN_TOKEN;
  if (!token || req.headers.get("x-screen-token") !== token) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await buildPortfolios();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portfolio build failed";
    const status = err instanceof BuildPendingError ? 503 : 500;
    return Response.json({ ok: false, error: message }, { status });
  }
}
