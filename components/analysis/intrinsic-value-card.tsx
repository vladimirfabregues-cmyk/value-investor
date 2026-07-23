import { Scale } from "lucide-react";

import { EvidenceHeader, MetricTable } from "@/components/analysis/evidence";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { describeValuationGap } from "@/lib/finance/valuation-gap";
import type { ValueInvestingAnalysis } from "@/types/analysis";

export function IntrinsicValueCard({
  analysis,
}: {
  analysis: ValueInvestingAnalysis;
}) {
  const iv = analysis.intrinsic_value;
  const currency = analysis.currency;
  const gap = describeValuationGap(iv.margin_of_safety_pct);
  const gapTone =
    gap.tone === "positive"
      ? "text-emerald-300"
      : gap.tone === "negative"
        ? "text-red-300"
        : "text-muted-foreground";

  return (
    <Card>
      <CardHeader>
        <EvidenceHeader icon={<Scale className="h-5 w-5" />} title="Intrinsic value" summary={iv.summary} />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estimated value is the primary output; the gap qualifies it in words + colour */}
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-muted-foreground">Estimated value per share</span>
            <span className={cn("text-sm font-medium", gapTone)}>
              {gap.kind === "none" ? gap.label : `${gap.display} ${gap.kind === "premium" ? "premium" : "margin of safety"}`}
            </span>
          </div>
          <div className="mt-1 font-display text-4xl leading-none tabular-nums text-foreground">
            {formatCurrency(iv.blended_intrinsic_value_per_share, currency)}
          </div>
        </div>

        <MetricTable
          entries={[
            { label: "DCF value / share", value: formatCurrency(iv.dcf_value_per_share, currency) },
            { label: "Graham value / share", value: formatCurrency(iv.graham_value_per_share, currency) },
          ]}
        />

        {(() => {
          // Prefer the assumptions the engine actually used (they are
          // sector-specific — the discount rate is not always 10%). Fall back
          // to the conservative defaults for analyses saved before provenance
          // was captured, so older results still show something meaningful.
          const a = analysis.data_status?.assumptions;
          const rows: [string, string][] = [
            ["Discount rate", a ? `${a.discount_rate_pct}%` : "10%"],
            ["Terminal growth", a ? `${a.terminal_growth_pct}%` : "2.5%"],
            ["Max growth cap", a ? `${a.max_growth_cap_pct}%` : "8%"],
            [
              "Conservative FCF basis",
              a ? (a.use_conservative_fcf_basis ? "Yes" : "No") : "Yes",
            ],
          ];
          return (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="mb-2 text-sm font-medium text-foreground">DCF assumptions</div>
              <dl className="grid gap-2 sm:grid-cols-2">
                {rows.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium tabular-nums text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}
