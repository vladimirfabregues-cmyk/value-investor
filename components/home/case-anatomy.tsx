"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight } from "lucide-react";

import { useTranslation } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils/cn";
import { COMPANY_CASE_SAMPLE, confidenceKey } from "@/lib/home/case-sample";

const STAGE_KEYS = ["evidence", "method", "checks", "limitations", "conclusion"] as const;
const TAB_KEYS = ["company", "etf"] as const;
type TabKey = (typeof TAB_KEYS)[number];

function money(value: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function longDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** Neutral placeholder track — the *shape* of a value, never a fabricated one. */
function Track({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("inline-block h-1.5 rounded-full bg-white/12", className)} />;
}

/** A labelled stage row inside a product panel. */
function Stage({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 border-t border-white/[0.06] py-4 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-xs tabular-nums text-primary/70">{n}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="min-w-0 text-sm leading-6 text-foreground/90">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-foreground/90">{children}</dd>
    </div>
  );
}

function ProvenanceBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary/60" />
      {children}
    </span>
  );
}

function CompanyPanel() {
  const { t, locale } = useTranslation();
  const s = COMPANY_CASE_SAMPLE;
  const stages = STAGE_KEYS.map((k) => ({
    n: t(`caseAnatomy.stages.${k}.n`),
    title: t(`caseAnatomy.stages.${k}.title`),
  }));

  return (
    <dl className="m-0">
      <Stage n={stages[0].n} title={stages[0].title}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-primary">{s.ticker}</span>
            <span className="font-display text-base text-foreground">{s.companyName}</span>
          </div>
          <ProvenanceBadge>{t("caseAnatomy.provenance.archived")}</ProvenanceBadge>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>
              {t("caseAnatomy.labels.source")}:{" "}
              <a
                href={s.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/80 underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
              >
                {s.source.title}
              </a>
            </div>
            <div>{t("caseAnatomy.labels.asOf", { date: longDate(s.asOfIso, locale) })}</div>
          </div>
        </div>
      </Stage>

      <Stage n={stages[1].n} title={stages[1].title}>
        <Row label={t("caseAnatomy.labels.method")}>{t("caseAnatomy.company.methodValue")}</Row>
      </Stage>

      <Stage n={stages[2].n} title={stages[2].title}>
        <div className="space-y-1.5">
          <Row label={t("caseAnatomy.labels.price")}>
            <span className="tabular-nums">{money(s.currentPrice, s.currency, locale)}</span>
          </Row>
          <Row label={t("caseAnatomy.labels.range")}>
            <span className="tabular-nums">
              {money(s.modelledLow, s.currency, locale)}–{money(s.modelledHigh, s.currency, locale)}
            </span>
          </Row>
          <Row label={t("caseAnatomy.labels.position")}>
            <span>
              {t("caseAnatomy.company.positionBelow")}{" "}
              <span className="text-muted-foreground">
                ({t("caseAnatomy.labels.marginOfSafety")}{" "}
                <span className="tabular-nums">+{s.marginOfSafetyPct}%</span>)
              </span>
            </span>
          </Row>
          <Row label={t("caseAnatomy.labels.resilience")}>
            {t(`caseAnatomy.status.${s.resilienceBand}`)}{" "}
            <span className="tabular-nums text-muted-foreground">({s.resilienceScore}/100)</span>
          </Row>
          <Row label={t("caseAnatomy.labels.earnings")}>
            <span className="tabular-nums">
              {t("caseAnatomy.company.fcfConsistency", { score: s.fcfConsistencyScore })}
            </span>
          </Row>
          <Row label={t("caseAnatomy.labels.cyclicality")}>
            <span className="tabular-nums">
              {t("caseAnatomy.company.revenueStability", { score: s.revenueStabilityScore })}
            </span>
          </Row>
        </div>
      </Stage>

      <Stage n={stages[3].n} title={stages[3].title}>
        <p className="text-muted-foreground">{s.keyLimitation}</p>
      </Stage>

      <Stage n={stages[4].n} title={stages[4].title}>
        <div className="flex flex-col gap-2.5">
          {/* Band-only, to match the result page's single confidence
              representation (P3-6 — no "High (83%)" vs "High" split). */}
          <Row label={t("caseAnatomy.labels.confidence")}>
            {t(`confidence.${confidenceKey(s.confidencePct)}`)}
          </Row>
          <p className="text-xs italic text-muted-foreground">{t("caseAnatomy.company.notice")}</p>
          <Link
            href={s.recreateHref as Route}
            className="inline-flex items-center gap-1 self-start text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
          >
            {t("caseAnatomy.company.openFull")}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Stage>
    </dl>
  );
}

function EtfPanel() {
  const { t } = useTranslation();
  const stages = STAGE_KEYS.map((k) => ({
    n: t(`caseAnatomy.stages.${k}.n`),
    title: t(`caseAnatomy.stages.${k}.title`),
  }));

  return (
    <dl className="m-0">
      <Stage n={stages[0].n} title={stages[0].title}>
        <div className="flex flex-col gap-2">
          <ProvenanceBadge>{t("caseAnatomy.provenance.illustrative")}</ProvenanceBadge>
          <p className="text-xs text-muted-foreground">{t("caseAnatomy.etf.previewNote")}</p>
        </div>
      </Stage>

      <Stage n={stages[1].n} title={stages[1].title}>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{t("caseAnatomy.etf.exposureGroup")}</span>
          <Track className="w-24" />
        </div>
      </Stage>

      <Stage n={stages[2].n} title={stages[2].title}>
        <div className="space-y-1.5">
          {(["cost", "tracking", "liquidity", "structure"] as const).map((k) => (
            <div key={k} className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">{t(`caseAnatomy.etf.${k}`)}</span>
              <Track className="w-16" />
            </div>
          ))}
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{t("caseAnatomy.etf.warning")}</span>
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-warning/70" />
          </div>
        </div>
      </Stage>

      <Stage n={stages[3].n} title={stages[3].title}>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{t("caseAnatomy.etf.warning")}</span>
          <Track className="w-28" />
        </div>
      </Stage>

      <Stage n={stages[4].n} title={stages[4].title}>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{t("caseAnatomy.etf.qualityScore")}</span>
            <Track className="w-16" />
          </div>
          <p className="text-xs italic text-muted-foreground">{t("caseAnatomy.etf.relative")}</p>
          {/* Cross-zone: /etf is a separate build behind a rewrite → plain <a>. */}
          <a
            href="/etf"
            className="inline-flex items-center gap-1 self-start text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
          >
            {t("caseAnatomy.etf.openCompare")}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </Stage>
    </dl>
  );
}

export function CaseAnatomy() {
  const { t } = useTranslation();
  const [active, setActive] = useState<TabKey>("company");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Roving-focus arrow-key handling. Selection follows focus (standard tab
  // pattern); there is no auto-rotation and no automatic content change.
  function onTabKeyDown(e: React.KeyboardEvent, index: number) {
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % TAB_KEYS.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + TAB_KEYS.length) % TAB_KEYS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TAB_KEYS.length - 1;
    else return;
    e.preventDefault();
    setActive(TAB_KEYS[next]);
    tabRefs.current[next]?.focus();
  }

  return (
    <section
      aria-labelledby="case-anatomy-heading"
      className="scroll-mt-24 border-t border-white/[0.08] py-14 sm:py-16"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/90">
        {t("caseAnatomy.eyebrow")}
      </p>
      <h2
        id="case-anatomy-heading"
        className="mt-3 text-balance font-display text-3xl leading-tight text-foreground sm:text-4xl"
      >
        {t("caseAnatomy.h2")}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{t("caseAnatomy.body")}</p>

      <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        {/* Chapter navigation — the five stages every case moves through */}
        <ol aria-label={t("caseAnatomy.stagesLabel")} className="m-0 flex list-none flex-col p-0">
          {STAGE_KEYS.map((k, i) => (
            <li
              key={k}
              className={cn(
                "flex gap-4 py-4",
                i > 0 && "border-t border-white/[0.06]",
              )}
            >
              <span className="font-display text-sm tabular-nums text-primary/70">
                {t(`caseAnatomy.stages.${k}.n`)}
              </span>
              <div className="min-w-0">
                <p className="font-display text-base text-foreground">{t(`caseAnatomy.stages.${k}.title`)}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t(`caseAnatomy.stages.${k}.question`)}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Product case — an accessible, manually-operated tab interface */}
        <div>
          <div
            role="tablist"
            aria-label={t("caseAnatomy.tabsLabel")}
            className="inline-flex gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1"
          >
            {TAB_KEYS.map((k, i) => {
              const selected = active === k;
              return (
                <button
                  key={k}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  id={`case-tab-${k}`}
                  aria-selected={selected}
                  aria-controls={`case-panel-${k}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(k)}
                  onKeyDown={(e) => onTabKeyDown(e, i)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    selected
                      ? "bg-primary/20 font-semibold text-primary-bright ring-1 ring-primary/50"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`caseAnatomy.tab.${k}`)}
                </button>
              );
            })}
          </div>

          {/* Single panel, min-height held stable to avoid layout shift on switch */}
          <div
            role="tabpanel"
            id={`case-panel-${active}`}
            aria-labelledby={`case-tab-${active}`}
            tabIndex={0}
            className="mt-4 min-h-[30rem] rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(18,28,45,0.6),rgba(8,14,25,0.65))] p-5 shadow-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:p-6"
          >
            {active === "company" ? <CompanyPanel /> : <EtfPanel />}
          </div>
        </div>
      </div>
    </section>
  );
}
