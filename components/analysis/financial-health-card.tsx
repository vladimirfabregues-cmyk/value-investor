import { Landmark } from "lucide-react";

import { MetricRow } from "@/components/analysis/metric-row";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils/format";
import type { ValueInvestingAnalysis } from "@/types/analysis";

export function FinancialHealthCard({
  analysis,
}: {
  analysis: ValueInvestingAnalysis;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-2 text-primary">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Financial Health</CardTitle>
            <CardDescription>{analysis.financial_health.summary}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <MetricRow
          label="Debt / Equity"
          value={formatNumber(analysis.financial_health.debt_equity)}
          verdict={analysis.financial_health.verdict}
        />
        <MetricRow
          label="Current Ratio"
          value={formatNumber(analysis.financial_health.current_ratio)}
        />
        <MetricRow
          label="Interest Coverage"
          value={formatNumber(analysis.financial_health.interest_coverage)}
        />
        <MetricRow
          label="FCF Consistency Score"
          value={formatNumber(analysis.financial_health.fcf_consistency_score, 0)}
        />
        <MetricRow
          label="Health Score"
          value={formatNumber(analysis.financial_health.health_score, 0)}
          className="md:col-span-2"
        />
      </CardContent>
    </Card>
  );
}
