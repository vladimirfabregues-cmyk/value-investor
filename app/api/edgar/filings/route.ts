import { NextResponse, type NextRequest } from "next/server";

const EDGAR_USER_AGENT = "ValueDesk research@valuedeskapp.com";

interface EftsHit {
  _id: string;
  _source: {
    entity_id?: string;
    entity_name?: string;
    file_date?: string;
    period_of_report?: string;
    form_type?: string;
    accession_no?: string;
  };
}

interface EftsResponse {
  hits?: {
    total?: { value: number };
    hits?: EftsHit[];
  };
}

export interface FilingRecord {
  formType: string;
  companyName: string;
  filedAt: string;
  periodOfReport: string | null;
  url: string;
}

function buildFilingUrl(hit: EftsHit): string {
  const { entity_id, accession_no } = hit._source;
  if (entity_id && accession_no) {
    const clean = accession_no.replace(/-/g, "");
    return `https://www.sec.gov/Archives/edgar/data/${entity_id}/${clean}/${accession_no}-index.htm`;
  }
  const [accId] = hit._id.split(":");
  if (accId && entity_id) {
    const clean = accId.replace(/-/g, "");
    return `https://www.sec.gov/Archives/edgar/data/${entity_id}/${clean}/${accId}-index.htm`;
  }
  return `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${entity_id ?? ""}&type=${hit._source.form_type ?? ""}&dateb=&owner=include&count=10`;
}

function formatPeriod(raw: string): string {
  if (raw.length === 8) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return raw;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ticker = req.nextUrl.searchParams.get("ticker")?.toUpperCase();
  if (!ticker) {
    return NextResponse.json({ error: "ticker is required" }, { status: 400 });
  }

  try {
    const startdt = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const url =
      `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(`"${ticker}"`)}&forms=10-K,10-Q,8-K&dateRange=custom&startdt=${startdt}`;

    const res = await fetch(url, {
      headers: { "User-Agent": EDGAR_USER_AGENT },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ filings: [], error: `EDGAR returned HTTP ${res.status}` });
    }

    const data = (await res.json()) as EftsResponse;
    const hits = data.hits?.hits ?? [];

    const ALLOWED = new Set(["10-K", "10-Q", "8-K"]);
    const filings: FilingRecord[] = hits
      .filter((h) => h._source.form_type && ALLOWED.has(h._source.form_type))
      .slice(0, 20)
      .map((h) => ({
        formType: h._source.form_type!,
        companyName: h._source.entity_name ?? ticker,
        filedAt: h._source.file_date ?? "",
        periodOfReport: h._source.period_of_report
          ? formatPeriod(h._source.period_of_report)
          : null,
        url: buildFilingUrl(h),
      }));

    return NextResponse.json({ filings, ticker });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ filings: [], error: message });
  }
}
