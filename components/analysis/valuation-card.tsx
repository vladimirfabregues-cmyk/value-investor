import { BarChart3 } from "lucide-react";

import { EvidenceHeader, MetricTable, ScoreHeadline } from "@/components/analysis/evidence";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils/format";
import type { ValueInvestingAnalysis } from "@/types/analysis";

export function ValuationCard({ analysis }: { analysis: ValueInvestingAnalysis }) {
  const v = analysis.valuation;

  return (
    <Card>
      <CardHeader>
        <EvidenceHeader icon={<BarChart3 className="h-5 w-5" />} title="Valuation" summary={v.summary} />
      </CardHeader>
      <CardContent className="space-y-4">
        <ScoreHeadline label="Valuation score" score={v.valuation_score} qualifier={v.verdict} />
        <MetricTable
          entries={[
            { label: "Price / earnings", value: formatNumber(v.pe) },
            { label: "Price / book", value: formatNumber(v.pb) },
            { label: "Price / sales", value: formatNumber(v.ps) },
            { label: "EV / EBITDA", value: formatNumber(v.ev_ebitda) },
            { label: "Price / free cash flow", value: formatNumber(v.price_fcf) },
            { label: "Graham number", value: formatNumber(v.graham_number) },
          ]}
        />
      </CardContent>
    </Card>
  );
}
