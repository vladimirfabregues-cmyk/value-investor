"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart2 } from "lucide-react";
import { RecentSearchItem } from "@/components/ticker/recent-search-item";

import { BusinessQualityCard } from "@/components/analysis/business-quality-card";
import { EdgarFilingsCard } from "@/components/analysis/edgar-filings-card";
import { FinancialHealthCard } from "@/components/analysis/financial-health-card";
import { IntrinsicValueCard } from "@/components/analysis/intrinsic-value-card";
import { SourcesCard } from "@/components/analysis/sources-card";
import { ThesisCard } from "@/components/analysis/thesis-card";
import { ValuationCard } from "@/components/analysis/valuation-card";
import { AnalysisSummary } from "@/components/analysis/analysis-summary";
import { HowValuationWorks } from "@/components/analysis/how-valuation-works";
import { ResultSections } from "@/components/analysis/result-sections";
import { StickySummary } from "@/components/analysis/sticky-summary";
import { WhyThisVerdict } from "@/components/analysis/why-this-verdict";
import { AppShell } from "@/components/shell/app-shell";
import { TickerSearchForm } from "@/components/ticker/ticker-search-form";
import { DEFAULT_EXCHANGE_CODE, toYahooTicker } from "@/lib/finance/exchanges";
import { Card, CardContent } from "@/components/ui/card";
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
  const summaryRef = useRef<HTMLDivElement>(null);

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
      <div className="space-y-6">
        {analysis ? (
          /* ── An analysis exists: the company is the subject of the page ── */
          <>
            <div ref={summaryRef}>
              <AnalysisSummary
                analysis={analysis}
                onReanalyse={() => void handleAnalyze()}
                isReanalysing={isLoading}
              />
            </div>

            <StickySummary
              analysis={analysis}
              watchRef={summaryRef}
              onReanalyse={() => void handleAnalyze()}
              isReanalysing={isLoading}
            />

            <ResultSections
              sections={[
                {
                  id: "overview",
                  label: "Overview",
                  content: analysis.verdict_explanation ? (
                    <WhyThisVerdict explanation={analysis.verdict_explanation} />
                  ) : (
                    <ThesisCard analysis={analysis} />
                  ),
                },
                {
                  id: "valuation",
                  label: "Valuation",
                  content: (
                    <>
                      <IntrinsicValueCard analysis={analysis} />
                      <ValuationCard analysis={analysis} />
                    </>
                  ),
                },
                {
                  id: "health",
                  label: "Financial health",
                  content: <FinancialHealthCard analysis={analysis} />,
                },
                {
                  id: "quality",
                  label: "Business quality",
                  content: <BusinessQualityCard analysis={analysis} />,
                },
                {
                  id: "risks",
                  label: "Risks and thesis",
                  content: <ThesisCard analysis={analysis} />,
                },
                {
                  id: "sources",
                  label: "Sources and methodology",
                  content: (
                    <>
                      <SourcesCard analysis={analysis} />
                      <EdgarFilingsCard ticker={analysis.ticker} />
                      <HowValuationWorks />
                    </>
                  ),
                },
              ]}
            />

            {/* Search stays available, but no longer dominates */}
            <details className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-medium text-foreground/90 [&::-webkit-details-marker]:hidden">
                Analyse another company
              </summary>
              <div className="border-t border-white/[0.06] p-5">
                <TickerSearchForm
                  ticker={ticker}
                  exchange={exchange}
                  isLoading={isLoading}
                  error={error}
                  onTickerChange={setTicker}
                  onExchangeChange={setExchange}
                  onSubmit={handleAnalyze}
                />
              </div>
            </details>
          </>
        ) : (
          /* ── No analysis: the search is the page ── */
          <>
            <section className="rounded-2xl border border-white/[0.08] bg-hero-grid p-5 shadow-panel sm:p-8">
              <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
                Analyse a stock
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                Estimate intrinsic value, test downside risk, and understand what could make the
                investment thesis fail.
              </p>

              <div className="mt-6 max-w-2xl">
                <TickerSearchForm
                  ticker={ticker}
                  exchange={exchange}
                  isLoading={isLoading}
                  error={error}
                  onTickerChange={setTicker}
                  onExchangeChange={setExchange}
                  onSubmit={handleAnalyze}
                />
              </div>

              {isLoading && progressStage ? (
                <div className="mt-5 flex items-center gap-3" role="status" aria-live="polite">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">{progressStage}</span>
                </div>
              ) : null}
            </section>

            {error ? (
              <Card className="border-red-500/25 bg-red-500/8">
                <CardContent className="p-5 text-sm text-red-100" role="alert">
                  {error}
                </CardContent>
              </Card>
            ) : null}

            {/* Continuation actions */}
            {history.length > 0 && (
              <section aria-labelledby="recent-heading">
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 id="recent-heading" className="text-sm font-medium text-foreground">
                    Continue where you left off
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {history.length} saved {history.length === 1 ? "analysis" : "analyses"}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {history.slice(0, 6).map((item) => (
                    <RecentSearchItem key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            <Link
              href="/screen"
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 transition hover:border-primary/30"
            >
              <span className="flex items-center gap-3">
                <BarChart2 className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm text-foreground">
                  Browse the Market Screener
                  <span className="ml-2 text-muted-foreground">
                    Ten markets already scored
                  </span>
                </span>
              </span>
              <span aria-hidden="true" className="text-muted-foreground">→</span>
            </Link>

            <HowValuationWorks />
          </>
        )}
      </div>
    </AppShell>
  );
}
