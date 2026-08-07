"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Menu, X } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/translations";
import { CasebookLogo } from "@/components/brand/casebook-logo";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils/cn";

type NavItem = { key: string; href: string; crossZone?: boolean };

const NAV: NavItem[] = [
  { key: "stocks", href: "/value" },
  { key: "etfs", href: "/etf", crossZone: true },
  { key: "compare", href: "/value/compare" },
  { key: "methodology", href: "/methodology" },
  { key: "about", href: "/about" },
];

const NAV_LINK =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded";

/** Inline EN / FR switch — labelled text, never colour-alone (mirrors the fixed one). */
function LangSwitch() {
  const { locale, setLocale, t } = useTranslation();
  const langs: { code: Locale; short: string; label: string }[] = [
    { code: "en", short: "EN", label: t("language.english") },
    { code: "fr", short: "FR", label: t("language.french") },
  ];
  return (
    <div role="group" aria-label={t("language.change")} className="flex items-center gap-1 rounded-full border border-white/12 p-0.5">
      {langs.map(({ code, short, label }) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            aria-label={label}
            className={cn(
              "flex h-7 min-w-8 items-center justify-center rounded-full px-2 text-xs tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
              active ? "bg-primary/20 font-semibold text-primary-bright ring-1 ring-primary/50" : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}

/**
 * One global header for the front-of-site (home + standards/legal pages). It is
 * deliberately NOT rendered inside the /value app workspace, which keeps its
 * own topbar; the ETF zone is a separate build and carries its own. Links only
 * point at routes that exist. Cross-zone /etf uses a plain <a>.
 */
export function SiteHeader() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on route change and on Escape.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // The app workspace has its own topbar; don't double up there.
  if (pathname?.startsWith("/value")) return null;

  const renderLink = (item: NavItem, className: string) =>
    item.crossZone ? (
      <a key={item.key} href={item.href} className={className}>
        {t(`siteNav.${item.key}`)}
      </a>
    ) : (
      <Link key={item.key} href={item.href as Route} className={className}>
        {t(`siteNav.${item.key}`)}
      </Link>
    );

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[rgba(6,11,20,0.85)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" aria-label={t("siteNav.home")} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
          <CasebookLogo size="md" />
        </Link>

        {/* Desktop nav */}
        <nav aria-label={t("siteNav.menuLabel")} className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => renderLink(item, NAV_LINK))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LangSwitch />
          <Link
            href={BRAND.products.companies.path}
            className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {t("siteNav.primary")}
          </Link>
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-mobile-menu"
          aria-label={open ? t("siteNav.closeMenu") : t("siteNav.openMenu")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/12 text-foreground transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 md:hidden"
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div id="site-mobile-menu" className="border-t border-white/[0.08] bg-[rgba(6,11,20,0.98)] md:hidden">
          <nav aria-label={t("siteNav.menuLabel")} className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {NAV.map((item) =>
              renderLink(
                item,
                "rounded-lg px-3 py-2.5 text-base font-medium text-foreground/90 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              ),
            )}
            <div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-4">
              <LangSwitch />
              <Link
                href={BRAND.products.companies.path}
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {t("siteNav.primary")}
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
