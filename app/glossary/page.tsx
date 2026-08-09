import type { Metadata } from "next";

import { GlossaryPage } from "@/components/glossary/glossary-page";
import { BRAND } from "@/lib/brand";

/**
 * Glossary of the platform's terms of art. Neutral shared page; content lives
 * in the client <GlossaryPage /> so it can read the locale context.
 */
export const metadata: Metadata = {
  title: "Glossary — The Investment Casebook",
  description:
    "Plain-English definitions of the research terms used across The Investment Casebook: conclusion cap, margin of safety, base value, value range, data confidence, peer group and more.",
  alternates: { canonical: `${BRAND.origin}/glossary` },
};

export default function GlossaryRoute() {
  return <GlossaryPage />;
}
