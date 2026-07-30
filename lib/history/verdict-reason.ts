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
 * The reason is derived once into a locale-neutral token, then rendered in the
 * viewer's language. `deriveVerdictReason` is the English rendering, kept for
 * the stored projection, search and the comparison export.
 *
 * Written defensively: `verdict_explanation` is absent on analyses saved before
 * it existed, and this runs against raw JSON straight out of the database.
 */

import { CAP_LABELS } from "@/lib/finance/verdict-explanation";
import { makeTranslator, type Translator } from "@/lib/i18n/translate";
import type { ValueInvestingAnalysis, VerdictCheck, VerdictReasonToken } from "@/types/analysis";

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

function truncate(text: string): string {
  return text.length <= MAX_REASON_LENGTH
    ? text
    : `${text.slice(0, MAX_REASON_LENGTH - 1).trimEnd()}…`;
}

/** Derive the locale-neutral reason token from a raw stored analysis. */
export function deriveVerdictReasonToken(fullJson: unknown): VerdictReasonToken {
  const explanation = isRecord(fullJson) ? fullJson.verdict_explanation : undefined;
  if (!isRecord(explanation)) return { k: "none" };

  const { hard_gates: gates, checks } = explanation as ExplanationShape;

  // A hard gate overrides the composite score, so it is the whole story.
  if (Array.isArray(gates)) {
    const gateName = gates.map(readName).find((name): name is string => name !== null);
    if (gateName) return { k: "gate", name: gateName };
  }

  if (Array.isArray(checks)) {
    const named = checks
      .map((check) => ({ name: readName(check), status: readStatus(check) }))
      .filter((check): check is { name: string; status: VerdictCheck["status"] } =>
        check.name !== null && check.status !== null,
      );

    const failed = named.filter((c) => c.status === "fail").map((c) => c.name);
    if (failed.length > 0) return { k: "failed", names: failed };

    const borderline = named.filter((c) => c.status === "warn").map((c) => c.name);
    if (borderline.length > 0) return { k: "borderline", names: borderline };

    if (named.length > 0) return { k: "allPassed" };
  }

  return { k: "none" };
}

// ── Localised rendering ──────────────────────────────────────────────────────

const CHECK_KEY: Record<string, string> = {
  Valuation: "valuation",
  "Financial health": "health",
  "Business quality": "quality",
  "Margin of safety": "margin",
  "Premium to estimated value": "premium",
};
const CAP_LABEL_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(CAP_LABELS).map(([key, label]) => [label, key]),
);

function localizeCheck(name: string, t: Translator): string {
  return CHECK_KEY[name] ? t(`prose.ve.name.${CHECK_KEY[name]}`) : name;
}

function localizeGate(name: string, t: Translator): string {
  if (name === "Balance-sheet safety") return t("prose.ve.gate.balanceName");
  if (name === "Value-trap risk") return t("prose.ve.gate.valueTrapName");
  const capKey = CAP_LABEL_TO_KEY[name];
  return capKey ? t(`caps.${capKey}.label`) : name;
}

/** Join names as "A and b" / "A, b and c" — first as written, rest lower-cased. */
function joinNames(names: string[], t: Translator): string {
  const [first, ...rest] = names;
  if (rest.length === 0) return first;
  const lowered = rest.map((n) => n.toLowerCase());
  const last = lowered.pop()!;
  const and = t("history.reason.and");
  return lowered.length > 0 ? `${first}, ${lowered.join(", ")}${and}${last}` : `${first}${and}${last}`;
}

/**
 * Render a reason token in the target language.
 *
 * @param fallback used for the `none` token (analyses without a structured
 *   explanation) — the caller passes the localised one-line verdict.
 */
export function renderVerdictReason(
  token: VerdictReasonToken,
  fallback: string | null | undefined,
  t: Translator,
): string {
  switch (token.k) {
    case "gate":
      return truncate(localizeGate(token.name, t));
    case "failed":
      return truncate(t("history.reason.failed", { names: joinNames(token.names.map((n) => localizeCheck(n, t)), t) }));
    case "borderline":
      return truncate(t("history.reason.borderline", { names: joinNames(token.names.map((n) => localizeCheck(n, t)), t).toLowerCase() }));
    case "allPassed":
      return t("history.reason.allPassed");
    default: {
      const text = (fallback ?? "").trim();
      return text ? truncate(text) : t("history.reason.unknown");
    }
  }
}

const enT = makeTranslator("en");

/**
 * English rendering of the reason — used for the stored summary projection,
 * history search and the comparison CSV/table, all of which are locale-neutral.
 *
 * @param fullJson the persisted analysis, of unknown shape
 * @param fallback used when no structured explanation is present — normally the
 *   saved one-line verdict, the best short text we have for old rows
 */
export function deriveVerdictReason(fullJson: unknown, fallback?: string | null): string {
  return renderVerdictReason(deriveVerdictReasonToken(fullJson), fallback, enT);
}

/** Convenience wrapper for callers that already hold a parsed analysis. */
export function verdictReasonFor(analysis: ValueInvestingAnalysis): string {
  return deriveVerdictReason(analysis, analysis.final_verdict.one_line_verdict);
}
