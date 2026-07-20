#!/usr/bin/env node
/**
 * Backtest harness: evaluates past screening verdicts against subsequent
 * price performance using the append-only ScreenSnapshot table.
 *
 * Usage:
 *   node scripts/backtest.cjs [--days 30] [--index SP500]
 *
 * For each ticker, takes its latest snapshot at least `--days` old, fetches
 * the current price, and reports return statistics per verdict bucket.
 * A sound value framework should show STRONG_BUY ≥ BUY ≥ WATCH ≥ AVOID over
 * meaningful horizons (months — not days; be patient before judging).
 */

if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "file:./dev.db";

const { PrismaClient } = require("@prisma/client");
const YahooFinance = require("yahoo-finance2").default;

const prisma = new PrismaClient();
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const MIN_AGE_DAYS = Number(arg("days", "30"));
const INDEX_FILTER = arg("index", null);

function median(xs) {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

async function currentPrices(tickers) {
  const out = new Map();
  const CHUNK = 40;
  for (let i = 0; i < tickers.length; i += CHUNK) {
    const chunk = tickers.slice(i, i + CHUNK);
    try {
      const quotes = await yf.quote(chunk, {}, { validateResult: false });
      for (const q of Array.isArray(quotes) ? quotes : [quotes]) {
        if (!q?.symbol || !q?.regularMarketPrice) continue;
        const px = q.currency === "GBp" ? q.regularMarketPrice / 100 : q.regularMarketPrice;
        out.set(q.symbol, px);
      }
    } catch (e) {
      console.error(`quote chunk failed (${chunk[0]}…): ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return out;
}

(async () => {
  const cutoff = new Date(Date.now() - MIN_AGE_DAYS * 86_400_000);
  const snapshots = await prisma.screenSnapshot.findMany({
    where: {
      screenerAt: { lte: cutoff },
      ...(INDEX_FILTER ? { screenerIndex: INDEX_FILTER } : {}),
    },
    orderBy: { screenerAt: "desc" },
  });

  if (snapshots.length === 0) {
    console.log(
      `No snapshots older than ${MIN_AGE_DAYS} days${INDEX_FILTER ? ` for ${INDEX_FILTER}` : ""}.\n` +
      "Snapshots accumulate from every screening run — run screens now, evaluate in a month.",
    );
    await prisma.$disconnect();
    return;
  }

  // Latest qualifying snapshot per ticker = the entry point being tested
  const byTicker = new Map();
  for (const s of snapshots) if (!byTicker.has(s.ticker)) byTicker.set(s.ticker, s);
  const entries = [...byTicker.values()];

  console.log(`Backtesting ${entries.length} positions (snapshots ≥${MIN_AGE_DAYS}d old${INDEX_FILTER ? `, ${INDEX_FILTER}` : ""})…\n`);
  const prices = await currentPrices(entries.map((e) => e.ticker));

  const buckets = new Map();
  for (const s of entries) {
    const now = prices.get(s.ticker);
    if (!now || s.price <= 0) continue;
    const ret = ((now - s.price) / s.price) * 100;
    if (!buckets.has(s.verdictLabel)) buckets.set(s.verdictLabel, []);
    buckets.get(s.verdictLabel).push(ret);
  }

  const order = ["STRONG_BUY", "BUY", "WATCH", "HOLD", "AVOID"];
  console.log("verdict      n     median%    mean%    win%");
  console.log("─".repeat(48));
  for (const v of order) {
    const rets = buckets.get(v);
    if (!rets || rets.length === 0) continue;
    const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
    const win = (rets.filter((r) => r > 0).length / rets.length) * 100;
    console.log(
      v.padEnd(11),
      String(rets.length).padStart(4),
      String(median(rets).toFixed(1)).padStart(9),
      String(mean.toFixed(1)).padStart(8),
      String(win.toFixed(0)).padStart(7),
    );
  }
  const all = [...buckets.values()].flat();
  if (all.length > 0) {
    const mean = all.reduce((a, b) => a + b, 0) / all.length;
    console.log("─".repeat(48));
    console.log("ALL".padEnd(11), String(all.length).padStart(4), String(median(all).toFixed(1)).padStart(9), String(mean.toFixed(1)).padStart(8));
  }
  await prisma.$disconnect();
})();
