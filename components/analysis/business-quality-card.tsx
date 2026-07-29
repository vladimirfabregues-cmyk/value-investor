import { Gem } from "lucide-react";

import { EvidenceHeader, MetricTable, ScoreHeadline } from "@/components/analysis/evidence";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n/locale-context";
import { useAnalysisProse } from "@/components/analysis/use-analysis-prose";
import { translateBand } from "@/lib/finance/prose";
import type { ValueInvestingAnalysis } from "@/types/analysis";

export function BusinessQualityCard({
  analysis,
}: {
  analysis: ValueInvestingAnalysis;
}) {
  const { t } = useTranslation();
  const prose = useAnalysisProse(analysis);
  const q = analysis.business_quality;

  return (
    <Card>
      <CardHeader>
        <EvidenceHeader icon={<Gem className="h-5 w-5" />} title={t("analysis.evidence.qualityTitle")} summary={prose.qualitySummary} />
      </CardHeader>
      <CardContent className="space-y-4">
        <ScoreHeadline label={t("analysis.evidence.qualityScore")} score={q.quality_score} qualifier={translateBand(q.verdict, t)} />
        <MetricTable
          entries={[
            { label: t("analysis.evidence.metrics.roe"), value: formatPercent(q.roe_pct) },
            { label: t("analysis.evidence.metrics.roic"), value: formatPercent(q.roic_pct) },
            { label: t("analysis.evidence.metrics.grossMargin"), value: formatPercent(q.gross_margin_pct) },
            { label: t("analysis.evidence.metrics.operatingMargin"), value: formatPercent(q.operating_margin_pct) },
            { label: t("analysis.evidence.metrics.revenueStability"), value: `${formatNumber(q.revenue_stability_score, 0)}/100` },
            { label: t("analysis.evidence.metrics.moat"), value: `${formatNumber(q.moat_score, 0)}/100` },
          ]}
        />
      </CardContent>
    </Card>
  );
}
