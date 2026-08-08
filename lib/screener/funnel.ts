/**
 * The screener funnel — one source of truth for every count shown on the
 * screener page. All figures derive from the index-wide screen metadata, never
 * from the (page-limited) rows currently rendered.
 *
 * Fixes P1-3: the page previously mixed four denominators — a 500-row page
 * limit labelled "candidates found", pill totals summing to the screened
 * figure, and a subline that folded Strong buy into "Buy" (1 + 13 read as
 * "14 Buy", contradicting the "Buy 13" pill). Everything now comes from here.
 */

export interface ScreenMetaLike {
  totalScreened: number;
  totalErrors: number;
  verdictCounts?: Record<string, number>;
}

export interface ScreenFunnel {
  /** Names attempted: those that produced a result plus those that errored. */
  universe: number;
  /** Names that produced a result (sum of the verdict distribution). */
  screened: number;
  /** Uncapped passes — Strong buy + Buy. */
  passedAllGates: number;
  /** Passed valuation/quality but held back by a conclusion cap. */
  onWatch: number;
  /** Actionable candidates = passed all gates + on watch. */
  candidateTotal: number;
}

export function computeScreenFunnel(meta: ScreenMetaLike): ScreenFunnel {
  const vc = meta.verdictCounts ?? {};
  const passedAllGates = (vc.STRONG_BUY ?? 0) + (vc.BUY ?? 0);
  const onWatch = vc.WATCH ?? 0;
  return {
    universe: meta.totalScreened + meta.totalErrors,
    screened: meta.totalScreened,
    passedAllGates,
    onWatch,
    candidateTotal: passedAllGates + onWatch,
  };
}
