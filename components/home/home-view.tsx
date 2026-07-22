"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BusinessQualityCard } from "@/components/analysis/business-quality-card";
import { EdgarFilingsCard } from "@/components/analysis/edgar-filings-card";
import { FinancialHealthCard } from "@/components/analysis/financial-health-card";
import { IntrinsicValueCard } from "@/components/analysis/intrinsic-value-card";
import { SourcesCard } from "@/components/analysis/sources-card";
import { ThesisCard } from "@/components/analysis/thesis-card";
import { ValuationCard } from "@/components/analysis/valuation-card";
import { VerdictBanner } from "@/components/analysis/verdict-banner";
import { WhyThisVerdict } from "@/components/analysis/why-this-verdict";
import { AppShell } from "@/components/shell/app-shell";
import { TickerSearchForm } from "@/components/ticker/ticker-search-form";
import { DEFAULT_EXCHANGE_CODE, toYahooTicker } from "@/lib/finance/exchanges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { HistoryResponse } from "@/types/api";
import type { SavedAnalysisRecord, SavedAnalysisSummary, ValueInvestingAnalysis } from "@/types/analysis";

interface HomeViewProps {
  initialHistory: SavedAnalysisSummary[];
  initialTicker?: string;
  initialExchange?: string;
  initialAnalysis?: SavedAnalysisRecord | null;
}

type SseEvent =
  | { type: "progress"; stage: string }
  | { type: "complete"; id: string; analysis: ValueInvestingAnalysis }
  | { type: "error"; message: string };

async function* readSseStream(response: Response): AsyncGenerator<SseEvent> {
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
        yield JSON.parse(line.slice(6)) as SseEvent;
      }
    }
  }
}

export function HomeView({
  initialHistory,
  initialTicker = "",
  initialExchange = DEFAULT_EXCHANGE_CODE,
  initialAnalysis = null,
}: HomeViewProps) {
  const router = useRouter();
  const [history, setHistory] = useState(initialHistory);
  const [ticker, setTicker] = useState(initialTicker);
  const [exchange, setExchange] = useState(initialExchange);
  const [analysis, setAnalysis] = useState(initialAnalysis?.fullJson ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressStage, setProgressStage] = useState<string | null>(null);

  const heroLabel = useMemo(() => {
    if (!analysis) {
      return "Intrinsic value, not hype.";
    }

    return `${analysis.ticker} analyzed with structured output and deterministic finance math.`;
  }, [analysis]);

  async function refreshHistory() {
    const response = await fetch("/api/history", { cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as HistoryResponse;
    setHistory(payload.items);
  }

  async function handleAnalyze() {
    // Market + symbol is the identity; resolve to the ticker the provider needs.
    const normalizedTicker = toYahooTicker(exchange, ticker);

    if (!normalizedTicker) {
      return;
    }

    setError(null);
    setIsLoading(true);
    setProgressStage("Initializing analysis...");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker: normalizedTicker, exchange }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Analysis failed.");
      }

      // Non-streaming response means we got a cached result
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("text/event-stream")) {
        const payload = (await response.json()) as { id: string; analysis: ValueInvestingAnalysis };
        setAnalysis(payload.analysis);
        await refreshHistory();
        router.replace(
          `/?analysis=${payload.id}&exchange=${encodeURIComponent(exchange)}&ticker=${encodeURIComponent(normalizedTicker)}`,
        );
        return;
      }

      for await (const event of readSseStream(response)) {
        if (event.type === "progress") {
          setProgressStage(event.stage);
        } else if (event.type === "complete") {
          setAnalysis(event.analysis);
          await refreshHistory();
          router.replace(
            `/?analysis=${event.id}&exchange=${encodeURIComponent(exchange)}&ticker=${encodeURIComponent(normalizedTicker)}`,
          );
          return;
        } else if (event.type === "error") {
          throw new Error(event.message);
        }
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while analyzing the ticker.",
      );
    } finally {
      setIsLoading(false);
      setProgressStage(null);
    }
  }

  return (
    <AppShell history={history}>
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-hero-grid px-6 py-10 shadow-panel sm:px-8">
          <div className="max-w-3xl">
            <Badge className="mb-4">Graham / Buffett Style</Badge>
            <h1 className="font-display text-5xl leading-none text-foreground sm:text-6xl">
              Value Investor
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-300">
              A disciplined long-term equity analysis workspace focused on intrinsic value,
              margin of safety, balance-sheet strength, and downside protection.
            </p>
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-primary">
              {heroLabel}
            </p>
          </div>

          <Separator className="my-8" />

          <TickerSearchForm
            ticker={ticker}
            exchange={exchange}
            isLoading={isLoading}
            error={error}
            onTickerChange={setTicker}
            onExchangeChange={setExchange}
            onSubmit={handleAnalyze}
          />

          {isLoading && progressStage ? (
            <div className="mt-5 flex items-center gap-3">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">{progressStage}</span>
            </div>
          ) : null}
        </section>

        {error ? (
          <Card className="border-red-500/25 bg-red-500/8">
            <CardContent className="p-5 text-sm text-red-100">{error}</CardContent>
          </Card>
        ) : null}

        {analysis ? (
          <div className="space-y-6">
            <VerdictBanner analysis={analysis} />
            {analysis.verdict_explanation && (
              <WhyThisVerdict explanation={analysis.verdict_explanation} />
            )}
            <ValuationCard analysis={analysis} />
            <FinancialHealthCard analysis={analysis} />
            <BusinessQualityCard analysis={analysis} />
            <IntrinsicValueCard analysis={analysis} />
            <ThesisCard analysis={analysis} />
            <SourcesCard analysis={analysis} />
            <EdgarFilingsCard ticker={analysis.ticker} />
          </div>
        ) : (
          <Card>
            <CardContent className="p-8">
              <div className="max-w-2xl">
                <div className="text-xs uppercase tracking-[0.18em] text-primary">
                  Ready To Analyze
                </div>
                <h2 className="mt-3 font-display text-2xl text-foreground">
                  Enter any ticker for a full conservative valuation.
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  Live fundamentals from Yahoo Finance with SEC EDGAR cross-checks. Every company
                  is valued with the model that fits its economics — discounted cash flow for
                  operating businesses, justified price-to-book for banks and insurers, NAV for
                  property and investment trusts, dividend discount for utilities — then gated by
                  margin-of-safety, balance-sheet, earnings-quality, and cyclicality checks.
                </p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  Prefer to hunt across whole markets? The{" "}
                  <a href="/screen" className="font-medium text-primary hover:underline">Screener</a>{" "}
                  scores ten indices across the US, UK, Europe, and Japan.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
