import { ExternalLink, Link2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ValueInvestingAnalysis } from "@/types/analysis";

export function SourcesCard({ analysis }: { analysis: ValueInvestingAnalysis }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-2 text-primary">
            <Link2 className="h-5 w-5" />
          </div>
          <CardTitle>Sources</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {analysis.sources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            No external sources were captured in this run.
          </div>
        ) : (
          analysis.sources.map((source) => (
            <a
              key={`${source.url}-${source.title}`}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-primary/25"
            >
              <div>
                <div className="font-medium text-foreground">{source.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{source.used_for}</div>
                <div className="mt-2 break-all text-xs text-zinc-500">{source.url}</div>
              </div>
              <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </a>
          ))
        )}
      </CardContent>
    </Card>
  );
}
