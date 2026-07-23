import { LineChart } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EvidenceHeader } from "@/components/analysis/evidence";
import { TrendChart, TrendGrid } from "@/components/analysis/trend-chart";
import { formatCompactCurrency, formatCurrency, formatPercent } from "@/lib/utils/format";
import type { ValueInvestingAnalysis } from "@/types/analysis";

/**
 * Five-year fundamental trends as accessible small multiples (§8).
 *
 * Each cell answers one investment question; none is decorative. Renders
 * nothing when the analysis carries no series (older saves, or a company the
 * provider had no history for) rather than showing empty axes.
 */
export function TrendsCard({ analysis }: { analysis: ValueInvestingAnalysis }) {
  const series = analysis.series;
  if (!series) return null;

  const labels = series.period_labels;
  const currency = analysis.currency;

  const charts = [
    {
      title: "Revenue",
      question: "Is the top line growing?",
      values: series.revenue,
      format: (v: number) => formatCompactCurrency(v, currency),
    },
    {
      title: "Diluted EPS",
      question: "Are per-share earnings rising?",
      values: series.diluted_eps,
      format: (v: number) => formatCurrency(v, currency),
    },
    {
      title: "Free cash flow",
      question: "Is the business generating cash?",
      values: series.free_cash_flow,
      format: (v: number) => formatCompactCurrency(v, currency),
    },
    {
      title: "Operating margin",
      question: "Are margins holding up?",
      values: series.operating_margin_pct,
      format: (v: number) => formatPercent(v),
    },
    {
      title: "Return on invested capital",
      question: "Is capital earning strong returns?",
      values: series.roic_pct,
      format: (v: number) => formatPercent(v),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <EvidenceHeader
          icon={<LineChart className="h-5 w-5" />}
          title="Five-year trends"
          summary="How the fundamentals have moved. Axes start at zero, so the shape is the story, not a cropped scale."
        />
      </CardHeader>
      <CardContent>
        <TrendGrid>
          {charts.map((c) => (
            <TrendChart
              key={c.title}
              title={c.title}
              question={c.question}
              values={c.values}
              labels={labels}
              format={c.format}
            />
          ))}
        </TrendGrid>
      </CardContent>
    </Card>
  );
}
