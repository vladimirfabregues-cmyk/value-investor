import { ArrowRight, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { verdictClasses } from "@/lib/utils/format";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { ValueInvestingAnalysis } from "@/types/analysis";

interface VerdictBannerProps {
  analysis: ValueInvestingAnalysis;
}

export function VerdictBanner({ analysis }: VerdictBannerProps) {
  return (
    <Card className="overflow-hidden border-primary/15 bg-[radial-gradient(circle_at_top_left,rgba(181,148,88,0.18),transparent_35%),linear-gradient(180deg,rgba(19,30,48,0.98),rgba(8,14,25,0.98))]">
      <CardContent className="p-0">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.4fr,1fr] lg:p-8">
          <div>
            <Badge className={verdictClasses(analysis.final_verdict.label)}>
              {analysis.final_verdict.label.replace("_", " ")}
            </Badge>
            <h2 className="mt-4 font-display text-4xl text-foreground sm:text-5xl">
              {analysis.company_name}
            </h2>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-zinc-300">
              {analysis.final_verdict.one_line_verdict}
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Conservative verdict anchored in deterministic valuation math and current web context.
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Current Price</div>
              <div className="mt-3 text-2xl font-semibold text-foreground">
                {formatCurrency(analysis.current_price, analysis.currency)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                Blended Intrinsic Value
              </div>
              <div className="mt-3 text-2xl font-semibold text-foreground">
                {formatCurrency(
                  analysis.intrinsic_value.blended_intrinsic_value_per_share,
                  analysis.currency,
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                Margin Of Safety
              </div>
              <div className="mt-3 text-2xl font-semibold text-foreground">
                {formatPercent(analysis.intrinsic_value.margin_of_safety_pct)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">Confidence</div>
              <div className="mt-3 text-2xl font-semibold text-foreground">
                {formatPercent(analysis.final_verdict.confidence_pct)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-white/6 px-6 py-4 text-sm text-muted-foreground lg:px-8">
          <span className="font-semibold uppercase tracking-[0.14em] text-zinc-300">
            Verdict
          </span>
          <ArrowRight className="h-4 w-4 text-primary" />
          <span>{analysis.final_verdict.reasoning}</span>
        </div>
      </CardContent>
    </Card>
  );
}
