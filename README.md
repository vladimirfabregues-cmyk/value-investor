# Value Investor

Value Investor is a premium dark-mode web app for Graham/Buffett-style equity analysis. It combines the OpenAI Responses API, built-in web search, strict function tools, deterministic finance math, Prisma persistence, and structured JSON rendering into a clean card-based interface.

## What It Does

- Analyzes a stock ticker with a conservative value-investing lens
- Uses OpenAI Responses API, not Chat Completions
- Declares built-in web search for recent qualitative context
- Executes strict server-side function tools for finance data and math
- Validates tool arguments, tool outputs, and final model output with Zod
- Persists completed analyses to SQLite with Prisma
- Shows saved analysis history in a fixed sidebar
- Supports side-by-side comparison for two saved analyses

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- lucide-react
- OpenAI Node SDK
- Zod
- Prisma
- SQLite for local dev

## Project Structure

Core directories:

- `app/` for routes, pages, and API handlers
- `components/` for shell, ticker, analysis, compare, and UI components
- `lib/openai/` for Responses orchestration and strict tool configuration
- `lib/finance/` for provider abstraction, fixtures, and deterministic valuation math
- `lib/db/` for Prisma client and queries
- `lib/validation/` for Zod schemas
- `prisma/` for the schema and initial migration
- `types/` for shared TypeScript types

## Mock Finance Provider

The app ships with a working mock finance provider so it runs locally without a paid market-data API.

Bundled fixtures:

- `AAPL`
- `MSFT`
- `BRK.B`
- `INTC`

If a ticker is not present in the fixture set, the analyze API returns a friendly `404`.

## Environment Variables

Copy `.env.example` to `.env` and set:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.4-mini
DATABASE_URL=file:./dev.db
FINANCE_PROVIDER=mock
```

Notes:

- `OPENAI_API_KEY` is required for `/api/analyze`
- `FINANCE_PROVIDER=mock` is the only bundled provider in this V1
- The database path is set up for local SQLite development

## Install

```bash
npm install
```

## Prisma Setup

Generate the Prisma client:

```bash
npm run db:generate
```

Initialize the database with Prisma:

```bash
npx prisma migrate dev --name init
```

If you are in a restricted environment and Prisma's schema engine errors before creating the SQLite file, apply the included migration SQL directly:

```bash
sqlite3 prisma/dev.db < prisma/migrations/20260326223000_init/migration.sql
```

## Run Locally

```bash
npm run dev
```

Then open:

- `http://localhost:3000`
- `http://localhost:3000/compare`

If port `3000` is already in use, Next.js will automatically choose another port and print it in the terminal.

## Analyzer Flow

1. User submits a ticker
2. `POST /api/analyze` validates the request
3. The server starts an OpenAI Responses loop
4. The model can call:
   - `fetch_financial_dataset`
   - `web_search`
   - `calculate_value_metrics`
5. Local server code executes deterministic tools
6. Final structured JSON is validated
7. Result is saved to Prisma
8. UI renders verdict, valuation, health, quality, intrinsic value, thesis, and sources

## Verification Commands

```bash
npm run build
curl -s http://127.0.0.1:3000/api/history
```

## Limitations Of The Mock Provider

- Only four bundled tickers are supported
- Fixture data is normalized and coherent, but not live market data
- Recent qualitative context still depends on OpenAI web search
- The mock provider is designed for local development, not production market-data coverage

## Extending Later

- Swap `lib/finance/mock-provider.ts` for a live provider behind the same interface
- Move SQLite to Postgres by updating `prisma/schema.prisma` datasource config
- Add dedicated saved-analysis detail routes if you want stable shareable URLs
- Add auth and portfolio/watchlist features on top of the persisted analysis table
