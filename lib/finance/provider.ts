import type { NormalizedFinancialDataset } from "@/types/finance";

export interface FinanceProvider {
  getCompanySnapshot(ticker: string): Promise<NormalizedFinancialDataset>;
}

export class FinanceProviderError extends Error {
  public readonly code: "UNSUPPORTED_TICKER" | "PROVIDER_CONFIGURATION_ERROR";
  public readonly statusCode: number;

  constructor(
    code: FinanceProviderError["code"],
    message: string,
    statusCode = 400,
  ) {
    super(message);
    this.name = "FinanceProviderError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
