"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, Play, RefreshCw, TrendingUp, TrendingDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VerdictModal } from "@/components/screen/verdict-modal";
import { describeValuationGap } from "@/lib/finance/valuation-gap";
import { inferExchangeFromTicker } from "@/lib/finance/exchanges";
import { CAP_LABELS } from "@/lib/finance/verdict-explanation";
import type { ScreenResultRecord, ScreenResultFilters } from "@/lib/db/screen-queries";
import type { BatchScreenComplete, BatchScreenProgress } from "@/lib/screener/batch";

type BatchEvent =
  | BatchScreenProgress
  | BatchScreenComplete
  | { type: "error"; message: string };

interface ScreenMeta {
  lastRunAt: Date | string | null;
  totalScreened: number;
  totalErrors: number;
  /** Count per verdict across the whole index, independent of the display filter */
  verdictCounts?: Record<string, number>;
}

interface ScreenViewProps {
  initialResults: ScreenResultRecord[];
  initialMeta: ScreenMeta;
}

const VERDICTS = ["STRONG_BUY", "BUY", "WATCH", "HOLD", "AVOID"] as const;

const SECTORS = [
  "Communication Services",
  "Consumer Discretionary",
  "Consumer Staples",
  "Energy",
  "Financials",
  "Health Care",
  "Industrials",
  "Information Technology",
  "Materials",
  "Real Estate",
  "Utilities",
];

const VERDICT_CONFIG: Record<string, { label: string; dot: string; text: string; chip: string }> = {
  STRONG_BUY: { label: "Strong Buy", dot: "bg-emerald-400", text: "text-emerald-300", chip: "border-emerald-500/30 bg-emerald-500/10" },
  BUY:        { label: "Buy",        dot: "bg-green-400",   text: "text-green-300",   chip: "border-green-500/25 bg-green-500/10" },
  WATCH:      { label: "Watch",      dot: "bg-amber-400",   text: "text-amber-300",   chip: "border-amber-500/25 bg-amber-500/10" },
  HOLD:       { label: "Hold",       dot: "bg-slate-400",   text: "text-slate-300",   chip: "border-slate-500/30 bg-slate-500/10" },
  AVOID:      { label: "Avoid",      dot: "bg-red-400",     text: "text-red-300",     chip: "border-red-500/25 bg-red-500/10" },
  UNKNOWN:    { label: "Error",      dot: "bg-zinc-500",    text: "text-zinc-400",    chip: "border-zinc-500/30 bg-zinc-500/10" },
};

function CapFlags({ caps }: { caps: string | null }) {
  if (!caps) return null;
  const list = caps.split(",");
  const readable = list.map((c) => CAP_LABELS[c] ?? c).join(" · ");
  return (
    <span
      title={`Verdict capped: ${readable}`}
      className="inline-flex cursor-help items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-300"
    >
      <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />
      <span aria-hidden="true">{list.length}</span>
      {/* The bare count is meaningless to a screen reader; spell it out. */}
      <span className="sr-only">
        {list.length} verdict {list.length === 1 ? "cap" : "caps"}: {readable}
      </span>
    </span>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const cfg = VERDICT_CONFIG[verdict] ?? VERDICT_CONFIG.UNKNOWN;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.chip} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function ScoreBar({ value }: { value: number }) {
  const color = value >= 70 ? "bg-emerald-400" : value >= 55 ? "bg-amber-400" : "bg-red-400/80";
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1 w-14 overflow-hidden rounded-full bg-white/[0.07]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="w-6 text-right tabular-nums text-xs text-foreground/80">{Math.round(value)}</span>
    </div>
  );
}

function MosBadge({ value }: { value: number | null | undefined }) {
  // Never render a negative "margin of safety" — above estimated value is a premium.
  const gap = describeValuationGap(value);
  if (gap.magnitudePct === null) return <span className="text-xs text-muted-foreground">—</span>;
  const isPremium = gap.kind === "premium";
  return (
    <span
      title={gap.kind === "margin" ? `${gap.display} margin of safety` : isPremium ? `${gap.display} premium to estimated value` : "Priced at estimated value"}
      className={`inline-flex items-center justify-end gap-1 text-xs font-semibold tabular-nums ${
        gap.tone === "positive" ? "text-emerald-300" : gap.tone === "negative" ? "text-red-300/90" : "text-muted-foreground"
      }`}
    >
      {gap.tone === "positive" ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : isPremium ? <TrendingDown className="h-3 w-3" aria-hidden="true" /> : null}
      {isPremium ? `${gap.display} premium` : gap.display}
    </span>
  );
}

async function* readSseStream(response: Response): AsyncGenerator<BatchEvent> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try { yield JSON.parse(line.slice(6)) as BatchEvent; } catch { /* skip */ }
      }
    }
  }
}

type ActiveIndex =
  | "SP500" | "SP400" | "RUSSELL2000" | "RUSSELLMID"
  | "CAC40" | "FTSE100" | "FTSE250" | "AIM"
  | "TOPIXSMALL" | "EUSC";

const MARKET_GROUPS: { region: string; markets: { key: ActiveIndex; label: string; count: string }[] }[] = [
  {
    region: "United States",
    markets: [
      { key: "SP500",       label: "S&P 500",      count: "500" },
      { key: "SP400",       label: "S&P 400",      count: "400" },
      { key: "RUSSELLMID",  label: "Russell Mid",  count: "800" },
      { key: "RUSSELL2000", label: "Russell 2000", count: "1.9k" },
    ],
  },
  {
    region: "United Kingdom",
    markets: [
      { key: "FTSE100", label: "FTSE 100", count: "100" },
      { key: "FTSE250", label: "FTSE 250", count: "250" },
      { key: "AIM",     label: "AIM",      count: "400" },
    ],
  },
  {
    region: "Europe",
    markets: [
      { key: "CAC40", label: "CAC 40",          count: "40" },
      { key: "EUSC",  label: "MSCI Europe SC",  count: "840" },
    ],
  },
  {
    region: "Japan",
    markets: [
      { key: "TOPIXSMALL", label: "TOPIX Small", count: "1.2k" },
    ],
  },
];

// ── Sector-median helpers (client-side, no API call) ─────────────────────────

function median(values: number[]): number | null {
  if (values.length < 3) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function buildSectorPeMap(rows: ScreenResultRecord[]): Map<string, number> {
  const bySector = new Map<string, number[]>();
  for (const r of rows) {
    if (!r.sector || r.pe === null || r.pe <= 0 || r.pe > 200) continue;
    const arr = bySector.get(r.sector) ?? [];
    arr.push(r.pe);
    bySector.set(r.sector, arr);
  }
  const out = new Map<string, number>();
  for (const [sector, pes] of bySector) {
    const med = median(pes);
    if (med !== null) out.set(sector, med);
  }
  return out;
}

function PeVsSectorBadge({ pe, sectorMedian }: { pe: number | null; sectorMedian: number | null }) {
  if (pe === null || pe <= 0) return <span className="text-xs text-muted-foreground">—</span>;
  const peStr = pe.toFixed(1) + "×";
  if (sectorMedian === null) return <span className="tabular-nums text-xs text-foreground/80">{peStr}</span>;
  const delta = ((pe - sectorMedian) / sectorMedian) * 100;
  const isDiscount = delta < -5;
  const isPremium = delta > 5;
  return (
    <span className="inline-flex items-baseline justify-end gap-1.5 tabular-nums text-xs text-foreground/80">
      {peStr}
      {isDiscount && <span className="text-[10px] font-semibold text-emerald-400">▼{Math.abs(delta).toFixed(0)}%</span>}
      {isPremium && <span className="text-[10px] font-semibold text-amber-400/90">▲{delta.toFixed(0)}%</span>}
    </span>
  );
}

/** Header cell that can be sorted, exposing state via aria-sort. */
function SortableTh({
  label,
  field,
  align = "left",
  title,
  sortBy,
  sortDir,
  onSort,
}: {
  label: string;
  field: "compositeScore" | "marginOfSafety" | "ticker";
  align?: "left" | "right";
  title?: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (field: "compositeScore" | "marginOfSafety" | "ticker") => void;
}) {
  const active = sortBy === field;
  return (
    <th
      scope="col"
      title={title}
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : ""}`}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 uppercase tracking-[0.14em] transition hover:text-foreground ${
          active ? "text-primary" : ""
        }`}
      >
        {label}
        <span aria-hidden="true" className="text-[9px]">
          {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

export function ScreenView({ initialResults, initialMeta }: ScreenViewProps) {
  const [activeIndex, setActiveIndex] = useState<ActiveIndex>("RUSSELL2000");
  const [results, setResults] = useState<ScreenResultRecord[]>(initialResults);
  const [allResults, setAllResults] = useState<ScreenResultRecord[]>(initialResults);
  const [meta, setMeta] = useState<ScreenMeta>(initialMeta);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<{ processed: number; total: number; lastTicker: string } | null>(null);
  const [filters, setFilters] = useState<ScreenResultFilters>({});
  // Actionable candidates are shown first; seeing every rejected company is a
  // deliberate choice, not the default.
  const [candidatesOnly, setCandidatesOnly] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const runAbortRef = useRef<AbortController | null>(null);
  const didInit = useRef(false);

  const ACTIONABLE = ["STRONG_BUY", "BUY", "WATCH"];

  const fetchResults = useCallback(async (f: ScreenResultFilters, index: ActiveIndex, updateBaseline = false) => {
    setIsFiltering(true);
    const params = new URLSearchParams();
    params.set("index", index);
    if (f.sector) params.set("sector", f.sector);
    if (f.verdict) params.set("verdict", f.verdict);
    if (f.verdicts?.length) params.set("verdicts", f.verdicts.join(","));
    if (f.minCompositeScore !== undefined) params.set("minScore", String(f.minCompositeScore));
    if (f.marketCapTier) params.set("marketCap", f.marketCapTier);
    if (f.sortBy) params.set("sortBy", f.sortBy);
    if (f.sortDir) params.set("sortDir", f.sortDir);
    const res = await fetch(`/api/screen/results?${params}`);
    const data = await res.json() as { results: ScreenResultRecord[]; meta: ScreenMeta };
    setResults(data.results);
    setMeta(data.meta);
    const noFilters = !f.sector && !f.verdict && !f.marketCapTier && f.minCompositeScore === undefined;
    if (updateBaseline || noFilters) setAllResults(data.results);
    setIsFiltering(false);
  }, []);

  const handleFilterChange = useCallback((key: keyof ScreenResultFilters, value: string | undefined) => {
    const next = { ...filters, [key]: value || undefined };
    // Picking a specific verdict leaves candidate mode.
    if (key === "verdict" && value) { setCandidatesOnly(false); next.verdicts = undefined; }
    setFilters(next);
    void fetchResults(next, activeIndex);
  }, [filters, fetchResults, activeIndex]);

  const applyCandidateMode = useCallback((on: boolean) => {
    setCandidatesOnly(on);
    const next: ScreenResultFilters = {
      ...filters,
      verdict: undefined,
      verdicts: on ? ACTIONABLE : undefined,
    };
    setFilters(next);
    void fetchResults(next, activeIndex);
  }, [filters, fetchResults, activeIndex]);

  const handleSort = useCallback((field: "compositeScore" | "marginOfSafety" | "ticker") => {
    const sameField = (filters.sortBy ?? "compositeScore") === field;
    const nextDir: "asc" | "desc" = sameField && (filters.sortDir ?? "desc") === "desc" ? "asc" : "desc";
    const next = { ...filters, sortBy: field, sortDir: nextDir };
    setFilters(next);
    void fetchResults(next, activeIndex);
  }, [filters, fetchResults, activeIndex]);

  const handleIndexChange = useCallback((index: ActiveIndex) => {
    if (index === activeIndex) return;
    // Switching markets abandons any in-flight run so the UI can never get
    // stuck in a "running" state that locks every control.
    runAbortRef.current?.abort();
    setIsRunning(false);
    setProgress(null);
    setActiveIndex(index);
    const cleared: ScreenResultFilters = candidatesOnly ? { verdicts: ACTIONABLE } : {};
    setFilters(cleared);
    void fetchResults(cleared, index, true);
  }, [activeIndex, fetchResults, candidatesOnly]);

  const handleRun = useCallback(async () => {
    runAbortRef.current?.abort();
    const abort = new AbortController();
    runAbortRef.current = abort;
    setIsRunning(true);
    setProgress({ processed: 0, total: 0, lastTicker: "" });

    try {
      const res = await fetch(`/api/screen/run?index=${activeIndex}`, { method: "POST", signal: abort.signal });
      if (!res.ok || !res.body) throw new Error("Failed to start screen run");

      for await (const event of readSseStream(res)) {
        if (event.type === "progress") {
          setProgress({ processed: event.processed, total: event.total, lastTicker: event.ticker });
        } else if (event.type === "complete") {
          setProgress(null);
          setIsRunning(false);
          await fetchResults(filters, activeIndex, true);
          return;
        } else if (event.type === "error") {
          setProgress(null);
          setIsRunning(false);
          return;
        }
      }
    } catch {
      setIsRunning(false);
      setProgress(null);
    }
  }, [filters, fetchResults, activeIndex]);

  // Apply the candidate default once on mount.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    void fetchResults({ verdicts: ACTIONABLE }, activeIndex, true);
    setFilters({ verdicts: ACTIONABLE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleVerdictFilter = useCallback((verdict: string) => {
    handleFilterChange("verdict", filters.verdict === verdict ? undefined : verdict);
  }, [filters.verdict, handleFilterChange]);

  const lastRunLabel = meta.lastRunAt
    ? new Date(meta.lastRunAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : null;

  // Sourced from the index-wide totals in meta, not the (possibly
  // candidate-filtered) rows on screen — so Hold and Avoid show their real
  // counts rather than 0 when the view is limited to actionable candidates.
  const verdictCounts = VERDICTS.reduce<Record<string, number>>((acc, v) => {
    acc[v] = meta.verdictCounts?.[v] ?? 0;
    return acc;
  }, {});

  const activeMarket = MARKET_GROUPS.flatMap((g) => g.markets).find((m) => m.key === activeIndex);

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-primary/90">Quantitative Value Screen</div>
          <h1 className="mt-1.5 font-display text-4xl text-foreground">Stock Screener</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Graham-style gates: normalized earnings, sector-aware intrinsic value, corroborated margins of safety.
          </p>
        </div>
        <Button
          onClick={() => void handleRun()}
          disabled={isRunning}
          size="lg"
          className="shrink-0 gap-2 px-6 shadow-[0_10px_30px_rgba(181,148,88,0.22)]"
        >
          {isRunning ? (
            <><RefreshCw className="h-4 w-4 animate-spin" /> Screening {activeMarket?.label}…</>
          ) : (
            <><Play className="h-4 w-4" /> Run {activeMarket?.label} Screen</>
          )}
        </Button>
      </div>

      {/* ── Market picker, grouped by region ── */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 shadow-panel">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MARKET_GROUPS.map(({ region, markets }) => (
            <div key={region}>
              <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {region}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {markets.map(({ key, label, count }) => {
                  const active = activeIndex === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleIndexChange(key)}
                      className={`group inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all ${
                        active
                          ? "border-primary/45 bg-primary/15 font-semibold text-primary shadow-[0_4px_16px_rgba(181,148,88,0.15)]"
                          : "border-white/[0.07] bg-white/[0.02] text-muted-foreground hover:border-white/15 hover:text-foreground"
                      }`}
                    >
                      {label}
                      <span className={`text-[10px] tabular-nums ${active ? "text-primary" : "text-muted-foreground"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Run progress ── */}
      {isRunning && progress && (
        <div className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.06] p-4">
          <div className="mb-2.5 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground/90">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
              Screening <span className="font-mono text-primary">{progress.lastTicker || "…"}</span>
            </span>
            <span className="tabular-nums text-muted-foreground">
              {progress.processed} / {progress.total || "…"}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-300"
              style={{ width: progress.total > 0 ? `${(progress.processed / progress.total) * 100}%` : "4%" }}
            />
          </div>
        </div>
      )}

      {/* ── Candidates summary: actionable names first ── */}
      {allResults.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/[0.05] px-4 py-3">
          {/* Announce count changes when filters or the market change */}
          <div role="status" aria-live="polite">
            <p className="text-sm font-medium text-foreground">
              {candidatesOnly
                ? `${results.length} candidate${results.length === 1 ? "" : "s"} found`
                : `${results.length} compan${results.length === 1 ? "y" : "ies"} shown`}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {candidatesOnly
                ? `${verdictCounts.STRONG_BUY + verdictCounts.BUY} Buy · ${verdictCounts.WATCH} Watch — companies that passed the principal quality and valuation gates.`
                : "Showing every screened company, including those the gates rejected."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => applyCandidateMode(!candidatesOnly)}
            className="shrink-0 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground/85 transition hover:border-primary/35 hover:text-primary"
          >
            {candidatesOnly ? "Show all companies" : "Show candidates only"}
          </button>
        </div>
      )}

      {/* ── Verdict summary (clickable) ── */}
      {/* Shown whenever the index has been screened, so the full verdict
          distribution (incl. Hold/Avoid) is visible even in candidates-only view. */}
      {meta.totalScreened > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {VERDICTS.map((v) => {
            const cfg = VERDICT_CONFIG[v];
            const active = filters.verdict === v;
            return (
              <button
                key={v}
                onClick={() => toggleVerdictFilter(v)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  active
                    ? `${cfg.chip} shadow-[0_6px_20px_rgba(0,0,0,0.25)]`
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.14]"
                }`}
                title={active ? "Click to clear this filter" : `Show only ${cfg.label} names`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  <span className={`text-[11px] font-medium uppercase tracking-wider ${active ? cfg.text : "text-muted-foreground"}`}>
                    {cfg.label}
                  </span>
                </div>
                <div className={`mt-1.5 font-display text-2xl tabular-nums ${active ? cfg.text : "text-foreground"}`}>
                  {verdictCounts[v]}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Select
          value={filters.sector ?? "all"}
          onValueChange={(v) => handleFilterChange("sector", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sectors</SelectItem>
            {SECTORS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.marketCapTier ?? "all"}
          onValueChange={(v) => handleFilterChange("marketCapTier", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Market cap" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sizes</SelectItem>
            <SelectItem value="micro">Micro (&lt;$300M)</SelectItem>
            <SelectItem value="small">Small ($300M–$2B)</SelectItem>
            <SelectItem value="mid">Mid ($2B–$10B)</SelectItem>
            <SelectItem value="large">Large ($10B–$200B)</SelectItem>
            <SelectItem value="mega">Mega (&gt;$200B)</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy ?? "compositeScore"}
          onValueChange={(v) => handleFilterChange("sortBy", v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compositeScore">Composite Score</SelectItem>
            <SelectItem value="marginOfSafety">Margin of Safety</SelectItem>
            <SelectItem value="ticker">Ticker (A–Z)</SelectItem>
          </SelectContent>
        </Select>

        {(filters.verdict || filters.sector || filters.marketCapTier) && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => {
              const cleared = {};
              setFilters(cleared);
              void fetchResults(cleared, activeIndex, true);
            }}
          >
            <X className="h-3 w-3" /> Clear filters
          </Button>
        )}

        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          {isFiltering && <span className="animate-pulse">Filtering…</span>}
          {lastRunLabel && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Last run {lastRunLabel}
            </span>
          )}
        </div>
      </div>

      {/* ── Audit warnings ── */}
      {results.length > 0 && (() => {
        const times = results.map((r) => new Date(r.screenerAt).getTime());
        const spanDays = (Math.max(...times) - Math.min(...times)) / 86_400_000;
        const ageDays = (Date.now() - Math.max(...times)) / 86_400_000;

        const buyRated = results.filter((r) => r.verdictLabel === "STRONG_BUY" || r.verdictLabel === "BUY");
        const bySector = new Map<string, number>();
        for (const r of buyRated) {
          if (r.sector) bySector.set(r.sector, (bySector.get(r.sector) ?? 0) + 1);
        }
        const top = [...bySector.entries()].sort((a, b) => b[1] - a[1])[0];
        const concentrated = top && buyRated.length >= 4 && top[1] / buyRated.length > 0.25;

        if (spanDays <= 7 && ageDays <= 30 && !concentrated) return null;
        return (
          <div className="space-y-2">
            {spanDays > 7 && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-xs leading-5 text-amber-200/90">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span>Results mix screening runs up to {Math.round(spanDays)} days apart — older rows may predate methodology changes. Re-run this market for consistent verdicts.</span>
              </div>
            )}
            {ageDays > 30 && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-xs leading-5 text-amber-200/90">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span>Latest results are {Math.round(ageDays)} days old — prices and fundamentals have moved since.</span>
              </div>
            )}
            {concentrated && (
              <div className="rounded-xl border border-orange-500/25 bg-orange-500/[0.07] px-4 py-3">
                <div className="flex items-start gap-2.5 text-xs leading-5 text-orange-200/90">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-400" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold">Concentration:</strong> {top[1]} of {buyRated.length}{" "}
                    Buy-rated names are {top[0]} — likely one correlated sector-cycle bet rather than
                    independent ideas.
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2 pl-6">
                  <button
                    type="button"
                    onClick={() => handleFilterChange("sector", top[0])}
                    className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[11px] font-medium text-orange-100 transition hover:bg-orange-500/20"
                  >
                    View {top[0]} exposure
                  </button>
                  {filters.sector && (
                    <button
                      type="button"
                      onClick={() => handleFilterChange("sector", undefined)}
                      className="rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-foreground/80 transition hover:border-white/25"
                    >
                      Clear sector filter
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Results ── */}
      {results.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] py-24 text-center shadow-panel">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
            <Play className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-4 font-display text-xl text-foreground">
            {meta.totalScreened === 0 ? `No data yet for ${activeMarket?.label}` : "No companies match the current filters"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {meta.totalScreened === 0
              ? "Run the screen to fetch fundamentals and score every constituent through the valuation pipeline."
              : "Relax or clear the filters above to see more of the screened universe."}
          </p>
        </div>
      ) : (() => {
        const sectorPeMap = buildSectorPeMap(results);
        return (
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[rgba(10,16,28,0.55)] shadow-panel">
            {/* Cards on mobile — a 10-column table is unusable at 375px */}
            <ul className="divide-y divide-white/[0.05] lg:hidden">
              {results.map((row) => {
                const gap = describeValuationGap(row.marginOfSafety);
                const cfg = VERDICT_CONFIG[row.verdictLabel] ?? VERDICT_CONFIG.UNKNOWN;
                return (
                  <li key={`m-${row.ticker}-${row.screenerIndex}`} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-sm font-semibold text-primary">{row.ticker}</span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {inferExchangeFromTicker(row.ticker).shortCode}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-foreground/85">{row.companyName}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{row.sector ?? "—"}</p>
                      </div>
                      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.chip} ${cfg.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
                        {cfg.label}
                      </span>
                    </div>

                    <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Overall</dt>
                        <dd className="mt-0.5 tabular-nums text-foreground">{Math.round(row.compositeScore)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {gap.kind === "premium" ? "Premium" : "Margin of safety"}
                        </dt>
                        <dd className={`mt-0.5 tabular-nums ${gap.tone === "positive" ? "text-emerald-300" : gap.tone === "negative" ? "text-red-300/90" : "text-muted-foreground"}`}>
                          {gap.display}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Price</dt>
                        <dd className="mt-0.5 tabular-nums text-foreground/85">
                          <span className="text-muted-foreground">{row.currency}</span>{" "}
                          {row.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Valuation</dt>
                        <dd className="mt-0.5 tabular-nums text-muted-foreground">{Math.round(row.valuationScore)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Health</dt>
                        <dd className="mt-0.5 tabular-nums text-muted-foreground">{Math.round(row.healthScore)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Quality</dt>
                        <dd className="mt-0.5 tabular-nums text-muted-foreground">{Math.round(row.qualityScore)}</dd>
                      </div>
                    </dl>

                    {row.verdictCaps && (
                      <p className="mt-2 text-[11px] leading-4 text-amber-300/90">
                        Capped: {row.verdictCaps.split(",").map((c) => CAP_LABELS[c] ?? c).join(" · ")}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-2">
                      <Link
                        href={`/?exchange=${inferExchangeFromTicker(row.ticker).code}&ticker=${encodeURIComponent(row.ticker)}`}
                        className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                      >
                        View analysis
                      </Link>
                      <VerdictModal row={row}>
                        <button className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs text-foreground/80">
                          Why this verdict
                        </button>
                      </VerdictModal>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="hidden max-h-[68vh] overflow-auto lg:block">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-white/[0.08] bg-[#0b1220] text-left text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <SortableTh label="Company" field="ticker" sortBy={filters.sortBy ?? "compositeScore"} sortDir={filters.sortDir ?? "desc"} onSort={handleSort} />
                    <th scope="col" className="px-4 py-3 font-medium">Sector</th>
                    <th scope="col" className="px-4 py-3 font-medium">Verdict</th>
                    <SortableTh label="Overall score" field="compositeScore" sortBy={filters.sortBy ?? "compositeScore"} sortDir={filters.sortDir ?? "desc"} onSort={handleSort} />
                    <SortableTh label="Margin of safety" field="marginOfSafety" align="right" title="Margin of safety, or premium when price exceeds estimated value" sortBy={filters.sortBy ?? "compositeScore"} sortDir={filters.sortDir ?? "desc"} onSort={handleSort} />
                    <th className="px-3 py-3 text-right font-medium" title="Valuation score out of 100">Valuation</th>
                    <th className="px-3 py-3 text-right font-medium" title="Financial health score out of 100">Financial health</th>
                    <th className="px-3 py-3 text-right font-medium" title="Business quality score out of 100">Business quality</th>
                    <th className="px-4 py-3 text-right font-medium" title="P/E · ▼ below sector median · ▲ above">P/E</th>
                    <th className="px-4 py-3 text-right font-medium">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {results.map((row) => {
                    const sectorMedianPe = row.sector ? (sectorPeMap.get(row.sector) ?? null) : null;
                    return (
                      <tr key={`${row.ticker}-${row.screenerIndex}`} className="group transition-colors hover:bg-primary/[0.04]">
                        <td className="px-4 py-2.5">
                          <Link href={`/?exchange=${inferExchangeFromTicker(row.ticker).code}&ticker=${encodeURIComponent(row.ticker)}`} className="block">
                            <span className="font-mono text-[13px] font-semibold text-primary group-hover:underline">
                              {row.ticker}
                            </span>
                            <span className="block max-w-[200px] truncate text-xs text-muted-foreground">
                              {row.companyName}
                            </span>
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted-foreground">
                          {row.sector ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5">
                          <span className="inline-flex items-center gap-1.5">
                            <VerdictModal row={row}>
                              <button className="cursor-pointer rounded-full transition-opacity hover:opacity-80">
                                <VerdictBadge verdict={row.verdictLabel} />
                              </button>
                            </VerdictModal>
                            <CapFlags caps={row.verdictCaps} />
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <ScoreBar value={row.compositeScore} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right">
                          <MosBadge value={row.marginOfSafety} />
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-xs text-muted-foreground">
                          {Math.round(row.valuationScore)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-xs text-muted-foreground">
                          {Math.round(row.healthScore)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-xs text-muted-foreground">
                          {Math.round(row.qualityScore)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right">
                          <PeVsSectorBadge pe={row.pe} sectorMedian={sectorMedianPe} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums text-xs text-foreground/85">
                          <span className="text-muted-foreground">{row.currency}</span>{" "}
                          {row.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs text-muted-foreground">
              <span>
                {results.length} result{results.length !== 1 ? "s" : ""}
                {meta.totalErrors > 0 && ` · ${meta.totalErrors} ticker${meta.totalErrors !== 1 ? "s" : ""} failed`}
              </span>
              <span className="hidden sm:block">
                Click a verdict for the full breakdown · ⚠ marks capped verdicts
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
