# The Investment Casebook — Redesign Audit

> **Brand:** The Investment Casebook · **Tagline:** *Every conclusion has a case.*
> **Purpose:** unify the existing company-analysis tool and the ETF-research tool
> under one coherent, premium investment-research brand.
> **Status:** audit only — no redesign code has been written (this document excepted).
> **Date of audit:** 2026-08-03.

This is a read-only inventory to de-risk the rebrand/redesign. It maps what exists,
what is safe to change, and what must never move. Read the **Critical constraints**
and **Product logic that must NOT be modified** sections before touching any file.

---

## 0. The two-app, single-origin topology (read first)

The product is **two separate Next.js applications** served from **one origin** via
Next.js **Multi-Zones**:

| App | Repo (local path) | GitHub | Serves | Vercel |
|---|---|---|---|---|
| **Value Investor** (company analysis) — the *hub* | `~/Desktop/Value Investor` | `vladimirfabregues-cmyk/value-investor` | `/`, `/about`, `/value/*`, `/api/*` | `value-investor-…vercel.app` |
| **ETF Compass** (ETF research) — the *zone* | `~/Documents/ETF comparateur` | `vladimirfabregues-cmyk/ETF-Compass` | `/etf/*` (basePath `/etf`) | `etf-comparateur.vercel.app` |

- The hub's `next.config.ts` **rewrites** `/etf` and `/etf/:path*` to `ETF_ZONE_URL`
  (default `https://etf-comparateur.vercel.app`). The ETF app sets `basePath: "/etf"`.
- Cross-zone navigation uses a **plain `<a>`** (not `<Link>`) to escape the basePath.
- The hub owns the origin (root PWA); the ETF app disables its own service worker.
- **Deploy order: ETF first, then Value Investor** (the hub's `/etf` proxy needs the
  zone live).
- Consequence: the ETF app's *standalone* root (`etf-comparateur.vercel.app/`) 404s;
  only `/etf` serves in production.

**Implication for the rebrand:** "one brand" spans **two codebases and two Vercel
projects** with **two different Tailwind major versions** (see §5). Any shared token,
logo, or wordmark change must be applied in both repos and deployed in order.

---

## 1. Current framework & tooling

| Concern | Value Investor (hub) | ETF Compass (zone) |
|---|---|---|
| Framework | Next.js `^15.2.4` (App Router) | Next.js `^15.3.4` (App Router) |
| React | `^19.0.0` | `^19.1.0` |
| Language | TypeScript `^5.8` (strict) | TypeScript `^5.8` (strict) |
| Package manager | **npm** (`package-lock.json`) | **npm** (`package-lock.json`) |
| Styling | **Tailwind CSS v3.4** (`tailwind.config.ts` + HSL CSS vars) | **Tailwind CSS v4.1** (`@theme` in `globals.css`, `@tailwindcss/postcss`) |
| Rendering | Mixed: client landing/analysis pages, server API routes; DB pages are `force-dynamic` | Mostly server components; **`export const dynamic = "force-dynamic"`** on the root layout (cookie-driven locale) |
| Persistence | **Prisma** `^6.6` → Neon **Postgres** | **None** — in-repo TS fixtures + JSON |
| Path alias | `@/*` → `./*` | `@/*` → `./src/*` |
| Routes typing | `typedRoutes: true` (hub) | (not enabled) |
| UI libs | Radix (`dialog`, `select`, `slot`), `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge` | none — hand-built components + CSS utility classes; **`recharts`** for charts |
| Data libs | `yahoo-finance2`, `zod` | `zod` |
| Lint | **none** (no `lint` script, no ESLint config) | **ESLint 9** (`eslint.config.mjs`, `eslint-config-next`) |
| Tests | **Vitest** (`__tests__/`) | **Vitest** (`tests/`) |
| E2E / a11y tooling | **none** (no Playwright, no axe) | **none** |
| Web analytics | **none** | **none** |
| SEO extras | **none** (no `sitemap`/`robots`/JSON-LD/OG images) | **none** |

### Directory structure (top level)

```
Value Investor (hub)                 ETF Compass (zone)
├── app/                             ├── src/
│   ├── page.tsx        (chooser)    │   ├── app/            (routes)
│   ├── about/          (shared)     │   ├── components/     (hand-built)
│   ├── value/          (analysis)   │   └── lib/            (engines, data, i18n)
│   ├── api/            (routes)     ├── public/             (icons, sw.js)
│   ├── layout.tsx / globals.css     ├── scripts/            (fetch-data, gen-icons)
│   └── manifest.ts                  ├── tests/
├── components/  (ui/ + features)    ├── eslint.config.mjs
├── lib/         (finance, i18n, …)  ├── next.config.ts  (basePath /etf)
├── prisma/      (schema + seed)     ├── postcss.config.mjs
├── types/                           └── tsconfig.json
├── __tests__/
├── scripts/backtest.cjs
├── next.config.ts (zones + redirects)
├── tailwind.config.ts
└── (no ESLint config)
```

---

## 2. Existing routes & their purpose

### Value Investor (hub)

| Route | File | Rendering | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | client | **Landing chooser / welcome** — editorial lead + two cards (Value Investor, ETF Screener) + "About the author" link |
| `/about` | `app/about/page.tsx` | static | **Neutral, shared bio page** (no app shell) — portrait, bio, "Connect on LinkedIn" |
| `/value` | `app/value/page.tsx` | dynamic | **Analyse** a company — ticker search + full analysis result (`home-view`) |
| `/value/screen` | `app/value/screen/page.tsx` | dynamic | **Market screener** — index-wide ranked results (`screen-view`) |
| `/value/compare` | `app/value/compare/page.tsx` | dynamic | **Compare** two analysed companies (`compare-view`) |
| `/api/analyze` | `app/api/analyze/route.ts` | dynamic | Run a single-company analysis |
| `/api/compare` | `app/api/compare/route.ts` | dynamic | Comparison payload |
| `/api/edgar/filings` | … | dynamic | SEC EDGAR filing links |
| `/api/history`, `/api/history/by-security` | … | dynamic | Saved-analysis history |
| `/api/screen/{run,results,news}` | … | dynamic | Chunked/resumable screener run, results, news |
| `/api/securities/search` | … | dynamic | Ticker/company search |
| `/manifest.webmanifest` | `app/manifest.ts` | static | PWA manifest (`start_url` `/value/screen`) |

**Redirects (hub `next.config.ts`):** `/screen`→`/value/screen`, `/compare`→`/value/compare`,
`/value/about`→`/about`, `/etf/about`→`/about` (the last caught before the `/etf` rewrite).
**Rewrites:** `/etf`, `/etf/:path*`→`ETF_ZONE_URL`.

### ETF Compass (zone; all paths below are under basePath `/etf`)

| Route | File | Purpose |
|---|---|---|
| `/` (→ `/etf`) | `src/app/page.tsx` | **Dashboard** — coverage, macro snapshot, scenario chips, featured groups |
| `/screener` | `src/app/screener/page.tsx` + `ScreenerView.tsx` | Filterable ETF screener |
| `/compare` | `src/app/compare/page.tsx` | Side-by-side ETF comparison |
| `/scenarios` | `src/app/scenarios/page.tsx` | Macro scenario explorer |
| `/methodology` | `src/app/methodology/page.tsx` | Quality-score & scenario methodology |
| `/disclaimer` | `src/app/disclaimer/page.tsx` | Disclaimer & data coverage |
| `/etf/[isin]` | `src/app/etf/[isin]/page.tsx` | Fund detail (dynamic) |
| `/api/v1/{etfs, etfs/[isin], macro/snapshot, meta/coverage, scenarios}` | … | Read-only JSON API |
| `error.tsx`, `not-found.tsx`, `manifest.ts` | … | Error/404/PWA |

**All routes above are currently working and must be preserved.**

---

## 3. Reusable components

### Value Investor (hub) — `components/`
- **`ui/`** (design-system primitives, shadcn-style): `badge`, `button`, `card`,
  `dialog`, `input`, `select`, `separator`, `sheet`. **These are the shared primitives
  to lean on for the hub redesign.**
- **`shell/`**: `app-shell` (topbar + history sidebar wrapper), `shell-layout`,
  `topbar` (contains the **"VI" logo badge** + "Value Investor" wordmark + nav), `sidebar-history`.
- **`about/`**: `about-bio`, `about-eyebrow`, `about-connect` (LinkedIn CTA), `workspaces-link`.
- **`analysis/`**: `analysis-summary`, `sticky-summary`, `why-this-verdict`, `intrinsic-value-card`,
  `valuation-card`, `financial-health-card`, `business-quality-card`, `thesis-card`, `evidence`,
  `result-sections`, `trend-chart`, `trends-card`, `value-vs-price`, `data-status-card`,
  `edgar-filings-card`, `sources-card`, `how-valuation-works`, `use-analysis-prose`.
- **`screen/`**: `screen-view`, `verdict-modal`. **`compare/`**: `compare-view`, `compare-slot`.
- **`home/`**: `home-view`. **`ticker/`**: `security-search`, `ticker-search-form`,
  `market-selector`, `recent-search-item`. **`i18n/`**: `language-toggle`.

### ETF Compass (zone) — `src/components/`
Hand-built (no primitive library), styled with CSS utility classes from `globals.css`:
`AckBanner`, `AllocationBars`, `BottomNav`, `DataAsOf`, `DisclaimedPanel`, `FactorShiftBars`,
`FitBadge`, `FlagBadges`, `LanguageToggle`, `NavLinks`, `PerformanceChart` (recharts),
`PillarBreakdown`, `ScoreBadge`, `SearchBox`, `ServiceWorker`. Header/footer live inline in
`src/app/layout.tsx` (contains the **"EC" logo badge** + "ETF Compass" wordmark).

> There is **no shared component package** across the two apps. Any "shared" component
> (logo, wordmark, footer) must be duplicated or re-implemented per repo/Tailwind version.

---

## 4. Design-token locations

**Good news: the two apps already share the same visual DNA** — identical palette and fonts,
expressed through different mechanisms.

| Token | Value / source | Where (hub) | Where (zone) |
|---|---|---|---|
| Gold accent | `hsl(40 38% 58%)` ≈ `#b59458` | `--primary` in `app/globals.css` → `tailwind.config.ts` `colors.primary` | `--color-gold` in `src/app/globals.css` `@theme` |
| Ink background | `hsl(220 42% 7%)` | `--background` | `--color-ink` |
| Cream text | `hsl(42 18% 92%)` | `--foreground` | `--color-cream` |
| Panel/card | `hsl(220 34% 11%)` | `--card` | `--color-panel` |
| Display serif | Iowan Old Style / Palatino | `--font-display` | `--font-display` |
| UI sans | Avenir Next | `--font-sans` | `--font-sans` |
| Mono (tickers) | SF Mono / ui-monospace | (n/a) | `--font-mono` |
| Chart palette | `--chart-1..5` (HSL) | `app/globals.css` | recharts inline hex in components |
| Panel shadow | soft depth | `tailwind.config.ts` `boxShadow.panel` | `--shadow-panel` / `--shadow-gold` |

- **Hub**: shadcn-style — HSL numbers in `app/globals.css :root`, surfaced as semantic
  Tailwind colors (`primary`, `foreground`, `card`, …) via `tailwind.config.ts`. Body
  gradient + grid overlay + scrollbars + focus ring also in `app/globals.css`.
- **Zone**: Tailwind v4 — named tokens in `@theme` (`--color-gold`, `--color-ink`, …) plus
  hand-authored utility classes (`.card`, `.chip`, `.btn-gold`, `.btn-ghost`, `.input-dark`,
  `.select-dark`, `.ticker`, `.section-title`, `.eyebrow`, `.table-base`, `.sticky-col`).

**Redesign token strategy:** define the Casebook palette/type **once as values**, then apply
to both mechanisms (hub `:root` HSL + config; zone `@theme`). Do **not** introduce a second CSS
framework or unify Tailwind versions as part of this work.

---

## 5. Data sources per product

### Value Investor (company analysis)
- **Market/fundamentals provider:** `lib/finance/provider.ts` interface; **default is the
  mock/fixture provider** (`lib/finance/mock-provider.ts`, fixtures in
  `lib/finance/fixtures/*.json`); **`lib/finance/yahoo-provider.ts`** (yahoo-finance2) is used
  when `FINANCE_PROVIDER=yahoo` (set in production).
- **Filings:** SEC EDGAR via `lib/finance/edgar-supplement.ts` (+ `/api/edgar/filings`).
- **Reference data:** `lib/finance/exchanges.ts`, `lib/finance/sector-profile.ts`;
  index constituents in `lib/screener/*.ts` (SP500, FTSE100/250, CAC40, Russell, TOPIX, …).
- **Calculation is fully deterministic** (no request-time LLM in the analysis path):
  `analyzeTicker` (`lib/claude/analyze-stock.ts`) → `calculateValueMetrics`
  (`lib/finance/scoring.ts`) → `buildVerdictExplanation` (`lib/finance/verdict-explanation.ts`)
  → generated prose (`lib/finance/prose.ts`, `verdict-explanation-prose.ts`). Supporting math:
  `dcf.ts`, `ratios.ts`, `valuation-range.ts`, `valuation-gap.ts`, `normalize.ts`, `series.ts`.
  (`lib/claude/instructions.ts` holds a persona prompt string but is not on the deterministic path.)
- **Persistence:** Prisma/Postgres — models `Analysis`, `ScreenResult`, `ScreenSnapshot`
  (`prisma/schema.prisma`); seed in `prisma/seed.mjs` + `prisma/seed-data/*`.

### ETF Compass (ETF research)
- **No database.** In-repo curated fixtures: `src/lib/data/etfs.ts`, `benchmarks.ts`,
  `exposureGroups.ts`, `allocations.ts`, `scenarios.ts`, `macro.ts`, `series.ts`.
- **Live public data (fetched offline into JSON):** `src/lib/data/live/fund-series.json`
  (Yahoo Finance price histories), `src/lib/data/live/macro-snapshot.json` (FRED / ECB /
  Bank of England). Refreshed via `scripts/fetch-live-data.mjs`.
- **Provider layer:** `src/lib/providers/{index,liveSnapshot}.ts`.
- **Engines (deterministic):** `src/lib/services/universe.ts` orchestrates
  provider → `analytics/returns.ts` → `scoring/{config,qualityScore}.ts` →
  `scenario/{baseline,fit}.ts` → `commentary/engine.ts`. Compliance lint in
  `src/lib/compliance/{copy,lint}.ts`.

> **Do not fabricate market/company/ETF/macro data.** All figures must continue to come from
> these modules. The redesign is presentation-only over this data.

---

## 6. Where dataset dates, methodology versions & counts originate

| Value | Constant / source | Surfaces publicly as |
|---|---|---|
| ETF dataset version | `DATASET_VERSION = "2026.06-demo.1"` — `src/lib/compliance/copy.ts` | footer "Dataset {…}", disclaimer page |
| ETF methodology version | `METHODOLOGY_VERSION = "1.0.0"` — same file | footer "Methodology v{…}", methodology page |
| ETF data as-of date | `DATA_AS_OF = "2026-06-30"` — same file | `DataAsOf` component ("as of …") |
| ETF live macro fetch date | `universe.liveMeta.macroFetchedAt` (runtime, from `macro-snapshot.json`) | scenarios page |
| ETF fund count / group count | **derived at runtime** — `universe.summaries.length`, `universe.groups.length` (from `etfs.ts`, `exposureGroups.ts`); coverage via `/api/v1/meta/coverage` | dashboard, disclaimer ("54 funds across 33 exposure groups" style — computed, not hardcoded) |
| VI valuation model version | `VALUATION_MODEL_VERSION = "1.0.0"` — `lib/finance/model-version.ts` | stamped onto saved analyses / data-status card |

**Hardcoded numeric claims in prose** (update only if the underlying config changes — they are
not auto-derived): ETF methodology page changelog string *"7 pillars, 3 gates, 7-factor scenario
model, 11 preset scenarios"* and *"seven macro factors"* (`src/lib/i18n/translations.ts`,
`methodology.*`). The `"-demo"` suffix in `DATASET_VERSION` and the `DATA_SOURCE_LABEL =
"Demonstration data"` are honesty labels that surface publicly (see §9 risks).

---

## 7. i18n architecture (EN/FR) — must be preserved

Two **different** mechanisms; both must keep working and stay bilingual.

| | Value Investor (hub) | ETF Compass (zone) |
|---|---|---|
| Strategy | **client** context (pages are client/CSR) | **cookie** (pages are server components) |
| Store | `localStorage` key `vi:locale` | cookie `etf_locale` |
| Default | `en` (server + first paint), then adopts stored | `en` |
| Provider | `lib/i18n/locale-context.tsx` (`LocaleProvider`, `useTranslation`) | `src/lib/i18n/locale-context.tsx` (client, seeded by server) + `server.ts` (`getLocale`/`getT`) |
| Dictionary | `lib/i18n/translations.ts` (large, `en`+`fr`) | `src/lib/i18n/translations.ts` (`en`+`fr`) |
| Engine | `lib/i18n/translate.ts` (`makeTranslator`, dot-path keys, `{var}` interpolation) | `src/lib/i18n/translate.ts` (same shape) |
| Toggle | `components/i18n/language-toggle.tsx` (🇬🇧/🇫🇷, bottom-right, global) | `src/components/LanguageToggle.tsx` (writes cookie + `router.refresh()`) |
| Parity test | `__tests__/i18n/parity.test.ts` | `tests/lint-and-format.test.ts` |
| Generated prose | localized via generators (`lib/finance/prose.ts`, `verdict-explanation-prose.ts`, `compare/comparison-i18n.ts`) | UI chrome + static prose localized; **engine-generated per-fund commentary + scenario narratives + data-driven labels stay source-language by design** |

**Rule for the rebrand:** every new/changed user-facing string goes through the dictionaries in
**both** locales, using the existing key-path + interpolation system. Never hardcode display text
in components. The zone's server/cookie model means new server components use `getT()`; client
components use `useTranslation()`.

---

## 8. Test & quality commands (baselines below in §13)

| Command | Value Investor | ETF Compass |
|---|---|---|
| Type-check | `npx tsc --noEmit` (no npm script) | `npm run typecheck` |
| Lint | *(none configured)* | `npm run lint` (`eslint .`) |
| Unit tests | `npm test` (`vitest run`) — `__tests__/` | `npm test` (`vitest run`) — `tests/` |
| Build | `npm run build` (`next build`) | `npm run build` |
| Other | `npm run backtest`, `db:generate`, `db:migrate` | `npm run fetch-data`, `gen-icons` |

No Playwright / no automated accessibility tooling in either repo.

---

## 9. Public branding strings that MUST change (rebrand → *The Investment Casebook*)

> These are **display strings / brand identifiers** only. Change the *values*; never the
> translation **key paths**, enum keys, DB columns, or route/query identifiers (see §10).

### Value Investor (hub)
| File | Line(s) | Current | Notes |
|---|---|---|---|
| `app/layout.tsx` | 9, 12, 23 | metadata `title`/`applicationName`/appleWebApp `title` = "Value Investor …" | brand + PWA name |
| `app/manifest.ts` | 5, 6 | `name`/`short_name` "Value Investor …" | PWA name |
| `components/shell/topbar.tsx` | ~71–76 | **"VI" logo badge** + "Value Investor" wordmark | logo + wordmark |
| `lib/i18n/translations.ts` | 45–55 (`chooser.*`), 791–793 (fr) | "Choose your workspace", "Value Investor", "ETF Screener", CTAs | chooser copy (both locales) |
| `app/page.tsx` | 9–10 (comments) | "Value Investor", "ETF Screener" | comments only (optional) |
| `README.md` | 1, 3 | "Value Investor …" | docs |

### ETF Compass (zone)
| File | Line(s) | Current | Notes |
|---|---|---|---|
| `src/app/layout.tsx` | 16, 19, 21, 73–74 (**"EC" badge**), 77 (wordmark) | "ETF Compass …" | brand + logo + PWA |
| `src/app/manifest.ts` | 10, 11 | "ETF Compass …" | PWA name |
| `src/app/{compare,disclaimer,methodology,scenarios,screener}/page.tsx` | `metadata.title` | "… — ETF Compass" | per-page titles |
| `src/lib/compliance/copy.ts` | 24, 41 | disclaimers embed "ETF Compass" | **compliance copy — change brand token only, keep legal substance; re-run compliance lint/tests** |
| `src/lib/i18n/translations.ts` | 330, 390, 403, 670 | "ETF Compass" in about/ack/disclaimer prose (EN+FR) | localized copy |
| `src/app/globals.css` | 4 | design-system comment "ETF Compass …" | comment |
| `src/components/ServiceWorker.tsx`, `public/sw.js` | headers | "ETF Compass" comments | comments |
| `README.md` | 1 | "ETF Compass …" | docs |

### Cross-cutting decisions the redesign must make (not yet decided)
- **Sub-brand naming.** "Value Investor" and "ETF Screener/ETF Compass" become what under
  *The Investment Casebook*? (e.g., "Casebook · Companies" and "Casebook · Funds"). This choice
  drives the chooser cards, both topbars, both PWAs, and page titles.
- **"Choose your workspace"** (`chooser.title`, hub `translations.ts:46`/`783`) — reframe to the
  Casebook voice.
- **Verdict vocabulary** (see §10 for the safety boundary). The tagline *"Every conclusion has a
  case"* invites reframing the **user-facing** word "Verdict" → "Conclusion"/"The case" and
  possibly the labels *Strong buy / Buy / Watch / Hold / Avoid*. All of these are **display
  values** in `lib/i18n/translations.ts` (`verdict.*`, `analysis.whyVerdict.*`, `history.verdict`,
  `screen.cols.verdict`, `compare.*`, `screen.capped*`) — safe to change **as long as the enum
  keys and key-paths are untouched**.
- **Logos.** Two monogram badges today ("VI", "EC"). A unified mark (e.g., "IC" / a casebook
  glyph) must be applied in both `components/shell/topbar.tsx` and `src/app/layout.tsx`, plus PWA
  icons in both `public/` folders (`icon-192`, `apple-*`, `favicon-*`) and `manifest.ts`.

### Developer detail leaking into public copy (fix during rebrand)
- ETF disclaimer footer: *"Live data providers can be connected through the provider adapter
  architecture (see **ARCHITECTURE.md in the repository**)"* —
  `src/lib/i18n/translations.ts:222` (EN) / `:562` (FR). Remove the repo/architecture reference
  from public-facing copy.

---

## 10. Product logic that must NOT be modified (hard boundary)

Renaming any of the following **for branding** is prohibited (it breaks the engines, the DB, or
saved data). Change display strings in the dictionaries instead.

1. **Company valuation engine** — `lib/finance/{scoring,dcf,ratios,valuation-range,valuation-gap,
   normalize,series,sector-profile,verdict-explanation}.ts`, `lib/finance/model-version.ts`.
2. **ETF scoring & scenario engines** — `src/lib/scoring/{config,qualityScore}.ts`,
   `src/lib/scenario/{baseline,fit}.ts`, `src/lib/analytics/returns.ts`,
   `src/lib/commentary/engine.ts`, `src/lib/services/universe.ts`.
3. **The `VerdictLabel` enum** — `"STRONG_BUY" | "BUY" | "WATCH" | "HOLD" | "AVOID"`
   (`types/analysis.ts:1`). Used across `scoring.ts`, `verdict-explanation.ts`, screener/history
   filters, **URL query params** (`?verdict=…`, `?verdicts=…` in `screen-view.tsx`), and
   **translation key paths** (`t(\`verdict.${verdict}\`)`). The five display labels may be
   re-worded; the keys may not.
4. **Prisma schema & stored columns** — `prisma/schema.prisma`: `Analysis.finalVerdictLabel`,
   `ScreenResult.verdictLabel`, `ScreenSnapshot.verdictLabel`, `verdictCaps`, score columns,
   `screenerIndex`, unique/index constraints. Do not alter schemas for branding.
5. **Compliance copy substance** — `src/lib/compliance/copy.ts` disclaimers, `SCORE_CONTEXT_NOTE`,
   `ACK_BANNER_TEXT`, and the banned-phrase lint (`src/lib/compliance/lint.ts`,
   `tests/{commentary-lint,lint-and-format}.test.ts`). Only the brand token inside them changes.
6. **Version/date/count constants** — §6. Presentation may change; values may not be fabricated.
7. **Data fixtures & live JSON** — do not edit numbers in `lib/finance/fixtures/*`,
   `src/lib/data/**`, `src/lib/data/live/*`.
8. **Routes, redirects, rewrites, basePath, zone wiring** — must keep working (§0, §2).
9. **i18n key paths & interpolation contracts** — add keys; don't rename existing paths.
10. **Internal identifiers generally** — `screenerIndex` values (SP500, FTSE100…), factor/pillar/
    exposure-group ids, scenario ids (used in URLs), API shapes under `/api/**` and
    `/etf/api/v1/**`.

---

## 11. Risks & dependencies

| # | Risk | Mitigation |
|---|---|---|
| R1 | **Two repos + two Vercel projects**; a partial rebrand looks broken across the seam. | Land brand tokens/wordmark/logo in both; **deploy ETF first, then hub**; verify the `/etf` seam after both deploy. |
| R2 | **Two Tailwind majors** (v3 config vars vs v4 `@theme`). A token defined once can't be shared as a file. | Define palette/type as canonical **values** in this doc; apply to each mechanism; do **not** unify versions or add a 2nd framework. |
| R3 | Rewording "Verdict"/labels risks touching enum keys, query params, or DB. | Change **values** in `translations.ts` only; keep `VerdictLabel`, key-paths, `?verdict=` params, DB columns. Run VI tests (esp. `verdict-explanation`, `i18n/parity`). |
| R4 | Compliance disclaimers are legally sensitive and lint-guarded. | Change only the brand token; keep substance; re-run `commentary-lint` + `lint-and-format`. |
| R5 | **No lint on the hub** — brand refactors can regress silently. | Rely on `tsc` + Vitest + `next build`; consider (out of scope) adding ESLint later. |
| R6 | **No E2E/a11y tests** — visual/interaction regressions won't be auto-caught. | Manual browser verification (EN+FR, desktop+mobile, both zones, the cross-zone seam) per change, as established. |
| R7 | Hub DB pages can't render locally (SQLite `.env` vs Postgres schema; no Docker). | Redesign hub chrome on DB-free pages (`/`, `/about`) locally; verify DB pages on the live Postgres deploy. Keep marketing/chooser content DB-free & static. |
| R8 | Local **iCloud "* 2.*" duplicate files** in the ETF path can break builds. | Scan/delete `* 2.*` before ETF builds. |
| R9 | PWA identity change (name/icons) can confuse already-installed home-screen apps. | Coordinate `manifest.ts` + icon swaps; keep `start_url`/scope; accept that installed users may see a renamed app. |
| R10 | Adding heavy deps for the "premium" look violates constraints. | No large production deps; use existing Tailwind + `lucide-react`; inline SVG for logo; system/existing fonts. |
| R11 | SEO/analytics are absent; tempting to add mid-rebrand. | If added, prefer static `metadata`/`sitemap`/`robots`/JSON-LD (server-rendered) and no heavy analytics SDK; treat as a separate, optional workstream. |

---

## 12. Recommended file-by-file implementation map (for later — not done yet)

> Grouped by workstream. Each is independently shippable and reversible. **No engine, schema,
> enum, route, or data-fixture files appear here.**

### A. Brand tokens & type (shared look)
- `app/globals.css` — confirm/retune `:root` HSL tokens to the Casebook palette; body gradient,
  focus ring, scrollbars.
- `tailwind.config.ts` — semantic color mapping, `boxShadow`, `fontFamily`, `borderRadius`.
- `src/app/globals.css` — mirror palette/type in `@theme`; retune utility classes
  (`.card`, `.btn-gold`, `.chip`, `.section-title`, …).
- (No new fonts unless already system-available.)

### B. Wordmark, logo & PWA identity (both apps)
- `components/shell/topbar.tsx` — replace "VI" badge + "Value Investor" wordmark with the
  Casebook mark/wordmark (inline SVG).
- `src/app/layout.tsx` — replace "EC" badge + "ETF Compass" wordmark; header/footer brand.
- `app/manifest.ts`, `src/app/manifest.ts` — `name`/`short_name`.
- `app/layout.tsx`, `src/app/layout.tsx` — `metadata.title`/`applicationName`/appleWebApp title.
- `public/` (both) — regenerate `icon-192`, `apple-*`, `favicon-*` (ETF `scripts/gen-icons.mjs`).
- Per-page `metadata.title` in ETF route files.

### C. Landing / chooser as premium marketing (hub, server/static preferred)
- `app/page.tsx` + `lib/i18n/translations.ts` `chooser.*` (EN+FR) — Casebook hero, tagline
  *"Every conclusion has a case,"* two product cards with new sub-brand names, About link.
- `app/about/page.tsx` + `about/*` — align to new brand voice (already neutral/shared).

### D. Voice & vocabulary (dictionary-only, both locales)
- `lib/i18n/translations.ts` — reframe user-facing "Verdict" → chosen term across `verdict.*`,
  `analysis.whyVerdict.*`, `history.*`, `screen.*`, `compare.*`; keep key-paths + enum keys.
- `src/lib/i18n/translations.ts` — brand token in about/ack/disclaimer prose; remove the
  ARCHITECTURE.md leak (`:222`/`:562`); align section titles to Casebook voice.
- `src/lib/compliance/copy.ts` — brand token only (then re-run compliance tests).

### E. Component polish (presentation only)
- Hub `components/ui/*` (button/card/badge/…) and feature cards — spacing, hierarchy, borders.
- Zone hand-built components — align to the shared utility classes after B/A.

### F. Optional, separate workstream (only if requested)
- SEO: `app/sitemap.ts`, `app/robots.ts`, JSON-LD, OG images (static).
- Analytics: privacy-light, no heavy SDK.

---

## 13. Baseline command results (recorded 2026-08-03)

All commands run with the existing package manager (**npm**) in each repo.

### Value Investor (hub)
| Command | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** (0 errors) |
| `npm run lint` | **N/A** — no `lint` script / no ESLint config |
| `npm test` (`vitest run`) | **PASS** — 22 files, **264 tests** passed |
| `npm run build` (`next build`) | **PASS** — compiled; routes: `/` (static), `/about` (static), `/value*` (dynamic), `/api/*` (dynamic) |

### ETF Compass (zone)
| Command | Result |
|---|---|
| `npm run lint` (`eslint .`) | **PASS** (0 problems) |
| `npm run typecheck` (`tsc --noEmit`) | **PASS** (0 errors) |
| `npm test` (`vitest run`) | **PASS** — 8 files, **70 tests** passed |
| `npm run build` (`next build`) | **PASS** — compiled; all routes render (`force-dynamic` layout) |

**Pre-existing failures:** none. Both repos are green on every available command. The only gaps
are *missing* tooling (no lint on the hub; no E2E/a11y anywhere), not failures.

---

## 14. Recommended implementation order

1. **A — Brand tokens & type** (both repos). Lowest-risk, highest-visual-leverage; palette
   already matches, so this is mostly renaming/retuning. Verify both builds + a browser pass.
2. **B — Wordmark, logo & PWA identity** (both repos). Unify the mark; swap icons/manifests/titles.
3. **C — Landing/chooser marketing** (hub). The front door carries the new brand + tagline;
   keep it server/static and DB-free.
4. **D — Voice & vocabulary** (dictionaries + compliance token). Includes the Verdict→Conclusion
   reframe **within the safety boundary**; remove the ARCHITECTURE.md leak. Re-run VI `i18n/parity`
   + `verdict-explanation` tests and ETF compliance-lint.
5. **E — Component polish** across both apps once tokens/brand are settled.
6. **F — (optional) SEO/analytics** as a separate, explicitly-requested workstream.

**After every workstream:** run the §13 commands in the affected repo(s), then a manual browser
pass in **EN and FR, desktop and mobile, both zones**, and confirm the **`/etf` cross-zone seam**.
**Deploy order remains ETF → hub.**
