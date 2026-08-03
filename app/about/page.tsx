import type { Metadata } from "next";
import Image from "next/image";

import { AboutEyebrow } from "@/components/about/about-eyebrow";
import { AboutBio } from "@/components/about/about-bio";
import { AboutConnect } from "@/components/about/about-connect";
import { WorkspacesLink } from "@/components/about/workspaces-link";

export const metadata: Metadata = { title: "About — Vladimir Fabregues" };

/**
 * Neutral, terminal-level About page. Deliberately carries no app-specific
 * chrome (no Value Investor topbar/history sidebar) — just a "Workspaces"
 * back-link and the global language toggle from the root layout — so it reads
 * as a shared page reached from the welcome screen rather than a VI workspace.
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
      <WorkspacesLink />

      <div className="mt-8 space-y-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
          {/* Portrait sits above the text on mobile, beside the name on wider screens */}
          <Image
            src="/vladimir.jpg"
            alt="Vladimir Fabregues"
            width={320}
            height={290}
            priority
            className="order-1 h-36 w-36 shrink-0 rounded-2xl border border-white/10 object-cover shadow-panel sm:order-2 sm:h-40 sm:w-40"
          />

          <div className="order-2 min-w-0 flex-1 sm:order-1">
            <AboutEyebrow />
            <h1 className="mt-2 font-display text-4xl leading-[1.05] text-foreground sm:text-5xl">
              Vladimir Fabregues
            </h1>
            <AboutBio part="intro" />
            <AboutConnect />
          </div>
        </header>

        <section className="space-y-6 text-[15px] leading-8 text-muted-foreground">
          <AboutBio part="body" />
        </section>
      </div>
    </div>
  );
}
