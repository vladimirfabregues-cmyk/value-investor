"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

import { exchangeByCode } from "@/lib/finance/exchanges";
import { formatCurrency } from "@/lib/utils/format";
import type { ValueInvestingAnalysis } from "@/types/analysis";

interface StickySummaryProps {
  analysis: ValueInvestingAnalysis;
  /** Element that, once scrolled out of view, reveals this bar */
  watchRef: React.RefObject<HTMLElement | null>;
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

/**
 * Keeps identity, price, verdict and the primary action reachable once the
 * executive header has scrolled away. Hidden entirely while the header is
 * visible so it never duplicates what is already on screen.
 */
export function StickySummary({
  analysis,
  watchRef,
  onReanalyse,
  isReanalysing,
}: StickySummaryProps) {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const target = watchRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchRef]);

  const verdict = VERDICT_STYLE[analysis.final_verdict.label] ?? VERDICT_STYLE.HOLD;
  const exchange = exchangeByCode(analysis.exchange);

  return (
    <div
      aria-hidden={!visible}
      className={`sticky top-[57px] z-30 -mx-4 border-b border-white/[0.07] bg-[rgba(6,11,20,0.92)] px-4 backdrop-blur-xl sm:mx-0 sm:rounded-xl sm:border sm:px-4 ${
        visible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none h-0 overflow-hidden border-transparent opacity-0"
      } ${reducedMotion.current ? "" : "transition-opacity duration-150"}`}
    >
      <div className="flex items-center justify-between gap-3 py-2.5">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="font-mono text-sm font-semibold text-primary">{analysis.ticker}</span>
          {exchange && (
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
              {exchange.shortCode}
            </span>
          )}
          <span className="truncate text-sm text-foreground/70">{analysis.company_name}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <span className="tabular-nums text-sm text-foreground/85">
            {formatCurrency(analysis.current_price, analysis.currency)}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${verdict.chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${verdict.dot}`} aria-hidden="true" />
            {verdict.label}
          </span>
          {onReanalyse && (
            <button
              type="button"
              onClick={onReanalyse}
              disabled={isReanalysing}
              tabIndex={visible ? 0 : -1}
              className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-foreground/85 transition hover:border-primary/30 hover:text-primary disabled:opacity-50 sm:inline-flex"
            >
              <RefreshCw
                className={`h-3 w-3 ${isReanalysing ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              {isReanalysing ? "Analysing…" : "Analyse again"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
