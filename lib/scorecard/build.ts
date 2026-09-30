import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { computeScorecard, type Scorecard } from "@/lib/scorecard/compute";

const PAGE = 20_000;

/** Load every snapshot rating, grade it, and store the result for the page. */
export async function buildScorecard(now: Date = new Date()): Promise<{ ratings: number; builtAt: string }> {
  // Paged so memory stays flat as the history grows (~6,000 rows a week).
  const rows = [];
  let cursor: string | undefined;
  for (;;) {
    const page = await prisma.screenSnapshot.findMany({
      take: PAGE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: {
        id: true, ticker: true, screenerIndex: true, screenerAt: true, verdictLabel: true, compositeScore: true,
        price: true, verdictCaps: true, valuationScore: true, healthScore: true, qualityScore: true, moatScore: true, fairValue: true,
      },
    });
    for (const r of page) {
      rows.push({
        ticker: r.ticker, index: r.screenerIndex, at: r.screenerAt.toISOString(), verdict: r.verdictLabel,
        score: r.compositeScore, price: r.price, caps: r.verdictCaps, valuationScore: r.valuationScore,
        healthScore: r.healthScore, qualityScore: r.qualityScore, moatScore: r.moatScore, fairValue: r.fairValue,
      });
    }
    if (page.length < PAGE) break;
    cursor = page.at(-1)!.id;
  }

  const data = computeScorecard(rows);
  await prisma.scorecardResult.upsert({
    where: { id: "latest" },
    create: { id: "latest", data: data as unknown as Prisma.InputJsonValue, builtAt: now },
    update: { data: data as unknown as Prisma.InputJsonValue, builtAt: now },
  });
  return { ratings: rows.length, builtAt: now.toISOString() };
}

export async function getScorecard(): Promise<{ data: Scorecard; builtAt: string } | null> {
  const row = await prisma.scorecardResult.findUnique({ where: { id: "latest" } });
  return row ? { data: row.data as unknown as Scorecard, builtAt: row.builtAt.toISOString() } : null;
}
