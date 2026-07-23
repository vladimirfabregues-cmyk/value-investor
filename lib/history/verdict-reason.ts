/**
 * The short "why" that sits next to a verdict in dense contexts — history
 * rows, comparison headers — where the full explanation will not fit.
 *
 * This reads the stored `verdict_explanation` rather than re-deriving verdict
 * logic, for the same reason `WhyThisVerdict` does: one authoritative account
 * of how a verdict was reached, rendered at different lengths. When a hard gate
 * fired, that gate *is* the reason and nothing else matters. Otherwise the
 * failed component checks are the reason.
 *
 * Written defensively: `verdict_explanation` is absent on analyses saved before
 * it existed, and this runs against raw JSON straight out of the database.
 */

import type { ValueInvestingAnalysis, VerdictCheck } from "@/types/analysis";

/** Fallback when the analysis predates structured explanations. */
const UNKNOWN_REASON = "Reason not recorded";

/** Keeps a reason readable inside a 320px panel. */
const MAX_REASON_LENGTH = 44;

interface ExplanationShape {
  hard_gates?: { name?: unknown }[];
  checks?: { name?: unknown; status?: unknown }[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readName(entry: unknown): string | null {
  if (!isRecord(entry)) return null;
  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  return name || null;
}

function readStatus(entry: unknown): VerdictCheck["status"] | null {
  if (!isRecord(entry)) return null;
  return entry.status === "pass" || entry.status === "warn" || entry.status === "fail"
    ? entry.status
    : null;
}

/** Joins check names into a phrase: "Valuation and business quality". */
function joinNames(names: string[]): string {
  const [first, ...rest] = names;
  if (rest.length === 0) return first;
  const lowered = rest.map((name) => name.toLowerCase());
  const last = lowered.pop()!;
  return lowered.length > 0
    ? `${first}, ${lowered.join(", ")} and ${last}`
    : `${first} and ${last}`;
}

function truncate(text: string): string {
  return text.length <= MAX_REASON_LENGTH
    ? text
    : `${text.slice(0, MAX_REASON_LENGTH - 1).trimEnd()}…`;
}

/**
 * Derive the short reason from a raw stored analysis.
 *
 * @param fullJson the persisted analysis, of unknown shape
 * @param fallback used when no structured explanation is present — normally the
 *   saved one-line verdict, which is the best short text we have for old rows
 */
export function deriveVerdictReason(fullJson: unknown, fallback?: string | null): string {
  const explanation = isRecord(fullJson) ? fullJson.verdict_explanation : undefined;

  if (!isRecord(explanation)) {
    const text = (fallback ?? "").trim();
    return text ? truncate(text) : UNKNOWN_REASON;
  }

  const { hard_gates: gates, checks } = explanation as ExplanationShape;

  // A hard gate overrides the composite score, so it is the whole story.
  if (Array.isArray(gates)) {
    const gateName = gates.map(readName).find((name): name is string => name !== null);
    if (gateName) return truncate(gateName);
  }

  if (Array.isArray(checks)) {
    const named = checks
      .map((check) => ({ name: readName(check), status: readStatus(check) }))
      .filter((check): check is { name: string; status: VerdictCheck["status"] } =>
        check.name !== null && check.status !== null,
      );

    const failed = named.filter((check) => check.status === "fail").map((check) => check.name);
    if (failed.length > 0) return truncate(`${joinNames(failed)} failed`);

    const borderline = named.filter((check) => check.status === "warn").map((check) => check.name);
    if (borderline.length > 0) return truncate(`Borderline on ${joinNames(borderline).toLowerCase()}`);

    if (named.length > 0) return "All checks passed";
  }

  const text = (fallback ?? "").trim();
  return text ? truncate(text) : UNKNOWN_REASON;
}

/** Convenience wrapper for callers that already hold a parsed analysis. */
export function verdictReasonFor(analysis: ValueInvestingAnalysis): string {
  return deriveVerdictReason(analysis, analysis.final_verdict.one_line_verdict);
}
