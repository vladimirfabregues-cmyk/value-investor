# Feasibility Assessment

Date: 2026-10-27. Based on the Phase 0 research in `protocol-research.md`, which was
gathered through search-index excerpts of official docs because the sandbox blocked
direct access.

## Verdict

**Feasible, with one scope change.** Build the MVP **holder-first** (start from
current positions in material markets and work outwards to the wallets' funding),
not chain-first (index every fill since 2022). With that change, the first success
criterion takes about **10–13 engineer-weeks** and the full spec about **5–6 months**
for one senior engineer. These are rough ranges.

What the product can claim: **high-precision discovery of a subset of multi-wallet
operators**, namely those whose wallets share on-chain control, or who fund or cash
out through private Polygon wallets. It **cannot** promise broad recall. Operators
who fund each wallet separately from exchanges or bridges leave no on-chain funding
link that this design can see. The UI must say that the absence of a cluster does not
establish independence.

## Why it is feasible

1. **Current exposure is cheap to get.** Data API v2 is documented as public. It
   returns up to **1,000 holders per outcome** (`/v2/holders`), market-wide positions
   (`/v2/positions?condition=`), and per-wallet trades and activity going back 3 years
   or more. Activity includes deposits, withdrawals and TIP (user-to-user pUSD)
   records. That is enough to rank aggregate exposure for any candidate cluster
   without an indexer.
2. **Funding relationships are plain ERC-20 logs.** pUSD, USDC.e and USDC `Transfer`
   events have indexed `from` and `to` topics, so each wallet's full funding and
   cash-out history can be fetched per address.
3. **Some explicit control evidence exists.** Legacy Proxy and Safe wallets are
   CREATE2-derived from the owner EOA. Deposit Wallets have explicit owners. Session
   keys are authorized and revoked on-chain. That supports real Grade-A must-links,
   such as one owner with both a legacy wallet and a Deposit Wallet, or a shared
   session signer.
4. **The analytics are classical and testable.** Capped evidence families,
   specificity weighting and average-linkage clustering need no ML. All of it can be
   unit-tested against the spec's synthetic scenarios A–E.
5. **Volumes fit Postgres** once scoped. The universe is about 10⁴–10⁵ wallets, and
   the edges and features for them fit easily. ClickHouse is needed only for the
   full fills index later.

## What makes it hard (ranked)

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| 1 | **Protocol churn.** Four on-chain generations so far: AMM, CLOB V1 (USDC.e), CLOB V2 (pUSD, 2026-04-28), and Protocol V2 (PositionManager, Exchange "v3", **new markets from 2026-11-02**). Data API v1 was retired on 2026-10-24 | Decoders and IDs break at upgrades | Versioned registry, `ledger` in every outcome key, decoder selection by emitter and ABI version, golden transactions per generation, DQ alarms on unknown topics |
| 2 | **Recall ceiling for funding evidence.** Bridge deposit addresses, exchanges and on-ramps carry no common-control signal, and cross-chain tracing is out of scope | Many real operators are missed | Precision-first by design. Disclose data completeness. Cross-chain tracing could be a later, separate project |
| 3 | **Per-address history cost on RPC.** Address-filtered `eth_getLogs` over blocks 4M to about 88M is cheap only if the provider allows wide block ranges. If chunked, it becomes infeasible (hundreds of millions of calls) | Phase 3a cost and time | Benchmark first (A-16). Behind the same adapter, use a provider "transfers by address" API (for example Alchemy `getAssetTransfers`, or Polygonscan `tokentx`), and cross-check samples against raw logs |
| 4 | **Timing semantics.** History has only settlement (block) time, and on-chain commit has been asynchronous since 2026-07-24. Match time exists only in live streams | Weaker temporal features, and no backfill of match time | Archive RTDS and market-WS frames from Phase 2. Never treat same-block settlement as coordination |
| 5 | **Shared signing platforms.** Builders may hold session keys for many unrelated customers | False Grade-A links | Signer-degree weighting, builder labels, alternative-explanation text (scoring-model §3.A) |
| 6 | **Unverified facts.** Every Phase 0 fact is an excerpt, not a live check (for example the V2 `OrderFilled` layout, Data API v2 maker/taker fields, the bridge hop shape, and a lookalike Proxy Factory address) | Wrong decoders | The Phase 2 and 3a verification checklist (`protocol-research.md` §11) is a blocking step |
| 7 | **Rate limits.** Data API v2 allows 800 requests per 10 s in general and 200–300 per 10 s on the heavy routes, per IP | Backfill of about 50k wallets takes hours | Run at 50% of budget. Incremental sync by cursor. A one-off initial backfill is fine |
| 8 | **Harm from false positives** (accusation by implication) | Reputational and legal | Fixed terminology and disclaimers, precision-first thresholds, analyst correction, reversible versioned clusters, no identity enrichment |
| 9 | **This environment** blocks Polymarket and RPC hosts, and has no Docker daemon | Phases 2+ cannot run here | Allow the hosts (implementation-plan §0). Run Docker locally or in CI |

## Recommended changes to the specification
1. **Holder-first ingestion** for Phases 2–7. Move the full fills index to Phase 3b,
   after the first success criterion (D-11).
2. Make the **`ledger` (CTF vs PositionManager)** and **protocol generation** part of
   every token and position key. Plan for Protocol V2 from day one, not as a "future
   upgrade" (D-03).
3. Add the address roles `DEPOSIT_WALLET`, `DEPOSIT_ADDRESS`, `EXCHANGE_OPERATOR`,
   `COLLATERAL_ONRAMP/OFFRAMP`, `COLLATERAL_ADAPTER`, `ROUTER`, `POSITION_MANAGER`,
   `INCIDENT` (D-14, D-18).
4. Treat **collateral wraps and unwraps** (USDC.e or USDC ↔ pUSD) as internal hops,
   never as funding (D-01).
5. Change specificity to `normalized log specificity × service factor (global degree
   probe) × label override` (D-07).
6. Extend **Grade C** to cover a single uncorroborated financial link (D-06).
7. **Archive real-time streams from Phase 2**, because match time cannot be backfilled
   (D-08).
8. Leave **Combos, Perps and Polymarket US** out of MVP scope explicitly, and report
   combo exposure as missing in data completeness (D-17).
9. Use the **Data API v2 only**. Never use the public Goldsky subgraphs (D-09, D-10).
10. Use a **dedicated repository** (D-13).
