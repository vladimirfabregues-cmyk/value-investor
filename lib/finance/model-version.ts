/**
 * Version of the deterministic valuation engine.
 *
 * This is provenance, not decoration: it stamps every analysis with the exact
 * version of the scoring, gating and intrinsic-value logic that produced it, so
 * a saved verdict can always be traced back to the rules in force at the time.
 *
 * Bump it whenever a change to that logic could move a verdict — new gates,
 * changed thresholds, a different valuation method, or reweighted scores.
 * Follows semver: MAJOR for a re-architecture of how verdicts are reached,
 * MINOR for new checks or methods, PATCH for tuning that rarely flips a verdict.
 *
 * 1.0.0 — first versioned release: sector-aware intrinsic value (DCF / NAV /
 *         DDM / justified-P/B), hard gates, and the composite score.
 */
export const VALUATION_MODEL_VERSION = "1.0.0";
