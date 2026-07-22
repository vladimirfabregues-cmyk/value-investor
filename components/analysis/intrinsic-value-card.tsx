import { Scale } from "lucide-react";

import { MetricRow } from "@/components/analysis/metric-row";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { describeValuationGap } from "@/lib/finance/valuation-gap";
import type { ValueInvestingAnalysis } from "@/types/analysis";

export function IntrinsicValueCard({
  analysis,
}: {
  analysis: ValueInvestingAnalysis;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-2 text-primary">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Intrinsic Value</CardTitle>
            <CardDescription>{analysis.intrinsic_value.summary}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <MetricRow
            label="DCF Value / Share"
            value={formatCurrency(
              analysis.intrinsic_value.dcf_value_per_share,
              analysis.currency,
            )}
          />
          <MetricRow
            label="Graham Value / Share"
            value={formatCurrency(
              analysis.intrinsic_value.graham_value_per_share,
              analysis.currency,
            )}
          />
          <MetricRow
            label="Blended Intrinsic Value"
            value={formatCurrency(
              analysis.intrinsic_value.blended_intrinsic_value_per_share,
              analysis.currency,
            )}
          />
          <MetricRow
            label="Margin Of Safety"
            value={describeValuationGap(analysis.intrinsic_value.margin_of_safety_pct).display}
          />
        </div>

        <div className="rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3">
          <div className="mb-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            DCF Assumptions
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Discount rate</span>
              <span className="font-medium text-foreground">10%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Terminal growth</span>
              <span className="font-medium text-foreground">2.5%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Max growth cap</span>
              <span className="font-medium text-foreground">8%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Conservative FCF basis</span>
              <span className="font-medium text-foreground">Yes</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
