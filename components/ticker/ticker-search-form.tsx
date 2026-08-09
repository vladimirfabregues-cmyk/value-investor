"use client";

import { TrendingUp } from "lucide-react";

import { SecuritySearch } from "@/components/ticker/security-search";
import { Button } from "@/components/ui/button";
import { exchangeByCode, inferExchangeFromTicker, toYahooTicker } from "@/lib/finance/exchanges";
import { useTranslation } from "@/lib/i18n/locale-context";
import type { SecuritySearchResult } from "@/lib/finance/security-search";

interface TickerSearchFormProps {
  ticker: string;
  exchange: string;
  isLoading: boolean;
  error?: string | null;
  onTickerChange: (value: string) => void;
  onExchangeChange: (value: string) => void;
  onSubmit: () => void;
}

/** Examples carry their market so no example can select the wrong listing.
 *  Labels use one canonical ticker format (P3-2). */
const EXAMPLES: { ticker: string; exchange: string; label: string }[] = [
  { ticker: "AAPL", exchange: "US", label: "AAPL" },
  { ticker: "MSFT", exchange: "US", label: "MSFT" },
  { ticker: "DPLM.L", exchange: "XLON", label: "DPLM.L" },
  { ticker: "MC.PA", exchange: "XPAR", label: "MC.PA" },
];

export function TickerSearchForm({
  ticker,
  exchange,
  isLoading,
  error = null,
  onTickerChange,
  onExchangeChange,
  onSubmit,
}: TickerSearchFormProps) {
  const { t } = useTranslation();
  // A ticker suffix (e.g. .PA) names its own market; otherwise use the picked
  // exchange, else US. This is what "will be analysed as" reflects (P3-1/P3-2).
  const effectiveExchange = ticker.trim().includes(".")
    ? inferExchangeFromTicker(ticker).code
    : exchange;
  const selected = exchangeByCode(effectiveExchange);
  const resolved = ticker.trim() ? toYahooTicker(effectiveExchange, ticker) : "";

  return (
    <div className="space-y-4">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {/* Ticker-first: one search across all markets. Exchange is resolved
            from the chosen result, not selected up front. */}
        <SecuritySearch
          value={ticker}
          isLoading={isLoading}
          error={error}
          onValueChange={onTickerChange}
          onSelect={(result: SecuritySearchResult) => {
            // Carry the market with the pick so the resolved listing is exact.
            onExchangeChange(result.exchange);
            onTickerChange(result.ticker);
          }}
        />

        {resolved && resolved !== ticker.trim().toUpperCase() && (
          <p className="-mt-2 text-xs text-muted-foreground">
            {t("form.willAnalyseAs", { ticker: resolved, market: selected?.name ?? "" })}
          </p>
        )}

        {/* 3. Action */}
        <Button
          type="submit"
          className="h-12 w-full gap-2 sm:w-auto sm:min-w-[200px]"
          disabled={isLoading || !ticker.trim()}
        >
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          {isLoading ? t("common.analysing") : t("form.submit")}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="uppercase tracking-[0.16em] text-zinc-400">{t("form.examples")}</span>
        {EXAMPLES.map((example) => (
          <button
            key={`${example.exchange}:${example.ticker}`}
            type="button"
            onClick={() => {
              onExchangeChange(example.exchange);
              onTickerChange(example.ticker);
            }}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-zinc-200 transition hover:border-primary/30 hover:text-primary"
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}
