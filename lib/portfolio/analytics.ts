/**
 * Diagnostics for a simulated book: where its return came from, how
 * concentrated it is, how its trades worked out, and whether trading helped.
 * Pure — built from the engine result, the market data it ran on, and the
 * screener's own snapshot prices.
 */

import type { MarketData } from "@/lib/portfolio/engine";
import { regionOf } from "@/lib/portfolio/lab";
import type { SimulationResult, Transaction } from "@/lib/portfolio/types";
import { weekOf, weekStart } from "@/lib/scorecard/compute";
import { median } from "@/lib/stats";

export interface SnapshotPrices {
  /** Snapshot price (local currency) for a ticker in a given week. */
  price(ticker: string, week: number): number | null;
  /** The index a ticker is judged against (its most local one). */
  homeIndex(ticker: string): string | null;
  sector(ticker: string): string | null;
}

/** `${index}|${weekStart}` → equal-weighted price return of that index over the following week. */
export type IndexWeekly = Map<string, number>;

export interface AttributionPoint {
  /** End date of the week the parts belong to. */
  date: string;
  total: number;
  currency: number;
  market: number;
  selection: number;
  dividends: number;
  costs: number;
}

export interface AttributionSummary {
  total: number;
  currency: number;
  market: number;
  selection: number;
  dividends: number;
  costs: number;
  /** Whatever the parts do not explain (timing, cash, compounding). */
  other: number;
  weeks: number;
}

export interface Concentration {
  holdings: number;
  /** 1 ÷ Σ weight²: how many equal-sized positions the book behaves like. */
  effectiveNames: number | null;
  topSector: string | null;
  topSectorWeight: number | null;
  regions: Record<string, number>;
  cashWeight: number;
  /** Fewer than 5 effective names, or 40%+ in one sector. */
  warning: boolean;
}

export interface Profile {
  closed: number;
  open: number;
  hitRate: number | null;
  avgWin: number | null;
  avgLoss: number | null;
  /** Median weeks from first purchase to final sale. */
  medianWeeks: number | null;
  /** Share of all gains that came from the three biggest winners. */
  topThreeShare: number | null;
}

export interface SellCheck {
  weeks: number;
  /** One per sale that was replaced by new names: bought names' return minus the sold name's. */
  diffs: number[];
  soldMean: number | null;
  boughtMean: number | null;
}

export interface MonthTrading {
  month: string;
  actual: number;
  /** Return had the book kept its opening holdings all month. */
  frozen: number;
}

export interface BookAnalytics {
  attribution: AttributionPoint[];
  concentration: Concentration;
  profile: Profile;
  selling: SellCheck[];
  trading: MonthTrading[];
}

const DAY_MS = 86_400_000;
const EPS = 1e-9;
const MAX_RATIO = 5;
const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);

/** Shares and currency of every position after all trades up to and including `date`. */
function positionsAt(transactions: Transaction[], date: string): Map<string, { shares: number; currency: string }> {
  const out = new Map<string, { shares: number; currency: string }>();
  for (const t of transactions) {
    if (t.date > date || !t.ticker || (t.type !== "BUY" && t.type !== "SELL")) continue;
    const p = out.get(t.ticker) ?? { shares: 0, currency: t.currency ?? "GBP" };
    p.shares += t.shares ?? 0;
    out.set(t.ticker, p);
  }
  for (const [k, p] of out) if (p.shares <= EPS) out.delete(k);
  return out;
}

function valueOf(market: MarketData, ticker: string, currency: string, shares: number, date: string): number {
  const px = market.priceOn(ticker, date);
  return px === null ? 0 : shares * px * market.fxToGbp(currency, date);
}

export function attribution(
  result: SimulationResult,
  market: MarketData,
  calendar: string[],
  snap: SnapshotPrices,
  indexWeekly: IndexWeekly,
): AttributionPoint[] {
  const values = new Map(result.valuations.map((v) => [v.date, v.totalGbp]));
  const dates = calendar.filter((d) => d >= result.inceptionDate && values.has(d));
  const out: AttributionPoint[] = [];
  for (let k = 0; k + 1 < dates.length; k++) {
    const [d0, d1] = [dates[k], dates[k + 1]];
    const v0 = values.get(d0)!;
    if (!(v0 > 0)) continue;
    const [w0, w1] = [weekOf(`${d0}T12:00:00Z`), weekOf(`${d1}T12:00:00Z`)];
    let currency = 0;
    let marketPart = 0;
    let selection = 0;
    for (const [ticker, p] of positionsAt(result.transactions, d0)) {
      const w = valueOf(market, ticker, p.currency, p.shares, d0) / v0;
      if (!w) continue;
      currency += w * (market.fxToGbp(p.currency, d1) / market.fxToGbp(p.currency, d0) - 1);
      const home = snap.homeIndex(ticker);
      const m = home && w1 === w0 + 1 ? indexWeekly.get(`${home}|${weekStart(w0)}`) : undefined;
      const s0 = snap.price(ticker, w0);
      const s1 = snap.price(ticker, w1);
      if (m !== undefined && s0 && s1 && s1 / s0 < MAX_RATIO && s1 / s0 > 1 / MAX_RATIO) {
        marketPart += w * m;
        selection += w * (s1 / s0 - 1 - m);
      }
    }
    const inWeek = result.transactions.filter((t) => t.date > d0 && t.date <= d1);
    out.push({
      date: d1,
      total: values.get(d1)! / v0 - 1,
      currency,
      market: marketPart,
      selection,
      dividends: inWeek.filter((t) => t.type === "DIVIDEND").reduce((s, t) => s + t.grossGbp, 0) / v0,
      costs: inWeek.reduce((s, t) => s + t.costGbp, 0) / v0,
    });
  }
  return out;
}

/** Parts over (from, to]; the total is compounded and "other" balances it exactly. */
export function summarizeAttribution(points: AttributionPoint[], from: string, to: string): AttributionSummary | null {
  const pts = points.filter((p) => p.date > from && p.date <= to);
  if (!pts.length) return null;
  const sum = (k: keyof Omit<AttributionPoint, "date">) => pts.reduce((s, p) => s + p[k], 0);
  const total = pts.reduce((g, p) => g * (1 + p.total), 1) - 1;
  const parts = { currency: sum("currency"), market: sum("market"), selection: sum("selection"), dividends: sum("dividends"), costs: sum("costs") };
  return {
    total,
    ...parts,
    other: total - (parts.currency + parts.market + parts.selection + parts.dividends - parts.costs),
    weeks: pts.length,
  };
}

export function concentration(result: SimulationResult, market: MarketData, date: string, snap: SnapshotPrices): Concentration {
  const total = result.valuations.at(-1)?.totalGbp ?? 0;
  const held = result.holdings
    .map((h) => ({ ticker: h.ticker, value: valueOf(market, h.ticker, h.currency, h.shares, date) }))
    .filter((h) => h.value > 0);
  const invested = held.reduce((s, h) => s + h.value, 0);
  const sectors = new Map<string, number>();
  const regions: Record<string, number> = {};
  for (const h of held) {
    const w = h.value / invested;
    const sector = snap.sector(h.ticker) ?? "Unknown";
    sectors.set(sector, (sectors.get(sector) ?? 0) + w);
    regions[regionOf(h.ticker)] = (regions[regionOf(h.ticker)] ?? 0) + w;
  }
  const [top] = [...sectors].sort((a, b) => b[1] - a[1]);
  const effectiveNames = invested > 0 ? 1 / held.reduce((s, h) => s + (h.value / invested) ** 2, 0) : null;
  return {
    holdings: held.length,
    effectiveNames,
    topSector: top?.[0] ?? null,
    topSectorWeight: top?.[1] ?? null,
    regions,
    cashWeight: total > 0 ? Math.max(0, 1 - invested / total) : 1,
    warning: held.length > 0 && ((effectiveNames ?? 0) < 5 || (top?.[1] ?? 0) >= 0.4),
  };
}

interface Episode {
  ticker: string;
  opened: string;
  closed: string | null;
  returnPct: number;
  gain: number;
}

/** Each position from first purchase to final sale (or today, if still held). */
function episodes(result: SimulationResult, market: MarketData, today: string): Episode[] {
  const open = new Map<string, { opened: string; shares: number; currency: string; cost: number; back: number }>();
  const out: Episode[] = [];
  for (const t of result.transactions) {
    if (!t.ticker) continue;
    let e = open.get(t.ticker);
    if (t.type === "BUY") {
      if (!e) {
        e = { opened: t.date, shares: 0, currency: t.currency ?? "GBP", cost: 0, back: 0 };
        open.set(t.ticker, e);
      }
      e.shares += t.shares ?? 0;
      e.cost += -t.cashDeltaGbp;
    } else if (e && (t.type === "SELL" || t.type === "DIVIDEND")) {
      e.back += t.cashDeltaGbp;
      if (t.type === "SELL") {
        e.shares += t.shares ?? 0;
        if (e.shares <= EPS) {
          out.push({ ticker: t.ticker, opened: e.opened, closed: t.date, returnPct: e.back / e.cost - 1, gain: e.back - e.cost });
          open.delete(t.ticker);
        }
      }
    }
  }
  for (const [ticker, e] of open) {
    const back = e.back + valueOf(market, ticker, e.currency, e.shares, today);
    out.push({ ticker, opened: e.opened, closed: null, returnPct: back / e.cost - 1, gain: back - e.cost });
  }
  return out;
}

function profileOf(eps: Episode[]): Profile {
  const closed = eps.filter((e) => e.closed);
  const wins = closed.filter((e) => e.returnPct > 0).map((e) => e.returnPct);
  const losses = closed.filter((e) => e.returnPct <= 0).map((e) => e.returnPct);
  const gains = eps.filter((e) => e.gain > 0).map((e) => e.gain).sort((a, b) => b - a);
  const totalGain = gains.reduce((s, g) => s + g, 0);
  return {
    closed: closed.length,
    open: eps.length - closed.length,
    hitRate: closed.length ? wins.length / closed.length : null,
    avgWin: mean(wins),
    avgLoss: mean(losses),
    medianWeeks: median(closed.map((e) => (Date.parse(e.closed!) - Date.parse(e.opened)) / (7 * DAY_MS))),
    topThreeShare: totalGain > 0 ? gains.slice(0, 3).reduce((s, g) => s + g, 0) / totalGain : null,
  };
}

/** After each sale that brought in new names: did the new names beat the one sold? */
function sellCheck(eps: Episode[], snap: SnapshotPrices, weeks: number, lastWeek: number): SellCheck {
  const near = (ticker: string, w: number) => snap.price(ticker, w) ?? snap.price(ticker, w + 1) ?? snap.price(ticker, w - 1);
  const ret = (ticker: string, from: number) => {
    const [a, b] = [near(ticker, from), near(ticker, from + weeks)];
    return a && b && b / a < MAX_RATIO && b / a > 1 / MAX_RATIO ? b / a - 1 : null;
  };
  const diffs: number[] = [];
  const sold: number[] = [];
  const bought: number[] = [];
  for (const e of eps.filter((x) => x.closed)) {
    const w = weekOf(`${e.closed}T12:00:00Z`);
    if (w + weeks > lastWeek) continue;
    const replacements = eps.filter((x) => x.opened === e.closed).map((x) => ret(x.ticker, w)).filter((r): r is number => r !== null);
    const s = ret(e.ticker, w);
    if (s === null || !replacements.length) continue;
    const b = mean(replacements)!;
    sold.push(s);
    bought.push(b);
    diffs.push(b - s);
  }
  return { weeks, diffs, soldMean: mean(sold), boughtMean: mean(bought) };
}

function tradingByMonth(result: SimulationResult, market: MarketData, today: string): MonthTrading[] {
  const vals = result.valuations;
  const out: MonthTrading[] = [];
  const firstMonth = result.inceptionDate.slice(0, 7);
  for (let m = firstMonth; m <= today.slice(0, 7); ) {
    const [y, mo] = m.split("-").map(Number);
    const next = new Date(Date.UTC(y, mo, 1)).toISOString().slice(0, 7);
    const start = vals.filter((v) => v.date < `${m}-01`).at(-1);
    const end = vals.filter((v) => v.date < `${next}-01`).at(-1);
    if (start && end && end.date > start.date && start.totalGbp > 0) {
      let frozen = start.cashGbp;
      for (const [ticker, p] of positionsAt(result.transactions, start.date)) {
        frozen += valueOf(market, ticker, p.currency, p.shares, end.date);
        for (const d of market.dividendsBetween(ticker, start.date, end.date)) {
          frozen += p.shares * d.amountLocal * market.fxToGbp(p.currency, d.date);
        }
      }
      out.push({ month: m, actual: end.totalGbp / start.totalGbp - 1, frozen: frozen / start.totalGbp - 1 });
    }
    m = next;
  }
  return out;
}

export function bookAnalytics(
  result: SimulationResult,
  market: MarketData,
  calendar: string[],
  snap: SnapshotPrices,
  indexWeekly: IndexWeekly,
  today: string,
  lastWeek: number,
): BookAnalytics {
  const eps = episodes(result, market, today);
  return {
    attribution: attribution(result, market, calendar, snap, indexWeekly),
    concentration: concentration(result, market, today, snap),
    profile: profileOf(eps),
    selling: [4, 13].map((w) => sellCheck(eps, snap, w, lastWeek)),
    trading: tradingByMonth(result, market, today),
  };
}
