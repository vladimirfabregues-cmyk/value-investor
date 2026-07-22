"use client";

import { useId } from "react";

import { EXCHANGES } from "@/lib/finance/exchanges";

interface MarketSelectorProps {
  value: string;
  onChange: (exchangeCode: string) => void;
  disabled?: boolean;
}

/**
 * Market must be chosen before a company, so the same symbol on two exchanges
 * can never be confused. Uses a native <select> deliberately: it is searchable
 * by typing, fully keyboard operable, and announced correctly by screen
 * readers on every platform without extra ARIA plumbing.
 */
export function MarketSelector({ value, onChange, disabled = false }: MarketSelectorProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  if (EXCHANGES.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] p-4 text-sm text-muted-foreground">
        No markets are currently available.
      </div>
    );
  }

  // Group by country so long lists stay scannable.
  const byCountry = new Map<string, typeof EXCHANGES>();
  for (const exchange of EXCHANGES) {
    const list = byCountry.get(exchange.country) ?? [];
    list.push(exchange);
    byCountry.set(exchange.country, list);
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        Market or exchange
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        aria-describedby={hintId}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-foreground outline-none transition focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {[...byCountry.entries()].map(([country, exchanges]) => (
          <optgroup key={country} label={country}>
            {exchanges.map((exchange) => (
              <option key={exchange.code} value={exchange.code}>
                {exchange.name} ({exchange.shortCode}) · {exchange.currency}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <p id={hintId} className="mt-1.5 text-xs text-muted-foreground">
        Choose the market first — the same ticker can exist on several exchanges.
      </p>
    </div>
  );
}
