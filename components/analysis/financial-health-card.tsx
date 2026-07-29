import { Landmark } from "lucide-react";

import { EvidenceHeader, MetricTable, ScoreHeadline } from "@/components/analysis/evidence";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n/locale-context";
import type { ValueInvestingAnalysis } from "@/types/analysis";

export function FinancialHealthCard({
  analysis,
}: {
  analysis: ValueInvestingAnalysis;
}) {
  const { t } = useTranslation();
  const h = analysis.financial_health;

  return (
    <Card>
      <CardHeader>
        <EvidenceHeader icon={<Landmark className="h-5 w-5" />} title={t("analysis.evidence.healthTitle")} summary={h.summary} />
      </CardHeader>
      <CardContent className="space-y-4">
        <ScoreHeadline label={t("analysis.evidence.healthScore")} score={h.health_score} qualifier={h.verdict} />
        <MetricTable
          entries={[
            { label: t("analysis.evidence.metrics.debtEquity"), value: formatNumber(h.debt_equity) },
            { label: t("analysis.evidence.metrics.currentRatio"), value: formatNumber(h.current_ratio) },
            { label: t("analysis.evidence.metrics.interestCoverage"), value: formatNumber(h.interest_coverage) },
            {
              label: t("analysis.evidence.metrics.cashFlowConsistency"),
              value: `${formatNumber(h.fcf_consistency_score, 0)}/100`,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
