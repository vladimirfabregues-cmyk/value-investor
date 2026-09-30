export const dynamic = "force-dynamic";

import { getArchivedReport, getMonthlyReport, previousMonth, type BookLine } from "@/lib/report/data";
import { BOOK_NAMES, fmtPct, headlines } from "@/lib/report/headlines";

export const metadata = { title: "Monthly report — The Investment Casebook", robots: { index: false } };

const VERDICT: Record<string, string> = { STRONG_BUY: "Strong buy", BUY: "Buy", WATCH: "Watch", HOLD: "Hold", AVOID: "Avoid" };
const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;
const monthName = (m: string) =>
  new Date(`${m}-01T00:00:00Z`).toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** Print-first monthly report; the monthly workflow saves it as a PDF and emails it. */
export default async function ReportPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month: asked } = await searchParams;
  const month = asked && /^\d{4}-\d{2}$/.test(asked) ? asked : previousMonth();
  const { report: r, frozen } = await getMonthlyReport(month);
  const prev = await getArchivedReport(previousMonth(new Date(`${month}-15T00:00:00Z`)));
  const prevByStrategy = new Map(prev?.books.map((b) => [b.strategy, b]) ?? []);
  const findings = headlines(r, prev);

  const Th = ({ children, left }: { children?: React.ReactNode; left?: boolean }) => (
    <th className={`border-b border-slate-300 py-1.5 pr-2 text-[9px] font-semibold uppercase tracking-wider text-slate-500 ${left ? "text-left" : "text-right"}`}>{children}</th>
  );
  const Td = ({ children, left, bold }: { children?: React.ReactNode; left?: boolean; bold?: boolean }) => (
    <td className={`border-b border-slate-100 py-1.5 pr-2 tabular-nums ${left ? "text-left" : "text-right"} ${bold ? "font-semibold" : ""}`}>{children}</td>
  );
  const bookRow = (b: BookLine) => (
    <tr key={b.strategy}>
      <Td left>{BOOK_NAMES[b.strategy] ?? b.strategy}</Td>
      <Td bold>{fmtPct(b.monthPct)}</Td>
      <Td>{fmtPct(prevByStrategy.get(b.strategy)?.monthPct)}</Td>
      <Td>{fmtPct(b.sinceFixedPct)}</Td>
      <Td>{fmtPct(b.sinceInceptionPct)}</Td>
      <Td>{b.maxDrawdownPct === null ? "—" : fmtPct(-b.maxDrawdownPct)}</Td>
      <Td>{`${(b.costsPct * 100).toFixed(1)}%`}</Td>
      <Td>{b.tradesInMonth}</Td>
      <Td>{gbp(b.valueGbp)}</Td>
    </tr>
  );

  return (
    <main className="min-h-screen bg-white text-[11px] leading-relaxed text-slate-900">
      <style>{`@page { size: A4; margin: 14mm 12mm; } @media print { html, body { background: #fff !important; } } .report h2 { break-after: avoid; } .report section { break-inside: avoid; }`}</style>
      <div className="report mx-auto max-w-[190mm] space-y-6 p-6 print:p-0">
        <header className="flex items-end justify-between border-b-2 border-slate-900 pb-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-amber-700">The Investment Casebook · Monthly report</p>
            <h1 className="mt-1 font-display text-3xl">{monthName(r.month)}</h1>
          </div>
          <p className="text-right text-[9px] text-slate-500">
            Period {r.periodStart} to {r.periodEnd}
            <br />
            {frozen ? "Issued" : "Preview built"} {r.builtAt.slice(0, 10)}
          </p>
        </header>

        <section>
          <h2 className="font-display text-lg">Key findings</h2>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {findings.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg">Strategy lab — simulated £10,000 books</h2>
          <table className="mt-2 w-full border-collapse">
            <thead>
              <tr>
                <Th left>Book</Th>
                <Th>This month</Th>
                <Th>Last month</Th>
                <Th>Since 29 Sept</Th>
                <Th>Since June*</Th>
                <Th>Worst fall</Th>
                <Th>Costs</Th>
                <Th>Trades</Th>
                <Th>Value</Th>
              </tr>
            </thead>
            <tbody>{r.books.map(bookRow)}</tbody>
          </table>
          <p className="mt-1.5 text-[9px] text-slate-500">
            Sorted by this month&apos;s return. *Before 29 Sept is a back-test; the rules were chosen after seeing it. Costs are cumulative, as a share of capital.
          </p>
        </section>

        {r.scorecard && (
          <section>
            <h2 className="font-display text-lg">Rating scorecard</h2>
            <p className="text-slate-600">
              Return after each rating, relative to the average company rated in the same index that week ({r.scorecard.ratings.toLocaleString("en-GB")} ratings on file).
            </p>
            <div className="mt-2 grid grid-cols-2 gap-5">
              {r.scorecard.horizons.map((h) => (
                <table key={h.weeks} className="w-full border-collapse">
                  <thead>
                    <tr>
                      <Th left>{h.weeks} weeks</Th>
                      <Th>Ratings</Th>
                      <Th>Average</Th>
                      <Th>Beat mkt</Th>
                      <Th>Last month</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {h.byVerdict.map((v) => {
                      const was = prev?.scorecard?.horizons.find((x) => x.weeks === h.weeks)?.byVerdict.find((x) => x.verdict === v.verdict);
                      return (
                        <tr key={v.verdict} className={v.n < 100 ? "text-slate-400" : ""}>
                          <Td left>{VERDICT[v.verdict]}</Td>
                          <Td>{v.n.toLocaleString("en-GB")}</Td>
                          <Td bold>{fmtPct(v.meanExcess)}</Td>
                          <Td>{v.hitRate === null ? "—" : `${Math.round(v.hitRate * 100)}%`}</Td>
                          <Td>{fmtPct(was?.meanExcess)}</Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ))}
            </div>
            <p className="mt-1.5 text-[9px] text-slate-500">Grey rows have fewer than 100 ratings and should not be read as findings yet.</p>

            <div className="mt-4 grid grid-cols-3 gap-5">
              <div>
                <h3 className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Red flags (4 weeks)</h3>
                {r.scorecard.flags.length === 0 ? (
                  <p className="mt-1 text-slate-500">Not enough flagged ratings yet.</p>
                ) : (
                  <ul className="mt-1 space-y-0.5">
                    {r.scorecard.flags.map((f) => (
                      <li key={f.flag} className="flex justify-between gap-2">
                        <span>{f.flag.replaceAll("_", " ")} ({f.n})</span>
                        <span className="tabular-nums">{fmtPct(f.difference)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {(
                [
                  ["Best Buy or better", r.scorecard.best],
                  ["Worst Buy or better", r.scorecard.worst],
                ] as const
              ).map(([title, rows]) => (
                <div key={title}>
                  <h3 className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
                  {rows.length === 0 ? (
                    <p className="mt-1 text-slate-500">Not enough data yet.</p>
                  ) : (
                    <ul className="mt-1 space-y-0.5">
                      {rows.map((c) => (
                        <li key={`${c.ticker}-${c.date}`} className="flex justify-between gap-2">
                          <span className="font-mono">{c.ticker}</span>
                          <span className="tabular-nums">{fmtPct(c.excess)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-2 gap-5">
          <div>
            <h2 className="font-display text-lg">Strong Buy list</h2>
            <p className="mt-1">Now: {r.strongBuys.current.join(", ") || "none"}</p>
            <p>Joined this month: {r.strongBuys.joined.join(", ") || "none"}</p>
            <p>Left this month: {r.strongBuys.left.join(", ") || "none"}</p>
          </div>
          <div>
            <h2 className="font-display text-lg">ETF portfolio</h2>
            {r.etf ? (
              <>
                <p className="mt-1">
                  Latest month ({r.etf.portfolioMonth}):{" "}
                  {r.etf.books.map((b) => `${b.strategy === "BUY_HOLD" ? "buy and hold" : b.strategy === "REBALANCED" ? "quarterly rebalanced" : "benchmark"} ${fmtPct(b.monthReturnPct)}`).join(" · ")}
                </p>
                <p>
                  Top fund changed in {r.etf.leaderChanges.length} of {r.etf.groups} exposure groups since {r.etf.comparedWith}
                  {r.etf.leaderChanges.length ? `: ${r.etf.leaderChanges.map((c) => `${c.from}→${c.to}`).join(", ")}` : "."}
                </p>
              </>
            ) : (
              <p className="mt-1 text-slate-500">ETF summary unavailable this month.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg">Data health</h2>
          <p className="mt-1">
            {r.health.fullRunWeeks} full screener run(s) out of {r.health.runWeeks} week(s) with a run this month.
            {r.health.badPrices !== null && ` ${r.health.badPrices} price pair(s) excluded from the scorecard as data errors.`}
          </p>
        </section>

        <footer className="border-t border-slate-300 pt-2 text-[8px] leading-snug text-slate-500">
          Simulations and statistics on past ratings only — not a track record and not investment advice. Costs, currency and dividends are modelled
          approximations; bid-ask spreads are not included. Past performance is not a reliable indicator of future results; capital is at risk.
        </footer>
      </div>
    </main>
  );
}
