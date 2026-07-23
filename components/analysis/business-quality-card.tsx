import { Gem } from "lucide-react";

import { EvidenceHeader, MetricTable, ScoreHeadline } from "@/components/analysis/evidence";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/utils/format";
import type { ValueInvestingAnalysis } from "@/types/analysis";

export function BusinessQualityCard({
  analysis,
}: {
  analysis: ValueInvestingAnalysis;
}) {
  const q = analysis.business_quality;

  return (
    <Card>
      <CardHeader>
        <EvidenceHeader icon={<Gem className="h-5 w-5" />} title="Business quality" summary={q.summary} />
      </CardHeader>
      <CardContent className="space-y-4">
        <ScoreHeadline label="Business quality score" score={q.quality_score} qualifier={q.verdict} />
        <MetricTable
          entries={[
            { label: "Return on equity", value: formatPercent(q.roe_pct) },
            { label: "Return on invested capital", value: formatPercent(q.roic_pct) },
            { label: "Gross margin", value: formatPercent(q.gross_margin_pct) },
            { label: "Operating margin", value: formatPercent(q.operating_margin_pct) },
            { label: "Revenue stability", value: `${formatNumber(q.revenue_stability_score, 0)}/100` },
            { label: "Moat indicators", value: `${formatNumber(q.moat_score, 0)}/100` },
          ]}
        />
      </CardContent>
    </Card>
  );
}
