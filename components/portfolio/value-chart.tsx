"use client";

import { useId } from "react";

export interface ValueSeries {
  id: string;
  label: string;
  /** SVG stroke colour. */
  color: string;
  dashed?: boolean;
  points: { date: string; value: number }[];
}

interface ValueChartProps {
  series: ValueSeries[];
  format: (n: number) => string;
  /** Capital line, drawn as a break-even reference. */
  baseline?: number;
}

const W = 100;
const H = 42;

/**
 * Dependency-free multi-series line chart for the portfolio value curves. The
 * SVG is decorative (aria-hidden); the accessible source of truth is a hidden
 * table of each series' start and end value. Series share one time axis and one
 * value domain so the books are directly comparable.
 */
export function ValueChart({ series, format, baseline }: ValueChartProps) {
  const tableId = useId();
  const allPoints = series.flatMap((s) => s.points);
  if (allPoints.length === 0) return null;

  const times = allPoints.map((p) => Date.parse(p.date));
  const tMin = Math.min(...times);
  const tMax = Math.max(...times);
  const values = allPoints.map((p) => p.value);
  let vMin = Math.min(...values, baseline ?? Infinity);
  let vMax = Math.max(...values, baseline ?? -Infinity);
  if (vMin === vMax) { vMin -= 1; vMax += 1; }
  const pad = (vMax - vMin) * 0.06;
  vMin -= pad;
  vMax += pad;

  const x = (date: string) => (tMax === tMin ? 0 : ((Date.parse(date) - tMin) / (tMax - tMin)) * W);
  const y = (v: number) => H - ((v - vMin) / (vMax - vMin)) * H;

  const path = (pts: { date: string; value: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.date).toFixed(2)},${y(p.value).toFixed(2)}`).join(" ");

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-56 w-full"
        aria-hidden="true"
        focusable="false"
      >
        {baseline !== undefined && baseline >= vMin && baseline <= vMax && (
          <line
            x1="0"
            x2={W}
            y1={y(baseline)}
            y2={y(baseline)}
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="0.4"
            strokeDasharray="1.5 1.5"
          />
        )}
        {series.map((s) => (
          <path
            key={s.id}
            d={path(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.dashed ? 1 : 1.4}
            strokeDasharray={s.dashed ? "2 1.6" : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <table id={tableId} className="sr-only">
        <thead>
          <tr>
            <th scope="col">Series</th>
            <th scope="col">Start</th>
            <th scope="col">Latest</th>
          </tr>
        </thead>
        <tbody>
          {series.map((s) => (
            <tr key={s.id}>
              <th scope="row">{s.label}</th>
              <td>{s.points[0] ? format(s.points[0].value) : "—"}</td>
              <td>{s.points.at(-1) ? format(s.points.at(-1)!.value) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
