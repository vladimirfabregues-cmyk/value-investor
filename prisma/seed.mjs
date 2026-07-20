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
  const existing = await prisma.screenResult.count();
  if (existing > 0) {
    console.log(`[seed] ScreenResult already has ${existing} rows — skipping seed.`);
    return;
  }

  const screenResults = load("ScreenResult");
  const screenSnapshots = load("ScreenSnapshot");
  const analyses = load("Analysis");
  console.log(`[seed] loading ${screenResults.length} results, ${screenSnapshots.length} snapshots, ${analyses.length} analyses…`);

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

  console.log("[seed] done.");
}

main()
  .catch((e) => {
    console.error("[seed] failed:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
