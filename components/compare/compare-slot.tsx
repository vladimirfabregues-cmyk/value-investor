"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, X } from "lucide-react";

import { MarketSelector } from "@/components/ticker/market-selector";
import { SecuritySearch } from "@/components/ticker/security-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatIsoDate } from "@/lib/utils/dates";
import { verdictClasses } from "@/lib/utils/format";
import { DEFAULT_EXCHANGE_CODE, exchangeByCode } from "@/lib/finance/exchanges";
import { formatValuationGapShort } from "@/lib/finance/valuation-gap";
import type { SecuritySearchResult } from "@/lib/finance/security-search";
import type { SavedAnalysisSummary } from "@/types/analysis";
import type { SecurityLookupResponse } from "@/types/api";

interface CompareSlotProps {
  /** Visible name for this side, e.g. "First company" */
  label: string;
  selected: SavedAnalysisSummary | null;
  /** Saved analyses offered as a shortcut */
  history: SavedAnalysisSummary[];
  /** Id already taken by the other slot, so it cannot be picked twice */
  excludeId?: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
}

/** A company found by search that has no saved analysis yet. */
interface UnanalysedResult {
  ticker: string;
  exchange: string;
  name: string;
}

export function CompareSlot({
  label,
  selected,
  history,
  excludeId = null,
  onSelect,
  onClear,
}: CompareSlotProps) {
  const id = useId();
  const [picking, setPicking] = useState(false);
  const [exchange, setExchange] = useState(DEFAULT_EXCHANGE_CODE);
  const [query, setQuery] = useState("");
  const [looking, setLooking] = useState(false);
  const [unanalysed, setUnanalysed] = useState<UnanalysedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const available = history.filter((item) => item.id !== excludeId);

  /**
   * A company picked from the search may or may not have been analysed. Ask
   * the server, and if it has not, say so plainly and offer to analyse it —
   * silently doing nothing would look broken.
   */
  async function resolveSecurity(result: SecuritySearchResult) {
    setQuery(result.ticker);
    setUnanalysed(null);
    setError(null);
    setLooking(true);

    try {
      const response = await fetch(
        `/api/history/by-security?exchange=${encodeURIComponent(result.exchange)}&ticker=${encodeURIComponent(result.ticker)}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("lookup failed");

      const payload = (await response.json()) as SecurityLookupResponse;
      if (payload.analysis) {
        onSelect(payload.analysis.id);
        setPicking(false);
        setQuery("");
      } else {
        setUnanalysed({
          ticker: result.ticker,
          exchange: result.exchange,
          name: result.name,
        });
      }
    } catch {
      setError("Could not check for a saved analysis of this company. Try again.");
    } finally {
      setLooking(false);
    }
  }

  // ── Filled ───────────────────────────────────────────────────────────────
  if (selected && !picking) {
    const market = exchangeByCode(selected.exchange);
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-semibold tracking-[0.12em] text-foreground">
                {selected.ticker}
              </span>
              {market && (
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {market.shortCode}
                </span>
              )}
            </div>
            <div className="mt-1 truncate text-sm text-muted-foreground">
              {selected.companyName}
            </div>
          </div>
          <Badge className={cn("shrink-0", verdictClasses(selected.finalVerdictLabel))}>
            {selected.finalVerdictLabel.replace("_", " ")}
          </Badge>
        </div>

        <dl className="space-y-1 text-xs text-muted-foreground">
          <div>
            <dt className="sr-only">Main reason</dt>
            <dd className="text-zinc-300">{selected.verdictReason}</dd>
          </div>
          <div>
            <dt className="sr-only">Valuation gap</dt>
            <dd>{formatValuationGapShort(selected.marginOfSafetyPct)}</dd>
          </div>
          <div>
            <dt className="sr-only">Analysis date</dt>
            <dd>Analysed {formatIsoDate(selected.analysisDate)}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPicking(true)}>
            Change
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </Button>
        </div>
      </div>
    );
  }

  // ── Empty, or changing ───────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        {selected && (
          <Button variant="ghost" size="sm" onClick={() => setPicking(false)}>
            Cancel
          </Button>
        )}
      </div>

      {available.length > 0 && (
        <div className="mb-4">
          <label htmlFor={`${id}-saved`} className="mb-1.5 block text-sm font-medium text-foreground">
            Saved analyses
          </label>
          <select
            id={`${id}-saved`}
            value=""
            onChange={(event) => {
              if (!event.target.value) return;
              onSelect(event.target.value);
              setPicking(false);
            }}
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-foreground outline-none transition focus-visible:border-primary/50"
          >
            <option value="">Choose a saved analysis…</option>
            {available.map((item) => (
              <option key={item.id} value={item.id}>
                {item.ticker} · {item.companyName} · {item.finalVerdictLabel.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-3 border-t border-white/[0.06] pt-4">
        <p className="text-sm font-medium text-foreground">Or search every supported company</p>
        <MarketSelector value={exchange} onChange={setExchange} />
        <SecuritySearch
          value={query}
          exchange={exchange}
          isLoading={looking}
          error={error}
          onValueChange={setQuery}
          onSelect={(result) => void resolveSecurity(result)}
        />

        {looking && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Checking for a saved analysis…
          </p>
        )}

        {unanalysed && (
          <div className="rounded-xl border border-orange-500/25 bg-orange-500/[0.08] p-3.5">
            <p className="text-xs leading-5 text-orange-100">
              <span className="font-medium">{unanalysed.name}</span> has not been analysed yet.
              A comparison needs a saved analysis for both companies.
            </p>
            <Link
              href={`/?exchange=${encodeURIComponent(unanalysed.exchange)}&ticker=${encodeURIComponent(unanalysed.ticker)}`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              Analyse {unanalysed.ticker} first
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
