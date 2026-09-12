export const dynamic = "force-dynamic";

import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { getHistorySummaries } from "@/lib/db/queries";
import { getPortfolioResults } from "@/lib/db/portfolio-queries";

export default async function PortfolioPage() {
  const [history, results] = await Promise.all([getHistorySummaries(), getPortfolioResults()]);
  return <PortfolioView history={history} results={results} />;
}
