import { describe, it, expect } from "vitest";

import { comparisonFilename, comparisonToCsv, csvField } from "@/lib/compare/export";
import type { Comparison } from "@/lib/compare/comparison";
import type { SavedAnalysisRecord } from "@/types/analysis";

const comparison: Comparison = {
  sections: [
    {
      id: "verdict",
      title: "Verdict and valuation",
      description: "…",
      rows: [
        {
          id: "pe", label: "Price / earnings", unit: "ratio",
          left: "20", right: "30", leftValue: 20, rightValue: 30,
          absoluteDelta: "+10", relativeDelta: "+50%", favours: "left", empty: false,
        },
      ],
    },
  ],
  warnings: [
    {
      id: "currency", level: "blocking",
      title: "Different reporting currencies",
      detail: "USD and EUR are not directly comparable.",
    },
  ],
};

const record = (ticker: string, companyName: string) =>
  ({ ticker, companyName }) as SavedAnalysisRecord;

describe("csvField", () => {
  it("quotes every field", () => {
    expect(csvField("plain")).toBe('"plain"');
  });

  it("escapes embedded quotes by doubling them", () => {
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
  });

  it("keeps commas and newlines inside the quoted field", () => {
    expect(csvField("a,b")).toBe('"a,b"');
    expect(csvField("a\nb")).toBe('"a\nb"');
  });

  // A company name or note beginning with =, +, - or @ is executed as a
  // formula by Excel and Sheets unless it is neutralised first.
  it("neutralises spreadsheet formula injection", () => {
    expect(csvField("=1+1")).toBe(`"'=1+1"`);
    expect(csvField("+SUM(A1)")).toBe(`"'+SUM(A1)"`);
    expect(csvField("-2")).toBe(`"'-2"`);
    expect(csvField("@cmd")).toBe(`"'@cmd"`);
  });

  it("leaves an ordinary leading character alone", () => {
    expect(csvField("20")).toBe('"20"');
  });
});

describe("comparisonToCsv", () => {
  const csv = comparisonToCsv(comparison, record("AAPL", "Apple Inc."), record("AIR.PA", "Airbus SE"));

  it("heads the columns with both companies", () => {
    expect(csv.split("\r\n")[0]).toBe(
      '"Section","Metric","AAPL (Apple Inc.)","AIR.PA (Airbus SE)","Difference","Relative difference"',
    );
  });

  // The leading apostrophe is deliberate. Excel reads a bare "+10" as the
  // formula =+10 and displays "10", silently dropping the sign from a
  // difference column; as text it survives, and the apostrophe is not shown.
  it("writes one row per metric, with both differences preserved as text", () => {
    expect(csv.split("\r\n")[1]).toBe(
      `"Verdict and valuation","Price / earnings","20","30","'+10","'+50%"`,
    );
  });

  it("carries the comparability warnings into the export", () => {
    expect(csv).toContain('"Comparability notes"');
    expect(csv).toContain('"Different reporting currencies","USD and EUR are not directly comparable."');
  });

  it("omits the warnings block when there is nothing to caveat", () => {
    const clean = comparisonToCsv(
      { ...comparison, warnings: [] },
      record("AAPL", "Apple Inc."),
      record("MSFT", "Microsoft Corp."),
    );
    expect(clean).not.toContain("Comparability notes");
  });
});

describe("comparisonFilename", () => {
  it("names the file after both tickers and the date", () => {
    expect(
      comparisonFilename(record("AIR.PA", "Airbus SE"), record("BRK-B", "Berkshire"), new Date("2026-07-22T10:00:00Z")),
    ).toBe("compare-AIR.PA-BRK-B-2026-07-22.csv");
  });

  it("strips characters that are not safe in a filename", () => {
    expect(
      comparisonFilename(record("A/B", "x"), record("C:D", "y"), new Date("2026-07-22T10:00:00Z")),
    ).toBe("compare-AB-CD-2026-07-22.csv");
  });
});
