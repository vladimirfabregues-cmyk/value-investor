# Data Model — Polymarket Operator Intelligence

Status: Phase 0 proposal (2026-10-27). PostgreSQL 16, migrations by Alembic.
The schema will change, but the concepts in spec §31 are kept. Columns marked *(P1)*
ship in the Phase 1 migration.

## 0. Conventions
- **Schemas**: `ref` (registry and config), `raw` (raw object index), `chain`
  (blocks, transactions, logs), `pm` (Polymarket domain), `canon` (canonical events),
  `intel` (addresses, labels, graph), `analytics`, `alerts`, `gov` (governance, audit,
  DQ, jobs).
- **Addresses**: `text`, lowercase, `CHECK (addr ~ '^0x[0-9a-f]{40}$')`. A domain type
  `evm_address` wraps this.
- **Hashes**: `text` with `^0x[0-9a-f]{64}$` (domain `bytes32_hex`).
- **Token amounts**: raw integer units `numeric(78,0)` plus `decimals smallint`. USD:
  `numeric(24,6)`. Prices: `numeric(12,8)`. Floats are never used for money.
- **Token and position IDs**: `numeric(78,0)` together with a `ledger` column
  (`CTF` | `PM_V2`). The ledger is part of every outcome-token key, because a CTF
  token ID and a Protocol V2 Position ID are different identifier spaces.
- **Time**: `timestamptz` (UTC). Block timestamps are stored as given.
- **Provenance on every derived row**: `run_id`, `model_version` or `decoder_version`,
  `created_at`. Raw-backed rows also carry `raw_object_id`.
- **Soft history**: analytical outputs are append-only per run. "Current" views
  select the latest successful run. Nothing analytical is updated in place except
  alert state.

---

## 1. `ref` — registry and configuration

### `ref.chains` *(P1)*
`chain_id int PK`, `name`, `native_symbol`, `block_time_ms_hint`, `finality_mode`
(`rpc_finalized_tag`).

### `ref.contracts` *(P1)*
| column | type | notes |
|---|---|---|
| contract_id | bigserial PK | |
| chain_id | int FK | |
| address | evm_address | |
| role | text | enum below |
| protocol_generation | text | `AMM`, `CLOB_V1`, `CLOB_V2`, `PROTOCOL_V2`, `INFRA` |
| abi_version | text | e.g. `ctf_exchange@2.0.0` |
| deployment_block | bigint | null if unknown |
| active_from_block / active_from_ts | bigint / timestamptz | the cutover can differ from deployment |
| retired_at_block / retired_at_ts | bigint / timestamptz | null while active |
| proxy_kind | text | `none`, `erc1967`, `beacon`, `minimal`, … |
| implementation_of | bigint FK self | implementation rows point at the proxy |
| verification_status | text | `unverified`, `bytecode_checked`, `source_verified` |
| sources | jsonb | `[{"url":…, "retrieved":"2026-10-27", "level":"O"}]` |
| registry_version | text | content hash of contracts.yaml at load |
| UNIQUE (chain_id, address, abi_version) | | |

Roles: `CTF`, `POSITION_MANAGER`, `CTF_EXCHANGE`, `NEGRISK_CTF_EXCHANGE`, `EXCHANGE`
(Protocol V2), `ROUTER`, `MODULE_BINARY`, `MODULE_NEGRISK`, `MODULE_COMBINATORIAL`,
`NEGRISK_ADAPTER`, `CTF_COLLATERAL_ADAPTER`, `NEGRISK_COLLATERAL_ADAPTER`,
`COLLATERAL_TOKEN` (pUSD), `STABLECOIN` (USDC.e, USDC), `COLLATERAL_ONRAMP`,
`COLLATERAL_OFFRAMP`, `PROXY_WALLET_FACTORY`, `SAFE_FACTORY`,
`DEPOSIT_WALLET_FACTORY`, `DEPOSIT_WALLET_BEACON`, `DEPOSIT_WALLET_IMPL`,
`UMA_CTF_ADAPTER`, `ORACLE_AGGREGATOR`, `FPMM_FACTORY`.

### `ref.contract_abis` *(P1)*
`abi_version PK`, `abi jsonb`, `source_url`, `sha256`, `events jsonb`
(precomputed `{topic0: signature}`).

### `ref.decoder_versions` *(P1)*
`decoder_version PK` (`<role>@<abi_version>#<code_version>`), `abi_version FK`,
`code_version` (git SHA), `introduced_at`, `notes`.

### `ref.config_versions` *(P1)*
`config_version PK` (hash), `kind` (`scoring`, `alerting`, `universe`, `labels`),
`body jsonb`, `created_at`, `created_by`. Every analytics run references the config
versions it used.

---

## 2. `raw` — immutable raw index

### `raw.raw_objects` *(P1)*
`raw_object_id bigserial PK`, `object_key text UNIQUE`, `sha256`, `bytes`, `source_system`
(`gamma`, `data_api_v2`, `clob`, `bridge`, `polygon_rpc`, `rtds`, `clob_ws`, `docs`),
`endpoint`, `request_params jsonb`, `http_status`, `fetched_at`, `run_id`,
`content_type`, `compression`.

### `raw.contract_logs_raw`
One row per log as received (also inside the raw object): `chain_id`, `block_number`,
`block_hash`, `tx_hash`, `log_index`, `address`, `topics text[]`, `data text`,
`removed bool`, `raw_object_id`, `finality_status`. PK
`(chain_id, block_hash, log_index)`. Keying on block_hash keeps orphaned versions
after a reorg.

---

## 3. `chain` — minimal Polygon data
- `chain.blocks`: `chain_id, block_number, block_hash, parent_hash, timestamp,
  finality_status, observed_at`. Only blocks we touch, not the whole chain.
- `chain.transactions`: `tx_hash PK, block_number, from_addr, to_addr, nonce, value,
  input_selector, status, gas_used, effective_gas_price, raw_object_id`, fetched on
  demand for transactions that carry evidence.
- `chain.decode_failures`: `chain_id, tx_hash, log_index, address, topic0,
  decoder_version, error, raw_object_id, created_at`, which feeds DQ.

## 4. `pm` — Polymarket domain
- `pm.events`: `event_id` (Gamma), `slug`, `title`, `category`, `neg_risk bool`,
  `start_ts`, `end_ts`, `status`, `ledger`, `raw_object_id`, `first_seen`, `last_seen`.
- `pm.markets`: `market_id` (Gamma), `condition_id`, `question_id`, `event_id`, `slug`,
  `question`, `category`, `ledger` (`CTF` | `PM_V2`), `protocol_generation`,
  `neg_risk`, `active`, `closed`, `resolved_outcome`, `resolution_ts`, `end_ts`,
  `volume_usd`, `liquidity_usd`, `raw_object_id`, `snapshot_ts`. Snapshots are
  append-only in `pm.market_snapshots`, which also holds OI from `/v2/oi`.
- `pm.market_outcomes`: `market_id`, `outcome_index`, `outcome_label`.
- `pm.outcome_tokens`: `ledger`, `token_id numeric(78,0)`, `market_id`, `condition_id`,
  `outcome_index`, `module_id` (PM_V2), `validated_via` (`gamma`, `v2_tokens`,
  `onchain`). PK `(ledger, token_id)`.
- `pm.price_points`: `ledger, token_id, ts, price, source` (`clob_prices_history`,
  `midpoint`, `last_trade`), `raw_object_id`.
- `pm.position_snapshots`: `snapshot_ts, account_wallet, ledger, token_id, market_id,
  outcome_index, shares numeric, avg_price, cur_price, value_usd, status, source`
  (`data_api_v2_positions`, `data_api_v2_holders`, `onchain_balance`), `run_id`,
  `raw_object_id`.
- `pm.wallet_profiles`: `account_wallet PK, proxy_wallet, pseudonym, created_at,
  verified_badge, fetched_at, raw_object_id`. *Privacy: `name`, `bio` and
  `x_username` are not stored by default.*
- `pm.wallet_deployments`: `account_wallet, wallet_type` (`PROXY`, `SAFE`,
  `DEPOSIT_WALLET`, `EOA`), `factory`, `owner_eoa`, `deploy_tx`, `deploy_block`,
  `derivation_check` (`create2_match`, `mismatch`, `n/a`), `evidence_event_id`.
- `pm.session_authorisations`: `account_wallet, signer, scopes jsonb,
  authorized_block, authorized_tx, expires_at, revoked_block, revoked_tx,
  evidence_event_ids`, a time-aware control relation.
- Fills, activity, position transfers, lifecycle events and collateral transfers
  live in `canon.canonical_events`, with typed views (`pm.fills_v`,
  `pm.collateral_transfers_v`, `pm.position_lifecycle_v`, …). This replaces the
  separate tables in spec §31 so the model stays single-sourced.

## 5. `canon.canonical_events` — the event spine

Partitioned by month on `block_timestamp` (or `api_timestamp` when there is no block).

| column | type | notes |
|---|---|---|
| event_id | bytes32_hex PK | deterministic hash (architecture §3.4) |
| event_type | text | see enum |
| chain_id | int | |
| block_number, block_hash | bigint, text | |
| block_timestamp | timestamptz | settlement time |
| api_timestamp | timestamptz | as served by an API |
| observed_at | timestamptz | real-time capture time |
| signed_order_timestamp | timestamptz | client-asserted, from calldata |
| transaction_hash, log_index | text, int | |
| leg | smallint | distinguishes multiple wallet legs in one log |
| account_wallet | evm_address | the Polymarket account this event is about |
| counterparty | evm_address | |
| signer | evm_address | order signer / session signer when known |
| tx_sender | evm_address | usually a relayer. **Never used as a relationship signal** |
| builder_code | text | V2 `builder` bytes32 |
| ledger | text | `CTF`, `PM_V2` |
| market_id, condition_id | text | |
| token_id | numeric(78,0) | |
| outcome_index | smallint | |
| side | text | `BUY`, `SELL` |
| liquidity_role | text | `maker`, `taker`, `unknown` |
| price | numeric(12,8) | |
| quantity | numeric(38,6) | shares |
| amount_raw / token_address / decimals | numeric(78,0) / evm_address / smallint | for transfers |
| usd_value | numeric(24,6) | |
| fee_usd | numeric(24,6) | |
| source_system | text | `polygon_rpc`, `data_api_v2`, `rtds`, … |
| decoder_version | text | for chain events |
| reconciliation_key | text | joins API and chain observations |
| finality_status | text | `unsafe`, `final`, `n/a` (API-only) |
| ingested_at | timestamptz | |
| raw_object_id | bigint FK | raw_payload_reference |
| run_id | bigint | |

`event_type` enum: `TRADE_FILLED`, `ORDERS_MATCHED`, `TOKEN_TRANSFERRED` (ERC-20),
`ACCOUNT_FUNDED`, `ACCOUNT_WITHDREW`, `COLLATERAL_WRAPPED`, `COLLATERAL_UNWRAPPED`,
`POSITION_TRANSFERRED` (ERC-1155), `POSITION_SPLIT`, `POSITION_MERGED`,
`POSITION_CONVERTED` (NegRisk), `POSITION_REDEEMED`, `TIP_SENT`, `REWARD_RECEIVED`,
`WALLET_DEPLOYED`, `OWNER_SET`, `SESSION_SIGNER_AUTHORIZED`, `SESSION_SIGNER_REVOKED`,
`CONDITION_RESOLVED`.

`ACCOUNT_FUNDED` and `ACCOUNT_WITHDREW` are **derived** from `TOKEN_TRANSFERRED` by
the funding tracer. It collapses protocol hops (onramp, offramp, adapters) and
records the derivation in `derived_from_event_ids`.

Indexes: `(account_wallet, block_timestamp)`, `(counterparty, block_timestamp)`,
`(condition_id, block_timestamp)`, `(transaction_hash)`, `(reconciliation_key)`.

---

## 6. `intel` — addresses, labels, graph

### `intel.addresses`
`address PK`, `chain_id`, `is_contract bool`, `bytecode_hash`, `first_seen_block`,
`first_seen_ts`, `universe_member bool`, `universe_degree int`,
`global_degree_probe int`, `global_degree_probe_at`, `effective_type`,
`effective_type_version`.

### `intel.label_sources`
`label_source_id PK`, `name` (`registry`, `curated_cex_list`, `polygonscan_tag`,
`heuristic_degree`, `analyst`, `polymarket_api`), `kind`, `url`, `trust_rank`.

### `intel.address_labels`
| column | notes |
|---|---|
| label_id PK | |
| address | |
| label | free text, e.g. "Binance hot wallet 3" |
| label_type | `POLYMARKET_ACCOUNT`, `DEPOSIT_ADDRESS`, `EOA`, `OWNER_SIGNER`, `SESSION_SIGNER`, `EXCHANGE`, `CUSTODIAN`, `BRIDGE`, `ONRAMP_PROVIDER`, `RELAYER`, `EXCHANGE_OPERATOR`, `WALLET_FACTORY`, `PROTOCOL_CONTRACT`, `BUILDER`, `MARKET_MAKER`, `INCIDENT`, `UNKNOWN_PRIVATE_WALLET` |
| label_source_id | |
| source_ref | URL, tx hash, decision ID |
| confidence | 0–1 |
| status | `asserted`, `probable`, `rejected` |
| valid_from / valid_to | |
| service_entity_id | groups addresses of one service (e.g. one CEX) |
| created_at / updated_at / created_by | |

### `intel.service_entities`
`service_entity_id PK`, `name`, `kind` (`cex`, `bridge`, `onramp`, `builder`,
`polymarket_infra`, `market_maker`), `infra_penalty_class`.

### `intel.graph_edges`
| column | notes |
|---|---|
| edge_id PK | |
| src_node / dst_node | an address, or `cluster:<id>` for cluster nodes |
| edge_type | `FUNDED`, `WITHDREW_TO`, `TRANSFERRED_TO`, `TRANSFERRED_POSITION_TO`, `DEPLOYED_BY`, `OWNED_BY`, `AUTHORIZED_SESSION`, `REVOKED_SESSION`, `SHARES_FUNDING_SOURCE`, `SHARES_CASHOUT_DESTINATION`, `TEMPORALLY_COORDINATED_WITH`, `BEHAVIOURALLY_SIMILAR_TO`, `TRADED_AGAINST` |
| directed bool | |
| first_seen / last_seen | |
| valid_from / valid_to | control edges |
| transaction_count | |
| total_value_usd | |
| confidence | 0–1 |
| specificity | 0–1 (scoring-model §2) |
| via_node | for SHARES_* edges, the shared source or destination |
| evidence_ids | bigint[] → edge_evidence |
| derivation_version | |
| run_id | |

### `intel.edge_evidence`
`evidence_id PK`, `edge_id`, `canonical_event_id`, `role_in_edge`
(`funding_leg_a`, `funding_leg_b`, …), `amount_usd`, `block_timestamp`, `note`.

---

## 7. `analytics`
- `analytics.universe_runs`: which markets and wallets were in scope, thresholds used,
  `config_version`.
- `analytics.wallet_features`: `account_wallet, run_id, feature_set_version, features
  jsonb, coverage jsonb` (for example `{"funding_history_complete": true,
  "trades_window_days": 1095}`).
- `analytics.pair_candidates`: `(wallet_a < wallet_b), run_id, reasons text[],
  first_reason_edge_ids`.
- `analytics.pair_features`: `pair, run_id, feature_set_version, features jsonb`.
- `analytics.pair_scores`: `pair, run_id, model_version, score smallint (0–100),
  band` (`Weak`, `Moderate`, `Strong`, `Very strong`), `grade` (A–D),
  `family_points jsonb, penalties jsonb, valid_period tstzrange,
  data_completeness numeric`.
- `analytics.score_explanations`: `pair, run_id, line_no, sign, points, family,
  text, evidence_ids`. These are the "+26 shared low-degree private funder" lines.
- `analytics.cluster_versions`: `cluster_version_id PK, run_id, model_version,
  config_version, created_at, parent_version_id, stats jsonb`.
- `analytics.clusters`: `cluster_id` (stable public number, like #184),
  `cluster_version_id`, `status` (`active`, `split`, `merged`, `rejected`),
  `cluster_score`, `grade`, `size`, `lineage jsonb` (predecessor IDs with Jaccard).
- `analytics.cluster_members`: `cluster_id, cluster_version_id, account_wallet,
  member_confidence, join_reason, is_must_link bool, valid_period`.
- `analytics.cluster_evidence`: `cluster_id, cluster_version_id, evidence_kind,
  edge_ids, pair_ids, summary_text`.
- `analytics.cluster_market_exposure`: `cluster_id, cluster_version_id, as_of,
  market_id, condition_id, outcome_index, shares, value_usd, cost_basis_usd,
  gross_usd, net_directional_shares, largest_wallet_usd, largest_wallet,
  wallet_count, fragmentation_ratio, hhi, pct_outside_largest, pct_of_oi,
  pct_of_liquidity, accumulated_24h_usd`.
- `analytics.position_episodes`: `episode_id, cluster_id or account_wallet,
  market_id, outcome_index, entry_start, entry_end, avg_entry_price,
  peak_exposure_usd, price_after jsonb ({"1h":…, "6h":…, "24h":…, "3d":…, "7d":…}),
  mfe, mae, resolution, realised_pnl, baseline_refs jsonb`.
- `analytics.market_anomalies`: `market_id, as_of, kind, metrics jsonb, run_id`.

## 8. `alerts`
- `alerts.alerts`: `alert_id, alert_type` (`COORDINATED_LARGE_POSITION`,
  `RAPID_ACCUMULATION`, …), `dedupe_key` (cluster, market, outcome, type),
  `cluster_id, cluster_version_id, market_id, outcome_index, opened_at, updated_at,
  state` (`new`, `triaged`, `under_review`, `dismissed`, `escalated`, `closed`),
  `common_operator_score, evidence_grade, material_position_score,
  trading_anomaly_score, priority, priority_formula_version, snapshot jsonb`
  (the exact numbers shown), `data_completeness, model_versions jsonb`.
- `alerts.alert_events`: state transitions and re-scores (append-only).

## 9. `gov`
- `gov.model_versions`: `model_version PK, kind` (`common_operator`, `materiality`,
  `anomaly`, `priority`, `clustering`), `code_version, config_version, description,
  created_at, approved_by`.
- `gov.runs` *(P1)*: `run_id PK, job_name, started_at, finished_at, status,
  code_version, registry_version, config_versions jsonb, counts jsonb, error`.
- `gov.jobs` *(P1)*: the queue (`job_id, kind, payload, priority, run_after, attempts,
  locked_by, locked_at, status, last_error`).
- `gov.ingest_checkpoints` *(P1)*: `source, stream_key, cursor text, block_number,
  updated_at, run_id`.
- `gov.data_quality_results` *(P1)*: `check_id, check_version, run_id, scope,
  status` (`pass`, `warn`, `fail`), `metric numeric, threshold, details jsonb,
  created_at`.
- `gov.analyst_decisions`: `decision_id, kind` (`must_link`, `cannot_link`,
  `label_assert`, `label_reject`, `cluster_split`, `cluster_reject`,
  `alert_disposition`), `subject jsonb, rationale, analyst_id, created_at,
  superseded_by`.
- `gov.audit_logs` *(P1)*: `audit_id, actor, action, resource, request_id, ip_hash,
  before jsonb, after jsonb, at`.
- `gov.users`, `gov.roles`, `gov.user_roles`: the RBAC foundation.

## 10. ClickHouse readiness
`canon.canonical_events`, `pm.position_snapshots`, `pm.price_points`,
`analytics.wallet_features` and `analytics.pair_features` are append-only with
deterministic keys and no foreign keys out of them. They can be mirrored to
ClickHouse unchanged. Readers go through a repository layer (`poi.store.events`), so
swapping the backend for a query family is local.
