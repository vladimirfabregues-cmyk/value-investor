import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { BRAND } from "@/lib/brand";

/**
 * Consolidated legal / important-information page. Neutral shared page (no
 * app-specific chrome); content lives in the client <LegalPage /> so it can
 * read the locale context.
 */
export const metadata: Metadata = {
  title: "Important information — The Investment Casebook",
  description:
    "Risk and status information for The Investment Casebook: informational purpose, no personal recommendation, capital at risk, data and model limitations, curated ETF coverage, and independent-verification guidance.",
  alternates: { canonical: `${BRAND.origin}/legal` },
};

export default function LegalRoute() {
  return <LegalPage />;
}
