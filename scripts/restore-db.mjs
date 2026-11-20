// Restores a weekly backup made by scripts/backup-db.mjs. Only ever ADDS rows
// that are missing (skipDuplicates); it never deletes or overwrites anything.
//
//   1. Download the "database-backup" artifact from a Weekly refresh run on GitHub.
//   2. Decrypt it with the SCREEN_RUN_TOKEN value (Vercel → Settings → Environment Variables):
//        openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:SCREEN_RUN_TOKEN \
//          -in backup.tar.gz.enc | tar xz
//   3. Check it:   node scripts/restore-db.mjs backup --dry-run
//   4. Restore:    DATABASE_URL="postgres://…" node scripts/restore-db.mjs backup [Table …]

import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { Prisma, PrismaClient } from "@prisma/client";

const [dir = "backup", ...rest] = process.argv.slice(2);
const dryRun = rest.includes("--dry-run");
const only = rest.filter((a) => !a.startsWith("--"));

const manifest = JSON.parse(readFileSync(`${dir}/manifest.json`, "utf8"));
const tables = Object.keys(manifest.counts).filter((t) => !only.length || only.includes(t));
const models = new Map(Prisma.dmmf.datamodel.models.map((m) => [m.name, m]));

function rowsOf(table) {
  const path = `${dir}/${table}.ndjson.gz`;
  if (!existsSync(path)) throw new Error(`Missing ${path}`);
  return gunzipSync(readFileSync(path)).toString("utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

console.log(`Backup taken ${manifest.takenAt}${dryRun ? " (dry run: nothing is written)" : ""}`);
const prisma = dryRun ? null : new PrismaClient();
try {
  for (const table of tables) {
    const model = models.get(table);
    if (!model) throw new Error(`${table} is not in schema.prisma`);
    // A null in an optional Json column must be sent as Prisma.DbNull.
    const jsonFields = model.fields.filter((f) => f.type === "Json").map((f) => f.name);
    const rows = rowsOf(table).map((r) => {
      for (const f of jsonFields) if (r[f] === null) r[f] = Prisma.DbNull;
      return r;
    });
    if (rows.length !== manifest.counts[table]) throw new Error(`${table}: ${rows.length} rows in file, manifest says ${manifest.counts[table]}`);
    if (dryRun) {
      console.log(`${table}: ${rows.length} rows, readable`);
      continue;
    }
    const delegate = prisma[table[0].toLowerCase() + table.slice(1)];
    let added = 0;
    for (let i = 0; i < rows.length; i += 500) {
      added += (await delegate.createMany({ data: rows.slice(i, i + 500), skipDuplicates: true })).count;
    }
    console.log(`${table}: ${rows.length} in backup, ${added} were missing and have been restored`);
  }
} finally {
  await prisma?.$disconnect();
}
