#!/usr/bin/env node
/**
 * Refresh the Market Screener cache.
 *
 * Walks each index's universe through the guarded POST /api/screen/run endpoint
 * in chunks — the same work the app used to do on demand — so the ScreenResult
 * cache stays fresh WITHOUT any visitor triggering the long run. Intended to be
 * run on a schedule by GitHub Actions (.github/workflows/refresh-screen.yml).
 *
 * Env:
 *   SCREEN_RUN_URL   full endpoint URL, e.g. https://<app>/api/screen/run
 *   SCREEN_RUN_TOKEN shared secret matching the server's SCREEN_RUN_TOKEN
 *   SCREEN_INDICES   optional CSV to limit which indices run (blank = all)
 */

const BASE = process.env.SCREEN_RUN_URL;
const TOKEN = process.env.SCREEN_RUN_TOKEN;
const ONLY = process.env.SCREEN_INDICES;

// Every index the app can screen (see app/api/screen/run/route.ts).
const ALL_INDICES = [
  "SP500", "SP400", "RUSSELLMID", "RUSSELL2000",
  "FTSE100", "FTSE250", "AIM", "CAC40", "EUSC", "TOPIXSMALL",
];

const CHUNK_TIMEOUT_MS = 90_000; // a chunk caps at the serverless 60s + slack
const MAX_ATTEMPTS = 3;

if (!BASE || !TOKEN) {
  console.error("Missing SCREEN_RUN_URL or SCREEN_RUN_TOKEN");
  process.exit(1);
}

const indices = ONLY
  ? ONLY.split(",").map((s) => s.trim()).filter(Boolean)
  : ALL_INDICES;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function postChunk(index, offset, at) {
  const url = `${BASE}?index=${encodeURIComponent(index)}&offset=${offset}&at=${encodeURIComponent(at)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "x-screen-token": TOKEN },
    signal: AbortSignal.timeout(CHUNK_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error ?? "run failed");
  return data;
}

async function runIndex(index) {
  // One run timestamp per index, so all its rows read as a single run.
  const at = new Date().toISOString();
  let offset = 0;
  let total = 0;
  let dataErrors = 0;
  let chunks = 0;

  for (;;) {
    let data;
    for (let attempt = 1; ; attempt += 1) {
      try {
        data = await postChunk(index, offset, at);
        break;
      } catch (err) {
        if (attempt >= MAX_ATTEMPTS) throw err;
        console.warn(`  ${index} @${offset} failed (${err.message}); retry ${attempt}/${MAX_ATTEMPTS - 1}`);
        await sleep(3000 * attempt);
      }
    }

    total = data.total;
    dataErrors += data.errors ?? 0;
    offset = data.nextOffset;
    chunks += 1;
    if (chunks % 10 === 0 || data.done) {
      console.log(`  ${index}: ${offset}/${total} (${dataErrors} data errors)`);
    }
    if (data.done) break;
  }

  return { total, dataErrors };
}

const startedAt = Date.now();
let failed = 0;

for (const index of indices) {
  console.log(`> ${index}`);
  try {
    const { total, dataErrors } = await runIndex(index);
    console.log(`OK ${index}: ${total} companies, ${dataErrors} data errors`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL ${index}: ${err.message}`);
  }
}

const mins = ((Date.now() - startedAt) / 60000).toFixed(1);
console.log(`Done in ${mins} min. ${failed} index(es) failed.`);
process.exit(failed > 0 ? 1 : 0);
