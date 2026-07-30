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
import { useTranslation } from "@/lib/i18n/locale-context";
import { renderVerdictReason } from "@/lib/history/verdict-reason";
import { oneLineVerdictFrom } from "@/lib/finance/prose";
import { DEFAULT_EXCHANGE_CODE, exchangeByCode } from "@/lib/finance/exchanges";
import { describeValuationGap } from "@/lib/finance/valuation-gap";
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
  const { t } = useTranslation();
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
      setError(t("compare.slot.lookupError"));
    } finally {
      setLooking(false);
    }
  }

  // ── Filled ───────────────────────────────────────────────────────────────
  if (selected && !picking) {
    const market = exchangeByCode(selected.exchange);
    const gap = describeValuationGap(selected.marginOfSafetyPct);
    const gapText =
      gap.magnitudePct === null
        ? "—"
        : gap.kind === "margin"
          ? t("analysis.evidence.marginOfSafety", { value: gap.display })
          : gap.kind === "premium"
            ? t("analysis.evidence.premium", { value: gap.display })
            : t("analysis.evidence.pricedAtValue");
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
            {t(`verdict.${selected.finalVerdictLabel}`)}
          </Badge>
        </div>

        <dl className="space-y-1 text-xs text-muted-foreground">
          <div>
            <dt className="sr-only">{t("compare.slot.mainReason")}</dt>
            <dd className="text-zinc-300">
              {selected.verdictReasonToken
                ? renderVerdictReason(
                    selected.verdictReasonToken,
                    oneLineVerdictFrom(selected.finalVerdictLabel, selected.marginOfSafetyPct, selected.companyName, t),
                    t,
                  )
                : selected.verdictReason}
            </dd>
          </div>
          <div>
            <dt className="sr-only">{t("compare.slot.valuationGap")}</dt>
            <dd>{gapText}</dd>
          </div>
          <div>
            <dt className="sr-only">{t("compare.slot.analysisDate")}</dt>
            <dd>{t("common.analysedOn", { date: formatIsoDate(selected.analysisDate) })}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPicking(true)}>
            {t("common.change")}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            {t("common.remove")}
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
            {t("common.cancel")}
          </Button>
        )}
      </div>

      {available.length > 0 && (
        <div className="mb-4">
          <label htmlFor={`${id}-saved`} className="mb-1.5 block text-sm font-medium text-foreground">
            {t("compare.slot.savedAnalyses")}
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
            <option value="">{t("compare.slot.chooseSaved")}</option>
            {available.map((item) => (
              <option key={item.id} value={item.id}>
                {item.ticker} · {item.companyName} · {t(`verdict.${item.finalVerdictLabel}`)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-3 border-t border-white/[0.06] pt-4">
        <p className="text-sm font-medium text-foreground">{t("compare.slot.orSearch")}</p>
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
            {t("compare.slot.checking")}
          </p>
        )}

        {unanalysed && (
          <div className="rounded-xl border border-orange-500/25 bg-orange-500/[0.08] p-3.5">
            <p className="text-xs leading-5 text-orange-100">
              {t("compare.slot.notAnalysed", { name: unanalysed.name })}
            </p>
            <Link
              href={`/?exchange=${encodeURIComponent(unanalysed.exchange)}&ticker=${encodeURIComponent(unanalysed.ticker)}`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              {t("compare.slot.analyseFirst", { ticker: unanalysed.ticker })}
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
