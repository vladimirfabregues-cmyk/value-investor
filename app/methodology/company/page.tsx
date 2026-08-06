import type { Metadata } from "next";

import { CompanyMethodology } from "@/components/methodology/company-methodology";
import { BRAND } from "@/lib/brand";

/**
 * Standalone company-methodology page — the parallel of /etf/methodology.
 * Neutral shared page (no app-specific chrome); the interactive content,
 * including the dynamically-rendered model version, lives in the client
 * <CompanyMethodology /> so it can read the locale context.
 */
export const metadata: Metadata = {
  title: "How company analysis works — The Investment Casebook",
  description:
    "The company scoring process: a valuation model chosen for the economics, checks on financial resilience, earnings quality and cyclicality, material-weakness caps, and how scores become a conclusion.",
  alternates: { canonical: `${BRAND.origin}/methodology/company` },
};

export default function CompanyMethodologyPage() {
  return <CompanyMethodology />;
}
