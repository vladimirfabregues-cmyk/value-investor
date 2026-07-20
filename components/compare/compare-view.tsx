"use client";

import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatNumber, formatPercent, verdictClasses } from "@/lib/utils/format";
import type { CompareResponse } from "@/types/api";
import type { SavedAnalysisRecord, SavedAnalysisSummary } from "@/types/analysis";

interface CompareViewProps {
  initialHistory: SavedAnalysisSummary[];
}

function ComparisonCell({
  title,
  left,
  right,
}: {
  title: string;
  left: string;
  right: string;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-5 md:grid-cols-[200px,1fr,1fr] md:items-center">
      <div className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">
        {title}
      </div>
      <div className="text-sm leading-7 text-zinc-200">{left}</div>
      <div className="text-sm leading-7 text-zinc-200">{right}</div>
    </div>
  );
}

export function CompareView({ initialHistory }: CompareViewProps) {
  const [history] = useState(initialHistory);
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");
  const [items, setItems] = useState<SavedAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (history.length >= 2) {
      setLeftId((current) => current || history[0].id);
      setRightId((current) => current || history[1].id);
    }
  }, [history]);

  useEffect(() => {
    async function loadComparison() {
      if (!leftId || !rightId || leftId === rightId) {
        setItems([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/compare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: [leftId, rightId] }),
        });
        const payload = (await response.json()) as CompareResponse | { error?: string };
        const errorMessage = "error" in payload ? payload.error : undefined;

        if (!response.ok || !("items" in payload)) {
          throw new Error(errorMessage || "Unable to compare analyses.");
        }

        setItems(payload.items);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to compare analyses.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadComparison();
  }, [leftId, rightId]);

  const [left, right] = useMemo(() => items, [items]);

  return (
    <AppShell history={history}>
      <div className="space-y-8">
        <section className="rounded-[1.8rem] border border-white/10 bg-hero-grid px-6 py-10 shadow-panel sm:px-8">
          <Badge className="mb-4">Comparison View</Badge>
          <h1 className="font-display text-5xl leading-none text-foreground sm:text-6xl">
            Compare Saved Analyses
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-300">
            Put two saved verdicts side by side and inspect valuation, balance-sheet
            strength, business quality, intrinsic value, and thesis symmetry.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-400">
                Left Analysis
              </div>
              <Select value={leftId} onValueChange={setLeftId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an analysis" />
                </SelectTrigger>
                <SelectContent>
                  {history.map((item) => (
                    <SelectItem key={`left-${item.id}`} value={item.id}>
                      {item.ticker} · {item.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-400">
                Right Analysis
              </div>
              <Select value={rightId} onValueChange={setRightId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an analysis" />
                </SelectTrigger>
                <SelectContent>
                  {history.map((item) => (
                    <SelectItem key={`right-${item.id}`} value={item.id}>
                      {item.ticker} · {item.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {history.length < 2 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Save at least two analyses from the home page to unlock comparison.
            </CardContent>
          </Card>
        ) : null}

        {leftId && rightId && leftId === rightId ? (
          <Card className="border-orange-500/25 bg-orange-500/8">
            <CardContent className="p-6 text-sm text-orange-100">
              Pick two different analyses to compare them side by side.
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading saved analyses...
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="border-red-500/25 bg-red-500/8">
            <CardContent className="p-6 text-sm text-red-100">{error}</CardContent>
          </Card>
        ) : null}

        {left && right ? (
          <div className="space-y-6">
            <div className="grid gap-4 xl:grid-cols-2">
              {[left, right].map((item) => {
                const analysis = item.fullJson;
                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle>
                            {analysis.ticker} · {analysis.company_name}
                          </CardTitle>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {analysis.final_verdict.one_line_verdict}
                          </p>
                        </div>
                        <Badge className={verdictClasses(analysis.final_verdict.label)}>
                          {analysis.final_verdict.label.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                          Margin Of Safety
                        </div>
                        <div className="mt-3 text-xl font-semibold text-foreground">
                          {formatPercent(analysis.intrinsic_value.margin_of_safety_pct)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                          Confidence
                        </div>
                        <div className="mt-3 text-xl font-semibold text-foreground">
                          {formatPercent(analysis.final_verdict.confidence_pct)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                          Current Price
                        </div>
                        <div className="mt-3 text-xl font-semibold text-foreground">
                          {formatCurrency(analysis.current_price, analysis.currency)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                          Intrinsic Value
                        </div>
                        <div className="mt-3 text-xl font-semibold text-foreground">
                          {formatCurrency(
                            analysis.intrinsic_value.blended_intrinsic_value_per_share,
                            analysis.currency,
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Comparison Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ComparisonCell
                  title="Valuation Summary"
                  left={left.fullJson.valuation.summary}
                  right={right.fullJson.valuation.summary}
                />
                <ComparisonCell
                  title="Health Summary"
                  left={left.fullJson.financial_health.summary}
                  right={right.fullJson.financial_health.summary}
                />
                <ComparisonCell
                  title="Quality Summary"
                  left={left.fullJson.business_quality.summary}
                  right={right.fullJson.business_quality.summary}
                />
                <ComparisonCell
                  title="Intrinsic Value"
                  left={`${formatCurrency(
                    left.fullJson.intrinsic_value.blended_intrinsic_value_per_share,
                    left.fullJson.currency,
                  )} · MOS ${formatPercent(left.fullJson.intrinsic_value.margin_of_safety_pct)}`}
                  right={`${formatCurrency(
                    right.fullJson.intrinsic_value.blended_intrinsic_value_per_share,
                    right.fullJson.currency,
                  )} · MOS ${formatPercent(right.fullJson.intrinsic_value.margin_of_safety_pct)}`}
                />
                <ComparisonCell
                  title="Bull Case"
                  left={left.fullJson.thesis.bull_case.join(" • ")}
                  right={right.fullJson.thesis.bull_case.join(" • ")}
                />
                <ComparisonCell
                  title="Bear Case"
                  left={left.fullJson.thesis.bear_case.join(" • ")}
                  right={right.fullJson.thesis.bear_case.join(" • ")}
                />
                <ComparisonCell
                  title="Red Flags"
                  left={left.fullJson.thesis.red_flags.join(" • ")}
                  right={right.fullJson.thesis.red_flags.join(" • ")}
                />
                <ComparisonCell
                  title="Quality Score"
                  left={formatNumber(left.fullJson.business_quality.quality_score, 0)}
                  right={formatNumber(right.fullJson.business_quality.quality_score, 0)}
                />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
