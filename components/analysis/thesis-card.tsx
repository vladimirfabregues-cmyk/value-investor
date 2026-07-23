import type { ReactNode } from "react";
import { AlertTriangle, ShieldAlert, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ValueInvestingAnalysis } from "@/types/analysis";

function BulletList({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </h3>
      {/* Shorter measure keeps narrative readable (§12) */}
      <div className="max-w-prose space-y-3 text-sm leading-7 text-zinc-300">
        {items.length === 0 ? (
          <p className="text-muted-foreground">No material points captured.</p>
        ) : null}
        {items.map((item) => (
          <p key={`${title}-${item}`} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{item}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function ThesisCard({ analysis }: { analysis: ValueInvestingAnalysis }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>Thesis and red flags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-3">
          <BulletList
            title="Bull case"
            items={analysis.thesis.bull_case}
            icon={<TrendingUp className="h-4 w-4 text-emerald-300" aria-hidden="true" />}
          />
          <BulletList
            title="Bear case"
            items={analysis.thesis.bear_case}
            icon={<AlertTriangle className="h-4 w-4 text-amber-300" aria-hidden="true" />}
          />
          <BulletList
            title="Red flags"
            items={analysis.thesis.red_flags}
            icon={<ShieldAlert className="h-4 w-4 text-red-300" aria-hidden="true" />}
          />
        </div>
        <div className="rounded-2xl border border-primary/18 bg-primary/10 p-5">
          <h3 className="text-sm font-semibold text-primary">Key risk</h3>
          <p className="mt-2 max-w-prose text-sm leading-7 text-zinc-300">{analysis.thesis.key_risk}</p>
        </div>
      </CardContent>
    </Card>
  );
}
