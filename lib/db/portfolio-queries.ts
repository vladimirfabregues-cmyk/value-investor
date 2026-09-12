import { prisma } from "@/lib/db/client";
import type { PortfolioMetrics } from "@/lib/portfolio/metrics";
import type { Holding, Transaction, ValuationPoint } from "@/lib/portfolio/types";

export interface StoredPortfolio {
  strategy: string;
  inceptionDate: string;
  capitalGbp: number;
  valuations: ValuationPoint[];
  holdings: Holding[];
  transactions: Transaction[];
  metrics: PortfolioMetrics;
  builtAt: string;
}

/** The three stored books (BUY_HOLD, REBALANCED, BENCHMARK); empty until the
 *  first background build has run. */
export async function getPortfolioResults(): Promise<StoredPortfolio[]> {
  const rows = await prisma.simPortfolio.findMany();
  return rows.map((r) => ({
    strategy: r.strategy,
    inceptionDate: r.inceptionDate,
    capitalGbp: r.capitalGbp,
    valuations: r.valuations as unknown as ValuationPoint[],
    holdings: r.holdings as unknown as Holding[],
    transactions: r.transactions as unknown as Transaction[],
    metrics: r.metrics as unknown as PortfolioMetrics,
    builtAt: r.builtAt.toISOString(),
  }));
}
