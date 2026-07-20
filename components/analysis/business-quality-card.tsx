import { Gem } from "lucide-react";

import { MetricRow } from "@/components/analysis/metric-row";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/utils/format";
import type { ValueInvestingAnalysis } from "@/types/analysis";

export function BusinessQualityCard({
  analysis,
}: {
  analysis: ValueInvestingAnalysis;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-2 text-primary">
            <Gem className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Business Quality</CardTitle>
            <CardDescription>{analysis.business_quality.summary}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <MetricRow
          label="ROE"
          value={formatPercent(analysis.business_quality.roe_pct)}
          verdict={analysis.business_quality.verdict}
        />
        <MetricRow label="ROIC" value={formatPercent(analysis.business_quality.roic_pct)} />
        <MetricRow
          label="Gross Margin"
          value={formatPercent(analysis.business_quality.gross_margin_pct)}
        />
        <MetricRow
          label="Operating Margin"
          value={formatPercent(analysis.business_quality.operating_margin_pct)}
        />
        <MetricRow
          label="Revenue Stability"
          value={formatNumber(analysis.business_quality.revenue_stability_score, 0)}
        />
        <MetricRow label="Moat Score" value={formatNumber(analysis.business_quality.moat_score, 0)} />
        <MetricRow
          label="Quality Score"
          value={formatNumber(analysis.business_quality.quality_score, 0)}
          className="md:col-span-2"
        />
      </CardContent>
    </Card>
  );
}
