export const dynamic = "force-dynamic";

import { ScorecardView } from "@/components/scorecard/scorecard-view";
import { getHistorySummaries } from "@/lib/db/queries";
import { getScorecard } from "@/lib/scorecard/build";

export default async function ScorecardPage() {
  const [history, scorecard] = await Promise.all([getHistorySummaries(), getScorecard()]);
  return <ScorecardView history={history} scorecard={scorecard} />;
}
