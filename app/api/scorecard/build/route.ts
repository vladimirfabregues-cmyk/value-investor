import { buildScorecard } from "@/lib/scorecard/build";

export const maxDuration = 60;

/** Rebuild the rating scorecard; called weekly by the scheduler, guarded by the screener token. */
export async function POST(req: Request): Promise<Response> {
  const token = process.env.SCREEN_RUN_TOKEN;
  if (!token || req.headers.get("x-screen-token") !== token) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    return Response.json({ ok: true, ...(await buildScorecard()) });
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "Scorecard build failed" }, { status: 500 });
  }
}
