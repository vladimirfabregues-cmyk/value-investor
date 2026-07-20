import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import {
  savedAnalysisSummarySchema,
  valueInvestingAnalysisSchema,
} from "@/lib/validation/analysis";
import type {
  SavedAnalysisRecord,
  SavedAnalysisSummary,
  ValueInvestingAnalysis,
} from "@/types/analysis";

function mapSummary(row: {
  id: string;
  ticker: string;
  companyName: string;
  analysisDate: Date;
  finalVerdictLabel: string;
  confidencePct: number;
  marginOfSafetyPct: number | null;
  oneLineVerdict: string;
  createdAt: Date;
}): SavedAnalysisSummary {
  return {
    id: row.id,
    ticker: row.ticker,
    companyName: row.companyName,
    analysisDate: row.analysisDate.toISOString(),
    finalVerdictLabel: savedAnalysisSummarySchema.shape.finalVerdictLabel.parse(
      row.finalVerdictLabel,
    ),
    confidencePct: row.confidencePct,
    marginOfSafetyPct: row.marginOfSafetyPct,
    oneLineVerdict: row.oneLineVerdict,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapRecord(row: {
  id: string;
  ticker: string;
  companyName: string;
  currency: string;
  currentPrice: number;
  analysisDate: Date;
  finalVerdictLabel: string;
  confidencePct: number;
  marginOfSafetyPct: number | null;
  oneLineVerdict: string;
  fullJson: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): SavedAnalysisRecord {
  return {
    ...mapSummary(row),
    currency: row.currency,
    currentPrice: row.currentPrice,
    updatedAt: row.updatedAt.toISOString(),
    fullJson: valueInvestingAnalysisSchema.parse(row.fullJson),
  };
}

export async function saveAnalysis(analysis: ValueInvestingAnalysis) {
  const analysisDate = Number.isNaN(Date.parse(analysis.analysis_date))
    ? new Date()
    : new Date(analysis.analysis_date);

  const row = await prisma.analysis.create({
    data: {
      ticker: analysis.ticker,
      companyName: analysis.company_name,
      currency: analysis.currency,
      currentPrice: analysis.current_price,
      analysisDate,
      finalVerdictLabel: analysis.final_verdict.label,
      confidencePct: analysis.final_verdict.confidence_pct,
      marginOfSafetyPct: analysis.intrinsic_value.margin_of_safety_pct,
      oneLineVerdict: analysis.final_verdict.one_line_verdict,
      fullJson: analysis as unknown as Prisma.InputJsonValue,
    },
  });

  return mapRecord(row);
}

export async function getHistorySummaries(): Promise<SavedAnalysisSummary[]> {
  const rows = await prisma.analysis.findMany({
    take: 50,
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      ticker: true,
      companyName: true,
      analysisDate: true,
      finalVerdictLabel: true,
      confidencePct: true,
      marginOfSafetyPct: true,
      oneLineVerdict: true,
      createdAt: true,
    },
  });

  return rows.map(mapSummary);
}

export async function getAnalysisById(id: string): Promise<SavedAnalysisRecord | null> {
  const row = await prisma.analysis.findUnique({
    where: { id },
  });

  return row ? mapRecord(row) : null;
}

export async function getAnalysesByIds(ids: string[]): Promise<SavedAnalysisRecord[] | null> {
  const rows = await prisma.analysis.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  if (rows.length !== ids.length) {
    return null;
  }

  const order = new Map(ids.map((id, index) => [id, index]));
  return rows
    .map(mapRecord)
    .sort((left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0));
}

export async function findRecentByTicker(
  ticker: string,
  withinHours = 24,
): Promise<SavedAnalysisRecord | null> {
  const cutoff = new Date(Date.now() - withinHours * 60 * 60 * 1000);
  const row = await prisma.analysis.findFirst({
    where: {
      ticker: ticker.toUpperCase(),
      createdAt: { gte: cutoff },
    },
    orderBy: { createdAt: "desc" },
  });

  return row ? mapRecord(row) : null;
}
