import aaplFixture from "@/lib/finance/fixtures/aapl.json";
import brkBFixture from "@/lib/finance/fixtures/brk-b.json";
import intcFixture from "@/lib/finance/fixtures/intc.json";
import msftFixture from "@/lib/finance/fixtures/msft.json";
import { normalizeFinancialDataset, normalizeTickerInput } from "@/lib/finance/normalize";
import { FinanceProviderError, type FinanceProvider } from "@/lib/finance/provider";
import { YahooFinanceProvider } from "@/lib/finance/yahoo-provider";
import type { NormalizedFinancialDataset } from "@/types/finance";

const FIXTURES: Record<string, NormalizedFinancialDataset> = {
  AAPL: normalizeFinancialDataset(aaplFixture),
  MSFT: normalizeFinancialDataset(msftFixture),
  "BRK.B": normalizeFinancialDataset(brkBFixture),
  INTC: normalizeFinancialDataset(intcFixture),
};

export class MockFinanceProvider implements FinanceProvider {
  async getCompanySnapshot(ticker: string): Promise<NormalizedFinancialDataset> {
    const normalizedTicker = normalizeTickerInput(ticker);
    const fixture = FIXTURES[normalizedTicker];

    if (!fixture) {
      throw new FinanceProviderError(
        "UNSUPPORTED_TICKER",
        `Mock market data is currently available for AAPL, MSFT, BRK.B, and INTC. "${normalizedTicker}" is not bundled yet.`,
        404,
      );
    }

    return fixture;
  }
}

export function getFinanceProvider(): FinanceProvider {
  const provider = process.env.FINANCE_PROVIDER ?? "mock";

  if (provider === "mock") {
    return new MockFinanceProvider();
  }

  if (provider === "yahoo") {
    return new YahooFinanceProvider();
  }

  throw new FinanceProviderError(
    "PROVIDER_CONFIGURATION_ERROR",
    `Unsupported FINANCE_PROVIDER "${provider}". Valid options: "mock", "yahoo".`,
    500,
  );
}
