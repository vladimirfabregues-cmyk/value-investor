"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

import { useTranslation } from "@/lib/i18n/locale-context";
import { BRAND } from "@/lib/brand";
import { getDataCoverage } from "@/lib/coverage/data-coverage";

type FooterLink = { key: string; href: string; crossZone?: boolean };

const GROUPS: Array<{ heading: string; links: FooterLink[] }> = [
  {
    heading: "tools",
    links: [
      { key: "companyAnalysis", href: "/value" },
      { key: "etfResearch", href: "/etf", crossZone: true },
      { key: "companyScreener", href: "/value/screen" },
      { key: "etfScreener", href: "/etf/screener", crossZone: true },
      { key: "compare", href: "/value/compare" },
    ],
  },
  {
    heading: "standards",
    links: [
      { key: "methodology", href: "/methodology" },
      { key: "dataCoverage", href: "/data-and-coverage" },
      { key: "about", href: "/about" },
    ],
  },
  {
    heading: "legal",
    links: [{ key: "important", href: "/legal" }],
  },
];

const LINK_CLASS =
  "text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded";

/**
 * One global footer for the front-of-site. It is deliberately NOT rendered
 * inside the /value app workspace (which keeps its own lean in-context
 * disclaimer), so the full disclaimer never appears twice on one page and the
 * marketing chrome doesn't intrude on the working tool.
 *
 * Links only ever point at routes that exist — Privacy/Terms/Contact are
 * omitted rather than shipped as dead links. Cross-zone /etf* links use plain
 * <a> (separate build behind a rewrite). The one dynamic figure, the company
 * methodology version, comes from the coverage adapter and is shown only when
 * present; unavailable values (ETF dataset version, a company data date) are
 * simply not rendered — never faked.
 */
export function SiteFooter() {
  const { t, locale } = useTranslation();
  const pathname = usePathname();

  // The app workspace has its own footer; don't double up there.
  if (pathname?.startsWith("/value")) return null;

  const coverage = getDataCoverage();
  const methodVersion = coverage.company.methodologyVersion;
  const year = new Date().getFullYear();
  const tagline = locale === "fr" ? BRAND.tagline.fr : BRAND.tagline.en;

  return (
    <footer aria-labelledby="site-footer-heading" className="mt-8 border-t border-white/[0.08]">
      <h2 id="site-footer-heading" className="sr-only">
        {t("siteFooter.label")}
      </h2>

      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          {/* Brand area */}
          <div>
            <p className="font-display text-lg text-foreground">{BRAND.name}</p>
            <p className="mt-1 font-display text-sm italic text-primary/80">{tagline}</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
              {t("siteFooter.description")}
            </p>
          </div>

          {/* Navigation groups */}
          {GROUPS.map((group) => (
            <nav key={group.heading} aria-label={t(`siteFooter.groups.${group.heading}`)}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/80">
                {t(`siteFooter.groups.${group.heading}`)}
              </h3>
              <ul className="mt-3 flex list-none flex-col gap-2 p-0">
                {group.links.map((link) =>
                  link.crossZone ? (
                    <li key={link.key}>
                      <a href={link.href} className={LINK_CLASS}>
                        {t(`siteFooter.links.${link.key}`)}
                      </a>
                    </li>
                  ) : (
                    <li key={link.key}>
                      <Link href={link.href as Route} className={LINK_CLASS}>
                        {t(`siteFooter.links.${link.key}`)}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          ))}
        </div>

        {/* Disclaimer — visible text, never hidden in an accordion */}
        <div className="mt-10 border-t border-white/[0.08] pt-6">
          <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
            {t("siteFooter.disclaimer")}
          </p>
          <Link
            href="/legal"
            className="mt-2 inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
          >
            {t("siteFooter.readFull")}
          </Link>
        </div>

        {/* Bottom bar: dynamic year + compact available metadata */}
        <div className="mt-6 flex flex-col gap-2 border-t border-white/[0.08] pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BRAND.name}. {t("siteFooter.rights")}
          </p>
          {methodVersion ? (
            <p className="tabular-nums">
              {t("siteFooter.methodLabel")} <span className="font-mono">v{methodVersion}</span>
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
