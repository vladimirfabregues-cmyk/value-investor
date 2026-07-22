"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { describeResultMarket, type SecuritySearchResult } from "@/lib/finance/security-search";
import { exchangeByCode } from "@/lib/finance/exchanges";

interface SecuritySearchProps {
  value: string;
  exchange: string;
  isLoading?: boolean;
  error?: string | null;
  onValueChange: (value: string) => void;
  /** Fired when a suggestion is chosen — carries the market so the wrong
   *  listing can never be selected silently. */
  onSelect: (result: SecuritySearchResult) => void;
}

/**
 * Combobox over the supported securities, scoped to the selected market.
 *
 * Implements the WAI-ARIA combobox pattern: the input keeps focus while the
 * listbox is navigated with the arrow keys, and `aria-activedescendant` tells
 * assistive technology which option is current.
 */
export function SecuritySearch({
  value,
  exchange,
  isLoading = false,
  error = null,
  onValueChange,
  onSelect,
}: SecuritySearchProps) {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const statusId = `${id}-status`;

  const [results, setResults] = useState<SecuritySearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [touched, setTouched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  /** Value written by an explicit pick — must not retrigger the search. */
  const justSelectedRef = useRef<string | null>(null);

  const selectedExchange = exchangeByCode(exchange);

  // Debounced lookup, scoped to the chosen market.
  useEffect(() => {
    const query = value.trim();

    // Choosing a suggestion sets the input; without this the list would
    // immediately reopen on top of the user's completed selection.
    if (justSelectedRef.current !== null && justSelectedRef.current === query) {
      justSelectedRef.current = null;
      return;
    }

    if (!touched || query.length < 1) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setSearching(true);
      try {
        const response = await fetch(
          `/api/securities/search?q=${encodeURIComponent(query)}&exchange=${encodeURIComponent(exchange)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("search failed");
        const data = (await response.json()) as { results: SecuritySearchResult[] };
        setResults(data.results ?? []);
        setActiveIndex(-1);
        setOpen(true);
      } catch {
        // Aborted or failed — leave prior results rather than flashing an error.
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value, exchange, touched]);

  // Close when focus or a click leaves the component.
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function choose(result: SecuritySearchResult) {
    justSelectedRef.current = result.ticker;
    abortRef.current?.abort();
    onSelect(result);
    setOpen(false);
    setSearching(false);
    setActiveIndex(-1);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!open || results.length === 0) {
      if (event.key === "ArrowDown" && results.length > 0) setOpen(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      choose(results[activeIndex]);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(results.length - 1);
    }
  }

  const showEmpty =
    touched && open && !searching && value.trim().length > 0 && results.length === 0;

  return (
    <div ref={containerRef}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        Ticker or company
      </label>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          value={value}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          aria-describedby={error ? errorId : statusId}
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={
            selectedExchange ? `Search ${selectedExchange.shortCode} by ticker or name` : "Search"
          }
          className="h-12 pl-11 pr-10"
          onChange={(event) => {
            setTouched(true);
            onValueChange(event.target.value);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {searching && (
          <Loader2
            className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}

        {open && results.length > 0 && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Matching companies"
            className="absolute z-50 mt-1.5 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#0b1220] p-1 shadow-panel"
          >
            {results.map((result, index) => (
              <li
                key={`${result.exchange}:${result.ticker}`}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault(); // keep focus in the input
                  choose(result);
                }}
                className={`cursor-pointer rounded-lg px-3 py-2 ${
                  index === activeIndex ? "bg-primary/15" : "hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm text-foreground">{result.name}</span>
                  <span className="shrink-0 font-mono text-xs text-primary">{result.ticker}</span>
                </div>
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {describeResultMarket(result)}
                  {result.sector ? ` · ${result.sector}` : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Status is announced politely rather than as an error */}
      <p id={statusId} role="status" aria-live="polite" className="mt-1.5 text-xs text-muted-foreground">
        {searching
          ? "Searching…"
          : showEmpty
            ? `No companies found on ${selectedExchange?.name ?? "this market"}. Check the market, or try the company's full name.`
            : selectedExchange
              ? `Searching ${selectedExchange.name} only.`
              : ""}
      </p>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
