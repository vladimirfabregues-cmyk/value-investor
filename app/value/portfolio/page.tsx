export const dynamic = "force-dynamic";

import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { getHistorySummaries } from "@/lib/db/queries";
import { getLabRows, getPortfolioResults } from "@/lib/db/portfolio-queries";

export default async function PortfolioPage() {
  const [history, results, labRows] = await Promise.all([getHistorySummaries(), getPortfolioResults(), getLabRows()]);
  return <PortfolioView history={history} results={results} labRows={labRows} />;
}
