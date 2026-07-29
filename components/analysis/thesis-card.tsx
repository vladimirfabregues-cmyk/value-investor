import type { ReactNode } from "react";
import { AlertTriangle, ShieldAlert, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/locale-context";
import { useAnalysisProse } from "@/components/analysis/use-analysis-prose";
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
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        {title}
      </h3>
      {/* Shorter measure keeps narrative readable (§12) */}
      <div className="max-w-prose space-y-3 text-sm leading-7 text-zinc-300">
        {items.length === 0 ? (
          <p className="text-muted-foreground">{t("analysis.thesis.noPoints")}</p>
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
  const { t } = useTranslation();
  const prose = useAnalysisProse(analysis);
  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>{t("analysis.thesis.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-3">
          <BulletList
            title={t("analysis.thesis.bull")}
            items={prose.bullCase}
            icon={<TrendingUp className="h-4 w-4 text-emerald-300" aria-hidden="true" />}
          />
          <BulletList
            title={t("analysis.thesis.bear")}
            items={prose.bearCase}
            icon={<AlertTriangle className="h-4 w-4 text-amber-300" aria-hidden="true" />}
          />
          <BulletList
            title={t("analysis.thesis.redFlags")}
            items={prose.redFlags}
            icon={<ShieldAlert className="h-4 w-4 text-red-300" aria-hidden="true" />}
          />
        </div>
        <div className="rounded-2xl border border-primary/18 bg-primary/10 p-5">
          <h3 className="text-sm font-semibold text-primary">{t("analysis.thesis.keyRisk")}</h3>
          <p className="mt-2 max-w-prose text-sm leading-7 text-zinc-300">{prose.keyRisk}</p>
        </div>
      </CardContent>
    </Card>
  );
}
