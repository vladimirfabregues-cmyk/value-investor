/**
 * Weekly backup of the data that cannot be rebuilt.
 *
 * The weekly snapshots are point-in-time records: a rating made in October can
 * never be re-made later with only what was known in October. Frozen monthly
 * reports, saved analyses and company fates are the same. Everything else
 * (portfolios, scorecard, price cache) is rebuilt from these plus Yahoo, so it
 * is left out to keep the backup small.
 *
 * The weekly workflow pages through each table with GET /api/backup, encrypts
 * the result and keeps it as a GitHub artifact (scripts/backup-db.mjs);
 * scripts/restore-db.mjs puts it back.
 */

import { prisma } from "@/lib/db/client";

/** Table name (as in schema.prisma) → its primary-key field. */
export const BACKUP_TABLES = {
  ScreenSnapshot: "id",
  ReportArchive: "month",
  Analysis: "id",
  TickerFate: "ticker",
  SplitCheck: "ticker",
  ScreenResult: "id",
} as const;

export type BackupTable = keyof typeof BACKUP_TABLES;

/** Rows per page: well under Vercel's 4.5 MB response limit for the widest table. */
export const PAGE_SIZE = 2000;

export const isBackupTable = (t: string | null): t is BackupTable => t !== null && Object.hasOwn(BACKUP_TABLES, t);

type Delegate = {
  findMany(args: { take: number; skip?: number; cursor?: Record<string, string>; orderBy: Record<string, "asc"> }): Promise<Record<string, unknown>[]>;
  count(): Promise<number>;
};

const delegate = (table: BackupTable) => {
  const name = table[0].toLowerCase() + table.slice(1);
  return (prisma as unknown as Record<string, Delegate>)[name];
};

/** One page of a table in key order, and the key to continue from (null at the end). */
export async function backupPage(table: BackupTable, after: string | null, take = PAGE_SIZE) {
  const key = BACKUP_TABLES[table];
  const rows = await delegate(table).findMany({
    take,
    orderBy: { [key]: "asc" },
    ...(after ? { cursor: { [key]: after }, skip: 1 } : {}),
  });
  const next = rows.length === take ? String(rows.at(-1)![key]) : null;
  return { table, rows, next };
}

export async function backupCounts(): Promise<Record<BackupTable, number>> {
  const out = {} as Record<BackupTable, number>;
  for (const t of Object.keys(BACKUP_TABLES) as BackupTable[]) out[t] = await delegate(t).count();
  return out;
}
