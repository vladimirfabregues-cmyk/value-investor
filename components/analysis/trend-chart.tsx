import { useId } from "react";

import { cn } from "@/lib/utils/cn";
import {
  buildTrendGeometry,
  polylinePoints,
  trendChangePct,
} from "@/lib/charts/scale";

interface TrendChartProps {
  title: string;
  /** The investment question this trend answers — never decorative (§8) */
  question: string;
  values: Array<number | null>;
  /** Period labels aligned to `values`, oldest-first */
  labels: string[];
  /** Formats a value for display; must be consistent across the app */
  format: (value: number) => string;
}

const VIEW_W = 100;
const VIEW_H = 40;

/**
 * A compact, dependency-free trend sparkline.
 *
 * Accessibility is built in, not bolted on: the SVG is decorative
 * (aria-hidden) and the real content is a visually-hidden data table plus a
 * one-line text summary, so a screen reader reads the numbers, not "graphic".
 * The y-domain always includes zero (see buildTrendGeometry), and change is
 * shown as an arrow **and** text, never colour alone.
 */
export function TrendChart({ title, question, values, labels, format }: TrendChartProps) {
  const tableId = useId();
  const geometry = buildTrendGeometry(values, { width: VIEW_W, height: VIEW_H });

  const plotted = values
    .map((v, i) => ({ v, label: labels[i] }))
    .filter((p): p is { v: number; label: string } => p.v !== null && Number.isFinite(p.v));

  // Empty state — an honest placeholder beats an axis of zeros.
  if (!geometry || plotted.length === 0) {
    return (
      <figure className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
        <figcaption className="text-sm font-medium text-foreground">{title}</figcaption>
        <p className="mt-3 text-xs text-muted-foreground">No history available.</p>
      </figure>
    );
  }

  const first = plotted[0];
  const last = plotted[plotted.length - 1];
  const change = trendChangePct(values);
  const rangeLabel =
    first.label === last.label ? first.label : `${first.label}–${last.label}`;

  const summary = `${title}: ${format(first.v)} in ${first.label} to ${format(last.v)} in ${last.label}.`;

  return (
    <figure className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-sm font-semibold tabular-nums text-foreground">{format(last.v)}</span>
      </figcaption>
      <p className="mt-0.5 text-xs leading-4 text-muted-foreground">{question}</p>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        className="mt-3 h-12 w-full text-primary"
        aria-hidden="true"
        focusable="false"
      >
        {/* Zero reference line, shown only when the data actually crosses zero */}
        {geometry.min < 0 && (
          <line
            x1="0"
            x2={VIEW_W}
            y1={geometry.zeroY}
            y2={geometry.zeroY}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
        )}
        {geometry.runs.map((run, i) => (
          <g key={i}>
            {/* Area from the line down to zero, so negatives read correctly */}
            <polygon
              points={`${polylinePoints(run)} ${run[run.length - 1].x},${geometry.zeroY} ${run[0].x},${geometry.zeroY}`}
              fill="currentColor"
              opacity="0.1"
            />
            <polyline
              points={polylinePoints(run)}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
        {geometry.points.map((p) => (
          <circle key={p.index} cx={p.x} cy={p.y} r="1.4" fill="currentColor">
            {/* Native hover tooltip — text, so it never relies on colour */}
            <title>{`${labels[p.index]}: ${format(p.value)}`}</title>
          </circle>
        ))}
      </svg>

      <div className="mt-1.5 flex items-baseline justify-between text-[11px] text-muted-foreground">
        <span>{rangeLabel}</span>
        {change !== null && (
          <span className="tabular-nums" aria-hidden="true">
            {change >= 0 ? "↑" : "↓"} {Math.abs(Math.round(change))}% over period
          </span>
        )}
      </div>

      {/* The accessible source of truth: a real table + a plain-language summary */}
      <table id={tableId} className="sr-only">
        <caption>{summary}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">{title}</th>
          </tr>
        </thead>
        <tbody>
          {values.map((v, i) => (
            <tr key={labels[i] ?? i}>
              <th scope="row">{labels[i]}</th>
              <td>{v === null || !Number.isFinite(v) ? "Not available" : format(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Groups trend sparklines as accessible small multiples (§8, dataviz). */
export function TrendGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid gap-3 sm:grid-cols-2", className)}>{children}</div>;
}
