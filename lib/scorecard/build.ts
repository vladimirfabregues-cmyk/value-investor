import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { adjustForSplits, computeScorecard, findVanished, splitCandidates, type ScoreRow, type Scorecard } from "@/lib/scorecard/compute";
import { resolveFates } from "@/lib/scorecard/fates";
import { resolveSplits } from "@/lib/scorecard/splits";

const PAGE = 20_000;
/** Yahoo look-ups stop at these points (ms from start), leaving time to compute and save. */
const SPLIT_BUDGET_MS = 18_000;
const FATE_BUDGET_MS = 32_000;

/** Load every snapshot rating, grade it, and store the result for the page. */
export async function buildScorecard(
  now: Date = new Date(),
): Promise<{ ratings: number; builtAt: string; splits: number; vanished: number; fates: number }> {
  const started = Date.now();
  // Paged so memory stays flat as the history grows (~6,000 rows a week).
  const rows: ScoreRow[] = [];
  let cursor: string | undefined;
  for (;;) {
    const page = await prisma.screenSnapshot.findMany({
      take: PAGE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: {
        id: true, ticker: true, screenerIndex: true, screenerAt: true, verdictLabel: true, compositeScore: true,
        price: true, verdictCaps: true, valuationScore: true, healthScore: true, qualityScore: true, moatScore: true, fairValue: true,
        dividendYield: true, marginOfSafety: true, sector: true,
      },
    });
    for (const r of page) {
      rows.push({
        ticker: r.ticker, index: r.screenerIndex, at: r.screenerAt.toISOString(), verdict: r.verdictLabel,
        score: r.compositeScore, price: r.price, caps: r.verdictCaps, valuationScore: r.valuationScore,
        healthScore: r.healthScore, qualityScore: r.qualityScore, moatScore: r.moatScore, fairValue: r.fairValue,
        dividendYield: r.dividendYield, marginOfSafety: r.marginOfSafety, sector: r.sector,
      });
    }
    if (page.length < PAGE) break;
    cursor = page.at(-1)!.id;
  }

  const splits = await resolveSplits(splitCandidates(rows), started + SPLIT_BUDGET_MS);
  const adjusted = adjustForSplits(rows, splits);
  const vanished = findVanished(adjusted);
  const fates = await resolveFates(vanished, started + FATE_BUDGET_MS);
  const data = computeScorecard(adjusted, fates);
  await prisma.scorecardResult.upsert({
    where: { id: "latest" },
    create: { id: "latest", data: data as unknown as Prisma.InputJsonValue, builtAt: now },
    update: { data: data as unknown as Prisma.InputJsonValue, builtAt: now },
  });
  return { ratings: rows.length, builtAt: now.toISOString(), splits: splits.size, vanished: vanished.length, fates: fates.size };
}

export async function getScorecard(): Promise<{ data: Scorecard; builtAt: string } | null> {
  const row = await prisma.scorecardResult.findUnique({ where: { id: "latest" } });
  return row ? { data: row.data as unknown as Scorecard, builtAt: row.builtAt.toISOString() } : null;
}
