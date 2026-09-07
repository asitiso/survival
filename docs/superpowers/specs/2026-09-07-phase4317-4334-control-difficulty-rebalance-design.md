# Phase 4317-4334 Control & Difficulty Rebalance Design

## Goal
Rebalance AUTO so it performs like a slightly-above-average human rather than an optimal frame-perfect controller, while making manual mobile play materially more forgiving without giving manual mode hidden damage bonuses. Rebase Threat 0-5 so Threat 2 approximates the previous baseline pressure and lower tiers create real reaction room.

## Global invariants
- AUTO ON/OFF never changes enemy HP, damage, spawn rules, rewards, save schema, or progression.
- Manual assist never changes player damage coefficients or spell cooldown tuning.
- Threat level remains the only player-facing difficulty selector; switching AUTO during a run cannot exploit difficulty scaling.
- Runtime-only AUTO state is not persisted and does not mutate snapshot schema.
- Existing 9 combat actions remain exactly 9.
- Existing spell targeting score function remains authoritative; AUTO humanization controls review cadence, switch commitment, cast pacing, and weakpoint precision above it.

## Phase 4317-4322 — AUTO Brain Humanization
Introduce a small runtime `AutoCombatBrain` state machine. Target reviews happen at 0.14s cadence (~7.1 Hz) instead of every render frame. A candidate must remain preferred before a target switch commits: 0.22s normal, 0.12s for an urgent core threat. Dead/out-of-range targets may be replaced immediately.

AUTO regular spell casts use a 0.14s minimum inter-cast gap and per-action readiness staggering so all four normal spells cannot fire on the same frame. Manual held/pressed inputs remain immediate and bypass this AUTO pacing.

Boss weakpoint selection is also runtime-held. A newly preferable weakpoint must persist for 0.24s before AUTO changes node. AUTO aims toward the selected node with an 82% blend from boss center rather than exact node-center coordinates. This intentionally leaves skilled manual play room to beat AUTO.

Target outcome: material AUTO decisions approximately 6-8 times/sec, non-emergency switches visibly delayed, weakpoint contact no longer perfect, and AUTO throughput approximately 88-92% of idealized frame-perfect behavior.

## Phase 4323-4328 — Manual Input Forgiveness
Increase cast intent buffer from 0.20s to 0.32s and manual target memory from 0.75s to 1.15s. Existing priority overrides (core threat, elite/boss) remain intact so longer memory cannot trap the player on a lower-priority target.

Add manual boss weakpoint soft assist: when a manual cast has selected the active boss and live weakpoints exist near the boss body, aim only 38% from boss center toward the preferred weakpoint. This is deliberately weaker than AUTO's 82% blend and never snaps to exact node center. It adds no new input action and does not affect non-boss targets.

## Phase 4329-4334 — Threat Curve Rebase
Replace linear Threat modifiers with an explicit six-tier table:

| Threat | Spawn | Elite interval | Enemy speed | Projectile speed | Boss cadence | Boss variant | Shards |
|---|---:|---:|---:|---:|---:|---:|---:|
| 0 안정 | 0.80 | 1.18 | 0.94 | 0.88 | 1.14 | 0 | 1.00 |
| 1 긴장 | 0.90 | 1.08 | 0.97 | 0.94 | 1.07 | 0 | 1.17 |
| 2 위험 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 0 | 1.34 |
| 3 악몽 | 1.13 | 0.90 | 1.035 | 1.06 | 0.94 | 1 | 1.51 |
| 4 재앙 | 1.29 | 0.78 | 1.07 | 1.13 | 0.86 | 1 | 1.68 |
| 5 종말 | 1.48 | 0.66 | 1.11 | 1.22 | 0.78 | 2 | 1.85 |

Boss cadence multiplier follows existing semantics: values above 1 slow special cadence, values below 1 accelerate it. Projectile speed composes with endless/ascension projectile pressure but is still clamped by EnemyManager's existing safety bounds.

Threat 0 keeps legacy shard payout and Threat 5 keeps >=1.8x shard payout. Balance simulation must allow sub-1 pressure for Threat 0/1 rather than clamping projected pressure to 1.

## Verification
- TDD RED->GREEN for each Fast Train.
- Focused regression covers existing auto-target stability, weakpoint behavior, manual target stability, cast buffering, threat composition, and new AUTO/manual/threat contracts.
- Add a 4 heroes x 6 Threat x 2 control-mode matrix audit that checks finite/monotonic pressure and intended control efficiency ordering: average manual < AUTO < skilled manual.
- Full test inventory, raster gate, release gate, candidate gate must pass before GitHub publication.
