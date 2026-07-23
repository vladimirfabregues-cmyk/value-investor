"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FilingRecord } from "@/app/api/edgar/filings/route";

interface EdgarFilingsCardProps {
  ticker: string;
}

// Form type is a category, not a status, so it carries no semantic colour —
// the label itself distinguishes the forms (§12 palette discipline).
const FORM_BADGE_CLASS =
  "border-white/12 bg-white/[0.04] text-muted-foreground";

const DIRECT_LINKS = [
  { label: "All 10-K", form: "10-K" },
  { label: "All 10-Q", form: "10-Q" },
  { label: "All 8-K", form: "8-K" },
  { label: "Proxy (DEF 14A)", form: "DEF+14A" },
];

function edgarCompanyUrl(ticker: string, form: string): string {
  return `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${encodeURIComponent(ticker)}&type=${form}&dateb=&owner=include&count=10`;
}

export function EdgarFilingsCard({ ticker }: EdgarFilingsCardProps) {
  const [filings, setFilings] = useState<FilingRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFilings(null);
    setError(null);
    fetch(`/api/edgar/filings?ticker=${encodeURIComponent(ticker)}`)
      .then((r) => r.json())
      .then((data: { filings: FilingRecord[]; error?: string }) => {
        if (data.error && data.filings.length === 0) {
          setError(data.error);
        } else {
          setFilings(data.filings);
        }
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load filings"),
      );
  }, [ticker]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-2 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <CardTitle level={2}>SEC EDGAR filings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/8 p-4 text-sm text-amber-300">
            Could not reach SEC EDGAR: {error}
          </div>
        ) : filings === null ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-xl bg-white/4" />
            ))}
          </div>
        ) : filings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-muted-foreground">
            No recent filings found for <span className="font-mono text-foreground">{ticker}</span> on SEC EDGAR.
            Non-US companies (e.g. CAC 40, FTSE 100) are not required to file with the SEC.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6 bg-white/3 text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-3">Form</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Filed</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3 text-right">Filing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {filings.map((f, i) => (
                  <tr key={i} className="transition-colors hover:bg-white/3">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${FORM_BADGE_CLASS}`}
                      >
                        {f.formType}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-foreground/80">
                      {f.companyName}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{f.filedAt}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {f.periodOfReport ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-white/6 pt-4">
          {DIRECT_LINKS.map(({ label, form }) => (
            <a
              key={form}
              href={edgarCompanyUrl(ticker, form)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/3 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/25 hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
              {label}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
