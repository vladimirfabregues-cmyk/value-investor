// One-time data migration: loads the exported SQLite rows into the cloud
// Postgres database on first deploy. Idempotent — if the tables already have
// rows it does nothing, so it's safe to run on every build.
//
// Run automatically by the Vercel build command (see vercel.json).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "seed-data");

const load = (name) => {
  const path = join(dataDir, `${name}.json`);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : [];
};

// SQLite stored DateTime as Unix milliseconds; Postgres wants Date objects.
const toDate = (ms) => (ms == null ? null : new Date(Number(ms)));

async function chunkedCreate(model, rows, mapRow, size = 500) {
  for (let i = 0; i < rows.length; i += size) {
    const batch = rows.slice(i, i + size).map(mapRow);
    await model.createMany({ data: batch, skipDuplicates: true });
  }
}

async function main() {
  const screenResults = load("ScreenResult");
  const screenSnapshots = load("ScreenSnapshot");
  const analyses = load("Analysis");

  // ScreenResult: gap-fill per index. Insert an index's rows only if the cloud
  // DB has none for it yet — so newly-added markets (e.g. a later SP500/AIM
  // backfill) land on the next deploy without touching markets already present.
  const byIndex = new Map();
  for (const r of screenResults) {
    if (!byIndex.has(r.screenerIndex)) byIndex.set(r.screenerIndex, []);
    byIndex.get(r.screenerIndex).push(r);
  }
  for (const [index, rows] of byIndex) {
    const have = await prisma.screenResult.count({ where: { screenerIndex: index } });
    if (have > 0) {
      console.log(`[seed] ${index}: ${have} rows present — skipping.`);
      continue;
    }
    console.log(`[seed] ${index}: inserting ${rows.length} rows…`);
    await seedScreenResults(rows);
  }

  // Snapshots and analyses: seed only when their table is entirely empty.
  if ((await prisma.screenSnapshot.count()) === 0 && screenSnapshots.length > 0) {
    console.log(`[seed] inserting ${screenSnapshots.length} snapshots…`);
    await seedSnapshots(screenSnapshots);
  }
  if ((await prisma.analysis.count()) === 0 && analyses.length > 0) {
    console.log(`[seed] inserting ${analyses.length} analyses…`);
    await seedAnalyses(analyses);
  }

  console.log("[seed] done.");
}

async function seedScreenResults(screenResults) {
  await chunkedCreate(prisma.screenResult, screenResults, (r) => ({
    id: r.id,
    ticker: r.ticker,
    companyName: r.companyName,
    currency: r.currency,
    price: r.price,
    marketCap: r.marketCap,
    sector: r.sector,
    verdictLabel: r.verdictLabel,
    compositeScore: r.compositeScore,
    valuationScore: r.valuationScore,
    healthScore: r.healthScore,
    qualityScore: r.qualityScore,
    moatScore: r.moatScore,
    marginOfSafety: r.marginOfSafety,
    pe: r.pe, pb: r.pb, ps: r.ps,
    evEbitda: r.evEbitda, priceFcf: r.priceFcf, grahamNumber: r.grahamNumber,
    screenerIndex: r.screenerIndex,
    screenerAt: toDate(r.screenerAt),
    verdictCaps: r.verdictCaps,
    errorMessage: r.errorMessage,
    createdAt: toDate(r.createdAt),
    updatedAt: toDate(r.updatedAt),
  }));
}

async function seedSnapshots(screenSnapshots) {
  await chunkedCreate(prisma.screenSnapshot, screenSnapshots, (r) => ({
    id: r.id,
    ticker: r.ticker,
    screenerIndex: r.screenerIndex,
    screenerAt: toDate(r.screenerAt),
    verdictLabel: r.verdictLabel,
    compositeScore: r.compositeScore,
    marginOfSafety: r.marginOfSafety,
    price: r.price,
    currency: r.currency,
    sector: r.sector,
    verdictCaps: r.verdictCaps,
    createdAt: toDate(r.createdAt),
  }));
}

async function seedAnalyses(analyses) {
  await chunkedCreate(prisma.analysis, analyses, (r) => ({
    id: r.id,
    ticker: r.ticker,
    companyName: r.companyName,
    currency: r.currency,
    currentPrice: r.currentPrice,
    analysisDate: toDate(r.analysisDate),
    finalVerdictLabel: r.finalVerdictLabel,
    confidencePct: r.confidencePct,
    marginOfSafetyPct: r.marginOfSafetyPct,
    oneLineVerdict: r.oneLineVerdict,
    // fullJson was exported as a stringified JSON — parse back to an object
    fullJson: typeof r.fullJson === "string" ? JSON.parse(r.fullJson) : r.fullJson,
    createdAt: toDate(r.createdAt),
    updatedAt: toDate(r.updatedAt),
  }));
}

main()
  .catch((e) => {
    console.error("[seed] failed:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
