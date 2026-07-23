import { Landmark } from "lucide-react";

import { EvidenceHeader, MetricTable, ScoreHeadline } from "@/components/analysis/evidence";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils/format";
import type { ValueInvestingAnalysis } from "@/types/analysis";

export function FinancialHealthCard({
  analysis,
}: {
  analysis: ValueInvestingAnalysis;
}) {
  const h = analysis.financial_health;

  return (
    <Card>
      <CardHeader>
        <EvidenceHeader icon={<Landmark className="h-5 w-5" />} title="Financial health" summary={h.summary} />
      </CardHeader>
      <CardContent className="space-y-4">
        <ScoreHeadline label="Financial health score" score={h.health_score} qualifier={h.verdict} />
        <MetricTable
          entries={[
            { label: "Debt / equity", value: formatNumber(h.debt_equity) },
            { label: "Current ratio", value: formatNumber(h.current_ratio) },
            { label: "Interest coverage", value: formatNumber(h.interest_coverage) },
            {
              label: "Cash-flow consistency",
              value: `${formatNumber(h.fcf_consistency_score, 0)}/100`,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
