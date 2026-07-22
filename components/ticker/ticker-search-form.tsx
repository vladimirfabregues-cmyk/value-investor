"use client";

import { useId } from "react";
import { Search, TrendingUp } from "lucide-react";

import { MarketSelector } from "@/components/ticker/market-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exchangeByCode, toYahooTicker } from "@/lib/finance/exchanges";

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
  const tickerId = useId();
  const errorId = `${tickerId}-error`;
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
        <div>
          <label htmlFor={tickerId} className="mb-1.5 block text-sm font-medium text-foreground">
            Ticker or company
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={tickerId}
              value={ticker}
              onChange={(event) => onTickerChange(event.target.value)}
              placeholder={selected ? `Ticker on ${selected.shortCode}` : "Ticker"}
              className="h-12 pl-11"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
          </div>
          {resolved && resolved !== ticker.trim().toUpperCase() && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Will be analysed as{" "}
              <span className="font-mono text-primary">{resolved}</span> on {selected?.name}.
            </p>
          )}
          {error && (
            <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-300">
              {error}
            </p>
          )}
        </div>

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
