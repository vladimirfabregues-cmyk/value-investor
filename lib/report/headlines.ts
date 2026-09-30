import type { MonthlyReport } from "@/lib/report/data";

export const BOOK_NAMES: Record<string, string> = {
  REBALANCED: "Strong Buy only (current rule)",
  LAB_TOP20: "Top 20, capped",
  LAB_STICKY: "Top 20, slow selling",
  LAB_MONTHLY: "Top 20, monthly",
  LAB_US: "US only",
  LAB_UK: "UK only",
  LAB_EU: "Europe only",
  LAB_JP: "Japan only",
  BUY_HOLD: "Buy and hold",
  BENCHMARK: "Benchmark (FTSE All-World)",
};

/** Books judged against each other; buy-and-hold and the benchmark are references. */
const RULEBOOKS = new Set(["REBALANCED", "LAB_TOP20", "LAB_STICKY", "LAB_MONTHLY", "LAB_US", "LAB_UK", "LAB_EU", "LAB_JP"]);
/** Below this many ratings a scorecard comparison is not stated as a finding. */
const MIN_N = 100;

export const fmtPct = (x: number | null | undefined, d = 1) =>
  x === null || x === undefined ? "—" : `${x >= 0 ? "+" : "−"}${(Math.abs(x) * 100).toFixed(d)}%`;

/** Plain-English findings, stated only where the data supports them. */
export function headlines(r: MonthlyReport, previous: MonthlyReport | null): string[] {
  const out: string[] = [];
  const month = new Date(`${r.month}-01T00:00:00Z`).toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const bench = r.books.find((b) => b.strategy === "BENCHMARK");
  const rules = r.books.filter((b) => RULEBOOKS.has(b.strategy) && b.monthPct !== null);

  if (rules.length && bench?.monthPct != null) {
    const best = rules[0];
    const worst = rules.at(-1)!;
    out.push(
      `Best rulebook in ${month}: ${BOOK_NAMES[best.strategy]}, ${fmtPct(best.monthPct)} against the benchmark's ${fmtPct(bench.monthPct)}. Weakest: ${BOOK_NAMES[worst.strategy]}, ${fmtPct(worst.monthPct)}.`,
    );
    const prevBest = previous?.books.find((b) => RULEBOOKS.has(b.strategy) && b.monthPct !== null);
    if (prevBest?.strategy === best.strategy) out.push(`${BOOK_NAMES[best.strategy]} has led two months running.`);
  }

  const ahead = r.books.filter((b) => RULEBOOKS.has(b.strategy) && b.sinceFixedPct !== null);
  const benchFixed = bench?.sinceFixedPct;
  if (ahead.length && benchFixed != null) {
    const n = ahead.filter((b) => b.sinceFixedPct! > benchFixed).length;
    out.push(`Since the rules were fixed on 29 Sept 2026, ${n} of ${ahead.length} rulebooks are ahead of the benchmark (${fmtPct(benchFixed)}).`);
  }

  const four = r.scorecard?.horizons.find((h) => h.weeks === 4);
  const buy = four?.byVerdict.find((v) => v.verdict === "BUY");
  const avoid = four?.byVerdict.find((v) => v.verdict === "AVOID");
  if (buy && avoid && buy.n >= MIN_N && avoid.n >= MIN_N && buy.meanExcess !== null && avoid.meanExcess !== null) {
    const gap = buy.meanExcess - avoid.meanExcess;
    out.push(
      gap > 0
        ? `Ratings are pointing the right way: over 4 weeks, Buy-rated companies beat Avoid-rated ones by ${(gap * 100).toFixed(1)} points (${buy.n.toLocaleString("en-GB")} Buy ratings).`
        : `Ratings are not yet pointing the right way: over 4 weeks, Buy-rated companies trailed Avoid-rated ones by ${(-gap * 100).toFixed(1)} points (${buy.n.toLocaleString("en-GB")} Buy ratings).`,
    );
  } else if (four) {
    out.push(`Too few Buy ratings have a 4-week result yet (${buy?.n ?? 0}) to judge the ratings; the scorecard needs about ${MIN_N}.`);
  }

  const { joined, left } = r.strongBuys;
  if (joined.length || left.length) {
    out.push(`Strong Buy list: ${joined.length} joined${joined.length ? ` (${joined.join(", ")})` : ""}, ${left.length} left${left.length ? ` (${left.join(", ")})` : ""}.`);
  }

  if (r.health.fullRunWeeks < r.health.runWeeks || r.health.fullRunWeeks < 4) {
    out.push(`Data check: ${r.health.fullRunWeeks} full screener run(s) this month out of ${r.health.runWeeks} week(s) with any run — read this month's figures with care.`);
  }

  if (r.etf?.leaderChanges.length) {
    out.push(`ETF rankings: the top fund changed in ${r.etf.leaderChanges.length} of ${r.etf.groups} exposure groups.`);
  }
  return out;
}
