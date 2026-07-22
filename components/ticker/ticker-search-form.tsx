"use client";

import { TrendingUp } from "lucide-react";

import { MarketSelector } from "@/components/ticker/market-selector";
import { SecuritySearch } from "@/components/ticker/security-search";
import { Button } from "@/components/ui/button";
import { exchangeByCode, toYahooTicker } from "@/lib/finance/exchanges";
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

/** Examples carry their market so no example can select the wrong listing. */
const EXAMPLES: { ticker: string; exchange: string; label: string }[] = [
  { ticker: "AAPL", exchange: "US", label: "AAPL · US" },
  { ticker: "MSFT", exchange: "US", label: "MSFT · US" },
  { ticker: "DPLM.L", exchange: "XLON", label: "DPLM · LSE" },
  { ticker: "MC.PA", exchange: "XPAR", label: "MC · EPA" },
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
  const selected = exchangeByCode(exchange);
  const resolved = ticker.trim() ? toYahooTicker(exchange, ticker) : "";

  return (
    <div className="space-y-4">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {/* 1. Market first */}
        <MarketSelector value={exchange} onChange={onExchangeChange} disabled={isLoading} />

        {/* 2. Then the company, scoped to that market */}
        <SecuritySearch
          value={ticker}
          exchange={exchange}
          isLoading={isLoading}
          error={error}
          onValueChange={onTickerChange}
          onSelect={(result: SecuritySearchResult) => {
            // Carry the market with the pick so the wrong listing can't be chosen.
            onExchangeChange(result.exchange);
            onTickerChange(result.ticker);
          }}
        />

        {resolved && resolved !== ticker.trim().toUpperCase() && (
          <p className="-mt-2 text-xs text-muted-foreground">
            Will be analysed as <span className="font-mono text-primary">{resolved}</span> on{" "}
            {selected?.name}.
          </p>
        )}

        {/* 3. Action */}
        <Button
          type="submit"
          className="h-12 w-full gap-2 sm:w-auto sm:min-w-[200px]"
          disabled={isLoading || !ticker.trim()}
        >
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          {isLoading ? "Analysing…" : "Analyse stock"}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="uppercase tracking-[0.16em] text-zinc-400">Examples</span>
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
