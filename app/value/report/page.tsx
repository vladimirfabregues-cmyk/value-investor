export const dynamic = "force-dynamic";

import type { ReactNode } from "react";

import { getArchivedReport, getMonthlyReport, previousMonth, type MonthlyReport } from "@/lib/report/data";
import { BOOK_NAMES, RULEBOOKS, fmtPct, fmtPts, headlines } from "@/lib/report/headlines";
import { LAB_RULES } from "@/lib/portfolio/lab";
import type { CaseRow, Pattern } from "@/lib/scorecard/compute";
import { SPREAD_PER_TRADE, gapRange, longDate, type Tone } from "@/lib/report/readiness";
import { CASH_RATE, MIN_WEEKS, interval, type ClaimStatus, type Interval, type SeriesPoint } from "@/lib/stats";
import { translations, type Dict } from "@/lib/i18n/translations";

export const metadata = { title: "Monthly report — The Value Investor", robots: { index: false } };

const CAPS = translations.en.caps as Dict;
const flagName = (f: string) => ((CAPS[f] as Dict | undefined)?.label as string | undefined) ?? f.replaceAll("_", " ");
const VERDICT: Record<string, string> = { STRONG_BUY: "Strong buy", BUY: "Buy", WATCH: "Watch", HOLD: "Hold", AVOID: "Avoid" };
const INDEX: Record<string, string> = {
  SP500: "S&P 500", SP400: "S&P 400", RUSSELLMID: "Russell Midcap", RUSSELL2000: "Russell 2000", FTSE100: "FTSE 100",
  FTSE250: "FTSE 250", AIM: "AIM", CAC40: "CAC 40", EUSC: "MSCI Europe Small Cap", TOPIXSMALL: "TOPIX Small",
};
const STATUS_TONE: Record<ClaimStatus, string> = {
  "too early": "text-slate-400",
  inconclusive: "text-slate-600",
  "leaning yes": "text-emerald-700",
  "leaning no": "text-amber-700",
  established: "font-semibold text-emerald-800",
  rejected: "font-semibold text-red-700",
};
const TONE: Record<Tone, string> = { good: "text-emerald-800", neutral: "text-slate-900", caution: "text-amber-800", bad: "text-red-700" };
const range = (i: { low: number; high: number } | null | undefined, unit: "%" | " pts" = "%") =>
  i ? `${fmtPct(i.low).replace("%", "")} to ${unit === "%" ? fmtPct(i.high) : fmtPts(i.high)}` : "—";
const ratio = (x: number | null | undefined) => (x === null || x === undefined ? "—" : `${x < 0 ? "−" : ""}${Math.abs(x).toFixed(2)}`);
const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;
const pct0 = (x: number | null | undefined) => (x === null || x === undefined ? "—" : `${Math.round(x * 100)}%`);
const monthName = (m: string) => new Date(`${m}-01T00:00:00Z`).toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const bookName = (s: string) => BOOK_NAMES[s] ?? s;
const REFERENCE_ORDER = (s: string) => (RULEBOOKS.has(s) ? 0 : s === "BUY_HOLD" ? 1 : 2);

function Th({ children, left }: { children?: ReactNode; left?: boolean }) {
  return (
    <th className={`border-b border-slate-300 py-1.5 pr-2 align-bottom text-[8.5px] font-semibold uppercase tracking-wider text-slate-500 ${left ? "text-left" : "text-right"}`}>
      {children}
    </th>
  );
}
function Td({ children, left, bold, className = "" }: { children?: ReactNode; left?: boolean; bold?: boolean; className?: string }) {
  return <td className={`border-b border-slate-100 py-1 pr-2 tabular-nums ${left ? "text-left" : "whitespace-nowrap text-right"} ${bold ? "font-semibold" : ""} ${className}`}>{children}</td>;
}
function Section({ title, note, children, pageBreak }: { title: string; note?: string; children: ReactNode; pageBreak?: boolean }) {
  return (
    <section className={pageBreak ? "break-before-page" : ""}>
      <h2 className="font-display text-lg">{title}</h2>
      {note && <p className="text-[10px] text-slate-600">{note}</p>}
      <div className="mt-2">{children}</div>
    </section>
  );
}
const Small = ({ children }: { children: ReactNode }) => <p className="mt-1.5 text-[9px] leading-snug text-slate-500">{children}</p>;

/** Cumulative line with a zero axis; decorative, the numbers sit beside it. */
function SpreadChart({ points }: { points: SeriesPoint[] }) {
  if (points.length < 2) return <p className="text-slate-500">Not enough weeks yet to draw the line.</p>;
  const W = 600;
  const H = 120;
  const ys = points.map((p) => p.value);
  const lo = Math.min(0, ...ys);
  const hi = Math.max(0, ...ys);
  const y = (v: number) => H - 8 - ((v - lo) / (hi - lo || 1)) * (H - 16);
  const x = (i: number) => (i / (points.length - 1)) * W;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-28 w-full" aria-hidden="true">
      <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1} />
      <polyline fill="none" stroke="#b45309" strokeWidth={2} points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")} />
      <text x={4} y={12} fontSize={10} fill="#64748b">{points[0].date}</text>
      <text x={W - 4} y={12} fontSize={10} fill="#64748b" textAnchor="end">{points.at(-1)!.date}</text>
    </svg>
  );
}

function CaseList({ title, rows, pattern, showCaps }: { title: string; rows: CaseRow[]; pattern?: Pattern | null; showCaps?: boolean }) {
  return (
    <div>
      <h3 className="text-[8.5px] font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-1 text-slate-500">Not enough data yet.</p>
      ) : (
        <ul className="mt-1 space-y-0.5">
          {rows.map((c) => (
            <li key={`${c.ticker}-${c.date}`} className="flex justify-between gap-2">
              <span className="min-w-0 truncate">
                <span className="font-mono">{c.ticker}</span>
                <span className="ml-1 text-slate-500">
                  {VERDICT[c.verdict]}
                  {c.mos !== null && c.mos !== undefined ? ` · MoS ${Math.round(c.mos)}%` : ""}
                  {showCaps && c.caps ? ` · ${c.caps.split(",").map(flagName).join(", ")}` : ""}
                </span>
              </span>
              <span className="shrink-0 tabular-nums">{fmtPct(c.excess)}</span>
            </li>
          ))}
        </ul>
      )}
      {pattern && <p className="mt-1 text-[9px] text-amber-800">Pattern: {Math.round(pattern.share * 100)}% are {pattern.sector}.</p>}
    </div>
  );
}

/** Print-first monthly report; the monthly workflow saves it as a PDF and emails it. */
export default async function ReportPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month: asked } = await searchParams;
  const month = asked && /^\d{4}-\d{2}$/.test(asked) ? asked : previousMonth();
  const { report: r, frozen } = await getMonthlyReport(month);
  const prev: MonthlyReport | null = await getArchivedReport(previousMonth(new Date(`${month}-15T00:00:00Z`)));
  const prevBook = new Map(prev?.books.map((b) => [b.strategy, b]) ?? []);
  const findings = headlines(r, prev);
  const diag = new Map((r.diagnostics ?? []).map((d) => [d.strategy, d]));
  const books = [...r.books].sort((a, b) => REFERENCE_ORDER(a.strategy) - REFERENCE_ORDER(b.strategy) || (b.sinceFixedPct ?? -9) - (a.sinceFixedPct ?? -9));
  const traded = books.filter((b) => b.strategy !== "BENCHMARK");
  const sc = r.scorecard;
  const hasRange = (sc?.horizons ?? []).some((h) => h.byVerdict.some((v) => v.range !== undefined));
  const spreadRange: Interval | null = sc?.spread
    ? interval(sc.spread.points.map((p, i, all) => p.value - (i ? all[i - 1].value : 0)))
    : null;
  const hasLive = r.books.some((b) => b.live !== undefined);
  const hasSector = (r.diagnostics ?? []).some((d) => d.sinceFixed?.sector !== undefined);
  const fixed = new Date(`${LAB_RULES.fixedOn}T00:00:00Z`).toLocaleString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <main className="min-h-screen bg-white text-[10.5px] leading-relaxed text-slate-900">
      <style>{`@page { size: A4; margin: 13mm 12mm; } @media print { html, body { background: #fff !important; } } .report h2 { break-after: avoid; } .report section { break-inside: avoid; } .break-before-page { break-before: page; }`}</style>
      <div className="report mx-auto max-w-[190mm] space-y-5 p-6 print:p-0">
        <header className="flex items-end justify-between border-b-2 border-slate-900 pb-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-amber-700">The Value Investor · Monthly report</p>
            <h1 className="mt-1 font-display text-3xl">{monthName(r.month)}</h1>
          </div>
          <p className="text-right text-[9px] text-slate-500">
            Period {r.periodStart} to {r.periodEnd}
            <br />
            {frozen ? "Issued" : "Preview built"} {r.builtAt.slice(0, 10)}
          </p>
        </header>

        {r.readiness && (
          <Section
            title="Investment readiness"
            note={`The investor's question: could this be trusted with real money? Answered for the main strategy, ${bookName(r.readiness.mainBook)}, chosen in advance on ${longDate(r.readiness.statedOn)}; the other books are alternatives.`}
          >
            <table className="w-full border-collapse">
              <tbody>
                {r.readiness.dashboard.map((d) => (
                  <tr key={d.question} className="align-top">
                    <td className="w-[52mm] border-b border-slate-200 py-1.5 pr-3 text-slate-600">{d.question}</td>
                    <td className={`w-[48mm] border-b border-slate-200 py-1.5 pr-3 text-[11.5px] font-semibold ${TONE[d.tone]}`}>{d.answer}</td>
                    <td className="border-b border-slate-200 py-1.5 text-slate-700">{d.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="mt-4 text-[8.5px] font-semibold uppercase tracking-wider text-slate-500">
              Readiness test — all must hold before real money (written down {longDate(r.readiness.statedOn)})
            </h3>
            <table className="mt-1 w-full border-collapse">
              <tbody>
                {r.readiness.conditions.map((c, i) => (
                  <tr key={c.text} className="align-top">
                    <Td left className="w-4 text-slate-500">{i + 1}</Td>
                    <Td left>{c.text}</Td>
                    <Td left className="whitespace-nowrap text-slate-700">{c.current}</Td>
                    <Td left className={`w-14 whitespace-nowrap font-semibold ${c.met ? "text-emerald-800" : "text-slate-400"}`}>{c.met ? "✓ met" : "not met"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Small>
              Ranges are 95% ranges from weekly results: the band the true figure probably lies in, given how much the weeks vary. Spreads are an estimate, not measured.
            </Small>
          </Section>
        )}

        <Section title="Key findings" pageBreak={!!r.readiness}>
          <ul className="list-disc space-y-1 pl-4">
            {findings.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Section>

        {r.claims && (
          <Section title="Claims scoreboard" note="The claims the system rests on, written down on 30 Sept 2026 and graded monthly. A claim is only established or rejected after 26 weeks of evidence pointing consistently one way.">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th left>#</Th>
                  <Th left>Claim</Th>
                  <Th left>Status</Th>
                  <Th left>Evidence</Th>
                  <Th left>Measure</Th>
                </tr>
              </thead>
              <tbody>
                {r.claims.map((c) => (
                  <tr key={c.id} className="align-top">
                    <Td left>{c.id}</Td>
                    <Td left className="max-w-[62mm]">{c.text}</Td>
                    <Td left className={STATUS_TONE[c.status]}>{c.status}</Td>
                    <Td left className="whitespace-nowrap text-slate-600">{c.strength} · n={c.n}</Td>
                    <Td left className="text-slate-700">{c.metric}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {r.decisions && (
          <Section title="Decisions">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <h3 className="text-[8.5px] font-semibold uppercase tracking-wider text-slate-500">Proposed</h3>
                <p className="mt-1">{r.decisions.proposed.length ? r.decisions.proposed.join(" ") : "No change proposed: no claim has met the evidence bar."}</p>
                <h3 className="mt-2 text-[8.5px] font-semibold uppercase tracking-wider text-slate-500">Watching</h3>
                {r.decisions.watching.length ? (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">{r.decisions.watching.map((w) => <li key={w}>{w}</li>)}</ul>
                ) : (
                  <p className="mt-1 text-slate-500">Nothing leaning either way yet.</p>
                )}
              </div>
              <div>
                <h3 className="text-[8.5px] font-semibold uppercase tracking-wider text-slate-500">Recent changes and their effect</h3>
                <ul className="mt-1 space-y-1">
                  {r.decisions.log.slice(-3).reverse().map((d) => (
                    <li key={d.date + d.change}>
                      <span className="text-slate-500">{d.date}</span> {d.change} <span className="text-slate-600">{d.observed ? `Observed: ${d.observed}` : `Expected: ${d.expected}`}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>
        )}

        {hasLive ? (
          <>
            <Section
              pageBreak
              title={`Prospective results: the honest test since ${fixed}`}
              note={`Simulated £10,000 books, measured only on weeks after the rules were fixed. ${bookName(r.readiness?.mainBook ?? "LAB_TOP20")} is the main strategy, chosen in advance; the rest are alternatives.`}
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <Th left>Book</Th>
                    <Th>Return</Th>
                    <Th>vs benchmark (95% range)</Th>
                    <Th>Worst fall</Th>
                    <Th>Volatility</Th>
                    <Th>Tracking error</Th>
                    <Th>Beta</Th>
                    <Th>Sharpe · Sortino</Th>
                    <Th>Costs + spreads</Th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => {
                    const l = b.live;
                    const isMain = b.strategy === r.readiness?.mainBook;
                    const isBench = b.strategy === "BENCHMARK";
                    return (
                      <tr key={b.strategy} className={isMain ? "bg-amber-50" : RULEBOOKS.has(b.strategy) ? "" : "text-slate-500"}>
                        <Td left bold={isMain}>
                          {bookName(b.strategy)}
                          {isMain && <span className="ml-1 text-[8px] font-semibold uppercase tracking-wider text-amber-700">main</span>}
                        </Td>
                        <Td bold>{fmtPct(b.sinceFixedPct)}</Td>
                        <Td className="whitespace-nowrap">
                          {!isBench && (
                            <>
                              {fmtPts(l?.vsBenchmark)}
                              {gapRange(l ?? null) && <span className="block text-[9px] text-slate-500">{range(gapRange(l ?? null), " pts")}</span>}
                            </>
                          )}
                        </Td>
                        <Td>{l?.maxDrawdownPct == null ? "—" : fmtPct(-l.maxDrawdownPct)}</Td>
                        <Td>{pct0(l?.risk?.volatility)}</Td>
                        <Td>{isBench ? "" : pct0(l?.risk?.trackingError)}</Td>
                        <Td>{isBench ? "" : ratio(l?.risk?.beta)}</Td>
                        <Td className="whitespace-nowrap">{l?.risk?.sharpe == null && l?.risk?.sortino == null ? "—" : `${ratio(l?.risk?.sharpe)} · ${ratio(l?.risk?.sortino)}`}</Td>
                        <Td>{l ? `${((l.costsPct + l.spreadPct) * 100).toFixed(1)}%` : "—"}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Small>
                vs benchmark: the book&apos;s return minus the benchmark&apos;s; the 95% range around it comes from the weekly gaps. Volatility and tracking error are yearly rates from weekly returns; beta is the book&apos;s sensitivity to the benchmark (1 = moves with it). Sharpe and Sortino (return over cash at {Math.round(CASH_RATE * 100)}% per unit of risk) appear after 26 weeks; before that they are noise. Costs + spreads: modelled costs plus bid-ask spreads estimated at {(SPREAD_PER_TRADE * 100).toFixed(1)}% a trade, as a share of the book at {fixed}.
              </Small>
            </Section>

            <section className="rounded border border-dashed border-slate-400 bg-slate-50 p-3 text-slate-600">
              <h2 className="font-display text-base text-slate-700">Back-test, before {fixed} — not evidence</h2>
              <p className="text-[10px]">
                These rules were chosen after seeing this period, so these figures show how the rules were picked, not how well they work. They are kept apart from the results above on purpose.
              </p>
              <table className="mt-2 w-full border-collapse">
                <thead>
                  <tr>
                    <Th left>Book</Th>
                    <Th>Start</Th>
                    <Th>Return to {fixed}</Th>
                    <Th>Worst fall</Th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.strategy}>
                      <Td left>{bookName(b.strategy)}</Td>
                      <Td>{b.backtest?.from ?? "—"}</Td>
                      <Td>{fmtPct(b.backtest?.returnPct)}</Td>
                      <Td>{b.backtest?.maxDrawdownPct == null ? "—" : fmtPct(-b.backtest.maxDrawdownPct)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          <Section pageBreak title="Strategy lab: results since the rules were fixed" note={`Simulated £10,000 books. The honest test starts on ${fixed}; earlier returns are a back-test and the rules were chosen after seeing it.`}>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th left>Book</Th>
                  <Th>Since {fixed}</Th>
                  <Th>3 months</Th>
                  <Th>6 months</Th>
                  <Th>12 months</Th>
                  <Th>Since June*</Th>
                  <Th>Worst fall</Th>
                  <Th>Costs</Th>
                  <Th>Value</Th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.strategy} className={RULEBOOKS.has(b.strategy) ? "" : "text-slate-500"}>
                    <Td left>{bookName(b.strategy)}</Td>
                    <Td bold>{fmtPct(b.sinceFixedPct)}</Td>
                    <Td>{fmtPct(b.rolling?.m3)}</Td>
                    <Td>{fmtPct(b.rolling?.m6)}</Td>
                    <Td>{fmtPct(b.rolling?.m12)}</Td>
                    <Td>{fmtPct(b.sinceInceptionPct)}</Td>
                    <Td>{b.maxDrawdownPct === null ? "—" : fmtPct(-b.maxDrawdownPct)}</Td>
                    <Td>{`${(b.costsPct * 100).toFixed(1)}%`}</Td>
                    <Td>{gbp(b.valueGbp)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Small>*Back-test before {fixed}. Rolling columns fill in as history builds. Costs are cumulative, as a share of capital; bid-ask spreads are not included.</Small>
          </Section>
        )}

        {r.diagnostics && (
          <Section title={`Where the returns came from (since ${fixed})`} note={
              hasSector
                ? "Each book's return split into currency moves, the average move of the markets it held, its sector bets (its holdings' sectors against their whole index), stock picking within sectors (each holding against the average company in its own sector and index), dividends and costs. 'Other' is what the parts do not explain: cash, timing and compounding."
                : "Each book's return split into currency moves, the average move of the markets it held, stock picking (its holdings against the average company in their own index), dividends and costs. 'Other' is what the parts do not explain: cash, timing and compounding."
            }
          >
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th left>Book</Th>
                  <Th>Return</Th>
                  <Th>Currency</Th>
                  <Th>Markets held</Th>
                  {hasSector && <Th>Sector bets</Th>}
                  <Th>{hasSector ? "Picking within sectors" : "Stock picking"}</Th>
                  <Th>Dividends</Th>
                  <Th>Costs</Th>
                  <Th>Other</Th>
                </tr>
              </thead>
              <tbody>
                {traded.map((b) => {
                  const s = diag.get(b.strategy)?.sinceFixed;
                  return (
                    <tr key={b.strategy}>
                      <Td left>{bookName(b.strategy)}</Td>
                      {s ? (
                        <>
                          <Td bold>{fmtPct(s.total)}</Td>
                          <Td>{fmtPts(s.currency)}</Td>
                          <Td>{fmtPts(s.market)}</Td>
                          {hasSector && <Td>{fmtPts(s.sector)}</Td>}
                          <Td bold>{fmtPts(s.selection)}</Td>
                          <Td>{fmtPts(s.dividends)}</Td>
                          <Td>{fmtPts(-s.costs)}</Td>
                          <Td className="text-slate-500">{fmtPts(s.other)}</Td>
                        </>
                      ) : (
                        <td colSpan={hasSector ? 8 : 7} className="border-b border-slate-100 py-1 text-right text-slate-400">No weeks since the rules were fixed yet</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>
        )}

        {r.diagnostics && (
          <Section title="Concentration check" note="How many truly independent bets each book holds today. 'Effective positions' is the number of equal-sized holdings the book behaves like; ⚠ marks fewer than 5, or 40% or more in one sector.">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th left>Book</Th>
                  <Th>Holdings</Th>
                  <Th>Effective positions</Th>
                  <Th left>Largest sector</Th>
                  <Th left>Regions</Th>
                  <Th>Cash</Th>
                  <Th> </Th>
                </tr>
              </thead>
              <tbody>
                {traded.map((b) => {
                  const c = diag.get(b.strategy)?.concentration;
                  return (
                    <tr key={b.strategy}>
                      <Td left>{bookName(b.strategy)}</Td>
                      <Td>{c?.holdings ?? "—"}</Td>
                      <Td>{c?.effectiveNames?.toFixed(1) ?? "—"}</Td>
                      <Td left>{c?.topSector ? `${c.topSector} ${pct0(c.topSectorWeight)}` : "—"}</Td>
                      <Td left>{c ? Object.entries(c.regions).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${pct0(v)}`).join(" · ") : "—"}</Td>
                      <Td>{pct0(c?.cashWeight)}</Td>
                      <Td className="text-amber-700">{c?.warning ? "⚠" : ""}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>
        )}

        {r.diagnostics && (
          <Section title="Trading discipline" note="Win/loss profile of closed positions, whether new names beat the names they replaced (4 and 13 weeks later), and what trading added this month against simply keeping the month's opening book.">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th left>Book</Th>
                  <Th>Closed</Th>
                  <Th>Hit rate</Th>
                  <Th>Avg win</Th>
                  <Th>Avg loss</Th>
                  <Th>Weeks held</Th>
                  <Th>Top-3 share</Th>
                  <Th>Switches 4w</Th>
                  <Th>Switches 13w</Th>
                  <Th>Trading, month</Th>
                  <Th>Trading, avg</Th>
                </tr>
              </thead>
              <tbody>
                {traded.map((b) => {
                  const d = diag.get(b.strategy);
                  const p = d?.profile;
                  const sw = (w: number) => {
                    const s = d?.switches.find((x) => x.weeks === w);
                    return s && s.n ? `${fmtPts(s.mean)} (${s.n})` : "—";
                  };
                  return (
                    <tr key={b.strategy}>
                      <Td left>{bookName(b.strategy)}</Td>
                      <Td>{p?.closed ?? "—"}</Td>
                      <Td>{pct0(p?.hitRate)}</Td>
                      <Td>{fmtPct(p?.avgWin)}</Td>
                      <Td>{fmtPct(p?.avgLoss)}</Td>
                      <Td>{p?.medianWeeks?.toFixed(0) ?? "—"}</Td>
                      <Td>{pct0(p?.topThreeShare)}</Td>
                      <Td>{sw(4)}</Td>
                      <Td>{sw(13)}</Td>
                      <Td>{fmtPts(d?.tradingMonth)}</Td>
                      <Td>{d?.tradingMonths ? `${fmtPts(d.tradingAvg)} (${d.tradingMonths})` : "—"}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Small>
              Switches: new names&apos; return minus the replaced name&apos;s, averaged (number of switches in brackets); positive means selling and replacing helped. Top-3 share: share of all gains that came from the three biggest winners. Trading: this month&apos;s return minus the return of keeping the opening book; the average covers full months since {fixed}.
            </Small>
          </Section>
        )}

        {sc && (
          <Section pageBreak title="Rating scorecard" note={`Every rating, graded by the return that followed (dividends included), relative to the average company rated in the same index that week. ${sc.ratings.toLocaleString("en-GB")} ratings on file.`}>
            {sc.spread && (
              <div>
                <h3 className="text-[8.5px] font-semibold uppercase tracking-wider text-slate-500">Buy minus Avoid, cumulative (the rating system&apos;s track record)</h3>
                <SpreadChart points={sc.spread.points} />
                <p>
                  {sc.spread.summary.n < MIN_WEEKS ? (
                    `${sc.spread.summary.n} week(s) so far; the average and its evidence appear after ${MIN_WEEKS} weeks (scaling a few weeks up to a year is noise).`
                  ) : (
                    <>
                      {sc.spread.summary.n} weeks: average {fmtPts(sc.spread.summary.mean! * 52)} a year
                      {spreadRange ? ` (95% range ${range({ low: spreadRange.low * 52, high: spreadRange.high * 52 }, " pts")})` : ""}, positive in {pct0(sc.spread.summary.positiveShare)} of weeks. Evidence:{" "}
                      <span className="font-semibold">{sc.spread.strength}</span>
                      {sc.ic ? `. Score ranking: average weekly rank correlation ${sc.ic.summary.mean === null ? "—" : sc.ic.summary.mean.toFixed(3)} (${sc.ic.strength}).` : "."}
                    </>
                  )}
                </p>
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-5">
              {sc.horizons.map((h) => (
                <table key={h.weeks} className="w-full border-collapse">
                  <thead>
                    <tr>
                      <Th left>{h.weeks} weeks</Th>
                      <Th>Ratings</Th>
                      <Th>Average</Th>
                      {hasRange && <Th>95% range</Th>}
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
                          {hasRange && <Td className="whitespace-nowrap text-slate-600">{range(v.range)}</Td>}
                          <Td>{pct0(v.hitRate)}</Td>
                          <Td>{fmtPct(was?.meanExcess)}</Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ))}
            </div>
            <Small>
              Grey rows have fewer than 100 ratings and are not findings yet.
              {hasRange && " The 95% range comes from one average per starting week and allows for back-to-back windows overlapping, so it is wider than a count of ratings would suggest: the same company rated ten weeks running is not ten independent results."}
            </Small>

            {sc.flagAudit && (
              <div className="mt-3">
                <h3 className="text-[8.5px] font-semibold uppercase tracking-wider text-slate-500">Red-flag audit</h3>
                {sc.flagAudit.length === 0 ? (
                  <p className="mt-1 text-slate-500">Not enough weeks yet.</p>
                ) : (
                  <table className="mt-1 w-full border-collapse">
                    <thead>
                      <tr>
                        <Th left>Flag</Th>
                        <Th>Weeks</Th>
                        <Th>Flagged vs unflagged, a year</Th>
                        <Th left>Evidence</Th>
                        <Th left>Verdict</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {sc.flagAudit.map((f) => (
                        <tr key={f.flag}>
                          <Td left>{flagName(f.flag)}</Td>
                          <Td>{f.weeks}</Td>
                          <Td bold>{f.weeks < MIN_WEEKS || f.weeklyMean === null ? "—" : fmtPts(f.weeklyMean * 52)}</Td>
                          <Td left>{f.strength}</Td>
                          <Td left className={f.weeklyMean !== null && f.weeklyMean < 0 ? "text-emerald-700" : "text-amber-700"}>
                            {f.strength === "too early" ? "—" : f.weeklyMean !== null && f.weeklyMean < 0 ? "warning works" : "not warning"}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-5">
              <CaseList title={`Winners rated Hold or Avoid (${sc.caseWeeks ?? "—"} weeks)`} rows={sc.missed ?? []} pattern={sc.patterns?.missed} showCaps />
              <CaseList title="Buy losers with no red flag (candidates for new flags)" rows={sc.flaglessLosers ?? []} pattern={sc.patterns?.flaglessLosers} />
              <CaseList title="Best Buy or better" rows={sc.best} />
              <CaseList title="Worst Buy or better" rows={sc.worst} showCaps />
            </div>
          </Section>
        )}

        {r.opportunities && r.opportunities.length > 0 && (
          <Section pageBreak title="Opportunities by market" note="Where the model finds value: the share of each index rated Buy or better, and the typical margin of safety, at the latest full run, with the change over the month.">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th left>Index</Th>
                  <Th>Rated</Th>
                  <Th>Buy or better</Th>
                  <Th>Change</Th>
                  <Th>Median margin of safety</Th>
                  <Th>Change</Th>
                </tr>
              </thead>
              <tbody>
                {r.opportunities.map((o) => (
                  <tr key={o.index}>
                    <Td left>{INDEX[o.index] ?? o.index}</Td>
                    <Td>{o.rated.toLocaleString("en-GB")}</Td>
                    <Td bold>{`${(o.buyShare * 100).toFixed(1)}%`}</Td>
                    <Td>{fmtPts(o.buyShareChange)}</Td>
                    <Td>{o.medianMos === null ? "—" : `${o.medianMos.toFixed(0)}%`}</Td>
                    <Td>{o.medianMosChange === null ? "—" : `${o.medianMosChange >= 0 ? "+" : "−"}${Math.abs(o.medianMosChange).toFixed(0)} pts`}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Small>A negative median margin of safety means the typical company trades above its estimated fair value.</Small>
          </Section>
        )}

        <section className="grid grid-cols-2 gap-5">
          <div>
            <h2 className="font-display text-lg">ETFs</h2>
            {r.etf ? (
              <>
                <p className="mt-1">
                  Portfolio, latest month ({r.etf.portfolioMonth}):{" "}
                  {r.etf.books.map((b) => `${b.strategy === "BUY_HOLD" ? "buy and hold" : b.strategy === "REBALANCED" ? "quarterly rebalanced" : "benchmark"} ${fmtPct(b.monthReturnPct)}`).join(" · ")}
                </p>
                <p>
                  Top fund changed in {r.etf.leaderChanges.length} of {r.etf.groups} exposure groups since {r.etf.comparedWith}
                  {r.etf.leaderChanges.length ? `: ${r.etf.leaderChanges.map((c) => `${c.from}→${c.to}`).join(", ")}` : "."}
                </p>
                <p>
                  Ranking test (top-ranked fund vs its peers, next month):{" "}
                  {r.etf.forwardTest?.length
                    ? `${r.etf.forwardTest.length} group-months, top fund ahead in ${pct0(r.etf.forwardTest.filter((o) => o.topReturn > o.peersReturn).length / r.etf.forwardTest.length)} of them.`
                    : "first results once October's prices are in."}
                </p>
              </>
            ) : (
              <p className="mt-1 text-slate-500">ETF summary unavailable this month.</p>
            )}
          </div>
          <div>
            <h2 className="font-display text-lg">Data integrity</h2>
            <p className="mt-1">
              {r.health.fullRunWeeks} full screener run(s) out of {r.health.runWeeks} week(s) with a run this month.
              {r.health.badPrices !== null && ` ${r.health.badPrices} price pair(s) excluded as data errors.`}
            </p>
            {sc?.outcomes && (
              <p>
                4-week outcomes: {sc.outcomes.snapshot.toLocaleString("en-GB")} from later ratings, {sc.outcomes.gap} after a skipped run, {sc.outcomes.trading} from Yahoo (no longer rated), {sc.outcomes.takeover} takeovers, {sc.outcomes.failure} failures counted as total losses; {sc.outcomes.missing.toLocaleString("en-GB")} still missing.
              </p>
            )}
            {r.integrity && r.integrity.modelVersions.length === 0 && <p>Model version: no ratings this month yet.</p>}
            {r.integrity && r.integrity.modelVersions.length > 0 && (
              <p>
                Model version{r.integrity.modelVersions.length > 1 ? "s" : ""} this month:{" "}
                {r.integrity.modelVersions.map((v) => `${v.version} (${v.ratings.toLocaleString("en-GB")} ratings, ${(v.buyShare * 100).toFixed(1)}% Buy or better)`).join("; ")}
                {r.integrity.modelVersions.filter((v) => !v.version.includes("not recorded")).length > 1 ? " — the model changed this month; compare the two." : "."}
              </p>
            )}
          </div>
        </section>

        <Section pageBreak title="This month's returns" note="One month is mostly noise; kept here for the record.">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th left>Book</Th>
                <Th>This month</Th>
                <Th>Last month</Th>
                <Th>Stock picking</Th>
                <Th>Currency</Th>
                <Th>Trades</Th>
              </tr>
            </thead>
            <tbody>
              {[...r.books].sort((a, b) => (b.monthPct ?? -9) - (a.monthPct ?? -9)).map((b) => {
                const m = diag.get(b.strategy)?.month;
                return (
                  <tr key={b.strategy}>
                    <Td left>{bookName(b.strategy)}</Td>
                    <Td bold>{fmtPct(b.monthPct)}</Td>
                    <Td>{fmtPct(prevBook.get(b.strategy)?.monthPct)}</Td>
                    <Td>{fmtPts(m?.selection)}</Td>
                    <Td>{fmtPts(m?.currency)}</Td>
                    <Td>{b.tradesInMonth}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-3 grid grid-cols-2 gap-5">
            <div>
              <h3 className="text-[8.5px] font-semibold uppercase tracking-wider text-slate-500">Strong Buy list</h3>
              <p className="mt-1">Now: {r.strongBuys.current.join(", ") || "none"}</p>
              <p>Joined: {r.strongBuys.joined.join(", ") || "none"} · Left: {r.strongBuys.left.join(", ") || "none"}</p>
            </div>
          </div>
        </Section>

        {r.decisions && (
          <Section title="Decision log" note="Every change to the model, the books or the measurements, with why it was made and what it was expected to do.">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th left>Date</Th>
                  <Th left>Change</Th>
                  <Th left>Why</Th>
                  <Th left>Expected / observed</Th>
                </tr>
              </thead>
              <tbody>
                {r.decisions.log.map((d) => (
                  <tr key={d.date + d.change} className="align-top">
                    <Td left className="whitespace-nowrap">{d.date}</Td>
                    <Td left>{d.change}</Td>
                    <Td left className="text-slate-600">{d.why}</Td>
                    <Td left className="text-slate-600">{d.observed ? `Observed: ${d.observed}` : d.expected}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        <footer className="border-t border-slate-300 pt-2 text-[8px] leading-snug text-slate-500">
          Simulations and statistics on past ratings only — not a track record and not investment advice. Costs, currency and dividends are modelled
          approximations; bid-ask spreads are not included. Past performance is not a reliable indicator of future results; capital is at risk.
        </footer>
      </div>
    </main>
  );
}
