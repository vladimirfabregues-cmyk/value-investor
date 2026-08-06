import type { Metadata } from "next";

import { MethodologyHub } from "@/components/methodology/methodology-hub";
import { BRAND } from "@/lib/brand";

/**
 * Unified methodology hub. Neutral, shared page (no app-specific chrome) reached
 * from the homepage principles section and the front door. The interactive
 * content — including the dynamically-rendered company methodology version —
 * lives in the client <MethodologyHub /> so it can use the locale context.
 */
export const metadata: Metadata = {
  title: "Methodology — The Investment Casebook",
  description:
    "One research standard, applied through two specialised methods: sector-aware company analysis and peer-group-relative ETF research. See how sources, missing data, gates and methodology versions are handled.",
  alternates: { canonical: `${BRAND.origin}/methodology` },
};

export default function MethodologyPage() {
  return <MethodologyHub />;
}
