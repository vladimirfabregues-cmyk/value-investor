/**
 * Shared building blocks for the "evidence" level of the result page
 * (§12, level 2): the valuation, financial-health and business-quality cards.
 *
 * Two primitives enforce one hierarchy across all of them:
 *
 *  - `ScoreHeadline` makes the component score the single dominant figure —
 *    large, tabular, with the model's own qualitative word beside it and a
 *    band colour that only ever reinforces that word (never carries meaning on
 *    its own, per WCAG 1.4.1).
 *  - `MetricTable` renders the supporting multiples as one quiet, aligned
 *    reference table rather than a grid of equally-loud boxes — which is the
 *    "everything at equal prominence" pattern §12 exists to remove.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** Score bands shared with the verdict engine's thresholds (pass ≥70, warn ≥55). */
function band(score: number): { bar: string; text: string } {
  if (score >= 70) return { bar: "bg-emerald-400/80", text: "text-emerald-300" };
  if (score >= 55) return { bar: "bg-amber-400/80", text: "text-amber-300" };
  return { bar: "bg-red-400/80", text: "text-red-300" };
}

interface ScoreHeadlineProps {
  /** Sentence-case, e.g. "Financial health score" */
  label: string;
  /** 0–100 */
  score: number;
  /** The model's own qualitative call, e.g. "Solid" — carries the meaning */
  qualifier?: string;
}

/** The dominant figure of an evidence card: a large tabular score out of 100. */
export function ScoreHeadline({ label, score, qualifier }: ScoreHeadlineProps) {
  const rounded = Math.round(score);
  const tone = band(score);
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        {qualifier && (
          <span className={cn("text-sm font-medium", tone.text)}>{qualifier}</span>
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-4xl leading-none tabular-nums text-foreground">
          {rounded}
        </span>
        <span className="text-lg text-muted-foreground">/100</span>
      </div>
      {/* Colour reinforces the number and word; it never stands alone */}
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
        role="presentation"
      >
        <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export interface MetricEntry {
  label: string;
  value: string;
  /** Optional short qualifier under the label */
  hint?: string;
}

/** A compact, right-aligned, tabular reference table of supporting metrics. */
export function MetricTable({ entries }: { entries: MetricEntry[] }) {
  return (
    <dl className="divide-y divide-white/[0.05] overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
      {entries.map((entry) => (
        <div key={entry.label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
          <dt className="text-sm text-muted-foreground">
            {entry.label}
            {entry.hint && (
              <span className="mt-0.5 block text-xs text-muted-foreground">{entry.hint}</span>
            )}
          </dt>
          <dd className="shrink-0 text-sm font-medium tabular-nums text-foreground">
            {entry.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The consistent shell for an evidence card: an accent-tinted icon, a
 * sentence-case title and the one-line summary. Keeps every card's header
 * identical so the eye learns the layout once.
 */
export function EvidenceHeader({
  icon,
  title,
  summary,
}: {
  icon: ReactNode;
  title: string;
  summary: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 rounded-2xl border border-primary/20 bg-primary/10 p-2 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="font-display text-xl text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{summary}</p>
      </div>
    </div>
  );
}
