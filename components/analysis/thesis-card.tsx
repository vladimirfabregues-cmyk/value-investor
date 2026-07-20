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
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-200">
        {icon}
        {title}
      </div>
      <div className="space-y-3 text-sm leading-7 text-zinc-300">
        {items.length === 0 ? <p>No material points captured.</p> : null}
        {items.map((item) => (
          <p key={`${title}-${item}`} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
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
        <CardTitle>Thesis / Red Flags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-3">
          <BulletList
            title="Bull Case"
            items={analysis.thesis.bull_case}
            icon={<TrendingUp className="h-4 w-4 text-emerald-300" />}
          />
          <BulletList
            title="Bear Case"
            items={analysis.thesis.bear_case}
            icon={<AlertTriangle className="h-4 w-4 text-orange-300" />}
          />
          <BulletList
            title="Red Flags"
            items={analysis.thesis.red_flags}
            icon={<ShieldAlert className="h-4 w-4 text-red-300" />}
          />
        </div>
        <div className="rounded-2xl border border-primary/18 bg-primary/10 p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-primary">Key Risk</div>
          <p className="mt-3 text-sm leading-7 text-zinc-300">{analysis.thesis.key_risk}</p>
        </div>
      </CardContent>
    </Card>
  );
}
