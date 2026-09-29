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

const CORE_STRATEGIES = ["BUY_HOLD", "REBALANCED", "BENCHMARK"];

/** The three original books in full; empty until the first background build has run. */
export async function getPortfolioResults(): Promise<StoredPortfolio[]> {
  const rows = await prisma.simPortfolio.findMany({ where: { strategy: { in: CORE_STRATEGIES } } });
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

export interface LabRow {
  strategy: string;
  metrics: PortfolioMetrics;
  holdings: number;
}

/** One summary row per book (lab and original) for the comparison table — no ledgers. */
export async function getLabRows(): Promise<LabRow[]> {
  const rows = await prisma.simPortfolio.findMany({ select: { strategy: true, metrics: true, holdings: true } });
  return rows.map((r) => ({
    strategy: r.strategy,
    metrics: r.metrics as unknown as PortfolioMetrics,
    holdings: (r.holdings as unknown as Holding[]).length,
  }));
}
