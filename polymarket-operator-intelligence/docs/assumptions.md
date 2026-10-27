# Assumptions and Spec Discrepancies

Status: Phase 0 (2026-10-27). Each entry has an ID, the date it was raised and a
status. Entries are never deleted. When a fact is checked, update its status and add
the evidence.

Status values: `open` (unverified), `verified` (with evidence link), `revised`,
`rejected`.

## 1. Discrepancies between the specification and current Polymarket behaviour

| ID | Spec says or implies | Current documented behaviour | Decision | Status |
|---|---|---|---|---|
| D-01 | Stablecoin collateral is generic or USDC | Collateral is **pUSD** (`0xC011…2DFB`) since **2026-04-28**. USDC.e before that. Native USDC appears around withdrawals | Track all three tokens. Wraps and unwraps are internal hops, not funding | open |
| D-02 | One "Polymarket account wallet" | Four wallet types: EOA, legacy Proxy (Magic), legacy Safe, and **Deposit Wallet** (default for accounts created on or after 2026-05-04). Each has a different deployment, signing and ownership model | `wallet_type` on every account wallet. A per-type ownership resolver | open |
| D-03 | Outcomes have "token IDs" | From **2026-11-02** (tentative) new markets use **Protocol V2**: **PositionManager** Position IDs, a separate identifier space from CTF token IDs. Legacy CTF positions are not converted | Every outcome key is `(ledger, id)`. The registry carries the `PROTOCOL_V2` generation | open |
| D-04 | Session-key authorisations "where publicly observable" | Session keys exist **only for Deposit Wallets** (beta, around 2026-08). Authorization and revocation are relayed and finalised **on-chain**. Expiry is about 180 days (4,315 h). Keys cannot withdraw | Model as time-aware control edges. Event names still to be found | open |
| D-05 | Separate tables for fills, activity, position transfers, collateral transfers and so on | — | One `canon.canonical_events` spine with typed views. Fewer places for provenance to drift | decided |
| D-06 | Grade C = repeated behavioural or temporal coordination without a hard link | — | Grade C also covers **a single uncorroborated financial link**. Otherwise a lone shared private funder (a real lead) would have no grade above D | decided |
| D-07 | `specificity = log(N / (1 + degree))` | — | Kept as `spec_u`, normalized to [0,1], and multiplied by a **service factor** from a global degree probe and a label override. Degree within the universe alone understates exchanges | decided |
| D-08 | Distinguish order submission time from settlement time | Public history exposes only **block (settlement) time**. Data API v2 `timestamp` is block time. Match time is visible only in real-time streams. The V2 order struct has a **client-set** `timestamp` in calldata. Since 2026-07-24 on-chain commit is asynchronous | Store each timestamp kind separately (architecture §3.6). Archive RTDS and market-channel frames from Phase 2 so match time is available later | decided |
| D-09 | Use the Data API | **Data API v1 retired 2026-10-24.** v2 pages by cursor only; `offset` returns 400 | v2 only | decided |
| D-10 | (Older guides) use Polymarket subgraphs | Goldsky says the public subgraphs return incomplete or incorrect data after the V2 move | Do not use. Dune for reconciliation only | decided |
| D-11 | Phase 3 builds full Polygon ingestion before the funding graph | — | **Split Phase 3**: 3a targeted (per-wallet collateral transfers, wallet ownership and session events) feeds Phases 4–7. 3b (exchange fills across V1, V2 and V3, full lifecycle) moves after the first success criterion. See implementation-plan.md | proposed |
| D-12 | Sigma.js or Cytoscape.js | — | Cytoscape.js (investigative interaction, small subgraphs) | proposed |
| D-13 | Build in "the repository" | This repo is the unrelated Next.js app *The Value Investor* | Recommend a dedicated repo. Phase 0 docs live in `polymarket-operator-intelligence/` for now | **needs decision** |
| D-14 | Relayers are not evidence | Also: `matchOrders` is sent by Polymarket **operator** EOAs. Relayed wallet transactions have `tx.from` = relayer | Add `EXCHANGE_OPERATOR` label type. `tx_sender` is stored but never used as a relationship signal | decided |
| D-15 | Example "92/100 — Strong" | — | Bands are 0–19 Minimal, 20–39 Weak, 40–59 Moderate, 60–100 Strong | decided |
| D-16 | "Net exposure" | — | Binary: `net_directional_shares = YES − NO`, plus `hedged_pairs = min(YES, NO)`. NegRisk events stay per market in the MVP, and event-level netting comes later | decided |
| D-17 | Polymarket broadly | Polymarket US (CFTC venue, separate API), Combos (since 2026-05-29) and Perps (since 2026-09-03) exist | All three are out of MVP scope. Combo exposure is not counted in market exposure, and this is shown in data completeness | proposed |
| D-18 | Funding comes from external wallets | Each profile has **fixed per-network deposit addresses** (Bridge API), and deposits are auto-converted to pUSD. Bridge **withdrawal** addresses are generated per request | Add a `DEPOSIT_ADDRESS` label type, collapsed into the owning account. Bridge withdrawal addresses link to the bridge entity, with specificity 0 | open |
| D-19 | Volume from fills | Summing `OrderFilled` double-counts (maker and taker legs) | One `TRADE_FILLED` per wallet leg with `liquidity_role`. Market volume counts one side | decided |
| D-20 | `PositionSplit` events identify the trader | On most splits the stakeholder is an exchange or adapter. NegRisk adapter and CTF both emit | Attribute through the transaction's transfers. Dedupe adapter and CTF emissions | open |

## 2. Working assumptions (to verify in Phases 2–3)

| ID | Assumption | How to verify | Status |
|---|---|---|---|
| A-01 | Data API v2 is public and unauthenticated (one excerpt mentioned a bearer token) | Call `/v2/trades` and `/v2/holders` without auth | open |
| A-02 | `/v2/holders` and `/v2/positions` identify holders by **account wallet** (`proxy_wallet`), the same identity as `public-profile.proxyWallet` and the on-chain ERC-1155 holder | Compare for 50 holders: API vs `balanceOf` on CTF or PositionManager | open |
| A-03 | Data API v2 `timestamp` is block timestamp | Join to the chain on `transaction_hash` | open |
| A-04 | `public-profile.proxyWallet` is authoritative for the account, and CREATE2 derivation only corroborates | Measure the mismatch rate on a sample | open |
| A-05 | An EOA owns at most one wallet per type, but can own several types (legacy plus deposit) | Factory events and docs | open |
| A-06 | A universe of markets with OI ≥ $25k, using the top 1,000 holders per outcome, captures at least 95% of position value in those markets | Compare Σ holders' value against `/v2/oi` per market | open |
| A-07 | Bridge deposits arrive on Polygon from bridge or solver infrastructure (no common-control signal), possibly via the account's deposit address | Decode real deposits (golden fixtures) | open |
| A-08 | Midpoint is a fair valuation price, falling back to last trade, and both are recorded | — | decided |
| A-09 | Polygon reorgs are shallow (reports say ≤ 2 blocks), and the RPC `finalized` tag is reliable | Monitor the finality job's diff counts | open |
| A-10 | A 200k-block global degree probe separates services from private wallets | Check against the curated CEX list (recall of known hot wallets) | open |
| A-11 | Protocol V2 routes new markets from 2026-11-02 and CTF remains for legacy markets | Gamma market metadata after the cutover; registry | open |
| A-12 | The CLOB V2 `OrderFilled` has 10 fields (adds side, tokenId, builder, metadata) | Verified ABI plus golden transaction | open |
| A-13 | Session keys cannot withdraw, so cash-out flows reflect owner-level control | Docs plus observed transactions | open |
| A-14 | Polymarket relayer and operator EOAs can be listed from `tx.from` of calls to registry contracts | Frequency analysis over a block sample | open |
| A-15 | Rate limits are per IP. We use at most 50% of each published budget | Watch 429 rates | open |
| A-16 | Address-filtered `eth_getLogs` over the full chain history (blocks 4M–present) is affordable for about 10⁵ wallets × 3 tokens on a paid RPC plan | Run a 1k-wallet benchmark in Phase 3a | open |

## 3. Open questions for the product owner
1. **Repository:** create a dedicated repo (recommended), or continue in this folder?
2. **Network access:** allow the Polymarket and RPC hosts in the cloud environment (list
   in implementation-plan.md §0)?
3. **RPC provider and budget:** which provider (Alchemy, QuickNode, Chainstack,
   Infura…), which plan, and is there a spending cap?
4. **Users and auth:** internal analysts only, or external users? This decides OIDC
   provider, RBAC depth and whether any public endpoints exist.
5. **Hosting target** after local Docker Compose?
6. **Historical depth for the MVP:** full funding history for universe wallets (the
   proposal), and fills history only from the Data API (3 years per user)?
7. **Risk appetite on labels:** may we import third-party address labels (Polygonscan
   tags, vendor lists), or only curate our own with sources?
