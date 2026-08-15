export const dynamic = "force-dynamic";

import { ConclusionDocument } from "@/components/analysis/conclusion-document";
import { PrintNotFound } from "@/components/analysis/print-not-found";
import { getAnalysisById } from "@/lib/db/queries";
import type { Route } from "next";

interface PrintPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Print / PDF view of a single conclusion. Server-fetches the record by id so
 * the whole argument is present in one linear document (no client tabs), then
 * hands off to the client component that owns the print controls (P9-2).
 */
export default async function ConclusionPrintPage({ searchParams }: PrintPageProps) {
  const params = searchParams ? await searchParams : {};
  const analysisId = typeof params.analysis === "string" ? params.analysis : undefined;
  const record = analysisId ? await getAnalysisById(analysisId) : null;

  if (!record) {
    return <PrintNotFound />;
  }

  const backHref = `/value?analysis=${encodeURIComponent(record.id)}&exchange=${encodeURIComponent(
    record.exchange,
  )}&ticker=${encodeURIComponent(record.ticker)}` as Route;

  return <ConclusionDocument analysis={record.fullJson} backHref={backHref} />;
}
