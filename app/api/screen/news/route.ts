import { NextResponse, type NextRequest } from "next/server";
import YahooFinance from "yahoo-finance2";

export interface NewsArticle {
  title: string;
  publisher: string;
  link: string;
  publishedAt: string;
}

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

/** Strip legal-form suffixes so "Swissquote Group Holding SA" → "Swissquote" */
function companyStem(name: string): string {
  let stem = name.replace(/\(publ\)/gi, "").trim();
  const suffix = /\s+(plc|sa|ag|nv|se|spa|ab|asa|oyj|sae|kgaa|group|holdings?|holding|incorporated|inc|corporation|corp|limited|ltd|co|company|kk|publ)\.?$/i;
  for (let i = 0; i < 4; i++) {
    const next = stem.replace(suffix, "").trim();
    if (next === stem || next.length < 3) break;
    stem = next;
  }
  return stem;
}

/** Words meaningful enough to test relevance against a headline */
function significantWords(stem: string): string[] {
  const stop = new Set(["the", "and", "des", "les", "der", "die", "das", "van", "von", "new"]);
  return stem
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !stop.has(w));
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ticker = req.nextUrl.searchParams.get("ticker");
  const name = req.nextUrl.searchParams.get("name");
  if (!ticker) return NextResponse.json({ error: "ticker is required" }, { status: 400 });

  // Yahoo's news search works well for US tickers but returns generic market
  // noise for exchange-suffixed ones (SQN.SW, 7203.T …) — query those by
  // company name instead, then keep only headlines that actually mention it.
  const isSuffixed = ticker.includes(".");
  const stem = name ? companyStem(name) : null;
  const query = isSuffixed && stem ? stem : ticker;

  try {
    const result = await yf.search(
      query,
      { newsCount: 10, enableFuzzyQuery: false },
      { validateResult: false },
    ) as { news?: Array<{ title?: string; publisher?: string; link?: string; providerPublishTime?: string | Date }> };

    let items = (result.news ?? []).filter((n) => n.title && n.link);

    // Relevance gate: a headline must mention the company (or ticker root).
    // Showing nothing is better than showing unrelated market chatter.
    const words = stem ? significantWords(stem) : [];
    const tickerRoot = ticker.split(".")[0].split("-")[0].toLowerCase();
    if (words.length > 0 || tickerRoot.length >= 3) {
      items = items.filter((n) => {
        const t = n.title!.toLowerCase();
        return words.some((w) => t.includes(w)) || (tickerRoot.length >= 3 && t.includes(tickerRoot));
      });
    }

    const articles: NewsArticle[] = items.slice(0, 8).map((n) => ({
      title: n.title!,
      publisher: n.publisher ?? "Unknown",
      link: n.link!,
      publishedAt: n.providerPublishTime
        ? new Date(n.providerPublishTime).toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
