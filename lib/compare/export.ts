/**
 * CSV export of a built comparison.
 *
 * Pure string production — the caller owns the download — so the escaping
 * rules can be tested directly. The comparability warnings are exported
 * alongside the rows on purpose: a spreadsheet that shows two currencies
 * subtracted, with no note saying why that is meaningless, is worse than no
 * export at all.
 */

import type { Comparison } from "@/lib/compare/comparison";
import type { SavedAnalysisRecord } from "@/types/analysis";

/**
 * Quote a CSV field. Also neutralises the leading characters spreadsheet
 * software treats as the start of a formula, so an exported company name can
 * never execute on open.
 */
export function csvField(value: string): string {
  const neutralised = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${neutralised.replace(/"/g, '""')}"`;
}

function csvRow(cells: string[]): string {
  return cells.map(csvField).join(",");
}

export function comparisonToCsv(
  comparison: Comparison,
  left: SavedAnalysisRecord,
  right: SavedAnalysisRecord,
): string {
  const leftHeading = `${left.ticker} (${left.companyName})`;
  const rightHeading = `${right.ticker} (${right.companyName})`;

  const lines: string[] = [
    csvRow(["Section", "Metric", leftHeading, rightHeading, "Difference", "Relative difference"]),
  ];

  for (const section of comparison.sections) {
    for (const row of section.rows) {
      lines.push(
        csvRow([
          section.title,
          row.label,
          row.left,
          row.right,
          row.absoluteDelta ?? "",
          row.relativeDelta ?? "",
        ]),
      );
    }
  }

  if (comparison.warnings.length > 0) {
    lines.push("");
    lines.push(csvRow(["Comparability notes", "", "", "", "", ""]));
    for (const warning of comparison.warnings) {
      lines.push(csvRow([warning.title, warning.detail, "", "", "", ""]));
    }
  }

  return lines.join("\r\n");
}

/** e.g. "compare-AIR.PA-BRK-B-2026-07-22.csv" */
export function comparisonFilename(
  left: SavedAnalysisRecord,
  right: SavedAnalysisRecord,
  now: Date = new Date(),
): string {
  const safe = (value: string) => value.replace(/[^A-Za-z0-9.-]/g, "");
  return `compare-${safe(left.ticker)}-${safe(right.ticker)}-${now.toISOString().slice(0, 10)}.csv`;
}
