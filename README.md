# The Value Investor

A value-investing screen in the style of Benjamin Graham and Warren Buffett. It ranks
listed companies on intrinsic value, margin of safety, balance-sheet strength, business
quality and downside protection, and it checks itself: every rating it publishes is later
graded against what the company's index cohort did.

## What it does

- **Ticker analysis** (`/`, `POST /api/analyze`): a single company, scored with a fixed
  set of finance rules. Sub-scores for valuation, health, quality and moat; intrinsic value
  by sector (DCF, NAV, DDM or justified P/B); verdict gates; red-flag caps (dilution,
  accruals, recent IPO, peak earnings). Every number comes from code, and the prose is
  generated from those numbers.
- **Market screener** (`/value/screen`): the same scoring across index universes: S&P 500
  and 400, Russell 2000 and mid-cap, FTSE 100 and 250, AIM, CAC 40, MSCI Europe Small Cap
  and TOPIX Small, about 6,500 names in all. A weekly GitHub Actions job precomputes the
  result, so visitors read a cached snapshot.
- **Scorecard** (`/value/scorecard`): every weekly rating is graded against its index
  cohort at 4, 13, 26 and 52 weeks. Companies that stop trading are classified as takeovers
  or failures, so delisted names count against the record.
- **Paper portfolios** (`/value/portfolio`): simulated Strong-Buy books, and a strategy lab
  whose rules were frozen before any result was known.
- **Monthly report** (`/value/report`): a PDF with the claims scoreboard, best and worst
  lists and red-flag summary, emailed on the 1st of each month through Resend.
- **Languages**: English and French, with parity tests.

No language model is called in the live path. The analyser is deterministic.
`lib/claude/instructions.ts` holds an unused prompt from an earlier design.

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma with PostgreSQL (Neon in
production), `yahoo-finance2` for prices and statements, SEC EDGAR XBRL as a US
gap-filler, Zod for validation, Vitest for tests, Resend for email.

## Local development

```bash
npm install            # runs prisma generate
cp .env.example .env   # then set DATABASE_URL to a PostgreSQL database
npx prisma migrate dev
npm run dev            # http://localhost:3000
```

The schema is PostgreSQL. A local SQLite file will not work.

## Checks

```bash
npm run lint           # ESLint (next/core-web-vitals + next/typescript); fails on errors
npm run typecheck      # tsc --noEmit
npm run test           # Vitest
npm run check          # all three, as CI runs them
```

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `DATABASE_URL` | app, Prisma | PostgreSQL connection string |
| `FINANCE_PROVIDER` | app | `mock` (the default, four bundled tickers) or `yahoo` (any ticker, live) |
| `SCREEN_RUN_URL`, `SCREEN_RUN_TOKEN` | GitHub Actions | the deployed screener endpoint and its shared secret, used by the weekly refresh and the monthly report |
| `SCREEN_INDICES` | weekly refresh | optional comma-separated subset of indices to refresh |
| `RESEND_API_KEY`, `REPORT_EMAIL_TO` | monthly report | Resend key and recipient, stored as GitHub secrets |

## Deployment and automation

- **Vercel** builds the app from `vercel.json`. The build command runs
  `prisma db push --accept-data-loss` before `next build`, which is convenient for a
  single-owner project but means every deploy changes the production schema. Replacing it
  with `prisma migrate deploy` is open work.
- **Weekly refresh** (`.github/workflows/refresh-screen.yml`, Mondays 06:00 UTC): precomputes
  the screener, then rebuilds the simulated portfolios from its snapshot history. The two
  run in order and never in parallel.
- **Monthly report** (`.github/workflows/monthly-report.yml`): builds the PDF and emails it.

## Layout

```
app/                 routes and API handlers (app/api/*)
components/          UI: analysis, screen, scorecard, portfolio, report, shell
lib/finance/         data providers, ratios, scoring, verdicts, prose
lib/screener/        index universes and the screening funnel
lib/scorecard/       outcome grading and fate classification
lib/portfolio/       simulated portfolios and the strategy lab
lib/report/          monthly report content
lib/i18n/            translations (en, fr)
prisma/              schema, seed data
scripts/             weekly refresh, portfolio build, report sender, backtest
__tests__/           Vitest suites
docs/                design audits
```

## Related projects

- **ETF Compass** is a separate repository. It is served under `/etf` through a
  Multi-Zones rewrite (`ETF_ZONE_URL`, see `next.config.ts`).
- **The Breakthrough Engine** (a second, research-only lens) lives in a private repository.

## Limits to keep in mind

- Prices and statements come from Yahoo Finance, which is unofficial and may change or
  drop series without notice. EDGAR fills US gaps only.
- The scores are a screen, not a forecast, and are not investment advice. The scorecard
  exists so that their record can be checked.
