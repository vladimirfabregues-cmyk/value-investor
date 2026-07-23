/**
 * Builds the auditable data-status record for an analysis.
 *
 * Pure and I/O-free so the provenance rules can be unit-tested directly: given
 * a dataset and the computed metrics, what do we honestly know about where the
 * numbers came from, when, and what was missing?
 *
 * The guiding principle is honesty over completeness. Where the provider did
 * not supply a field (the mock provider, older fixtures), the corresponding
 * output is simply absent and the UI shows "not recorded" — it never
 * fabricates a timestamp or claims data is live when it cannot know that.
 */

import { VALUATION_MODEL_VERSION } from "@/lib/finance/model-version";
import type { NormalizedFinancialDataset, ValueMetricsResult } from "@/types/finance";
import type { DataStatus } from "@/types/analysis";

/** Yahoo market states → how the price should be read. */
function priceStateFrom(marketState: string | undefined): DataStatus["price_state"] {
  switch (marketState) {
    case "REGULAR":
      // The free Yahoo feed is delayed intraday; claiming "live" would be false.
      return "delayed";
    case "CLOSED":
    case "POST":
    case "POSTPOST":
    case "PRE":
    case "PREPRE":
      return marketState === "CLOSED" ? "closed" : "prepost";
    default:
      return "asof";
  }
}

/**
 * Core snapshot inputs and their human labels. Free cash flow is handled
 * separately because it is structurally absent for banks/insurers/utilities and
 * listing it as "missing" there would be misleading rather than informative.
 */
const CORE_FIELDS: { key: keyof NormalizedFinancialDataset["latest"]; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "net_income", label: "Net income" },
  { key: "diluted_eps", label: "Diluted EPS" },
  { key: "bvps", label: "Book value per share" },
  { key: "total_equity", label: "Shareholders' equity" },
];

function missingFields(
  dataset: NormalizedFinancialDataset,
  metrics: ValueMetricsResult,
): string[] {
  const latest = dataset.latest;
  const missing = CORE_FIELDS.filter(({ key }) => latest[key] === null).map(({ label }) => label);

  // FCF is only a genuine input when the intrinsic value is DCF-based.
  if (metrics.intrinsic_value.intrinsic_method === "dcf" && latest.free_cash_flow === null) {
    missing.push("Free cash flow");
  }

  return missing;
}

export function buildDataStatus(
  dataset: NormalizedFinancialDataset,
  metrics: ValueMetricsResult,
  exchange: string,
): DataStatus {
  const provenance = dataset.provenance ?? {};

  const sources = [dataset.source_name];
  if (provenance.edgar_supplemented) sources.push("SEC EDGAR (XBRL company facts)");

  return {
    // A quote timestamp is preferred; fetch time is the honest fallback.
    price_as_of: provenance.price_as_of ?? dataset.as_of_date,
    price_timezone: provenance.price_timezone,
    price_state: priceStateFrom(provenance.market_state),
    income_statement_period: provenance.income_statement_period,
    balance_sheet_period: provenance.balance_sheet_period,
    currency: dataset.currency,
    exchange,
    model_version: VALUATION_MODEL_VERSION,
    assumptions: {
      discount_rate_pct: metrics.diagnostics.assumptions.discount_rate_pct,
      terminal_growth_pct: metrics.diagnostics.assumptions.terminal_growth_pct,
      max_growth_cap_pct: metrics.diagnostics.assumptions.max_growth_cap_pct,
      use_conservative_fcf_basis: metrics.diagnostics.assumptions.use_conservative_fcf_basis,
    },
    sources,
    edgar_supplemented: provenance.edgar_supplemented ?? false,
    missing_fields: missingFields(dataset, metrics),
    data_quality_notes: metrics.diagnostics.data_quality_notes,
  };
}
