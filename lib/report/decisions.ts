/**
 * Every change to the model, the books or the measurements, with why it was
 * made and what it was expected to do, so later reports can check the effect.
 * Append only.
 */

export interface DecisionEntry {
  date: string;
  change: string;
  why: string;
  expected: string;
  observed?: string;
}

export const DECISION_LOG: DecisionEntry[] = [
  {
    date: "2026-09-28",
    change: "Portfolio builds refuse to save when price downloads fail.",
    why: "A throttled download was simulated as an all-cash book and overwrote real results with zeros.",
    expected: "A failed week keeps the previous figures and retries.",
  },
  {
    date: "2026-09-29",
    change: "Stock splits are no longer applied twice.",
    why: "Yahoo prices are already split-adjusted, so a held 10:1 split would have shown a tenfold gain.",
    expected: "No effect on current books (no split yet); protects future ones.",
  },
  {
    date: "2026-09-29",
    change: "Strategy lab rules fixed (version 1).",
    why: "So that a year from now the comparison between rulebooks is an honest test.",
    expected: "Only results after 29 Sept count as evidence.",
  },
  {
    date: "2026-09-30",
    change: "Lab version 2: books trade only on full screener runs.",
    why: "Before the weekly automation, partial runs forced needless sales and repurchases.",
    expected: "Fewer trades and lower costs in the back-test; no effect from October on.",
    observed: "Back-test trades fell by about two-thirds and costs roughly halved; the monthly book went from 3 to 20 holdings.",
  },
  {
    date: "2026-09-30",
    change: "Eight claims written down; monthly report restructured around them.",
    why: "Judging the process, not the month: each claim is graded only on evidence gathered after it was stated.",
    expected: "No rule changes until a claim meets the bar (26 weeks, consistently one way).",
  },
  {
    date: "2026-09-30",
    change: "Scorecard counts dividends and companies that stop being rated.",
    why: "Price-only returns understated high-yield Buys; delisted companies silently dropped out.",
    expected: "Buy ratings look slightly better (dividends) and failures now count as losses.",
  },
  {
    date: "2026-09-30",
    change: "Scorecard restates prices for share splits.",
    why: "Snapshot prices are raw: MQ's 1-for-4 and DuPont's 1-for-3 reverse splits read as +330% and +190% 'returns'.",
    expected: "Those false winners disappear from the case lists; averages shift slightly.",
  },
  {
    date: "2026-11-13",
    change: "Report reorganised around investment readiness; Top 20, capped fixed as the main strategy; a six-condition readiness test written down.",
    why: "The report answered a researcher's question (is each claim proven?) rather than an investor's (is this ready for real money?), and led with whichever book happened to be ahead.",
    expected: "Status stays 'research and observation' until at least 29 Sept 2027 (12 months of prospective results).",
  },
  {
    date: "2026-11-13",
    change: "Stock picking split into sector bets and picking within sectors; 95% ranges, volatility, tracking error and beta added (Sharpe and Sortino from 26 weeks).",
    why: "The books lean heavily on Financials, so part of what read as stock picking was a sector bet; raw returns without ranges overstated how much a few weeks show.",
    expected: "Stock picking shrinks where books are concentrated in one sector; ranges are wide for months. Claim 7 keeps its original measure (sector and within-sector together).",
  },
];
