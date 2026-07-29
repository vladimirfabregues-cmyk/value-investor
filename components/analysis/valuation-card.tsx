import { BarChart3 } from "lucide-react";

import { EvidenceHeader, MetricTable, ScoreHeadline } from "@/components/analysis/evidence";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils/format";
import { useTranslation } from "@/lib/i18n/locale-context";
import type { ValueInvestingAnalysis } from "@/types/analysis";

export function ValuationCard({ analysis }: { analysis: ValueInvestingAnalysis }) {
  const { t } = useTranslation();
  const v = analysis.valuation;

  return (
    <Card>
      <CardHeader>
        <EvidenceHeader icon={<BarChart3 className="h-5 w-5" />} title={t("analysis.evidence.valuationTitle")} summary={v.summary} />
      </CardHeader>
      <CardContent className="space-y-4">
        <ScoreHeadline label={t("analysis.evidence.valuationScore")} score={v.valuation_score} qualifier={v.verdict} />
        <MetricTable
          entries={[
            { label: t("analysis.evidence.metrics.pe"), value: formatNumber(v.pe) },
            { label: t("analysis.evidence.metrics.pb"), value: formatNumber(v.pb) },
            { label: t("analysis.evidence.metrics.ps"), value: formatNumber(v.ps) },
            { label: t("analysis.evidence.metrics.evEbitda"), value: formatNumber(v.ev_ebitda) },
            { label: t("analysis.evidence.metrics.priceFcf"), value: formatNumber(v.price_fcf) },
            { label: t("analysis.evidence.metrics.graham"), value: formatNumber(v.graham_number) },
          ]}
        />
      </CardContent>
    </Card>
  );
}
