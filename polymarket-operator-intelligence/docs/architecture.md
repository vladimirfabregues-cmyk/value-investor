# Architecture — Polymarket Operator Intelligence

Status: Phase 0 proposal (2026-10-27). Protocol facts: `protocol-research.md`.
Tables: `data-model.md`. Scores: `scoring-model.md`.

## 1. Design goals, in priority order
1. **Defensible conclusions.** Every score traces back to stored evidence rows, which
   trace back to raw payloads.
2. **Reproducibility across protocol upgrades.** The registry, decoders and analytics
   are versioned. Four on-chain generations already exist, and a fifth (Protocol V2)
   is going live as this is written.
3. **Precision before recall.**
4. **Simple to run.** A modular monolith in one repo. Postgres plus S3-compatible
   storage. One Python image runs as API and as worker. No message broker, no
   Kubernetes, no microservices.

## 2. The key strategic choice: holder-first, not chain-first

Indexing every Polymarket fill since 2022 means hundreds of millions of rows. It
needs ClickHouse, a long backfill and decoders for four exchange generations before
anything useful appears. The first success criterion (spec §42) does not need it:

> current markets where a probable operator has more than $100k of aggregate
> directional exposure across several wallets.

Current exposure lives in **current positions**, and the Data API v2 gives them per
market: `/v2/holders` returns up to 1,000 holders per outcome with cursor paging, and
`/v2/positions?condition=` gives market-wide positions. The relationships live in
**collateral transfers to and from those holders**. Address-filtered `eth_getLogs` on
three ERC-20 contracts fetches those cheaply for the whole history.

The MVP pipeline:

```
 active markets (Gamma keyset)            ──► materiality filter (OI, volume)
        │
        ▼
 holders per outcome (/v2/holders, ≤1000) ──► WALLET UNIVERSE  (≈ 10⁴–10⁵ account wallets)
        │
        ├─► positions, trades, activity (+deposits/withdrawals/tips) per wallet  (Data API v2)
        ├─► profile → account wallet, created_at                                (Gamma)
        ├─► collateral ERC-20 transfers in/out of each wallet, full history      (Polygon RPC, address-filtered)
        ├─► wallet deployment / owner / session-signer events                    (Polygon RPC)
        ▼
 counterparty set ──► classify (registry + labels + degree) ──► expand 1 hop for low-degree private counterparties
        ▼
 funding / cash-out / direct-transfer edges ──► candidate pairs ──► pair features ──► Common Operator Score
        ▼
 conservative clustering (versioned) ──► cluster × market exposure ──► Material Position Score ──► alerts
```

**Per-address history cost is the main unknown** (assumption A-16). Address-filtered
`eth_getLogs` over blocks 4M to about 88M is cheap only if the RPC provider accepts
wide block ranges with topic filters. The `rpc` adapter therefore has two
interchangeable back-ends, raw `eth_getLogs` and a provider "transfers by address"
API (for example Alchemy `alchemy_getAssetTransfers`, or Polygonscan `tokentx`). The
second is cross-checked against raw logs on a sample, and every response is still
written to the raw layer. Phase 3a starts with a 1,000-wallet benchmark to choose.

A full fills index (chain-first) arrives later, in Phase 3b and Phase 8. It serves
temporal-coordination features beyond what the per-wallet Data API trade history
offers, reconciliation, and the historical timing analysis. That is when ClickHouse
becomes justified (§8).

## 3. Components

```
┌──────────────────────────── poi (one Python package, one image) ────────────────────────────┐
│                                                                                             │
│  sources/            adapters with rate limiting, retries and raw capture                   │
│    gamma.py  data_api.py  clob.py  bridge.py  rpc.py  ws_rtds.py  ws_market.py              │
│                                                                                             │
│  raw/                immutable raw store (S3/MinIO): every response/log batch → gz JSON     │
│  registry/           versioned contract registry + ABIs + decoder versions (YAML → DB)      │
│  decode/             log decoders keyed by (role, abi_version); golden tests                │
│  canonical/          normalisers: API rows + decoded logs → canonical_events                │
│  ingest/             jobs: market sync, universe build, wallet sync, transfer sync, finality│
│  intel/              address classification, labels, degree, graph edges + evidence         │
│  analytics/          candidates, pair features, scoring, clustering, exposure, episodes     │
│  alerts/             materiality, anomaly, alert priority, dedupe, state machine            │
│  dq/                 data-quality checks → data_quality_results                             │
│  api/                FastAPI (read API + analyst actions), auth, RBAC, audit                │
│  jobs/               Postgres-backed job queue + scheduler                                   │
│  cli.py              `poi ...` operator commands                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
        │ SQLAlchemy/psycopg3                │ boto3 (S3 API)
        ▼                                    ▼
   PostgreSQL 16                         MinIO (local) / S3 (prod)

   frontend/  Next.js + TypeScript (App Router), talks only to the FastAPI API
```

### 3.1 Jobs and scheduling
- A **Postgres-backed job queue** (`jobs` table, `SELECT … FOR UPDATE SKIP LOCKED`)
  plus a small scheduler loop in the worker process. No Redis or Celery until a
  measured need appears.
- Jobs are idempotent and checkpointed (`ingest_checkpoints`). Each job run writes a
  `runs` row: code version, config hash, registry version, start/end, status, counts.
- Ingestion jobs per source and target respect that source's rate budget through a
  shared token bucket kept in Postgres, so several workers cannot exceed Polymarket's
  per-IP limits together.

### 3.2 Raw layer (immutable)
- Every HTTP response page and every `eth_getLogs` batch is written **before
  parsing** to object storage as gzip JSON (Parquet later for bulk logs):
  ```
  raw/polymarket/gamma/markets/snapshot_date=2026-10-27/<run_id>/<seq>.json.gz
  raw/polymarket/data_api/v2/holders/date=2026-10-27/condition=<id>/<run_id>-<seq>.json.gz
  raw/polymarket/data_api/v2/activity/date=…/user=<addr>/<run_id>-<seq>.json.gz
  raw/polygon/logs/contract=<addr>/block_range=<from>-<to>/<sha256>.json.gz
  raw/polygon/logs/erc20_by_wallet/token=<addr>/wallet=<addr>/block_range=…/<sha256>.json.gz
  raw/polygon/tx/<tx_hash>.json.gz           # tx + receipt, fetched on demand
  raw/ws/rtds/date=…/hour=…/<seq>.jsonl.gz   # real-time frames (append-only)
  raw/docs/polymarket/snapshot_date=…/<path>.md
  ```
- Postgres `raw_objects` indexes every object (key, sha256, source, request
  parameters, fetched_at, http status, byte size). Each canonical row carries
  `raw_object_id`, which is the spec's `raw_payload_reference`.
- Raw objects are never overwritten. Re-fetches create new objects. Retention is
  indefinite in the MVP.

### 3.3 Contract registry and decoders
- The source of truth is `registry/contracts.yaml` in git. The loader validates it
  and writes `contracts`, `contract_abis` and `decoder_versions`, stamped with a
  `registry_version` (content hash).
- Entry fields: chain_id, address, role, protocol_generation, abi_version,
  deployment_block, active_from_block, retired_at_block, proxy_of / implementation,
  verification_status (`unverified` | `bytecode_checked` | `source_verified`), sources.
- **No contract address appears anywhere else in the application code.** A lint test
  greps the codebase for 40-hex literals outside `registry/` and test fixtures.
- A decoder is selected by `(emitter address → role, abi_version, topic0)`. A log from
  a registered contract with an unknown topic0, or one that fails to decode, writes a
  `decode_failures` row and a data-quality failure. It is **never dropped silently**.
- `decoder_version` = `<role>@<abi_version>#<decoder code version>`, stored on every
  canonical event.

### 3.4 Canonical events
Both API rows and decoded logs become one `canonical_events` table (schema in
`data-model.md`). Rules:
- **Deterministic `event_id`**: `sha256(source_system | chain_id | tx_hash | log_index
  | wallet | leg)` for chain events and `sha256(source_system | endpoint | natural key)`
  for API rows. Re-ingestion is idempotent.
- API and chain observations of the same economic event stay **separate rows** with a
  `reconciliation_key` (tx_hash plus wallet plus token). A DQ job matches them and
  reports mismatches. Neither overwrites the other.
- Fill dedupe (Paradigm): one `TRADE_FILLED` per (wallet, order) leg, with
  `liquidity_role` ∈ {maker, taker, unknown}. Market-volume aggregates count one side.

### 3.5 Finality and reorgs
- Chain rows carry `finality_status` ∈ {`unsafe`, `final`}. A finality job promotes
  rows at or below the RPC `finalized` tag. For any unsafe range whose block hash
  changed, it deletes those rows and re-derives them from fresh raw objects. The old
  raw objects stay.
- Analytics read only `final` rows by default. The real-time path (Phase 10) may read
  `unsafe` rows and labels them so.

### 3.6 Time semantics
Each event stores the timestamps it actually has, each named for what it is:
`block_timestamp` (settlement), `api_timestamp` (as served; equal to block time on
Data API v2), `observed_at` (our wall clock when a real-time frame arrived),
`signed_order_timestamp` (from calldata, client-asserted), and `ingested_at`. Features
state which timestamp they use. Nothing is called "order time" unless it is.

## 4. Address classification and the graph
- `addresses` holds one row per address ever seen. `address_labels` holds many rows
  per address, each with provenance, confidence and validity interval. The
  **effective classification** is computed by a deterministic, versioned precedence
  rule. Registry > curated list > analyst decision > heuristic, and conflicts are
  surfaced. Uncertain labels stay uncertain.
- Label sources in the MVP: the contract registry (protocol, exchange, factory,
  adapter, onramp/offramp); a curated YAML of known CEX hot wallets, bridges, on-ramps
  and the Polymarket relayer/operator EOAs (collected from Polygonscan labels and our
  own observation, each with a source URL); heuristics (contract bytecode present
  means contract; high degree means probable service, see below); and analyst
  decisions.
- **Degree** is computed per counterparty, both within the universe (number of
  distinct universe wallets it funded or received from) and as a **global degree
  probe** (distinct counterparties in a recent block window, capped and cached).
  Degree within the universe alone underestimates exchanges. The probe stops a CEX hot
  wallet that funded only three of our wallets from looking low-degree.
- Graph storage is Postgres tables (`graph_edges`, `edge_evidence`). We traverse a
  few hops with SQL or recursive CTEs, and load subgraphs into igraph in the analytics
  jobs. No graph database.
- Control relationships (OWNED_BY, AUTHORIZED_SESSION) carry `valid_from` and
  `valid_to` taken from on-chain authorization and revocation blocks. Pair scoring
  only counts a control edge for the period it was valid.

## 5. Analytics pipeline (batch, versioned)
Every stage reads one input snapshot and writes outputs tagged with `run_id` and
`model_version`. Stages:
1. `funding_trace`: first and major inbound funding per wallet, one-hop expansion
2. `edge_derivation`: FUNDED, WITHDREW_TO, TRANSFERRED_TO, SHARES_FUNDING_SOURCE,
   SHARES_CASHOUT_DESTINATION and so on, with evidence
3. `candidate_generation`: only pairs that share at least one meaningful relation
   (spec §18), using inverted indexes on counterparty, signer and owner. Never all
   pairs
4. `pair_features`, then `pair_scores` with `score_explanations`
5. `clustering`: a new `cluster_version`, stable IDs, lineage
6. `exposure`: `cluster_market_exposure` from current positions × prices
7. `materiality`, then `alerts`

The MVP runs the whole pipeline on a schedule (for example hourly for positions and
prices, daily for the universe and full re-scoring). Real-time updates come in Phase 10.

## 6. API
- FastAPI under `/api/v1`. Pydantic models are the contract. The frontend calls
  nothing else.
- Read endpoints: markets, market concentration (top wallets vs top clusters),
  wallets (profile, funding, cash-out, positions, trades, related-wallet candidates),
  pairs (score plus explanation), clusters (members, exposure, evidence, history),
  alerts, graph (one-hop expansion with filters), data quality, model versions.
- Analyst actions: label edits, must-link and cannot-link decisions, cluster
  split/reject, alert state changes. Every one writes `analyst_decisions` and
  `audit_logs`.
- Every score response includes `model_version`, `run_id`, `data_completeness` and
  the fixed disclaimer strings from `scoring-model.md` §14.

## 7. Frontend
- Next.js (App Router) plus TypeScript, server components fetching from the API.
- Charts: ECharts. Wallet graph: **Cytoscape.js**, which suits investigative
  expand-one-hop interaction and typed styling at our expected subgraph sizes
  (under 2k nodes). Sigma.js stays an option if we ever render very large graphs.
- Pages follow spec §33. The market page leads with **top individual wallet vs top
  probable operator cluster**.

## 8. When to introduce ClickHouse
Stay on Postgres until any of these holds:
- full fills or ERC-1155 history beyond about 200M rows is required (Phase 3b, 8, 9);
- an analytical query over a typical window cannot be made to run in under 10 s with
  indexes or partitioning; or
- the canonical event ingest rate stays above roughly 2k rows/s.

Migration path: the canonical events and features tables are append-only with
explicit types, so they can be dual-written to ClickHouse later
(`ReplacingMergeTree` on `event_id`). Domain tables (markets, addresses, labels,
clusters, alerts) stay in Postgres.

## 9. Security, privacy and ethics
- Secrets come only from the environment or a secret manager. `.env` is gitignored,
  `.env.example` documents the variables, and gitleaks runs in pre-commit and CI.
- All SQL goes through SQLAlchemy with bound parameters. No string-built SQL.
- Strict input validation: an address must match `^0x[0-9a-fA-F]{40}$` and is
  normalized to lowercase. Condition IDs must match `^0x[0-9a-f]{64}$`. Token IDs are
  decimal strings at most 78 digits long. Every limit and window is bounded.
- **Blockchain data is untrusted input.** We decode logs with eth-abi against
  registry ABIs only. We never call `eth_call` on unregistered contracts, never run
  contract code locally, and never trust token names or symbols from chain data.
- Auth: OIDC or simple session auth for analysts. Roles: `viewer`, `analyst`, `admin`.
  Public endpoints, if any, are read-only, rate-limited and aggregate-only.
- Secure headers (HSTS, CSP, frame-deny), CORS allowlist, request size limits.
- Dependency scanning with pip-audit and npm audit in CI.
- **Privacy:** no real-person identification, no enrichment of profile `name`, `bio`
  or `xUsername` beyond what is needed to show the account, no inference of politics
  or sensitive traits from bets. Clusters are reversible hypotheses. Labels are
  editable and audited. UI and API text uses the terminology in `scoring-model.md` §14.

## 10. Observability
- structlog JSON logs carrying run_id, job_id and source.
- Prometheus-style metrics endpoint (requests and 429s per source, lag behind
  `finalized`, decode failures, DQ status). OpenTelemetry tracing on API and jobs where
  cheap.
- Sentry-compatible error reporting through the `SENTRY_DSN` environment variable,
  off by default.
- An internal DQ dashboard page reads `data_quality_results`.

## 11. Deployment
- Local: Docker Compose (`docker-compose.proposal.yml`) runs postgres, minio, api,
  worker and web.
- First hosted deployment, when needed: one VM or a managed container service, plus
  managed Postgres and S3. The same image and environment-variable contract apply.

## 12. Repository
This repository (`value-investor`) hosts an unrelated Next.js product. **Recommendation:
create a dedicated repository** `polymarket-operator-intelligence` and move this
folder there before Phase 1. The proposed layout is in `repository-structure.md`.
