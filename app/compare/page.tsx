export const dynamic = "force-dynamic";

import { CompareView } from "@/components/compare/compare-view";
import { getHistorySummaries } from "@/lib/db/queries";

export default async function ComparePage() {
  const history = await getHistorySummaries();

  return <CompareView initialHistory={history} />;
}
