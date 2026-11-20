import { backupCounts, backupPage, isBackupTable } from "@/lib/backup/tables";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Read-only export for the weekly backup (scripts/backup-db.mjs).
 * GET ?table=ScreenSnapshot&after=<key> → { table, rows, next }; no table → row counts.
 * Needs the same x-screen-token as the other workflow endpoints.
 */
export async function GET(req: Request): Promise<Response> {
  const token = process.env.SCREEN_RUN_TOKEN;
  if (!token || req.headers.get("x-screen-token") !== token) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const params = new URL(req.url).searchParams;
  const table = params.get("table");
  try {
    if (table === null) return Response.json({ ok: true, counts: await backupCounts() });
    if (!isBackupTable(table)) return Response.json({ ok: false, error: `Unknown table ${table}` }, { status: 400 });
    return Response.json({ ok: true, ...(await backupPage(table, params.get("after"))) });
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "Backup failed" }, { status: 500 });
  }
}
