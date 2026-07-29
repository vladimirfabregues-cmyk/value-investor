import { Scale } from "lucide-react";

import { EvidenceHeader, MetricTable } from "@/components/analysis/evidence";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { describeValuationGap } from "@/lib/finance/valuation-gap";
import { useTranslation } from "@/lib/i18n/locale-context";
import type { ValueInvestingAnalysis } from "@/types/analysis";

export function IntrinsicValueCard({
  analysis,
}: {
  analysis: ValueInvestingAnalysis;
}) {
  const { t } = useTranslation();
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
        <EvidenceHeader icon={<Scale className="h-5 w-5" />} title={t("analysis.evidence.intrinsicTitle")} summary={iv.summary} />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estimated value is the primary output; the gap qualifies it in words + colour */}
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-muted-foreground">{t("analysis.evidence.estimatedValuePerShare")}</span>
            <span className={cn("text-sm font-medium", gapTone)}>
              {gap.kind === "none"
                ? t("analysis.decision.pricedLabel")
                : gap.kind === "premium"
                  ? t("analysis.evidence.premium", { value: gap.display })
                  : t("analysis.evidence.marginOfSafety", { value: gap.display })}
            </span>
          </div>
          <div className="mt-1 font-display text-4xl leading-none tabular-nums text-foreground">
            {formatCurrency(iv.blended_intrinsic_value_per_share, currency)}
          </div>
        </div>

        <MetricTable
          entries={[
            { label: t("analysis.evidence.metrics.dcfValue"), value: formatCurrency(iv.dcf_value_per_share, currency) },
            { label: t("analysis.evidence.metrics.grahamValue"), value: formatCurrency(iv.graham_value_per_share, currency) },
          ]}
        />

        {(() => {
          // Prefer the assumptions the engine actually used (they are
          // sector-specific — the discount rate is not always 10%). Fall back
          // to the conservative defaults for analyses saved before provenance
          // was captured, so older results still show something meaningful.
          const a = analysis.data_status?.assumptions;
          const rows: [string, string][] = [
            [t("analysis.evidence.discountRate"), a ? `${a.discount_rate_pct}%` : "10%"],
            [t("analysis.evidence.terminalGrowth"), a ? `${a.terminal_growth_pct}%` : "2.5%"],
            [t("analysis.evidence.maxGrowthCap"), a ? `${a.max_growth_cap_pct}%` : "8%"],
            [
              t("analysis.evidence.conservativeFcf"),
              a ? (a.use_conservative_fcf_basis ? t("analysis.evidence.yes") : t("analysis.evidence.no")) : t("analysis.evidence.yes"),
            ],
          ];
          return (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="mb-2 text-sm font-medium text-foreground">{t("analysis.evidence.dcfAssumptions")}</div>
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
