import type { MonthlyReport } from "@/lib/report/data";
import { MIN_WEEKS } from "@/lib/stats";

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
export const RULEBOOKS = new Set(["REBALANCED", "LAB_TOP20", "LAB_STICKY", "LAB_MONTHLY", "LAB_US", "LAB_UK", "LAB_EU", "LAB_JP"]);

export const fmtPct = (x: number | null | undefined, d = 1) =>
  x === null || x === undefined ? "—" : `${x >= 0 ? "+" : "−"}${(Math.abs(x) * 100).toFixed(d)}%`;
export const fmtPts = (x: number | null | undefined, d = 1) =>
  x === null || x === undefined ? "—" : `${x >= 0 ? "+" : "−"}${(Math.abs(x) * 100).toFixed(d)} pts`;

/** Plain-English findings, stated only where the data supports them. */
export function headlines(r: MonthlyReport, previous: MonthlyReport | null): string[] {
  const out: string[] = [];

  if (r.claims?.length) {
    const decided = r.claims.filter((c) => c.status === "established" || c.status === "rejected");
    const leaning = r.claims.filter((c) => c.status === "leaning yes" || c.status === "leaning no");
    out.push(
      decided.length
        ? `${decided.length} claim(s) met the evidence bar (${decided.map((c) => `#${c.id} ${c.status}`).join(", ")}): see Decisions.`
        : `No claim has met the evidence bar yet (26 weeks, consistently one way), so no rule changes. ${leaning.length} of ${r.claims.length} claims are leaning one way.`,
    );
  }

  const bench = r.books.find((b) => b.strategy === "BENCHMARK");
  const rules = r.books.filter((b) => RULEBOOKS.has(b.strategy) && b.sinceFixedPct !== null).sort((a, b) => b.sinceFixedPct! - a.sinceFixedPct!);
  if (rules.length && bench?.sinceFixedPct != null) {
    const [best, worst] = [rules[0], rules.at(-1)!];
    const ahead = rules.filter((b) => b.sinceFixedPct! > bench.sinceFixedPct!).length;
    out.push(
      `Since the rules were fixed on 29 Sept: best ${BOOK_NAMES[best.strategy]} ${fmtPct(best.sinceFixedPct)}, weakest ${BOOK_NAMES[worst.strategy]} ${fmtPct(worst.sinceFixedPct)}; benchmark ${fmtPct(bench.sinceFixedPct)}. ${ahead} of ${rules.length} rulebooks are ahead.`,
    );
    const split = r.diagnostics?.find((d) => d.strategy === best.strategy)?.sinceFixed;
    if (split) {
      out.push(
        `Where ${BOOK_NAMES[best.strategy]}'s return came from: currency ${fmtPts(split.currency)}, the markets it held ${fmtPts(split.market)}, stock picking ${fmtPts(split.selection)}, dividends ${fmtPts(split.dividends)}, costs ${fmtPts(-split.costs)}.`,
      );
    }
  }

  const concentrated = (r.diagnostics ?? []).filter((d) => d.concentration?.warning && (RULEBOOKS.has(d.strategy) || d.strategy === "BUY_HOLD"));
  if (concentrated.length) {
    out.push(
      `Concentration warning: ${concentrated
        .slice(0, 3)
        .map((d) => `${BOOK_NAMES[d.strategy]} (effectively ${d.concentration!.effectiveNames?.toFixed(1)} positions; ${d.concentration!.topSector} ${Math.round((d.concentration!.topSectorWeight ?? 0) * 100)}%)`)
        .join("; ")}.`,
    );
  }

  const spread = r.scorecard?.spread;
  if (spread) {
    out.push(
      spread.summary.n < MIN_WEEKS
        ? `Too early to judge the ratings: ${spread.summary.n} week(s) of Buy-minus-Avoid data so far; ${MIN_WEEKS} are needed before it counts as evidence.`
        : `Buy-rated companies have ${spread.summary.mean! >= 0 ? "beaten" : "trailed"} Avoid-rated ones by ${fmtPts(Math.abs(spread.summary.mean! * 52))} a year so far (${spread.summary.n} weeks; evidence: ${spread.strength}).`,
    );
  }

  const o = r.scorecard?.outcomes;
  if (o && (o.failure || o.takeover || o.missing)) {
    out.push(
      `Companies that stopped being rated: ${o.failure} rating(s) of failed companies counted as total losses, ${o.takeover} treated as takeovers at their last price; ${o.missing} still await an outcome.`,
    );
  }

  if (r.health.fullRunWeeks < r.health.runWeeks || r.health.fullRunWeeks < 4) {
    out.push(`Data check: ${r.health.fullRunWeeks} full screener run(s) this month out of ${r.health.runWeeks} week(s) with any run; read this month's figures with care.`);
  }

  const { joined, left } = r.strongBuys;
  if (joined.length || left.length) {
    out.push(`Strong Buy list: ${joined.length} joined${joined.length ? ` (${joined.join(", ")})` : ""}, ${left.length} left${left.length ? ` (${left.join(", ")})` : ""}.`);
  }

  const prevBest = previous?.books.filter((b) => RULEBOOKS.has(b.strategy) && b.monthPct !== null).sort((a, b) => b.monthPct! - a.monthPct!)[0];
  const thisBest = r.books.filter((b) => RULEBOOKS.has(b.strategy) && b.monthPct !== null).sort((a, b) => b.monthPct! - a.monthPct!)[0];
  if (prevBest && thisBest && prevBest.strategy === thisBest.strategy) {
    out.push(`${BOOK_NAMES[thisBest.strategy]} had the best month two months running (one month is mostly noise; two is still not evidence).`);
  }
  return out;
}
