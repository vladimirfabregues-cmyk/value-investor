# Scoring Model — v0 proposal

Status: Phase 0 proposal (2026-10-27). Every number below is a **configurable,
versioned default**, not a calibrated value. Version tags: `cos-0.1` (Common Operator
Score), `clu-0.1` (clustering), `mps-0.1` (Material Position Score), `tas-0.1`
(Trading Anomaly Score), `ap-0.1` (Alert Priority).

The three primary dimensions are **independent** and always shown separately:

| Score | Question it answers | It does NOT answer |
|---|---|---|
| Common Operator Score (COS), 0–100 | How strongly does observable evidence support **common operational control** of these wallets during this period? | Whether one natural person owns them |
| Material Position Score (MPS), 0–100 | How economically significant is this (cluster-)position in this market? | Whether it is suspicious |
| Trading Anomaly Score (TAS), 0–100 | How unusual is the activity relative to matched baselines? | Whether anyone holds non-public information |

COS is an **evidence support score, not a probability**. The UI shows
"Common-control support: 84/100 — Strong", never "84% probability".

---

## 1. Evidence units and families

A **signal** is one observation, such as "wallet A and wallet B were both funded by
address S". Signals that describe **the same underlying event** become one
**evidence unit**, and their extra detail (same amount, two minutes apart) only
**modifies** that unit. Units are grouped into families, and every family has a cap.

| Family | What | Cap (points) |
|---|---|---|
| A | Control / signing | 60 |
| B | Funding relationships | 35 |
| C | Cash-out relationships | 30 |
| D | Direct wallet interactions | 25 |
| E | Temporal coordination | 15 |
| F | Behavioural similarity | 10 |
| — | Corroboration bonus (B and C, or B and D) | +15 |
| G | Shared-infrastructure and alternative-explanation penalties | −30 |
| H | Contradictory evidence | −40, or veto |

**Within-family combination** (diminishing, so correlated units cannot pile up): sort
the unit points u₁ ≥ u₂ ≥ … and set

```
family = min(cap, u₁ + 0.5·u₂ + 0.25·u₃ + 0.125·u₄ …)
```

**Total:** `COS = clamp(round(A + B + C + D + E + F + bonus − G − H), 0, 100)`

**Guardrails:**
1. Unless A, B, C or D contributes at least 10, **COS is capped at 45**. Behaviour and
   timing alone can never reach "Strong" (spec §17, §37).
2. Data completeness below 0.5 caps COS at 55 and adds a visible flag.
3. An analyst cannot-link decision for the pair **vetoes** it: COS = 0, kept in history.

(No extra guardrail is needed for a lone financial family. Without timing or
behavioural support (E + F < 5) it tops out near 40, which is Moderate. Reaching
Strong takes a second financial family plus the corroboration bonus, or near-maximal
timing and behaviour evidence: 35 + 15 + 10 = 60.)

**Bands:** 0–19 Minimal · 20–39 Weak · 40–59 Moderate · 60–100 Strong. Bands and
grades are separate dimensions. The band says how much evidence there is, and the
grade says what kind.

---

## 2. Source specificity

The principle from spec §13: a low-degree private source is informative, and a
high-degree shared service is not. Three factors:

```
d_u  = distinct universe account wallets that the source funded (or received from), within the lookback window
d_g  = distinct counterparties of the source in a global probe window (default 200k blocks ≈ 4.6 days, capped at 1000)
N    = number of account wallets in the reference universe

spec_u   = clamp( ln(N / (1 + d_u)) / ln(N / 2), 0, 1 )           # spec formula, normalised so d_u = 1 → 1.0
service  = clamp( 1 − ln(max(d_g,25)/25) / ln(20), 0, 1 )        # 1.0 at ≤25 counterparties, 0 at ≥500
label    = 0     if effective type ∈ {EXCHANGE, CUSTODIAN, BRIDGE, ONRAMP_PROVIDER, RELAYER,
                                       EXCHANGE_OPERATOR, PROTOCOL_CONTRACT, WALLET_FACTORY, BUILDER, DEPOSIT_ADDRESS*}
           0.3   if MARKET_MAKER
           0.5   if an unregistered contract (could be a smart account, multisig or DEX aggregator)
           1     otherwise
specificity = spec_u × service × label
```
\*A `DEPOSIT_ADDRESS` belonging to the account itself is collapsed into the account,
and the funding tracer looks one hop behind it.

Why both degrees: `d_u` alone **understates** an exchange hot wallet that happens to
have funded only three of our wallets, and `d_g` catches it. `d_g` alone would penalise
a genuine operator wallet that is busy elsewhere, which is why `service` decays slowly.
A private source with `d_u ≥ 50` also gets a proposed heuristic label "probable
service" for analyst review. It is never asserted automatically.

---

## 3. Family definitions (cos-0.1)

### A. Control / signing (cap 60). These are also must-link candidates.
| Unit | Points | Notes |
|---|---|---|
| Same **owner EOA** controls both account wallets (Proxy, Safe or Deposit Wallet ownership from factory or setup events; CREATE2 derivation agrees where applicable) | 60 | The usual case is one user with a legacy Safe or Proxy plus a new Deposit Wallet. UI note: "same owner signer; beneficial ownership not established" |
| Shared **session signer** with overlapping validity intervals | 50 × signer_factor | `signer_factor` = 1 if the signer is authorized on ≤ 5 wallets, decaying linearly to 0.2 at ≥ 50. If the signer belongs to a labelled BUILDER, the unit is capped at 10 and "shared trading platform" is added to alternative explanations (spec scenario D) |
| Shared co-owner of multi-owner Safes | 40 | |
| Order signer of A is the owner or session signer of B | 50 | |

Control edges count only for the period they were valid. A session key authorized
today says nothing about trades from last year.

### B. Funding (cap 35)
One unit per shared source S (direct, or one private hop back):
```
unit = 30 × specificity(S) × share × timing  (+ modifiers, unit cap 35)
share  = sqrt( min(f_a, f_b) )      f_x = fraction of wallet x's external inbound USD that came from S
timing = 1.0 if first funding of a and of b from S is ≤ 24h apart; 0.8 ≤ 7d; 0.6 ≤ 30d; 0.4 otherwise
modifiers: +4 amounts within 5% (or identical round amounts); +3 both start trading within 48h of funding;
           +up to 5 for repeated funding rounds to both
two-hop source: × 0.6, and the intermediate hops must be private wallets with specificity ≥ 0.5
```

### C. Cash-out (cap 30)
This mirrors B for outbound flows: shared **private destination** D, consolidation of
redeemed proceeds, repeated sends.
`unit = 26 × specificity(D) × share_out × timing (+ modifiers, cap 30)`. Bridge
withdrawal addresses are generated per request and always link to the bridge
(specificity 0).

**Corroboration bonus** `= min(15, 0.25 × (B + C + D))`, granted only when B ≥ 12 and
(C ≥ 10 or D ≥ 10): a common private funder **and** a common private destination or
direct interaction is substantially stronger than either alone (spec §14). Capital
recycling (S funds a and b and later receives from both) qualifies.

### D. Direct interactions (cap 25)
| Unit | Points |
|---|---|
| Collateral transfer a↔b outside trade settlement (including TIP) | 10 × amount_factor (0.3 at $10, 1.0 at ≥ $1k, log scale) |
| Round trip a→b→a, or repeated bidirectional transfers | +8 |
| Outcome-token (ERC-1155) transfer a→b outside exchange settlement | 12 |
| Repeatedly matched as each other's counterparty, beyond what their share of market volume predicts | up to 6 |

### E. Temporal coordination (cap 15)
- **Co-trades**: a and b trade the same token on the same side within Δ (default 60 s,
  by block time). Co-trades inside one transaction or block-batch artefact count once.
- **Baseline:** a circular-shift permutation test that shifts b's trades within the
  same market-day, which preserves each wallet's intensity and the market's activity.
  It gives a p-value.
- `points = 15 × clamp((−log10 p − 2) / 4, 0, 1)`, requiring at least 5 co-trades
  spread over at least 3 distinct markets **or** days. This stops one news event
  from driving the score (spec scenario C).
- **Surge dampening:** co-trades in windows where the market trade rate is at least
  5× its trailing baseline are weighted 0.2.
- Extra small units: activation within 1 h for two new wallets in a quiet window (+3);
  coordinated redemptions or withdrawals within 10 min on at least 2 occasions (+4).

### F. Behavioural similarity (cap 10)
Transparent components: IDF-weighted Jaccard of markets traded, Wasserstein distance
between log trade-size distributions, recurring identical non-round trade sizes, cosine
similarity of hour-of-week activity, and holding-period distribution distance. Their
mean becomes a similarity S. `points = 10 × clamp((pct(S) − 0.90) / 0.10, 0, 1)`,
where pct is the percentile among all candidate pairs in the run.

### G. Infrastructure and alternative-explanation penalties (up to −30)
| Condition | Effect | Explanation line |
|---|---|---|
| Both trade predominantly through the same builder code | E and F × 0.3 | "−x common builder infrastructure" |
| Possible copy trading: b follows a with a 1–30 s lag in the same direction, and a is a leaderboard or high-visibility wallet | E × 0.3 | "−x possible copy trading" |
| Both labelled MARKET_MAKER | E and F × 0.3 | "−x market-making pattern" |
| Shared session signer with a high-degree signer | (handled in A) | "−x shared signing platform" |
| Incomplete data (completeness c) | −min(10, 10 × (1 − c)) | "−x incomplete historical data" |

Dampening is reported as a negative explanation line equal to the points it removed,
so the explanation still adds up to the score.

### H. Contradictory evidence (up to −40, or veto)
- Analyst cannot-link: veto.
- Funding from S came only after both wallets had long, independent histories, and S
  has moderate degree (an OTC or P2P desk pattern): −10.
- Considered and rejected for v0: opposite-side positions are **not** treated as
  contradictory, because operators hedge.

---

## 4. Evidence grades

| Grade | Rule (cos-0.1) | Meaning |
|---|---|---|
| **A** | Family A ≥ 40 | An explicit cryptographic or contractual control relationship (shared owner signer or session signer). Beneficial ownership is still not established |
| **B** | Financial (B + C + D) ≥ 25 **and** independent corroboration (a second financial family ≥ 10, or E + F ≥ 5) | A strong financial relationship backed by independent evidence |
| **C** | E + F ≥ 12 with no financial link, **or** a single financial family ≥ 15 without corroboration | Uncorroborated coordination. *The "single uncorroborated financial link" half is an extension of spec §20; see assumptions D-06* |
| **D** | COS ≥ 15 otherwise | A weak investigative lead |
| — | COS < 15 | Not shown as related |

---

## 5. Explanation output (every pair, every cluster)

```
Common-control support: 78/100 — Strong          (model cos-0.1, run 1932, completeness 0.70)
Positive evidence:
  +30  shared low-degree private funder 0xab…12 (specificity 0.91, funded 4 wallets in 38 min,
       amounts within 5%)                                                                       [evidence: 6 tx]
  +21  common private consolidation wallet 0x9c…e0 (specificity 0.88)                            [evidence: 9 tx]
  +13  corroboration: common funder and common destination
  +12  repeated coordinated execution (17 co-trades, 6 markets, p=2e-5) and similar activation   [evidence: 34 fills]
   +5  behavioural similarity (market overlap, trade-size profile; 96th percentile)
Penalties:
   −3  incomplete historical data (completeness 0.70: one wallet's pre-2026 funding history not yet backfilled)
Evidence grade: B
Alternative explanations: shared fund manager · professional trading operation · common automated strategy
This indicates observable evidence of common operational control. It does not establish beneficial ownership.
```
Each line is a `score_explanations` row with `evidence_ids` pointing to `edge_evidence`
and then to canonical events and raw objects.

---

## 6. Clustering (clu-0.1): conservative, not transitive closure

1. **Graph:** nodes are universe account wallets. Edges are pairs with COS ≥ 55 and
   grade A or B. **Must-links** are A-family ≥ 40 edges valid in the analysis period,
   plus analyst must-links. **Cannot-links** are analyst decisions.
2. **Seeds:** connected components of must-links.
3. **Agglomeration** in descending edge score. Merge clusters X and Y only if all of
   these hold:
   - no cannot-link between X and Y;
   - **average linkage**: the mean COS over all pairs in X × Y, **counting pairs with no
     score as 0**, is at least 40 (at least 50 once the merged size exceeds 20);
   - **internal density**: after the merge, at least 60% of member pairs have COS ≥ 30.
4. **Member confidence** = the mean COS to the other members, missing pairs as 0, and
   must-link pairs as 100. Members below 35 are ejected and recorded as rejected
   candidates.
5. **Cluster score** = average-linkage COS over members. **Cluster grade** = the
   weakest grade on the cluster's maximum spanning tree, since the cluster is only as
   strong as its weakest necessary link.
6. **Versioning:** each run writes a new `cluster_version`. A new cluster inherits a
   previous cluster's public ID if their Jaccard overlap is at least 0.5. Otherwise it
   gets a new ID. Splits and merges are recorded in `lineage`. Wallet records are
   never merged.

Spec scenario E check: the chain A–B 80, B–C 60, C–D 60 with no other pairs. Merging
{A,B} with {C} gives mean(A–C = 0, B–C = 60) = 30 < 40, so it is rejected. Result:
cluster {A,B} only. C and D might form their own cluster if their pair qualifies.

---

## 7. Exposure and fragmentation (per cluster × market × outcome)

```
shares_o          = Σ_wallets shares in outcome o
value_o           = shares_o × price_o               (midpoint; last trade as fallback, source recorded)
max_payout_o      = shares_o × $1
cost_basis_o      = Σ avg_price × shares             (from Data API positions)
hedged_pairs      = min(shares_yes, shares_no)       (binary; mergeable for $1 each)
net_directional   = shares_yes − shares_no           (sign = direction)
gross_usd         = Σ_o value_o
largest_wallet    = max_w value_{w,o}
fragmentation     = value_o / largest_wallet
hhi               = Σ_w (value_{w,o} / value_o)²,   effective_wallets = 1 / hhi
pct_outside_largest = 1 − largest_wallet / value_o
pct_of_oi         = value_o / market OI   (/v2/oi; flagged "n/a" if unavailable)
pct_of_liquidity  = value_o / book depth within ±5¢ of mid (CLOB /book)
accumulated_24h   = Δ value from position snapshots over 24h
```
NegRisk multi-outcome events are reported per market in the MVP. Event-level netting
(YES on one candidate ≈ NO on the rest) is a later feature. The "fragmentation"
wording is fixed: we report **position fragmentation**, never "threshold evasion".

---

## 8. Material Position Score (mps-0.1) and triggers

Components, each 0–100 and each shown:
| Component | Formula |
|---|---|
| absolute | `100 × clamp(log10(value / 10k) / 2, 0, 1)` ($10k → 0, $100k → 50, $1M → 100) |
| oi_share | `100 × clamp(pct_of_oi / 0.15, 0, 1)` |
| liquidity | `100 × clamp(pct_of_liquidity / 2, 0, 1)` |
| participant_rank | `100 × (1 − (rank − 1) / max(1, n_holders_cluster_adjusted − 1))` |
| speed | `100 × clamp((accumulated_24h / volume_24h) / 0.25, 0, 1)` |
| concentration | `1 − minority_side_value / gross_usd` (0–1 multiplier) |

`MPS = (0.30·absolute + 0.25·oi_share + 0.15·liquidity + 0.15·participant_rank + 0.15·speed) × (0.5 + 0.5·concentration)`

**Triggers** (any one, configurable): aggregate value ≥ $100k · pct_of_oi ≥ 5% ·
pct_of_liquidity ≥ 50% · accumulated_24h ≥ $50k **and** ≥ 10% of 24h volume · value ≥ 3×
the cluster's 90-day median episode peak.

## 9. Trading Anomaly Score (tas-0.1), Phase 9, defined now so the schema is ready
Components (each a percentile against **matched baselines**: same market category,
similar liquidity, similar prevailing price, similar time-to-resolution): directional
size, accumulation speed, wallet newness or dormancy break, exposure concentration,
departure from the cluster's own history, and post-entry repricing at 1h/6h/24h/3d/7d
relative to the market's realised volatility. The pre-repricing components exclude
entries within ±30 min of known public catalysts where those can be identified.
TAS stays at 0, displayed as "not computed", until Phase 9.

Fixed disclaimer, rendered with every TAS: **"Unusual activity does not establish
possession of non-public information."**

## 10. Alert Priority (ap-0.1)
- **Gate** (all of these): cluster COS ≥ 55, cluster grade A or B, and at least one
  materiality trigger. Grade-C clusters may raise only a low-priority
  `COORDINATION_LEAD` alert.
- `priority = 0.40·COS + 0.40·MPS + 0.20·TAS`. Bands: P1 ≥ 80, P2 ≥ 65, otherwise P3.
- The dedupe key is (cluster_id, market_id, outcome, alert_type). A re-score updates
  the alert and appends an `alert_events` row.
- Fixed alert footer: **"This alert identifies unusual coordinated trading activity. It
  does not establish insider trading, market manipulation, or common beneficial
  ownership."**

## 11. Expected behaviour on the synthetic scenarios (spec §38)
| Scenario | Mechanism that produces the expected result |
|---|---|
| A: 4 wallets with a shared private funder and a shared private destination | With N = 50k and d_u = 4, specificity ≈ 0.91. B ≈ 27 + 7 = 34, C ≈ 19, bonus ≈ 13, E ≈ 5, so COS ≈ 71: Strong, grade B, one 4-wallet cluster (all pairs share the funder, so average linkage holds) |
| B: 100 wallets funded by one exchange | `label = 0` and `service ≈ 0`, so B = 0. Guardrail 1 caps COS at 45 even if timing looks similar. No cluster |
| C: independent wallets trading together after news | Surge dampening plus the ≥ 3-markets/days requirement give E ≈ 0. No financial families, COS < 25 |
| D: one session signer operating several wallets | A = 50 × signer_factor, so grade A and must-link. UI shows "common operator; beneficial ownership not established". If the signer is a labelled builder, the unit is capped at 10 and a platform explanation is shown |
| E: chain of weak relationships A–B–C–D | The average-linkage and density rules stop the 4-wallet cluster (§6) |

## 12. Calibration (later)
No probabilities until there is a labelled set. Analyst decisions (must-link,
cannot-link, dispositions) accumulate as labels. We track precision@k on Strong pairs
and run ablations per family. Weights change only through a new `model_version` with
a written rationale.

## 13. Default configuration (stored in `ref.config_versions`)
```yaml
cos:
  version: cos-0.1
  caps: {A: 60, B: 35, C: 30, D: 25, E: 15, F: 10, bonus: 15, G: 30, H: 40}
  diminishing: [1.0, 0.5, 0.25, 0.125]
  guardrails: {no_hard_link_cap: 45, low_completeness: {below: 0.5, cap: 55}}
  bands: {minimal: 0, weak: 20, moderate: 40, strong: 60}
  specificity: {global_probe_blocks: 200000, global_probe_cap: 1000, service_floor: 25, service_zero: 500,
                market_maker_factor: 0.3, unknown_contract_factor: 0.5, probable_service_du: 50}
  funding: {base: 30, unit_cap: 35, timing: {"24h": 1.0, "7d": 0.8, "30d": 0.6, else: 0.4},
            amount_match_pct: 5, amount_bonus: 4, activation_hours: 48, activation_bonus: 3,
            repeat_bonus_max: 5, two_hop_factor: 0.6, two_hop_min_specificity: 0.5}
  cashout: {base: 26, unit_cap: 30}
  corroboration: {B_min: 12, C_min: 10, D_min: 10, factor: 0.25, cap: 15}
  temporal: {window_s: 60, min_cotrades: 5, min_distinct_markets_or_days: 3, surge_multiple: 5, surge_weight: 0.2}
  behavioural: {percentile_floor: 0.90}
  session_signer: {full_weight_max_wallets: 5, floor_at_wallets: 50, floor: 0.2, builder_cap: 10}
grades: {A_min_A: 40, B_min_financial: 25, B_corroboration_family_min: 10, B_corroboration_EF_min: 5,
         C_min_EF: 12, C_min_single_financial: 15, D_min_score: 15}
clustering:
  version: clu-0.1
  edge_min_score: 55
  edge_grades: [A, B]
  avg_linkage_min: 40
  avg_linkage_min_large: 50
  large_cluster_size: 20
  density_min_fraction: 0.6
  density_pair_min_score: 30
  member_min_confidence: 35
  id_inherit_jaccard: 0.5
materiality:
  version: mps-0.1
  triggers: {abs_usd: 100000, pct_oi: 0.05, pct_liquidity: 0.5, accum_24h_usd: 50000,
             accum_24h_share_of_volume: 0.10, vs_cluster_median_peak: 3.0}
priority:
  version: ap-0.1
  gate: {min_cos: 55, grades: [A, B]}
  weights: {cos: 0.40, mps: 0.40, tas: 0.20}
  bands: {P1: 80, P2: 65}
```

## 14. Terminology and fixed wording (enforced by tests)
**Use:** probable operator · operator cluster · common operational control ·
coordinated activity · related-wallet candidate · aggregate exposure · position
fragmentation · unusual activity · information-advantage candidate · anomalous timing.

**Never generate automatically:** insider, insider trading, market manipulation, same
person, beneficial owner (except in the negations below), threshold evasion. A unit
test scans API response templates and frontend copy for these terms.

**Fixed strings:**
- Pair and cluster scores: *"This indicates observable evidence of common operational
  control. It does not establish beneficial ownership."*
- Grade A from a session signer: *"Common operator (shared signing key). Beneficial
  ownership is not established."*
- Trading Anomaly Score: *"Unusual activity does not establish possession of
  non-public information."*
- Alerts: *"This alert identifies unusual coordinated trading activity. It does not
  establish insider trading, market manipulation, or common beneficial ownership."*
- Wallets with no cluster: *"No common-control evidence found in the data analysed.
  This does not establish that the wallet is independent."*
