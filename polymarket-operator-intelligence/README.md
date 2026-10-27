# Polymarket Operator Intelligence

An analytics platform that looks for Polymarket wallets showing observable evidence
of **common operational control**, estimates their **aggregate exposure** by market,
and explains why the wallets are believed to be related. It does not identify
beneficial owners and makes no claims about non-public information.

**Status: Phase 0 (research and design) is complete. Waiting for approval before Phase 1.**

> This folder sits inside the unrelated `value-investor` repository for now. The
> recommendation is to move it to its own repository before Phase 1
> (see `docs/assumptions.md`, D-13).

## Documents

| Document | Contents |
|---|---|
| [docs/feasibility.md](docs/feasibility.md) | Verdict, ranked risks, recommended spec changes |
| [docs/protocol-research.md](docs/protocol-research.md) | Current Polymarket APIs, contracts, wallets, collateral and events, each with source and verification level (retrieved 2026-10-27) |
| [docs/architecture.md](docs/architecture.md) | Holder-first pipeline, components, raw layer, registry, finality, time semantics, security |
| [docs/data-model.md](docs/data-model.md) | PostgreSQL schemas and tables, canonical event spine, ClickHouse readiness |
| [docs/scoring-model.md](docs/scoring-model.md) | Common Operator Score, grades, clustering, exposure, Material Position Score, anomaly score, alert priority (v0 defaults) |
| [docs/assumptions.md](docs/assumptions.md) | Spec-vs-reality discrepancies, working assumptions, open questions |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Phase sequencing, effort ranges, exact Phase 1 plan and acceptance criteria |
| [docs/repository-structure.md](docs/repository-structure.md) | Target layout |
| [docker-compose.proposal.yml](docker-compose.proposal.yml) | Local stack proposal (postgres, minio, api, worker, web) |

## Verification caveat

The Phase 0 sandbox could not reach `docs.polymarket.com`, the Polymarket APIs or a
Polygon RPC. All protocol facts were gathered through search-index excerpts and are
marked with a verification level. Re-verifying them against live responses and real
transactions is the first, blocking step of Phases 2 and 3a.
