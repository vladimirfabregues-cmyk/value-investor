// Weekly backup: downloads every irreplaceable table from GET /api/backup into
// backup/<Table>.ndjson.gz plus backup/manifest.json. The workflow then
// encrypts the folder and keeps it as a GitHub artifact.
//
// Env: SCREEN_RUN_URL (…/api/screen/run, as for the other steps), SCREEN_RUN_TOKEN.
// Fails (exit 1) if any table comes back short, so a broken backup is noticed.

import { createWriteStream, mkdirSync, writeFileSync } from "node:fs";
import { createGzip } from "node:zlib";
import { once } from "node:events";

const runUrl = process.env.SCREEN_RUN_URL;
const token = process.env.SCREEN_RUN_TOKEN;
if (!runUrl || !token) {
  console.error("SCREEN_RUN_URL and SCREEN_RUN_TOKEN are required.");
  process.exit(1);
}
const endpoint = runUrl.replace(/\/api\/screen\/run\/?$/, "/api/backup");
const OUT = process.argv[2] ?? "backup";

async function get(params) {
  const url = `${endpoint}?${new URLSearchParams(params)}`;
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { "x-screen-token": token }, signal: AbortSignal.timeout(90_000) });
      const body = await res.json();
      if (res.ok && body.ok) return body;
      if (res.status === 401 || res.status === 400) throw new Error(`${res.status} ${body.error ?? ""}`);
      throw Object.assign(new Error(`HTTP ${res.status} ${body.error ?? ""}`), { retry: true });
    } catch (err) {
      const retry = err.retry || err.name === "TimeoutError" || err.name === "TypeError";
      if (!retry || attempt >= 4) throw err;
      console.log(`  retrying (${err.message})…`);
      await new Promise((r) => setTimeout(r, 15_000 * attempt));
    }
  }
}

mkdirSync(OUT, { recursive: true });
const { counts } = await get({});
console.log("Rows on the server:", counts);

const written = {};
for (const table of Object.keys(counts)) {
  const gz = createGzip();
  const file = createWriteStream(`${OUT}/${table}.ndjson.gz`);
  gz.pipe(file);
  let after = null;
  let n = 0;
  do {
    const page = await get(after ? { table, after } : { table });
    for (const row of page.rows) {
      if (!gz.write(JSON.stringify(row) + "\n")) await once(gz, "drain");
    }
    n += page.rows.length;
    after = page.next;
  } while (after);
  gz.end();
  await once(file, "finish");
  written[table] = n;
  console.log(`${table}: ${n} rows`);
}

writeFileSync(`${OUT}/manifest.json`, JSON.stringify({ takenAt: new Date().toISOString(), counts: written }, null, 2));

// Rows only ever get added during a backup, so fewer than counted means pages went missing.
const short = Object.keys(counts).filter((t) => written[t] < counts[t]);
if (short.length) {
  console.error(`Backup incomplete for: ${short.join(", ")}`);
  process.exit(1);
}
console.log("Backup complete.");
