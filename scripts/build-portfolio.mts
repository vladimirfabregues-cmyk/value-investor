/**
 * Build and persist the simulated Strong-Buy portfolios.
 *
 * Reads the screener snapshot history, fetches market history from Yahoo, runs
 * both books (buy-and-hold + weekly-rebalanced) plus the benchmark, and upserts
 * the results. Run by GitHub Actions weekly (see the portfolio-build workflow),
 * after the screener refresh. Needs DATABASE_URL in the environment.
 *
 *   DATABASE_URL=... npx tsx scripts/build-portfolio.mts
 */

import { buildPortfolios } from "@/lib/portfolio/build";

const started = Date.now();
try {
  const { inception, today, tickers } = await buildPortfolios();
  const secs = ((Date.now() - started) / 1000).toFixed(0);
  console.log(`Built portfolios: ${inception} → ${today}, ${tickers} securities, in ${secs}s`);
  process.exit(0);
} catch (err) {
  console.error("Portfolio build failed:", err instanceof Error ? err.message : err);
  process.exit(1);
}
