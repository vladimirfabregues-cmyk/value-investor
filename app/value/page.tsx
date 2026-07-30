export const dynamic = "force-dynamic";

import { HomeView } from "@/components/home/home-view";
import { getAnalysisById, getHistorySummaries } from "@/lib/db/queries";
import { DEFAULT_EXCHANGE_CODE, inferExchangeFromTicker } from "@/lib/finance/exchanges";

interface HomePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : {};
  const analysisId =
    typeof params.analysis === "string" ? params.analysis : undefined;
  const ticker = typeof params.ticker === "string" ? params.ticker : "";
  // Absent exchange (older links) is inferred from the ticker suffix.
  const exchange =
    typeof params.exchange === "string"
      ? params.exchange
      : ticker
        ? inferExchangeFromTicker(ticker).code
        : DEFAULT_EXCHANGE_CODE;

  const [history, initialAnalysis] = await Promise.all([
    getHistorySummaries(),
    analysisId ? getAnalysisById(analysisId) : Promise.resolve(null),
  ]);

  return (
    <HomeView
      initialHistory={history}
      initialTicker={ticker}
      initialExchange={exchange}
      initialAnalysis={initialAnalysis}
    />
  );
}
