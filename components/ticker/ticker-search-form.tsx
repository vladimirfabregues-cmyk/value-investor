"use client";

import { Search, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TickerSearchFormProps {
  ticker: string;
  isLoading: boolean;
  onTickerChange: (value: string) => void;
  onSubmit: () => void;
}

const EXAMPLE_TICKERS = ["AAPL", "MSFT", "BRK.B", "INTC"] as const;

export function TickerSearchForm({
  ticker,
  isLoading,
  onTickerChange,
  onSubmit,
}: TickerSearchFormProps) {
  return (
    <div className="space-y-4">
      <form
        className="flex flex-col gap-3 md:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={ticker}
            onChange={(event) => onTickerChange(event.target.value)}
            placeholder="Enter a public equity ticker"
            className="pl-11"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Button type="submit" className="min-w-[160px]" disabled={isLoading || !ticker.trim()}>
          <TrendingUp className="h-4 w-4" />
          {isLoading ? "Analyzing..." : "Analyze"}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="uppercase tracking-[0.16em] text-zinc-400">Examples</span>
        {EXAMPLE_TICKERS.map((exampleTicker) => (
          <button
            key={exampleTicker}
            type="button"
            onClick={() => onTickerChange(exampleTicker)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-zinc-200 transition hover:border-primary/30 hover:text-primary"
          >
            {exampleTicker}
          </button>
        ))}
      </div>
    </div>
  );
}
