import { archiveMonthlyReport, previousMonth } from "@/lib/report/data";

export const maxDuration = 60;

/** Freeze a month's report figures (default: last month). Called by the monthly report workflow. */
export async function POST(req: Request): Promise<Response> {
  const token = process.env.SCREEN_RUN_TOKEN;
  if (!token || req.headers.get("x-screen-token") !== token) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const asked = new URL(req.url).searchParams.get("month");
  const month = asked && /^\d{4}-\d{2}$/.test(asked) ? asked : previousMonth();
  try {
    const report = await archiveMonthlyReport(month);
    return Response.json({ ok: true, month, books: report.books.length });
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "Report archive failed" }, { status: 500 });
  }
}
