"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Bookmark, BookmarkCheck, Download, Info, Trash2 } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { CompareSlot } from "@/components/compare/compare-slot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import {
  buildComparison,
  countUnavailableRows,
  type ComparisonRow,
} from "@/lib/compare/comparison";
import { comparisonFilename, comparisonToCsv } from "@/lib/compare/export";
import {
  isComparisonSaved,
  readSavedComparisons,
  removeComparison,
  saveComparison,
  writeSavedComparisons,
  type SavedComparison,
} from "@/lib/compare/saved-comparisons";
import type { CompareResponse } from "@/types/api";
import type { SavedAnalysisRecord, SavedAnalysisSummary } from "@/types/analysis";

interface CompareViewProps {
  initialHistory: SavedAnalysisSummary[];
  initialLeftId?: string | null;
  initialRightId?: string | null;
}

/** Cell styling for the side a single metric favours. Weight, not colour alone. */
function ValueCell({
  value,
  favoured,
  companyName,
}: {
  value: string;
  favoured: boolean;
  companyName: string;
}) {
  return (
    <td
      className={cn(
        "px-3 py-2.5 align-top text-sm tabular-nums",
        favoured ? "font-semibold text-foreground" : "text-zinc-300",
      )}
    >
      {value}
      {favoured && <span className="sr-only"> — stronger on this metric: {companyName}</span>}
    </td>
  );
}

function MetricTable({
  title,
  rows,
  leftName,
  rightName,
  leftTicker,
  rightTicker,
}: {
  title: string;
  rows: ComparisonRow[];
  leftName: string;
  rightName: string;
  leftTicker: string;
  rightTicker: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-left">
        <caption className="sr-only">
          {title}: {leftTicker} compared with {rightTicker}
        </caption>
        <thead>
          <tr className="border-b border-white/10">
            <th scope="col" className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Metric
            </th>
            <th scope="col" className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {leftTicker}
            </th>
            <th scope="col" className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {rightTicker}
            </th>
            <th scope="col" className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Difference
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-white/[0.05] last:border-0">
              <th
                scope="row"
                className="px-3 py-2.5 align-top text-sm font-normal text-muted-foreground"
              >
                {row.label}
                {row.note && (
                  <span className="mt-1 block text-[11px] leading-4 text-orange-200/80">
                    {row.note}
                  </span>
                )}
              </th>
              <ValueCell value={row.left} favoured={row.favours === "left"} companyName={leftName} />
              <ValueCell value={row.right} favoured={row.favours === "right"} companyName={rightName} />
              <td className="px-3 py-2.5 align-top text-sm tabular-nums text-muted-foreground">
                {row.absoluteDelta ?? "—"}
                {row.relativeDelta && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ({row.relativeDelta})
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Split a section into contiguous runs of the same kind.
 *
 * Row order inside a section is authored deliberately — the verdict leads,
 * the multiples follow — so narrative and numeric rows cannot simply be
 * bucketed into two blocks without inverting that priority.
 */
function toRuns(rows: ComparisonRow[]): { kind: "metrics" | "narrative"; rows: ComparisonRow[] }[] {
  const runs: { kind: "metrics" | "narrative"; rows: ComparisonRow[] }[] = [];

  for (const row of rows) {
    const kind = row.unit === "text" ? "narrative" : "metrics";
    const current = runs[runs.length - 1];
    if (current && current.kind === kind) current.rows.push(row);
    else runs.push({ kind, rows: [row] });
  }

  return runs;
}

/** Narrative rows read as prose, not as table cells. */
function NarrativeRows({
  rows,
  leftTicker,
  rightTicker,
}: {
  rows: ComparisonRow[];
  leftTicker: string;
  rightTicker: string;
}) {
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.id}>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {row.label}
          </h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
              <div className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                {leftTicker}
              </div>
              <p className="text-sm leading-6 text-zinc-300">{row.left}</p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
              <div className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                {rightTicker}
              </div>
              <p className="text-sm leading-6 text-zinc-300">{row.right}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CompareView({
  initialHistory,
  initialLeftId = null,
  initialRightId = null,
}: CompareViewProps) {
  const router = useRouter();
  const [history] = useState(initialHistory);

  // Seeded from the two most recent analyses only when the URL says nothing —
  // a starting point, not a commitment: either slot can be cleared.
  const seeded = Boolean(!initialLeftId && !initialRightId && history.length >= 2);
  const [leftId, setLeftId] = useState<string | null>(
    initialLeftId ?? (history.length >= 2 ? history[0].id : null),
  );
  const [rightId, setRightId] = useState<string | null>(
    initialRightId ?? (history.length >= 2 ? history[1].id : null),
  );
  const [fromSeed, setFromSeed] = useState(seeded);

  const [items, setItems] = useState<SavedAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hideUnavailable, setHideUnavailable] = useState(true);
  const [saved, setSaved] = useState<SavedComparison[]>([]);

  useEffect(() => setSaved(readSavedComparisons()), []);

  // Keep the URL in step so a comparison can be linked to and reloaded.
  useEffect(() => {
    const params = new URLSearchParams();
    if (leftId) params.set("left", leftId);
    if (rightId) params.set("right", rightId);
    const query = params.toString();
    router.replace(query ? `/compare?${query}` : "/compare", { scroll: false });
  }, [leftId, rightId, router]);

  useEffect(() => {
    let cancelled = false;

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [leftId, rightId] }),
        });
        const payload = (await response.json()) as CompareResponse | { error?: string };

        if (!response.ok || !("items" in payload)) {
          throw new Error(
            ("error" in payload && payload.error) || "Unable to compare these analyses.",
          );
        }
        if (!cancelled) setItems(payload.items);
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error ? caughtError.message : "Unable to compare these analyses.",
          );
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadComparison();
    return () => {
      cancelled = true;
    };
  }, [leftId, rightId]);

  const left = items[0] ?? null;
  const right = items[1] ?? null;

  const comparison = useMemo(
    () => (left && right ? buildComparison(left, right, { hideUnavailable }) : null),
    [left, right, hideUnavailable],
  );
  const hiddenCount = useMemo(
    () => (left && right ? countUnavailableRows(left, right) : 0),
    [left, right],
  );

  const summaryById = useMemo(
    () => new Map(history.map((item) => [item.id, item])),
    [history],
  );

  const swap = useCallback(() => {
    setFromSeed(false);
    setLeftId(rightId);
    setRightId(leftId);
  }, [leftId, rightId]);

  function pick(side: "left" | "right", id: string) {
    setFromSeed(false);
    if (side === "left") setLeftId(id);
    else setRightId(id);
  }

  function clear(side: "left" | "right") {
    setFromSeed(false);
    if (side === "left") setLeftId(null);
    else setRightId(null);
  }

  function toggleSaved() {
    if (!left || !right) return;
    const next = isComparisonSaved(saved, left.id, right.id)
      ? removeComparison(
          saved,
          saved.find(
            (entry) =>
              (entry.leftId === left.id && entry.rightId === right.id) ||
              (entry.leftId === right.id && entry.rightId === left.id),
          )!.id,
        )
      : saveComparison(saved, {
          leftId: left.id,
          rightId: right.id,
          label: `${left.ticker} vs ${right.ticker}`,
        });

    setSaved(next);
    writeSavedComparisons(next);
  }

  function exportCsv() {
    if (!comparison || !left || !right) return;
    const blob = new Blob([comparisonToCsv(comparison, left, right)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = comparisonFilename(left, right);

    // Anchored in the document and revoked on the next tick: WebKit — which is
    // what this runs on when installed to an iPhone home screen — can drop the
    // download if the object URL is released in the same task as the click.
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  const isSaved = left && right ? isComparisonSaved(saved, left.id, right.id) : false;

  return (
    <AppShell history={history}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-white/[0.08] bg-hero-grid p-5 shadow-panel sm:p-8">
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            Compare stocks
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Put two analysed companies side by side — verdict and valuation first, then the
            fundamentals, the risks, and the model differences that qualify both.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr,auto,1fr] lg:items-start">
            <CompareSlot
              label="First company"
              selected={leftId ? summaryById.get(leftId) ?? null : null}
              history={history}
              excludeId={rightId}
              onSelect={(id) => pick("left", id)}
              onClear={() => clear("left")}
            />

            <div className="flex justify-center lg:pt-16">
              <Button
                variant="secondary"
                size="icon"
                onClick={swap}
                disabled={!leftId || !rightId}
                title="Swap the two companies"
              >
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Swap the two companies</span>
              </Button>
            </div>

            <CompareSlot
              label="Second company"
              selected={rightId ? summaryById.get(rightId) ?? null : null}
              history={history}
              excludeId={leftId}
              onSelect={(id) => pick("right", id)}
              onClear={() => clear("right")}
            />
          </div>

          {fromSeed && (
            <p className="mt-4 text-xs text-muted-foreground">
              Started from your two most recent analyses. Change or remove either one.
            </p>
          )}
        </section>

        {saved.length > 0 && (
          <section aria-labelledby="saved-comparisons">
            <h2 id="saved-comparisons" className="mb-2 text-sm font-medium text-foreground">
              Saved comparisons
            </h2>
            <div className="flex flex-wrap gap-2">
              {saved.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-3 pr-1"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setFromSeed(false);
                      setLeftId(entry.leftId);
                      setRightId(entry.rightId);
                    }}
                    className="text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    {entry.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = removeComparison(saved, entry.id);
                      setSaved(next);
                      writeSavedComparisons(next);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition hover:text-red-300"
                    title={`Remove ${entry.label}`}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">Remove {entry.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {history.length < 2 && (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              A comparison needs two saved analyses. Analyse a second company to unlock it.
            </CardContent>
          </Card>
        )}

        {leftId && rightId && leftId === rightId && (
          <Card className="border-orange-500/25 bg-orange-500/[0.08]">
            <CardContent className="p-5 text-sm text-orange-100">
              Both slots hold the same analysis. Pick a different company for one of them.
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground" role="status" aria-live="polite">
              Loading the two analyses…
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-500/25 bg-red-500/[0.08]">
            <CardContent className="p-5 text-sm text-red-100" role="alert">
              {error}
            </CardContent>
          </Card>
        )}

        {comparison && left && right && (
          <>
            {/* Caveats come before the numbers, not after them */}
            {comparison.warnings.length > 0 && (
              <Card className="border-orange-500/20 bg-orange-500/[0.05]">
                <CardHeader>
                  <CardTitle level={2} className="flex items-center gap-2 text-base">
                    <Info className="h-4 w-4 text-orange-300" aria-hidden="true" />
                    Before you compare these two
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {comparison.warnings.map((warning) => (
                    <div key={warning.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{warning.title}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {warning.level === "blocking" ? "Not comparable" : "Read with care"}
                        </Badge>
                      </div>
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-300">
                        {warning.detail}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" size="sm" onClick={toggleSaved}>
                  {isSaved ? (
                    <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {isSaved ? "Saved" : "Save comparison"}
                </Button>
                <Button variant="secondary" size="sm" onClick={exportCsv}>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Export CSV
                </Button>
              </div>

              {hiddenCount > 0 && (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={hideUnavailable}
                    onChange={(event) => setHideUnavailable(event.target.checked)}
                    className="h-3.5 w-3.5 rounded border-white/20 bg-white/[0.04] accent-primary"
                  />
                  Hide {hiddenCount} metric{hiddenCount === 1 ? "" : "s"} neither company reports
                </label>
              )}
            </div>

            {comparison.sections.map((section) => {
              if (section.rows.length === 0) return null;

              return (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle level={2}>{section.title}</CardTitle>
                    <p className="mt-1.5 text-sm text-muted-foreground">{section.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {toRuns(section.rows).map((run, index) =>
                      run.kind === "metrics" ? (
                        <MetricTable
                          key={`${section.id}-${index}`}
                          title={section.title}
                          rows={run.rows}
                          leftName={left.companyName}
                          rightName={right.companyName}
                          leftTicker={left.ticker}
                          rightTicker={right.ticker}
                        />
                      ) : (
                        <NarrativeRows
                          key={`${section.id}-${index}`}
                          rows={run.rows}
                          leftTicker={left.ticker}
                          rightTicker={right.ticker}
                        />
                      ),
                    )}
                  </CardContent>
                </Card>
              );
            })}

            <p className="px-1 pb-2 text-xs leading-5 text-muted-foreground">
              Individual metrics are marked where one company is stronger. No overall winner is
              declared: businesses in different sectors, valued by different models, are not
              reducible to a single score.
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}
