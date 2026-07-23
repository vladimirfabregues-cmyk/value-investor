"use client";

import Link from "next/link";
import { AlertTriangle, GitCompareArrows, RefreshCw } from "lucide-react";

import { exchangeByCode } from "@/lib/finance/exchanges";
import { describeValuationGap } from "@/lib/finance/valuation-gap";
import { buildValuationRange } from "@/lib/finance/valuation-range";
import { formatCurrency } from "@/lib/utils/format";
import { formatIsoDate } from "@/lib/utils/dates";
import type { ValueInvestingAnalysis } from "@/types/analysis";

interface AnalysisSummaryProps {
  analysis: ValueInvestingAnalysis;
  /** Only rendered when the caller can actually re-run — no dead controls. */
  onReanalyse?: () => void;
  isReanalysing?: boolean;
}

const VERDICT_STYLE: Record<string, { label: string; chip: string; dot: string }> = {
  STRONG_BUY: { label: "Strong buy", chip: "border-emerald-500/40 bg-emerald-500/12 text-emerald-200", dot: "bg-emerald-400" },
  BUY:        { label: "Buy",        chip: "border-green-500/35 bg-green-500/12 text-green-200",     dot: "bg-green-400" },
  WATCH:      { label: "Watch",      chip: "border-amber-500/35 bg-amber-500/12 text-amber-200",     dot: "bg-amber-400" },
  HOLD:       { label: "Hold",       chip: "border-slate-500/40 bg-slate-500/12 text-slate-200",     dot: "bg-slate-400" },
  AVOID:      { label: "Avoid",      chip: "border-red-500/35 bg-red-500/12 text-red-200",           dot: "bg-red-400" },
};

/** Data confidence, described in words rather than a bare percentage. */
function confidenceLabel(pct: number): { word: string; tone: string } {
  if (pct >= 70) return { word: "High", tone: "text-emerald-300" };
  if (pct >= 55) return { word: "Medium", tone: "text-amber-300" };
  return { word: "Low", tone: "text-red-300" };
}

export function AnalysisSummary({ analysis, onReanalyse, isReanalysing }: AnalysisSummaryProps) {
  const verdict = VERDICT_STYLE[analysis.final_verdict.label] ?? VERDICT_STYLE.HOLD;
  const exchange = exchangeByCode(analysis.exchange);
  const gap = describeValuationGap(analysis.intrinsic_value.margin_of_safety_pct);
  const range = buildValuationRange(analysis.intrinsic_value);
  const confidence = confidenceLabel(analysis.final_verdict.confidence_pct);
  const currency = analysis.currency;

  // Drivers come from the computed thesis, not re-derived here.
  const drivers = analysis.thesis.bull_case.slice(0, 3);

  return (
    <section
      aria-labelledby="company-heading"
      className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(18,28,45,0.96),rgba(8,14,25,0.98))] shadow-panel"
    >
      <div className="p-5 sm:p-7">
        {/* Identity line: ticker · exchange · sector · currency */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono font-semibold text-primary">{analysis.ticker}</span>
          {exchange && (
            <>
              <span aria-hidden="true">·</span>
              <span>{exchange.shortCode}</span>
            </>
          )}
          {analysis.sector && (
            <>
              <span aria-hidden="true">·</span>
              <span>{analysis.sector}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{currency}</span>
        </div>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          {/* The company is the subject of the page */}
          <h1 id="company-heading" className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
            {analysis.company_name}
          </h1>
          <p className="shrink-0 text-xs text-muted-foreground">
            As of {formatIsoDate(analysis.analysis_date)}
          </p>
        </div>

        {/* Verdict — colour is paired with text, never alone */}
        <div className="mt-4">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold ${verdict.chip}`}
          >
            <span className={`h-2 w-2 rounded-full ${verdict.dot}`} aria-hidden="true" />
            {verdict.label}
          </span>
        </div>

        {/* The four decision numbers */}
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Current price" value={formatCurrency(analysis.current_price, currency)} />
          <Metric
            label="Base value"
            value={formatCurrency(analysis.intrinsic_value.blended_intrinsic_value_per_share, currency)}
          />
          <Metric
            label="Value range"
            value={
              range.low !== null && range.high !== null
                ? `${formatCurrency(range.low, currency)}–${formatCurrency(range.high, currency)}`
                : "—"
            }
            hint={range.agreement ? `${range.agreement} model agreement` : undefined}
          />
          <Metric
            label={gap.label}
            value={gap.display}
            tone={gap.tone === "positive" ? "text-emerald-300" : gap.tone === "negative" ? "text-red-300" : undefined}
          />
        </dl>

        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric
            label="Data confidence"
            value={confidence.word}
            tone={confidence.tone}
            hint="Based on data completeness and model agreement"
          />
          <div className="col-span-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 sm:col-span-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Valuation model
            </dt>
            <dd className="mt-1 text-sm text-foreground/90">
              {analysis.verdict_explanation?.valuation_method_label ?? "Discounted cash flow"}
            </dd>
          </div>
        </dl>

        {/* Why, and the main risk */}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground">
              Why
            </h2>
            <ul className="mt-2 space-y-1.5">
              {drivers.map((driver, i) => (
                <li key={i} className="flex gap-2 text-sm leading-6 text-foreground/85">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {driver}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground">
              Main risk
            </h2>
            <p className="mt-2 flex gap-2 text-sm leading-6 text-foreground/85">
              <AlertTriangle className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden="true" />
              {analysis.thesis.key_risk}
            </p>
          </div>
        </div>
      </div>

      {/* Only actions that genuinely do something */}
      <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-white/[0.02] px-5 py-3 sm:px-7">
        {onReanalyse && (
          <button
            type="button"
            onClick={onReanalyse}
            disabled={isReanalysing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-foreground/85 transition hover:border-primary/30 hover:text-primary disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isReanalysing ? "animate-spin" : ""}`} aria-hidden="true" />
            {isReanalysing ? "Analysing…" : "Analyse again"}
          </button>
        )}
        <Link
          href="/compare"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-foreground/85 transition hover:border-primary/30 hover:text-primary"
        >
          <GitCompareArrows className="h-3 w-3" aria-hidden="true" />
          Compare
        </Link>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
      <dt className="text-xs font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className={`mt-1 font-display text-xl tabular-nums ${tone ?? "text-foreground"}`}>
        {value}
      </dd>
      {hint && <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{hint}</p>}
    </div>
  );
}
