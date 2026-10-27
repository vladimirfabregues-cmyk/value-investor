# Proposed Repository Structure

This is the target layout once all phases exist. Phase 1 creates the parts marked ●.
The rest appear in the phase named.

```
polymarket-operator-intelligence/
├── README.md                         ● quick start, links to docs
├── Makefile                          ● up/down/test/lint/typecheck/migrate/registry
├── docker-compose.yml                ● local stack (from docker-compose.proposal.yml)
├── .env.example                      ● documented variables, no secrets
├── .pre-commit-config.yaml           ●
├── .github/workflows/ci.yml          ● lint, typecheck, unit+integration tests, frontend build, pip-audit/npm audit, gitleaks
│
├── registry/                         ● the ONLY place contract addresses live
│   ├── contracts.yaml                ● versioned registry (chain, address, role, generation, abi_version, blocks, sources)
│   ├── abis/                         3a  verified ABIs, one file per abi_version
│   └── labels/                       4   curated service labels (cex.yaml, bridges.yaml, polymarket_infra.yaml), each entry with source URL
│
├── config/                           5   versioned analytics config (cos.yaml, clustering.yaml, materiality.yaml, priority.yaml, universe.yaml)
│
├── backend/
│   ├── pyproject.toml                ●
│   ├── Dockerfile                    ●
│   ├── alembic.ini                   ●
│   ├── migrations/versions/          ●
│   ├── src/poi/
│   │   ├── config.py  logging.py  db.py  cli.py          ●
│   │   ├── models/                   ● SQLAlchemy models per schema (ref, raw, gov, pm, canon, intel, analytics, alerts)
│   │   ├── registry/                 ● schema + loader;  3a verification (bytecode/ABI/topic0)
│   │   ├── raw/                      ● object store client, key layout
│   │   ├── jobs/                     ● queue, scheduler, worker
│   │   ├── sources/                  2   http (rate limit, retry, raw capture), gamma, data_api, clob, bridge, ws_rtds, ws_market;  3a rpc
│   │   ├── decode/                   3a  erc20, erc1155, wallet factories, session keys;  3b exchanges v1/v2/v3, ctf, negrisk, pm_v2 modules, router
│   │   ├── canonical/                2/3a normalisers → canonical_events; reconciliation keys
│   │   ├── ingest/                   2   market sync, universe build, wallet sync;  3a transfer sync, finality
│   │   ├── intel/                    4   classification, labels, degree probe, funding tracer, edges + evidence
│   │   ├── analytics/
│   │   │   ├── candidates.py         5
│   │   │   ├── features/             5   funding, cashout, direct, control;  8 temporal, behavioural
│   │   │   ├── scoring/              5   cos (families, guardrails, grades, explanations)
│   │   │   ├── clustering/           6   clu (must-link, agglomeration, lineage)
│   │   │   ├── exposure.py           6
│   │   │   ├── materiality.py        7
│   │   │   ├── episodes.py           9
│   │   │   └── anomaly.py            9
│   │   ├── alerts/                   7   triggers, priority, dedupe, state machine
│   │   ├── dq/                       2+  checks registry → data_quality_results
│   │   ├── store/                    2+  read repositories (Postgres now, ClickHouse later)
│   │   └── api/
│   │       ├── main.py               ●
│   │       ├── security.py           2   auth, RBAC, rate limiting, headers
│   │       └── routes/               ● health, registry;  2 markets;  4 wallets, graph;  5 pairs;  6 clusters;  7 alerts;  dq, models
│   └── tests/
│       ├── unit/                     ●
│       ├── integration/              ●
│       ├── golden/                   3a/3b  recorded tx + receipt + logs → exact decoded canonical events
│       ├── fixtures/                 2+  recorded API pages (sanitised), synthetic graphs
│       └── scenarios/                5   synthetic scenarios A–E (spec §38)
│
├── frontend/
│   ├── package.json  Dockerfile      ●
│   ├── app/                          ● status page;  2 markets/[id];  4 wallets/[address];  6 clusters/[id];  7 dashboard, alerts/[id];  dq
│   ├── components/                   2+  tables, score cards (component scores always visible), evidence lists, disclaimers
│   ├── components/graph/             4   Cytoscape wallet graph (expand hop, filters, hide infra, focus cluster)
│   ├── components/charts/            2   ECharts price/exposure/accumulation
│   └── lib/api.ts                    ●   typed client (generated from OpenAPI in Phase 2)
│
└── docs/
    ├── protocol-research.md  architecture.md  data-model.md  scoring-model.md
    ├── assumptions.md  implementation-plan.md  repository-structure.md
    └── adr/                          1+  one ADR per significant decision (0001-postgres-first, 0002-holder-first, …)
```
