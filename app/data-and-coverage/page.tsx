import type { Metadata } from "next";

import { CoveragePage } from "@/components/coverage/coverage-page";
import { BRAND } from "@/lib/brand";

/**
 * Public data-and-coverage page. Neutral shared page (no app chrome); all
 * figures/versions/dates are read from the coverage adapter inside the client
 * <CoveragePage /> so it can use the locale context.
 */
export const metadata: Metadata = {
  title: "Data and coverage — The Investment Casebook",
  description:
    "What the research tools cover and what they do not: supported markets, data sources, update cadence, curated-versus-live fields, missing-data handling, methodology versions and primary-source verification guidance.",
  alternates: { canonical: `${BRAND.origin}/data-and-coverage` },
};

export default function DataAndCoveragePage() {
  return <CoveragePage />;
}
