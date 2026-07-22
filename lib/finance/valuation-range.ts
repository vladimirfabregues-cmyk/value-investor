/**
 * Turns the individual valuation models into an honest range.
 *
 * A single blended figure implies more precision than the models support. When
 * methods disagree materially the user should see the spread and be told the
 * agreement is weak, rather than being handed one confident-looking number.
 */

export interface ModelValue {
  /** e.g. "DCF", "Graham number" */
  name: string;
  value: number;
}

export type ModelAgreement = "High" | "Medium" | "Low";

export interface ValuationRange {
  /** Lowest and highest model outputs; null when nothing could be valued */
  low: number | null;
  high: number | null;
  /** The figure the verdict is anchored to */
  base: number | null;
  models: ModelValue[];
  agreement: ModelAgreement | null;
  /** Spread between models as a share of the base, e.g. 1.2 = 120% */
  spreadRatio: number | null;
  explanation: string | null;
}

interface IntrinsicValueInput {
  dcf_value_per_share?: number | null;
  graham_value_per_share?: number | null;
  nav_value_per_share?: number | null;
  ddm_value_per_share?: number | null;
  pbroe_value_per_share?: number | null;
  blended_intrinsic_value_per_share: number | null;
  intrinsic_method?: "dcf" | "nav" | "ddm" | "pbroe";
}

const MODEL_LABEL: Record<string, string> = {
  dcf_value_per_share: "Discounted cash flow",
  graham_value_per_share: "Graham number",
  nav_value_per_share: "Net asset value",
  ddm_value_per_share: "Dividend discount",
  pbroe_value_per_share: "Justified price-to-book",
};

/** Only models relevant to the chosen method are worth showing side by side. */
const RELEVANT: Record<string, string[]> = {
  dcf: ["dcf_value_per_share", "graham_value_per_share"],
  nav: ["nav_value_per_share", "dcf_value_per_share"],
  ddm: ["ddm_value_per_share", "dcf_value_per_share"],
  pbroe: ["pbroe_value_per_share", "graham_value_per_share"],
};

export function buildValuationRange(iv: IntrinsicValueInput): ValuationRange {
  const method = iv.intrinsic_method ?? "dcf";
  const keys = RELEVANT[method] ?? RELEVANT.dcf;

  const models: ModelValue[] = [];
  for (const key of keys) {
    const value = iv[key as keyof IntrinsicValueInput];
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      models.push({ name: MODEL_LABEL[key] ?? key, value });
    }
  }

  const base = iv.blended_intrinsic_value_per_share;

  if (models.length === 0) {
    return {
      low: null, high: null, base, models: [],
      agreement: null, spreadRatio: null, explanation: null,
    };
  }

  // Include the base so the range always brackets the anchor. A range that
  // excludes its own base case is incoherent to a reader.
  const values = models.map((m) => m.value);
  if (base !== null && Number.isFinite(base) && base > 0) values.push(base);
  const low = Math.min(...values);
  const high = Math.max(...values);

  if (models.length === 1) {
    return {
      low, high, base, models, agreement: null, spreadRatio: 0,
      explanation: `Only one model (${models[0].name.toLowerCase()}) could be computed, so there is no second estimate to corroborate it.`,
    };
  }

  // Spread measured against the base so it reads as "how wide is the range".
  const denominator = base && base > 0 ? base : (low + high) / 2;
  const spreadRatio = denominator > 0 ? (high - low) / denominator : null;

  let agreement: ModelAgreement = "High";
  if (spreadRatio !== null) {
    if (spreadRatio > 0.6) agreement = "Low";
    else if (spreadRatio > 0.25) agreement = "Medium";
  }

  const explanation =
    agreement === "High"
      ? "The valuation models broadly agree, so the base case rests on more than one method."
      : agreement === "Medium"
        ? "The models differ moderately. Treat the base case as a midpoint rather than a precise figure."
        : `The models disagree materially (${models.map((m) => m.name.toLowerCase()).join(" vs ")}). Treat the range, not the base case, as the honest answer.`;

  return { low, high, base, models, agreement, spreadRatio, explanation };
}
