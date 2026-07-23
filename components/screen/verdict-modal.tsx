"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ExternalLink, Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { describeValuationGap } from "@/lib/finance/valuation-gap";
import { inferExchangeFromTicker } from "@/lib/finance/exchanges";
import { CAP_LABELS } from "@/lib/finance/verdict-explanation";
import type { ScreenResultRecord } from "@/lib/db/screen-queries";
import type { NewsArticle } from "@/app/api/screen/news/route";

interface VerdictModalProps {
  row: ScreenResultRecord;
  children: React.ReactNode;
}

const VERDICT_CONFIG: Record<string, { label: string; dot: string; text: string; chip: string; summary: string }> = {
  STRONG_BUY: {
    label: "Strong Buy", dot: "bg-emerald-400", text: "text-emerald-300", chip: "border-emerald-500/30 bg-emerald-500/10",
    summary: "Scores well across all dimensions and trades at a meaningful, corroborated discount to estimated intrinsic value.",
  },
  BUY: {
    label: "Buy", dot: "bg-green-400", text: "text-green-300", chip: "border-green-500/25 bg-green-500/10",
    summary: "Solid fundamentals with a reasonable margin of safety. Minor concerns in one area don't outweigh the overall opportunity.",
  },
  WATCH: {
    label: "Watch", dot: "bg-amber-400", text: "text-amber-300", chip: "border-amber-500/25 bg-amber-500/10",
    summary: "Interesting on some metrics but not compelling enough yet. Worth monitoring for a better entry point.",
  },
  HOLD: {
    label: "Hold", dot: "bg-slate-400", text: "text-slate-300", chip: "border-slate-500/30 bg-slate-500/10",
    summary: "Fairly valued with mixed characteristics. Neither an attractive purchase nor a clear exit.",
  },
  AVOID: {
    label: "Avoid", dot: "bg-red-400", text: "text-red-300", chip: "border-red-500/25 bg-red-500/10",
    summary: "Weak fundamentals, poor financial health, or trading at a premium to intrinsic value.",
  },
};

function band(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Elite", color: "text-emerald-300" };
  if (score >= 70) return { label: "Strong", color: "text-green-300" };
  if (score >= 55) return { label: "Mixed", color: "text-amber-300" };
  if (score >= 40) return { label: "Weak", color: "text-orange-300" };
  return { label: "Poor", color: "text-red-300" };
}

function fmtX(n: number | null | undefined, decimals = 1): string {
  if (n == null) return "—";
  return n.toFixed(decimals) + "×";
}

function fmtPct(n: number | null | undefined): string {
  if (n == null) return "—";
  return (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
}

function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg tabular-nums text-foreground">{value}</div>
      {note && <div className="mt-0.5 text-[10px] text-muted-foreground">{note}</div>}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const b = band(score);
  const barColor = score >= 70 ? "bg-emerald-400" : score >= 55 ? "bg-amber-400" : "bg-red-400/80";
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 shrink-0 text-xs text-muted-foreground">{label}</div>
      <div className="flex-1">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, score)}%` }} />
        </div>
      </div>
      <span className={`w-8 shrink-0 text-right text-xs font-semibold tabular-nums ${b.color}`}>{Math.round(score)}</span>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function VerdictModal({ row, children }: VerdictModalProps) {
  const cfg = VERDICT_CONFIG[row.verdictLabel] ?? VERDICT_CONFIG.AVOID;
  const compositeBand = band(row.compositeScore);
  const caps = row.verdictCaps ? row.verdictCaps.split(",") : [];
  // Negative gaps are premiums, not negative margins of safety.
  const gap = describeValuationGap(row.marginOfSafety);

  const [news, setNews] = useState<NewsArticle[] | null>(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || news !== null) return;
    setNewsLoading(true);
    fetch(`/api/screen/news?ticker=${encodeURIComponent(row.ticker)}&name=${encodeURIComponent(row.companyName)}`)
      .then((r) => r.json())
      .then((d: { articles: NewsArticle[] }) => setNews(d.articles))
      .catch(() => setNews([]))
      .finally(() => setNewsLoading(false));
  }, [open, row.ticker, news]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border-white/[0.08] bg-[#0a101c] p-0 shadow-panel">
        {/* ── Header band ── */}
        <div className="border-b border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent px-6 pb-5 pt-6">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <DialogTitle className="font-mono text-2xl tracking-tight text-primary">{row.ticker}</DialogTitle>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.chip} ${cfg.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-foreground/85">{row.companyName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {row.sector ?? "—"} · {row.screenerIndex}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Price</div>
                <div className="mt-0.5 font-display text-xl tabular-nums text-foreground">
                  <span className="text-sm text-muted-foreground">{row.currency}</span>{" "}
                  {row.price?.toFixed(2) ?? "—"}
                </div>
              </div>
            </div>
            <DialogDescription className="mt-3 text-sm leading-6 text-muted-foreground">
              {cfg.summary}
            </DialogDescription>
          </DialogHeader>

          {/* Red-flag caps — why the verdict was held down */}
          {caps.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {caps.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/[0.08] px-2.5 py-1 text-[11px] font-medium text-amber-200/90"
                >
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                  {CAP_LABELS[c] ?? c}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5 px-6 pb-6 pt-5">
          {/* ── Composite + component scores ── */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Composite Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-xs font-medium ${compositeBand.color}`}>{compositeBand.label}</span>
                <span className="font-display text-3xl tabular-nums text-foreground">{Math.round(row.compositeScore)}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="space-y-2.5">
              <ScoreBar label="Valuation" score={row.valuationScore} />
              <ScoreBar label="Health" score={row.healthScore} />
              <ScoreBar label="Quality" score={row.qualityScore} />
              <ScoreBar label="Moat" score={row.moatScore} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
              <span className="text-xs text-muted-foreground" title="Versus the sector-appropriate intrinsic value model">
                {gap.label}
              </span>
              <span className={`font-display text-lg tabular-nums ${
                gap.tone === "positive" ? "text-emerald-300" : gap.tone === "negative" ? "text-red-300" : "text-foreground"
              }`}>
                {gap.display}
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
              Component weights are sector-aware; financials, REITs, and utilities are valued on
              justified P/B, NAV, and dividend-discount models respectively rather than FCF.
            </p>
          </div>

          {/* ── Valuation ratios ── */}
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Valuation Ratios
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <StatTile label="P / E" value={fmtX(row.pe)} />
              <StatTile label="P / B" value={fmtX(row.pb, 2)} />
              <StatTile label="P / S" value={fmtX(row.ps)} />
              <StatTile label="EV / EBITDA" value={fmtX(row.evEbitda)} />
              <StatTile label="Price / FCF" value={fmtX(row.priceFcf)} />
              <StatTile
                label="Graham №"
                value={row.grahamNumber != null ? `${row.currency ?? ""} ${row.grahamNumber.toFixed(2)}` : "—"}
                note={row.grahamNumber !== null && row.price > 0
                  ? row.price <= row.grahamNumber ? "Price below Graham threshold" : "Price above Graham threshold"
                  : undefined}
              />
            </div>
          </div>

          {/* ── News ── */}
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Recent News
            </p>
            {newsLoading && (
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading news…
              </div>
            )}
            {!newsLoading && news !== null && news.length === 0 && (
              <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-muted-foreground">
                No recent news found.
              </p>
            )}
            {!newsLoading && news !== null && news.length > 0 && (
              <div className="divide-y divide-white/[0.05] overflow-hidden rounded-xl border border-white/[0.07]">
                {news.map((article, i) => (
                  <a
                    key={i}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-3 bg-white/[0.02] px-4 py-3 transition-colors hover:bg-primary/[0.05]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground/90 group-hover:text-foreground">{article.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {article.publisher} · {timeAgo(article.publishedAt)}
                      </p>
                    </div>
                    <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
            <p className="text-[11px] text-muted-foreground">
              Yahoo Finance + SEC EDGAR · Deterministic scoring
            </p>
            <Link
              href={`/?exchange=${inferExchangeFromTicker(row.ticker).code}&ticker=${encodeURIComponent(row.ticker)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/35 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20 hover:shadow-[0_4px_16px_rgba(181,148,88,0.2)]"
            >
              Run full analysis <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
