import { readFileSync } from "node:fs";
import { join } from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => {
  const model = () => ({ findMany: vi.fn(), count: vi.fn() });
  return { screenSnapshot: model(), reportArchive: model(), analysis: model(), tickerFate: model(), splitCheck: model(), screenResult: model() };
});
vi.mock("@/lib/db/client", () => ({ prisma: db }));

import { GET } from "@/app/api/backup/route";
import { BACKUP_TABLES, backupPage } from "@/lib/backup/tables";

const call = (query: string, token?: string) =>
  GET(new Request(`https://x.test/api/backup${query}`, { headers: token ? { "x-screen-token": token } : {} }));

beforeEach(() => {
  vi.stubEnv("SCREEN_RUN_TOKEN", "secret");
  for (const m of Object.values(db)) m.count.mockResolvedValue(3);
});

describe("deploys cannot delete data", () => {
  it("never lets the schema sync drop data", () => {
    const build = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8")).buildCommand as string;
    expect(build).toContain("prisma db push");
    expect(build).not.toMatch(/accept-data-loss|force-reset|migrate reset/);
  });

  it("backs up only tables that exist in schema.prisma", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");
    for (const table of Object.keys(BACKUP_TABLES)) expect(schema).toContain(`model ${table} {`);
  });
});

describe("GET /api/backup", () => {
  it("refuses without the workflow token", async () => {
    expect((await call("?table=ScreenSnapshot")).status).toBe(401);
    expect((await call("?table=ScreenSnapshot", "wrong")).status).toBe(401);
    expect(db.screenSnapshot.findMany).not.toHaveBeenCalled();
  });

  it("rejects tables outside the backup list", async () => {
    const res = await call("?table=SimPortfolio", "secret");
    expect(res.status).toBe(400);
    expect((await call("?table=constructor", "secret")).status).toBe(400);
  });

  it("returns row counts with no table", async () => {
    const body = await (await call("", "secret")).json();
    expect(body.counts).toEqual(Object.fromEntries(Object.keys(BACKUP_TABLES).map((t) => [t, 3])));
  });

  it("pages in key order and stops on a short page", async () => {
    db.reportArchive.findMany.mockResolvedValueOnce([{ month: "2026-09" }, { month: "2026-10" }]).mockResolvedValueOnce([{ month: "2026-11" }]);
    const first = await backupPage("ReportArchive", null, 2);
    expect(db.reportArchive.findMany).toHaveBeenLastCalledWith({ take: 2, orderBy: { month: "asc" } });
    expect(first.next).toBe("2026-10");
    const second = await backupPage("ReportArchive", first.next, 2);
    expect(db.reportArchive.findMany).toHaveBeenLastCalledWith({ take: 2, orderBy: { month: "asc" }, cursor: { month: "2026-10" }, skip: 1 });
    expect(second.next).toBeNull();
  });
});
