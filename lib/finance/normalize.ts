import {
  normalizedFinancialDatasetSchema,
  type NormalizedFinancialDatasetInput,
} from "@/lib/validation/tools";
import type { NormalizedFinancialDataset } from "@/types/finance";

const TICKER_ALIASES: Record<string, string> = {
  "BRK-B": "BRK.B",
  "BRK/B": "BRK.B",
  "BRKB": "BRK.B",
};

export function normalizeTickerInput(input: string): string {
  const raw = input.trim().toUpperCase();
  return TICKER_ALIASES[raw] ?? raw;
}

export function normalizeFinancialDataset(
  dataset: NormalizedFinancialDatasetInput,
): NormalizedFinancialDataset {
  const parsed = normalizedFinancialDatasetSchema.parse({
    ...dataset,
    ticker: normalizeTickerInput(dataset.ticker),
  });

  return parsed;
}
