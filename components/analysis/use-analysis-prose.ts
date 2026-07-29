"use client";

import { useMemo } from "react";

import { useTranslation } from "@/lib/i18n/locale-context";
import { analysisProse, proseModelFromAnalysis, type AnalysisProse } from "@/lib/finance/prose";
import type { ValueInvestingAnalysis } from "@/types/analysis";

/**
 * Regenerate the analysis's prose in the viewer's language from the numbers the
 * analysis carries, using the same generators that produced the stored English.
 * Recomputed when the analysis or the locale changes.
 */
export function useAnalysisProse(analysis: ValueInvestingAnalysis): AnalysisProse {
  const { t, locale } = useTranslation();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- t is stable per locale
  return useMemo(() => analysisProse(proseModelFromAnalysis(analysis), t), [analysis, locale]);
}
