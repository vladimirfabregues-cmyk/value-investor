import { BarChart3 } from "lucide-react";

import { MetricRow } from "@/components/analysis/metric-row";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils/format";
import type { ValueInvestingAnalysis } from "@/types/analysis";

export function ValuationCard({ analysis }: { analysis: ValueInvestingAnalysis }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-2 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Valuation</CardTitle>
            <CardDescription>{analysis.valuation.summary}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <MetricRow label="P/E" value={formatNumber(analysis.valuation.pe)} verdict={analysis.valuation.verdict} />
        <MetricRow label="P/B" value={formatNumber(analysis.valuation.pb)} />
        <MetricRow label="P/S" value={formatNumber(analysis.valuation.ps)} />
        <MetricRow label="EV / EBITDA" value={formatNumber(analysis.valuation.ev_ebitda)} />
        <MetricRow label="Price / FCF" value={formatNumber(analysis.valuation.price_fcf)} />
        <MetricRow label="Graham Number" value={formatNumber(analysis.valuation.graham_number)} />
        <MetricRow
          label="Valuation Score"
          value={formatNumber(analysis.valuation.valuation_score, 0)}
          className="md:col-span-2"
        />
      </CardContent>
    </Card>
  );
}
