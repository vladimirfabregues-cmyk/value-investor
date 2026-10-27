# Implementation Plan

Status: Phase 0 complete (2026-10-27). **Waiting for approval before Phase 1.**

## 0. Prerequisites (blockers for Phase 2 and later, not for Phase 1)

1. **Network allowlist** for the cloud environment. Phase 0 could not reach any of these:
   - `docs.polymarket.com` (verification and doc snapshots)
   - `gamma-api.polymarket.com`, `data-api.polymarket.com`, `clob.polymarket.com`, `bridge.polymarket.com`
   - `ws-subscriptions-clob.polymarket.com`, `ws-live-data.polymarket.com` (and possibly `ws-live-v2.polymarket.com`)
   - the chosen Polygon RPC host (for example `polygon-mainnet.g.alchemy.com`)
   - optional: `api.polygonscan.com` (verified ABIs), `api.etherscan.io` (v2 multichain)
2. **Polygon RPC credentials**: an HTTP URL and a WS URL as environment secrets.
3. **Repository decision** (assumptions.md §3, question 1).

## 1. Phase overview and sequencing

The order serves the **first success criterion** (spec §42) as early as possible.
Effort assumes one senior engineer working full-time. These are planning ranges, not
commitments.

| Phase | Deliverable | Exit criteria | Effort |
|---|---|---|---|
| **1 Foundation** | Repo, backend skeleton, frontend skeleton, Postgres + MinIO, migrations, registry loader, raw store, logging, health, tests, CI | §2 acceptance list passes | 3–5 days |
| **2 Polymarket ingestion** | Gamma markets and events (keyset), Data API v2 holders, positions, trades, activity (deposits, withdrawals and tips included), OI, profiles, CLOB prices and books. Checkpoints. RTDS and market-WS archiver (raw only). Market list and market page showing real data | Verified A-01…A-03, A-06. 7 days of continuous ingestion with no unhandled 429s. Pagination-completeness DQ checks green | 1.5–2 weeks |
| **3a Targeted Polygon** | Registry verification (bytecode, ABI, topic0). Address-filtered ERC-20 transfer sync for universe wallets (USDC.e, USDC, pUSD). Wallet deployment, owner and session-key decoding. tx and receipt fetch on demand. Finality job. Golden fixtures for transfers, wraps, deploys and session events | Golden tests green. A-07, A-12, A-16 resolved. Reorg simulation test green | 1.5–2 weeks |
| **4 Funding graph** | Funding tracer (first and major funding, hop collapse, one-hop expansion), address classification, degrees, edges and evidence, cash-out and direct transfers. **Wallet page plus graph UI (Cytoscape)** | Entering a wallet shows its funding sources and cash-out destinations with evidence transactions | 2 weeks |
| **5 Pair scoring** | Candidate generation, pair features (B, C, D, plus A from 3a), COS cos-0.1, grades, explanations. Synthetic scenarios A–E as tests | All five scenario tests pass. Every score has an explanation that adds up | 1.5 weeks |
| **6 Clustering and exposure** | clu-0.1, versioning and lineage, member confidence, analyst split and reject, cluster page, cluster × market exposure, fragmentation | **Milestone 1:** the market page shows top wallet vs top cluster | 1.5 weeks |
| **7 Large-position alerts** | MPS, triggers, alert generation, dedupe and state, dashboard, alert page, disclaimers | **First success criterion** answered from live data | 1.5 weeks |
| 3b Fills index | V1, V2 and Protocol V2 exchange decoding, lifecycle events, Paradigm dedupe, API-vs-chain reconciliation, Dune spot checks. ClickHouse decision | Reconciliation within tolerance for sampled markets | 2 weeks |
| 8 Behavioural analytics | Families E and F (co-trading permutation test, surge dampening, similarity), copy-trading and builder dampening | Scenario C test strengthened with real-data replay | 2 weeks |
| 9 Anomaly engine | Position episodes, horizons, matched baselines, TAS | **Second success criterion**; the third only after a reliability review | 3–4 weeks |
| 10 Real-time | Incremental exposure from RTDS and chain head, real-time alerts | p95 alert latency under 2 min from settlement | 2–3 weeks |

The first success criterion takes about **10–13 engineer-weeks**. The full spec scope
takes about **5–6 months**.

## 2. Phase 1: exact plan

### 2.1 What will be built
A runnable, tested skeleton with **no external data access**. Phase 1 needs only
package registries and Docker images.

### 2.2 Files

```
polymarket-operator-intelligence/
  README.md                       # quick start
  Makefile                        # up, down, test, lint, typecheck, migrate, fmt
  docker-compose.yml              # promoted from docker-compose.proposal.yml
  .env.example                    # every variable documented, no secrets
  .pre-commit-config.yaml         # ruff, ruff-format, mypy, gitleaks, end-of-file, eslint/prettier for frontend
  .github/workflows/ci.yml        # backend: ruff, mypy, pytest (postgres + minio services); frontend: lint, typecheck, build
  registry/
    contracts.yaml                # seeded from protocol-research.md §4–5, verification_status: unverified
    abis/README.md                # ABIs arrive in Phase 3a
  backend/
    pyproject.toml                # uv-managed; python 3.12; fastapi, pydantic v2, pydantic-settings, sqlalchemy 2,
                                  # alembic, psycopg[binary] 3, structlog, boto3, httpx, tenacity, pyyaml, eth-utils
                                  # dev: pytest, pytest-asyncio, factory-boy, ruff, mypy, types-*
    Dockerfile                    # multi-stage, non-root user
    alembic.ini
    migrations/versions/0001_foundation.py
    src/poi/
      __init__.py
      config.py                   # Settings (env-only), validated; secrets as SecretStr
      logging.py                  # structlog JSON, request_id/run_id contextvars
      db.py                       # engine/session factory
      models/ref.py gov.py raw.py # SQLAlchemy models for Phase-1 tables
      registry/schema.py          # pydantic model of contracts.yaml
      registry/loader.py          # validate + upsert → ref.contracts, registry_version hash
      raw/store.py                # put_raw(): gzip JSON → S3 key layout, sha256, raw_objects row
      jobs/queue.py               # Postgres SKIP LOCKED queue (enqueue/claim/complete/fail)
      jobs/worker.py              # worker loop + heartbeat job
      api/main.py                 # FastAPI app factory, security headers, CORS allowlist
      api/routes/health.py        # /health/live, /health/ready (db + object store), /version
      api/routes/registry.py      # GET /api/v1/contracts (filter by role/generation)
      cli.py                      # `poi registry load|validate`, `poi raw put-test`, `poi worker`
    tests/
      conftest.py                 # postgres + minio fixtures (env-provided in CI, compose locally)
      unit/test_config.py
      unit/test_registry_schema.py   # address format, checksum, no duplicate (chain,address,abi), ranges sane
      unit/test_no_address_literals.py  # fails if 40-hex literals appear outside registry/ and tests/fixtures/
      unit/test_raw_keys.py
      unit/test_validation.py        # address/condition/token-id validators
      integration/test_migrations.py # upgrade head → downgrade base → upgrade head
      integration/test_registry_load.py
      integration/test_raw_store.py
      integration/test_job_queue.py  # concurrent claim does not double-process
      integration/test_health_api.py
  frontend/
    package.json                  # next, react, typescript, eslint; (echarts/cytoscape added later)
    Dockerfile
    app/layout.tsx, app/page.tsx  # status page: API health + registry table
    lib/api.ts                    # typed fetch wrapper
  docs/                           # these Phase 0 docs, updated
```

### 2.3 Phase 1 migration (`0001_foundation`)
Schemas `ref`, `raw`, `gov`. Tables: `ref.chains`, `ref.contracts`,
`ref.contract_abis`, `ref.decoder_versions`, `ref.config_versions`,
`raw.raw_objects`, `gov.runs`, `gov.jobs`, `gov.ingest_checkpoints`,
`gov.data_quality_results`, `gov.audit_logs`. Domain types `evm_address` and
`bytes32_hex`. Seed `ref.chains` (137).

### 2.4 Commands (documented in README)
```bash
cp .env.example .env
make up            # docker compose up -d --build  (postgres, minio, minio-init, api, worker, web)
make migrate       # alembic upgrade head (also run by api on start in dev)
make registry      # poi registry load registry/contracts.yaml
make test          # pytest (unit + integration)
make lint typecheck
open http://localhost:3000   # frontend status page
curl localhost:8000/health/ready
```

### 2.5 Acceptance criteria
1. `make up` from a clean checkout brings every service healthy (compose healthchecks).
2. `/health/live` returns 200. `/health/ready` returns 200 only when Postgres and MinIO
   are reachable, and 503 otherwise (tested).
3. The migration round trip (up, down, up) passes.
4. The registry loads, `GET /api/v1/contracts?generation=CLOB_V2` returns the seeded
   entries with `verification_status=unverified`, and loading twice is idempotent
   (same `registry_version`).
5. `put_raw` writes a gzip object whose key follows the layout and records the sha256
   in `raw_objects`. Writing an identical payload twice yields two raw_objects rows
   that point at one content hash.
6. The job queue: two workers claiming concurrently never get the same job.
7. ruff, mypy (strict for `poi.*`), pytest, frontend lint, typecheck and build are all
   green in CI.
8. No secrets in the repo (gitleaks).

### 2.6 Explicitly not in Phase 1
No calls to Polymarket or Polygon. No canonical events, analytics or UI beyond the
status page.

## 3. Phase 2 preview (so Phase 1 interfaces fit)
- `sources/http.py`: a shared httpx client with a token-bucket rate limiter backed by
  Postgres, tenacity retries honouring `Retry-After`, and raw capture of every page
  **before** parsing.
- Cursor handling is generic (`next_cursor` / `after_cursor`) with checkpoints per
  (endpoint, key).
- DQ checks: pagination completeness (a page count of zero after a non-null cursor
  is a warning), staleness per market, schema drift (unknown fields are logged and
  their counts tracked).
- Day-one RTDS and market-WS archiver (raw JSONL to MinIO). It is cheap, and match-time
  data cannot be recovered later.
