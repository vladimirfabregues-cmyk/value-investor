# Protocol Research — Polymarket (Phase 0)

Retrieval date for every fact in this document: **2026-10-27**.

## 0. How this research was done, and how far to trust it

The Phase 0 sandbox's network policy refused connections to `docs.polymarket.com`,
`gamma-api.polymarket.com`, `data-api.polymarket.com`, `clob.polymarket.com` and
`polygon-rpc.com` (HTTP CONNECT 403). No page could be fetched directly and no live
API response or transaction could be inspected. All facts below come from a web-search
index of the official documentation, official GitHub repositories, and (where stated)
third-party sources.

Each fact carries a verification level:

| Level | Meaning |
|---|---|
| **O** | Official Polymarket source (docs.polymarket.com, help.polymarket.com, github.com/Polymarket), read through a search-index excerpt |
| **T** | Third-party source (indexers, data vendors, blogs, news) |
| **K** | Prior engineering knowledge, not re-confirmed on 2026-10-27 |
| **C** | Sources conflict; see the note |

**Nothing here has been checked against a live response or an on-chain transaction.**
The first task of Phase 2 and Phase 3 is to re-verify every **O**/**T**/**K** fact we
rely on directly (fetching the page, calling the endpoint, decoding a real
transaction) and to record the result in `docs/assumptions.md`. The contract registry
gives every address a `verification_status` for this reason (see `data-model.md`).

---

## 1. Product surfaces and scope

| Surface | What it is | In MVP scope? |
|---|---|---|
| Polymarket (global, polymarket.com) | Hybrid CLOB: matching happens off-chain and settles on Polygon PoS (chain 137) | **Yes** |
| Polymarket US (polymarket.us) | A separate CFTC-designated contract market with its own API (`api.polymarket.us`), API-key auth, and no public on-chain settlement data that we know of [O] | **No.** Do not mix the two data sets |
| Combos | Multi-leg parlay positions, priced by RFQ, live since 2026-05-29 [T: Dune docs]. Positions are YES/NO pairs built from legs [O] | **No.** Combos are tracked as a separate exposure type later |
| Perps | Perpetual futures launched 2026-09-03 [T: news]. Chain and settlement not confirmed | **No** |

---

## 2. Off-chain API inventory

### 2.1 Gamma API — market and event metadata
- Base URL: `https://gamma-api.polymarket.com` [O]
- Auth: none for public reads [O/T]
- Pagination: keyset endpoints `GET /markets/keyset` and `GET /events/keyset` take
  `after_cursor`. They reject `offset` with the error "offset is not allowed on keyset
  endpoints" [O]. The older offset-paginated `/markets` and `/events` still work but
  third parties report a 10,000 offset cap and a deprecation path [T]. **Use keyset only.**
- Profiles: `GET /public-profile?address=<0x…>` accepts a proxy wallet or user address
  and returns `createdAt`, `proxyWallet`, `pseudonym`, `name`, `profileImage`, `bio`,
  `xUsername`, `verifiedBadge`, `displayUsernamePublic`, `users`. Every field is
  nullable, and a malformed address returns 400 [O]. *Privacy note: we store only
  `proxyWallet`, `pseudonym`, `createdAt` and `verifiedBadge`. We never enrich `name`,
  `bio` or `xUsername` (see architecture §9).*
- Rate limits, per 10 s: general 4,000; `/events` 500; `/markets` 300; `/markets` +
  `/events` listing 900; `/public-search` 350; `/comments` and `/tags` 200 each [O,
  snippet may be about 5 months old].

### 2.2 Data API v2 — positions, trades, activity, holders
- Base URL: `https://data-api.polymarket.com/v2` [O]
- **Data API v1 was retired on 2026-10-24** [O]. Build against v2 only. Snapshot the
  migration guide (`/migrate/data-api-v1-to-v2`).
- Auth: [C] The v2 overview and `data-api.polymarket.com/v2/docs` say no API key or
  token is required and all data routes are public [O]. One search excerpt of the
  "List trades" page mentioned a bearer token or `AUTH_TOKEN` header. Treat the public
  answer as current, keep an optional bearer token in config, and verify in Phase 2.
- Pagination: **cursor only**. Read `pagination.next_cursor` and resend it as `cursor`.
  Sending `offset` returns 400. Cursors are signed, typed per endpoint and opaque. The
  trades, activity and combo-activity feeds use keyset cursors anchored on
  `(block_timestamp, sequence_id)`, so deep pages cost the same as shallow ones [O].
- Conventions: fields are snake_case. Markets are selected with `condition=`. A bare
  `size` is outcome shares, `_usdc` fields are USD, and `taker_`-prefixed volumes
  count one side. Null numerics mean unavailable, not zero. `outcome_index = 999`
  means the outcome could not be labelled [O].
- Throttling: HTTP 429 with `Retry-After`. Heavy queries may first wait briefly in a
  queue [O].
- Rate limits, per 10 s: v2 general 800; `/v2/trades` 300; `/v2/positions` and
  `/v2/positions/combos` 200; `/v2/activity` and `/v2/activity/combos` 200 [O].
  Third parties say the limits are per IP and shared, with no tiers [T].

| Endpoint | Purpose | Key facts |
|---|---|---|
| `GET /v2/trades` | Trade feed | Filters: `user`, `condition`, `event_id`. **Time window:** for `user`, an omitted `start` means 3 years back and an omitted `end` means now + 1 day. For `condition` or `event_id` the window is a fixed 3 years. **The unfiltered feed covers only the current and previous month** [O]. A malformed condition returns 400; a valid one with no trades returns empty `data` [O]. Fields seen in examples: `proxy_wallet`, `side`, `condition_id`, `size`, `price`, `timestamp`, `transaction_hash` [O, partial]. **Maker/taker attribution in v2 is unconfirmed.** v1 had `takerOnly`, default `true` [T] |
| `GET /v2/activity` | Per-account activity | Types (v1 enum): TRADE, SPLIT, MERGE, REDEEM, REWARD, CONVERSION, DEPOSIT, WITHDRAWAL, YIELD, MAKER_REBATE, TAKER_REBATE, REFERRAL_REWARD [O]. v2 adds **TIP**, a user↔user pUSD transfer that is not a trade-settlement leg. TIP is returned only when requested by name [O]. Deposits and withdrawals are **excluded by default**; pass `exclude_deposits_withdrawals=false` [O]. Ordered by `(block_timestamp, sequence_id)`. `start` and `end` are epoch seconds on block_timestamp; omitted or 0 means 3 years back, so **pass `start=1` for full history** [O]. On REDEEM rows, `size` is tokens burned for that row's outcome [O]. Block number in response: not confirmed |
| `GET /v2/positions` | Positions by user or market | One route for the whole lifecycle, filtered by `status` ∈ {OPEN, REDEEMABLE, REDEEMABLE_LOST, MERGEABLE, CLOSED}. `redeemable` and `mergeable` flags on each row. Pass the proxy wallet as `user`. **`condition` without `user` gives market-wide holders** [O] |
| `GET /v2/positions/combos` | Combo positions | Out of MVP scope |
| `GET /v2/holders` | Top holders per outcome | `condition` required (comma list). `limit` per outcome token: default 100, **max 1,000** (max 100 with `include_pnl=true`, single condition). `min_balance` applies after netting. Cursor paging after page 1 [O]. v1 `/holders` was capped at 20 [O] |
| `GET /v2/value` | Portfolio value | [O] |
| `GET /v2/oi` | Open interest | Used for relative materiality [O] |
| `GET /v2/tokens` | Resolve up to 50 ERC-1155 token IDs, or list every token of up to 10 conditions | Added 2026-09-04 [O]. Useful for token-ID validation |
| `GET /v2/leaderboard`, `/v2/biggest-winners`, `/v2/builders/leaderboard` | Rankings | `/v2/builders/leaderboard` helps label builders [O] |

### 2.3 CLOB API — order book and prices
- Base URL: `https://clob.polymarket.com` [O]
- Public, unauthenticated reads: `/book`, `/books`, `/price`, `/prices`, `/midpoint`,
  `/midpoints`, `GET /prices-history` (`market` = CLOB token ID, optional `startTs`,
  `endTs`, `interval`), and `POST /batch-prices-history` [O]. Allowed `interval`
  values and whether `fidelity` exists were not confirmed.
- Authenticated (L1 EIP-712 / L2 HMAC API keys): order placement and cancellation,
  and the account's **own** orders and trades only [O/K]. **Other users' trade history
  is not available from the CLOB.** Public trade history comes from the Data API and
  the chain.
- Rate limits, per 10 s: general 9,000; `/book`, `/price`, `/midpoint` 1,500 each;
  `/books`, `/prices`, `/midpoints` 500 each; `/prices-history` 1,000 [O snippet; T
  sources conflict on prices-history].
- **Async commit pipeline (2026-07-24):** `POST /order` and `POST /orders` no longer
  return `transactionHashes` for FAK/FOK matches and return `tradeIDs` instead [O].
  On-chain commit is asynchronous, so the gap between match and block is not constant.

### 2.4 WebSockets
| Channel | URL | Auth | Contents |
|---|---|---|---|
| CLOB market | `wss://ws-subscriptions-clob.polymarket.com/ws/market` [T] | None | L2 book, price changes, last trade price per asset ID. **No wallet identity** [T/K] |
| CLOB user | `.../ws/user` [O/T] | Required | Own orders and trades only |
| RTDS | `wss://ws-live-data.polymarket.com` [T] | None | `{"topic":"activity","type":"trades"}`, optionally filtered by `event_slug` or `market_slug`; unfiltered means all trades [O: official TS client]. Market-topic messages carry `timestamp` and `transactionHash` [O]. **Field list for activity/trades not confirmed.** Price topics reportedly moving to `wss://ws-live-v2.polymarket.com/ws` (PolyBolt) [T] |

Keepalive: text PING about every 10 s on CLOB channels and about every 5 s on RTDS [T].

### 2.5 Bridge API (deposits and withdrawals)
- Base URL: `https://bridge.polymarket.com` [O]
- `POST /deposit` with the Polymarket wallet returns **one deposit address per address
  type** (evm, svm, btc, tron/tvm). Each account has a **fixed deposit address tied to
  its profile**, and it differs per network [O].
- `GET /supported-assets` lists chains, tokens and minimums. Minimums change; live
  values win [O].
- Deposits are converted to **pUSD on Polygon** automatically. Native USDC or USDC.e
  are accepted [O].
- Withdraw: `/supported-assets`, then `POST /quote`, then `POST /withdraw` (wallet,
  chain, token, recipient) returns an address. Send pUSD to it and track with
  `/status/{address}`. Withdrawal addresses should be generated only at execution
  time [O]. When withdrawing, pUSD is unwrapped to USDC through the Collateral Offramp
  and swapped through a Uniswap v3 pool for native USDC. That pool can be exhausted [O].

### 2.6 Relayer (gasless transactions)
- `https://relayer-v2.polymarket.com/`. Polymarket pays gas, so **`tx.from` of relayed
  transactions is a Polymarket relayer EOA, not the user** [O].
- Relayer client transaction types: `SAFE` (default) and `PROXY` [O]. New API users
  are steered to deposit wallets [O].
- Safe wallets need `deploy()` before their first transaction. Proxy wallets deploy
  automatically on their first transaction [O].
- Builder tiers: Unverified 100/day, Verified 10,000/day, Partner unlimited relayer
  transactions [O]. Builders have relayer keys and builder codes.

---

## 3. Order-submission time vs. on-chain settlement time

| Timestamp | Where it is observable | Trust |
|---|---|---|
| Signed order `timestamp` (V2 order-struct field) | Exchange calldata (`matchOrders` arguments) | **Set by the client** and not proven. Upper-bounds nothing. Treat as a hint only |
| Match time | CLOB user channel (own orders only); CLOB market channel `last_trade_price` (no wallet identity); RTDS activity trades (fields unconfirmed) | Real-time capture only. **Not recoverable later** |
| Settlement time | `block_timestamp` of the transaction carrying `OrderFilled` | Authoritative for settlement. Data API v2 `timestamp` and its cursor are **block_timestamp** [O] |

Consequences:
1. Data API and on-chain timestamps describe settlement, not submission. Since the
   2026-07-24 async-commit change the match-to-block lag can vary.
2. Same-block settlement is a property of the operator's batching. It is **not**
   evidence of coordination (spec §16).
3. If we want match-time features later, we must capture the RTDS and market
   channels in real time from day one and archive the raw frames, because they cannot
   be backfilled. That is a cheap Phase 2 add-on; see the implementation plan.

---

## 4. Protocol generations (versioned contract registry seed)

Polymarket has had at least four on-chain generations. The registry must model all of
them; MVP backfill needs generations 2, 3 and 4. All on Polygon PoS, chain 137.

| Gen | Name | Active | Collateral | Outcome ledger | Exchange |
|---|---|---|---|---|---|
| 1 | AMM era (FixedProductMarketMaker) | 2020 to about 2022 | USDC.e [K] | CTF ERC-1155 | FPMM per market [K] |
| 2 | CLOB V1 | from block **33,605,403** (2022-09-26) [T] until the 2026-04-28 cutover | **USDC.e** `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` [K] | CTF `0x4D97DCd97eC945f40cF65F87097ACe5EA0476045` (from block 4,023,686 [T]) | CTF Exchange v1 `0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E` [O/T]; NegRisk CTF Exchange v1 `0xC5d563A36AE78145C45a50134d48A1215220f80a` (from block 50,505,492 [T]); NegRisk Adapter v1 `0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296` [O, "CLOB v1, deprecated"] |
| 3 | CLOB V2 | **2026-04-28 about 11:00 UTC** [O: help center] | **pUSD** `0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB` (proxy) [O] | CTF (same contract) | CTF Exchange v2 `0xE111180000d2663C0091e4f400237545B87B996B` (deployed at block 84,902,353 [T]); NegRisk CTF Exchange v2 `0xe2222d279d744050d28e00520010520000310F59` (block 85,058,176 [T]) [O] |
| 4 | **Protocol V2** | Canary markets 2026-10-05 to 10-30. **New markets route to V2 from 2026-11-02, tentatively** [T: several news outlets citing Polymarket] | pUSD only | **PositionManager** (ERC-1155) `0x006F54F7f9A22e0000CC2AB60031000000ae9fEF` [O] | Exchange ("v3") `0xe3333700cA9d93003F00f0F71f8515005F6c00Aa` [O; "v3" label is T] |

**Gen 3 supporting contracts** [O, ctf-exchange-v2 repo and contracts page]:
- CollateralOnramp `0x93070a847efEf7F70739046A929D47a521F5B8ee` wraps USDC.e (and USDC?) into pUSD
- CollateralOfframp `0x2957922Eb93258b93368531d39fAcCA3B4dC5854` unwraps pUSD into USDC
- CtfCollateralAdapter `0xADa100874d00e3331D00F2007a9c336a65009718`
- NegRiskCtfCollateralAdapter `0xAdA200001000ef00D07553cEE7006808F895c6F1`
- In V2, factory addresses are immutable constructor parameters of the exchange [O]

**Gen 4 (Protocol V2) contracts** [O: polymarket-v2-external README and contracts page]:

| Contract | Proxy | Implementation |
|---|---|---|
| PositionManager | `0x006F54F7f9A22e0000CC2AB60031000000ae9fEF` | `0xCc5De1e9D14a7AB75E872E23FC9D605518Bac2D0` |
| Exchange | `0xe3333700cA9d93003F00f0F71f8515005F6c00Aa` | `0x641b40ec414a076b9e79E703Fc7BF4EBEC248Bb7` |
| Router | `0x12121212006e4CD160D18e3f00711DA5c3372600` | — |
| BinaryModule (module id 1) | `0x1000008dD9001B968442c1000017eaE6E0dA00Ba` | — |
| NegRiskModule (module id 2) | `0x200000900045e3B6259600682756002200028933` | — |
| CombinatorialModule (module id 3) | `0x30000034706C7d8e12009DAB006Be20000c031A8` | `0xf96968a44022B17240B42c557693E7C383d2d8a3` |
| OracleAggregator (UMA + Chainlink per market) | `0x0A0a0A0A8B00C51b7D810501b03F230028C04a87` | `0x822e8A97AF8005073F2f6E88435D692E33ab6082` |

Protocol V2 facts [O unless marked]:
- PositionManager holds every outcome balance and routes each **Position ID** to its
  module. The Position ID encodes the module ID (8 bits) and outcome index (8 bits),
  plus market identity.
- **A CTF token ID and a Position ID are different identifier spaces.** Never send one
  to the other ledger. Both ledgers are ERC-1155 with the same economic meaning.
- The Router is the public entry for split, merge, redeem and module operations. Split
  needs pUSD approval to the Router; merge and redeem need PositionManager approval.
- **Existing CTF positions are not converted.** CTF support must stay for legacy
  markets. Per-condition migration exists on the Binary and NegRisk modules only after
  Polymarket registers the condition or event.
- Combo positions are not bridgeable [O].
- Lifecycle event names change: CTF `PositionSplit`, `PositionsMerge`,
  `PayoutRedemption` become V2 `PositionsSplit`, `PositionsMerged`, `PositionRedeemed`
  under the Binary, NegRisk or Combo scopes. **The names differ by one letter, so
  decoders must match by full signature and emitting contract, never by name.**
- [C] EIP-712 domain version: "2" for CTF Exchange V2, but the Protocol V2 section of
  the same page says "3". Read the deployed domain separator on-chain.

**Resolution / oracle contracts.** The UmaCtfAdapter connects CTF markets to UMA's
Optimistic Oracle. v2 and later add a bulletin board for clarifications [O]. Current
and historical adapter addresses were **not obtained**: one excerpt was garbled (41 hex
characters) and must not be used. Fill these from the contracts page in Phase 3.
Protocol V2 uses OracleAggregator.

**Incident (2026-05-22):** about $520k was drained from Polygon operational wallets
linked to the UMA adapter after a compromised six-year-old internal top-up key, per
news reports citing Polymarket's VP of Engineering. Contracts were not affected [T].
The involved addresses get an `INCIDENT` label so they do not look like private
funders.

---

## 5. Account-wallet architecture

### 5.1 Wallet types and signature types [O]

| SDK enum | Wallet | Who gets it | Deployment | Order signature |
|---|---|---|---|---|
| 0 `EOA` | Plain EOA | API traders trading directly | n/a | ECDSA |
| 1 `POLY_PROXY` | **Polymarket Proxy Wallet** (legacy) | Magic Link and Google login | Proxy Factory `0xaB45c5A4B0c941a2F231C04C3f49182e1A254052` [O]; deploys automatically on first tx | Standard sig over Exchange typed data |
| 2 `GNOSIS_SAFE` | **Safe Wallet** (legacy) | External signers (MetaMask, Rabby) | Gnosis Safe Factory `0xaacFeEa03eb1561C4e67d661e40682Bd20E3541b` [O]; `deploy()` before first tx | Standard sig |
| 3 `DEPOSIT_WALLET` (POLY_1271) | **Deposit Wallet** (current default) | **Accounts created on or after 2026-05-04** [O] | Deposit Wallet Factory `0x00000000000Fb5C9ADea0298D729A0CB3823Cc07`; Beacon `0x7A18EDfe055488A3128f01F563e5B479D92ffc3a` [O]; Implementation `0x58CA52ebe0DadfdF531Cde7062e76746de4Db1eB` [T]. Per-user ERC-1967 proxy [O] | ERC-1271, wrapped for **ERC-7739** (nested TypedDataSign under the Exchange domain). Maker and signer are both the wallet address on orders [T] |

**[C] Lookalike address warning.** A search result titled "Polymarket : Proxy Factory"
showed `0xaB45c54aB0C941A2f231c04C3f49182E1A254052`. It differs from the documented
`0xaB45c5A4B0c941a2F231C04C3f49182e1A254052` only in the order of the characters `a4`
and `4a`. Registry entries are verified by bytecode and the Polygonscan
verified-source name before use. Keep an address-poisoning check in data quality.

### 5.2 Ownership derivation
- Proxy and Safe factories use **CREATE2 with the owner EOA as salt**, so a wallet can
  be checked against an EOA [T: ChainSecurity audit]. Libraries expose
  `derive_proxy_address(owner)` and `derive_safe_address(owner)` [T].
- [C] Proxies created through the web UI with social login have been seen to differ
  from the locally derived CREATE2 address. **Use the Gamma `public-profile`
  `proxyWallet` as the account wallet, and treat CREATE2 derivation as a separate
  corroborating signal, not ground truth** [T: polymarket-cli issue].
- Safe owners can be read from the Safe's setup event and owner set at deployment [K].
  The exact proxy-factory and deposit-wallet-factory event signatures were **not
  obtained**. Get them from verified ABIs in Phase 3.
- One EOA can be the owner of a legacy Proxy or Safe **and** a new Deposit Wallet. That
  is the same signer migrating, which is a Grade-A must-link (see scoring-model.md).

### 5.3 Session keys (Deposit Wallets only) [O]
- The Deposit Wallet owner signs a typed-data authorization for a signer address with
  scopes (default ALL venues) and expiry. The relayer executes it. The authorization
  deadline needs at least 10 s of validity left.
- Expiry is about 180 days. The SDK wire value is **4,315 hours, about 5 h short of 180
  days** [O changelog + T]. Since SDK 0.8.1 a custom `validUntil` cannot be set.
- Revocation: `revokeSessionKey()` returns once the key leaves the active registry. The
  backend cancels orders and **finalises the on-chain revocation asynchronously**,
  within up to about 5 minutes. So authorizations and revocations are on-chain [O]
  (event names unknown).
- A session key **can trade but cannot withdraw** [O-adjacent: Polymarket VP Eng post].
- Authorizing a session key needs a **Builder API key** [O]. Session keys were in beta
  around 2026-08 [T].
- A dedicated migration flow from Safe and Proxy wallets to Deposit Wallets is planned [O].

**Analytical consequence.** A session signer shared by several wallets is strong
evidence of a **common operator (often software)** but not a common owner. Builders
(trading terminals, bots) may hold session keys for many unrelated customers, so
signer degree and builder attribution must reduce the weight (scoring-model §3.A).

### 5.4 Builders
- V2 orders carry a `builder` bytes32 code, and **every V2 `OrderFilled` emits it** [O].
- A shared builder code is **infrastructure, not evidence**. It is a penalty
  context (family G), never a positive signal.

---

## 6. Collateral, funding and cash-out flows on Polygon

| Flow | Expected on-chain shape | Level |
|---|---|---|
| Wrap to pUSD | USDC.e or USDC Transfer from the account wallet to the CollateralOnramp, then a pUSD mint/Transfer to the account wallet | O (onramp exists, accepts USDC.e); event names K |
| Direct Polygon funding | ERC-20 Transfer (USDC.e, USDC or pUSD) **from an external address to the account wallet**. Self-custody funding gives the strongest funder signal | K |
| Bridge deposit | Assets arrive at the account's **fixed per-profile deposit address**, are bridged or swapped, then arrive on Polygon as pUSD (or USDC first). The immediate Polygon sender is bridge or solver infrastructure | O (flow); exact hop shape **unknown** |
| Card / on-ramp (MoonPay etc.) | Sender is a provider hot wallet | K |
| Withdraw via Bridge | pUSD Transfer from the account wallet to a **per-request bridge withdrawal address**, then Offramp unwrap to USDC, then Uniswap v3 swap to native USDC, then bridged out | O |
| Direct withdrawal | pUSD/USDC Transfer from the account wallet to an external Polygon address | K |
| Tips | pUSD user↔user transfer outside trade settlement. Data API TIP type, opt-in | O |
| Split / merge / redeem | CTF or V2 lifecycle events plus collateral Transfer to and from the CTF/adapter/Router | O |

Consequences for the funding graph:
1. **Collapse internal hops.** Onramp/offramp wraps, collateral adapters, exchanges,
   the CTF, the Router and PositionManager are protocol plumbing (`PROTOCOL_CONTRACT`).
   They are never funders or destinations.
2. **Bridge deposit addresses** belong to the user's own account (`DEPOSIT_ADDRESS`
   role, linked to the account) or to bridge infrastructure. We must observe at least
   one real deposit to learn the hop shape before writing the funding tracer
   (assumption A-07).
3. **Bridge withdrawal addresses are generated per request.** A "shared cash-out
   destination" that is really a bridge withdrawal address must be linked to the
   bridge, not to a private wallet.
4. **Recall limit.** Any funding that arrives through bridges, exchanges or on-ramps
   is invisible to common-funder detection without cross-chain tracing, which is out
   of scope. The detector will find operators who fund from self-custody Polygon
   wallets and miss the rest. That limits recall, not precision (spec §37).

---

## 7. Events needed to reconstruct trades and positions

| Domain | Contract(s) | Events (decode by topic0 + emitter + registry ABI version) |
|---|---|---|
| Collateral | USDC.e, USDC, pUSD | ERC-20 `Transfer(address indexed from, address indexed to, uint256 value)` [K] |
| Outcome balances | CTF; PositionManager | ERC-1155 `TransferSingle`, `TransferBatch` [K/O] |
| Fills, CLOB V1 | CTF Exchange v1, NegRisk Exchange v1 | `OrderFilled` (8 fields: orderHash, maker, taker, makerAssetId, takerAssetId, makerAmountFilled, takerAmountFilled, fee) and `OrdersMatched` [K/T] |
| Fills, CLOB V2 | CTF Exchange v2, NegRisk Exchange v2 | `OrderFilled`, **10 fields**: adds `side` (BUY=0, SELL=1), a single `tokenId`, `builder` (bytes32), `metadata` (bytes32) [T, consistent with O builder docs]; `OrdersMatched` (takerOrderHash, takerOrderMaker, side, tokenId, amounts) [T]. **The V2 topic hash is not confirmed.** One paper's topic `0xd0a08e8c…` describes the V1 layout |
| Fills, Protocol V2 | Exchange (v3) | **Unknown.** Get from polymarket-v2-external ABIs |
| Lifecycle (CTF) | CTF, NegRisk Adapter | `ConditionPreparation`, `ConditionResolution`, `PositionSplit`, `PositionsMerge`, `PayoutRedemption` [O]. **The NegRisk adapter and CTF both emit split/merge for one action, so dedupe** [T: arXiv]. NegRisk conversions: `PositionsConverted` [K] |
| Lifecycle (V2) | Binary/NegRisk/Combinatorial modules, Router | `PositionsSplit`, `PositionsMerged`, `PositionRedeemed`, plus Router events for routed operations and collateral returns [O] |
| Wallets | Proxy Factory, Safe Factory, Deposit Wallet Factory, wallets | Deployment and owner events: **to be obtained**. Session-key authorize and revoke: **to be obtained** |
| Collateral wrap | Onramp, Offramp | Wrap/unwrap events: **to be obtained** |
| Fees | Exchanges | V2 charges fees on-chain at match time [O]. Event name not confirmed |

**Fill double counting [T: Paradigm, 2025-12].** Each match emits an `OrderFilled` per
maker order **and** one for the taker order, plus `OrdersMatched`. Summing all
`OrderFilled` roughly doubles volume. There is at most one match group per transaction
[T]. Canonical rule: one `TRADE_FILLED` per (wallet, order) fill. Market volume counts
one side only, and the counterparty is the matched order's maker. Golden-transaction
tests pin this.

**Settlement holder ≠ trader [T: Bitquery].** On most splits since 2025-09 the stakeholder
in `PositionSplit` is an exchange or adapter. Attribute lifecycle events to the account
by following the transaction's ERC-1155 and collateral transfers, not the event's
`stakeholder` field alone.

---

## 8. Third-party and bulk data sources (for backfill and reconciliation)

| Source | Status | Use |
|---|---|---|
| Goldsky public subgraphs (orderbook, positions, activity, pnl, OI) | Goldsky says Polymarket stopped using subgraphs after the V2 move, so **public endpoints return incomplete or incorrect data** [T: Goldsky docs] | **Do not use** |
| Goldsky Turbo pipelines, v2 datasets | Current; positions with average price and realized PnL [T] | Optional paid backfill accelerator |
| Dune curated `polymarket_polygon.*` (`market_trades`, `positions`, `market_details`, prices) | Covers V1 and V2 in the same tables since 2022-11, refreshed about every 24 h [T] | **Reconciliation baseline** for fills and positions (data quality) |
| Envio polymarket-v2-indexer, PaulieB14 V2 subgraphs and substreams, Bitquery | Community or vendor | Reference for ABIs and start blocks only |

Recommendation: the system of record is our own RPC ingestion plus the Data API, per
the spec. Dune is a periodic reconciliation check, not a dependency.

---

## 9. Polygon chain facts
- Chain ID 137. Bor blocks are about 2 s [K].
- **Finality:** since Heimdall v2 (2025-07) milestone finality is deterministic in
  about 2–5 s [O: Polygon docs]. Reorg depth is reportedly capped at about 2 blocks;
  attributions differ between Heimdall v2 and a 2026-04 "Giugliano" hardfork [T, C].
  Design: ingest at `latest`, mark `finality_status='unsafe'`, promote to `final`
  once at or below the RPC `finalized` block, and re-fetch and diff any unsafe range.
- **RPC:** a managed provider (Alchemy, QuickNode, Chainstack, Infura or other) set
  through `POLYGON_RPC_HTTP_URL` and `POLYGON_RPC_WS_URL`. `eth_getLogs` range and
  result caps differ by provider, so the ingestor adapts its block-range size.
  **Address-filtered ERC-20 logs** (`topics[1]` or `topics[2]` = wallet) make
  per-wallet funding history cheap without a full index.

## 10. Fees
- Taker-only fees on some markets; makers never pay [O]. Formula:
  `shares × rate × p × (1 − p)`. Category rates such as geopolitics 0 and crypto 0.07
  differ across sources. "Fee Structure V2" from 2026-03-30 [T, C]. Fees do not affect
  clustering. Store the fee field from `OrderFilled` for P&L.

---

## 11. Verification checklist for Phase 2 and Phase 3 (blocking items marked ★)

1. ★ Allow the network hosts listed in `implementation-plan.md` §0, then fetch
   `docs.polymarket.com/llms.txt` and snapshot every page we cite into
   `raw/docs/snapshot_date=…/`.
2. ★ Data API v2: confirm public access, the `/v2/trades` response schema, whether
   maker/taker is represented, and whether `block_number`, `log_index` or a sequence ID
   is returned for joining to the chain.
3. ★ Pull the verified ABIs for every registry contract (exchanges v1, v2, v3,
   PositionManager, modules, Router, onramp/offramp, adapters, factories, deposit
   wallet beacon/impl, pUSD). Compute topic0 hashes. Verify bytecode exists at each
   address and matches the verified source name. Read the EIP-712 domain separators.
4. ★ Decode one real transaction of each kind into golden fixtures: a V1 fill, a V2
   fill, a Protocol V2 fill, a NegRisk conversion, a split, a merge, a redemption, a
   bridge deposit, a bridge withdrawal, an onramp wrap, a Safe deploy, a Proxy deploy,
   a Deposit Wallet deploy, a session-key authorize and a session-key revoke.
5. Confirm the Protocol V2 cutover date (2026-11-02) and whether new markets on V2 get
   new condition IDs or market IDs in Gamma.
6. Confirm the RTDS `activity/trades` payload fields, wallet identity in particular.
7. Get the UMA CTF adapter version history and addresses.
8. Confirm whether one EOA can own more than one Deposit Wallet.

---

## 12. Source index (retrieved 2026-10-27)

Official Polymarket:
- Docs index: https://docs.polymarket.com/ · changelog: https://docs.polymarket.com/changelog · predictions changelog: https://docs.polymarket.com/changelog/predictions · SDK changelog: https://docs.polymarket.com/changelog/sdks
- Rate limits: https://docs.polymarket.com/api-reference/rate-limits
- Data API v2 overview: https://docs.polymarket.com/api-reference/data-api/overview · v2 docs: https://data-api.polymarket.com/v2/docs · v1→v2 migration: https://docs.polymarket.com/migrate/data-api-v1-to-v2
- Trades feed: https://docs.polymarket.com/api-reference/feeds/list-trades · account activity: https://docs.polymarket.com/api-reference/feeds/list-account-activity · holders: https://docs.polymarket.com/api-reference/markets/list-a-markets-top-holders · Data OpenAPI: https://docs.polymarket.com/api-spec/data-openapi.yaml
- Gamma keyset: https://docs.polymarket.com/api-reference/markets/list-markets-keyset-pagination · https://docs.polymarket.com/api-reference/events/list-events-keyset-pagination · profile: https://docs.polymarket.com/api-reference/profiles/get-public-profile-by-wallet-address
- CLOB prices history: https://docs.polymarket.com/api-reference/markets/get-prices-history · market WS: https://docs.polymarket.com/api-reference/wss/market · user WS: https://docs.polymarket.com/developers/CLOB/websocket/user-channel · RTDS: https://docs.polymarket.com/market-data/websocket/rtds
- CLOB V2 migration: https://docs.polymarket.com/v2-migration · exchange upgrade: https://help.polymarket.com/en/articles/14762452-polymarket-exchange-upgrade-april-28-2026
- Contracts: https://docs.polymarket.com/resources/contracts · https://docs.polymarket.com/resources/contract-addresses · onchain position data: https://docs.polymarket.com/resources/onchain-position-data · positions: https://docs.polymarket.com/trading/positions/how-positions-work · https://docs.polymarket.com/concepts/positions-tokens
- Wallets: https://docs.polymarket.com/trading/wallets-auth · deposit wallets: https://docs.polymarket.com/trading/deposit-wallets · session keys: https://docs.polymarket.com/trading/session-keys · place orders: https://docs.polymarket.com/trading/place-orders · proxy wallet: https://docs.polymarket.com/developers/proxy-wallet · gasless: https://docs.polymarket.com/trading/gasless · wallet activity: https://docs.polymarket.com/trading/wallet-activity
- Bridge: https://docs.polymarket.com/trading/bridge/deposit · https://docs.polymarket.com/trading/bridge/withdraw · https://docs.polymarket.com/trading/bridge/supported-assets
- Builders and fees: https://docs.polymarket.com/builders/fees · https://docs.polymarket.com/builders/tiers · https://docs.polymarket.com/trading/fees
- UMA resolution: https://docs.polymarket.com/developers/resolution/UMA
- GitHub: https://github.com/Polymarket/ctf-exchange-v2 · https://github.com/Polymarket/polymarket-v2-external · https://github.com/Polymarket/proxy-factories · https://github.com/Polymarket/contract-security · https://github.com/Polymarket/builder-relayer-client · https://github.com/Polymarket/real-time-data-client · https://github.com/Polymarket/py-clob-client-v2/issues/70

Third-party (T):
- Paradigm, volume double counting: https://www.paradigm.xyz/2025/12/polymarket-volume-is-being-double-counted
- Goldsky Polymarket status: https://docs.goldsky.com/chains/polymarket
- Dune curated tables: https://docs.dune.com/data-catalog/curated/prediction-markets/polymarket/overview
- The Graph Market (start blocks): https://thegraph.market/polymarket
- ChainSecurity ProxyWalletFactories audit: https://reports.chainsecurity.com/Polymarket/ChainSecurity_Polymarket_ProxyWalletFactories_Audit.pdf
- Polymarket CLI CREATE2 divergence: https://github.com/Polymarket/polymarket-cli/issues/14
- arXiv microstructure paper: https://arxiv.org/html/2604.24366v2 · 2024 election anatomy: https://arxiv.org/html/2603.03136v2
- Protocol V2 coverage: https://unchainedcrypto.com/polymarket-rebuilds-its-core-smart-contracts-with-protocol-v2-targets-nov-2-switchover/ · https://cryptobriefing.com/polymarket-protocol-v2-mainnet-switchover/
- Polygon finality: https://docs.polygon.technology/pos/concepts/finality/finality
- UMA-adapter key incident: https://crypto.news/polymarket-hit-zachxbt-flags-520k-uma-adapter-loss/
