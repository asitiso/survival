# Phase 2823~2840 Handoff

## Baseline

- Input: `arcane-last-stand-phase2822-full-merged.zip`
- Previous Candidate: `RCQ-A5F3BFF3`
- Previous Release: `RQ-D4630257`
- Uploaded ZIP contains no `.git`; this pass updates the reconstructed source tree directly.

## Phase 2823~2828 — Spawn-Lane Cumulative Anchor-Origin Drift

Problem: per-update spatial re-entry already rejected one large >96px jump, but repeated smaller lateral shifts could walk one long-lived count identity hundreds of pixels because `anchorPos` refreshed every frame.

Implementation:
- `SPAWN_LANE_CUMULATIVE_ANCHOR_ORIGIN_DRIFT_DISTANCE = 144`
- count memory now stores both latest `anchorPos` and immutable-within-lineage `originAnchorPos`.
- north/south cumulative identity uses X displacement; east/west uses Y displacement.
- repeated sub-threshold shifts that exceed 144px from the lineage origin start a fresh presentation identity immediately.
- perpendicular edge-normal jitter spends no cumulative drift budget.
- any existing freshness/spatial reset creates a new origin at the fresh entrance.
- canonical cue count, spawn rate, portal TTL, target, pathing, and enemy state are untouched.

Audit:
- `spawn-lane-cumulative-anchor-origin-drift-audit.ts`
- deterministic 64 samples / action count 9 / presentation-only / no gameplay formula or snapshot mutation.

## Phase 2829~2834 — Projectile Split/Merge Lineage Coherence

Problem: one-to-one shared impact identity matching was stable for ordinary motion, but equal-distance split/merge cases could depend on array order and attach the old count/anchor lineage to the wrong child or merge parent.

Implementation:
- `projectileImpactSplitMergeLineagePairComparator()` is now the deterministic pair ranking contract.
- matching priority remains shortest distance first.
- equal-distance split candidates prefer the larger current `clusterCount`, preserving the old identity on the dominant child.
- equal-distance merge parents prefer the lower stable `identityId`, independent of previous memory array order.
- remaining ties use cluster impact coordinates and indices only as deterministic presentation fallbacks.
- secondary split children receive fresh monotonically allocated ids; secondary merge parents retire in the same frame.
- count hold and label-anchor hold continue consuming the exact shared identity keys and retirement set.
- projectile collision, damage, TTL, impact compression, and stamp lifecycle are untouched.

Audit:
- `projectile-impact-split-merge-lineage-coherence-audit.ts`
- deterministic 64 samples / action count 9 / presentation-only / no gameplay formula or snapshot mutation.

## Phase 2835~2840 — Boss Strict-Epoch Slot-Transition Coherence

Problem: strict handoff correctly stayed active for 0.18s, but a safe-response slot could still oscillate `above/right/left` every frame while the strict epoch was active.

Implementation:
- `BOSS_SAFE_RESPONSE_STRICT_SLOT_TRANSITION_LOCK_SECONDS = 0.08`
- first strict-epoch slot change is accepted immediately when the previous strict slot is no longer safe.
- accepted transition starts a short slot lock.
- while locked, a different candidate slot is ignored if the locked slot remains safe.
- safety always wins: if the locked slot becomes unsafe, a second strict slot change is accepted immediately and relocked.
- after the 0.08s lock expires, another legitimate transition may be accepted while the parent 0.18s strict epoch remains active.
- `bossSafeResponseStrictSlotPosition()` derives the existing canonical slot coordinates for safety checks; no new movement animation is introduced.
- boss/cycle identity changes clear the transition lock.
- boss AI, cycle state, safe-response availability, ring confirmation, cooldowns, and combat actions are untouched.

Audit:
- `boss-safe-response-strict-slot-transition-coherence-audit.ts`
- deterministic 64 samples / action count 9 / presentation-only / no gameplay formula or snapshot mutation.

## Release Binding

All three audits are bound into `release-freeze-audit.ts` and `release-candidate-audit.ts` with pass bits + sample counts in Candidate signature material and markdown evidence.

Candidate after this pass: `RCQ-6006367D`.

Forgery behavior verified:
- each new pass bit -> false: Candidate becomes `REVIEW`, includes `release-freeze`, signature changes.
- each new sample count -> +1: Candidate remains logically `PASS`, but signature changes.

## Asset Decision

- New image assets: **0**
- Phase 2822 vs Phase 2840 `assets/`: **120 / 120 files, byte-level unchanged**
- These three changes resolve identity continuity and slot arbitration; new art would add visual density without a new semantic state.

## Changed Source/Test Files

11 source/test files changed/added versus Phase 2822:
- `src/game/spawn-lane-edge-count-downward-debounce.ts`
- `src/game/spawn-lane-cumulative-anchor-origin-drift-audit.ts`
- `src/game/projectile-impact-identity-coherence.ts`
- `src/game/projectile-impact-split-merge-lineage-coherence-audit.ts`
- `src/game/boss-safe-response-slot-hysteresis.ts`
- `src/game/boss-safe-response-strict-slot-transition-coherence-audit.ts`
- `src/game/release-freeze-audit.ts`
- `src/game/release-candidate-audit.ts`
- `tests/phase2823-2828-spawn-lane-cumulative-anchor-origin-drift.test.mjs`
- `tests/phase2829-2834-projectile-impact-split-merge-lineage-coherence.test.mjs`
- `tests/phase2835-2840-boss-safe-response-strict-slot-transition-coherence.test.mjs`

## Verification

- Baseline build: PASS.
- Baseline recent contracts: 36/36 PASS.
- TDD RED: 18/18 fail before implementation.
- GREEN: 18/18 PASS.
- Related regression: **38 files / 237 tests / 237 PASS / 0 fail**.
- Full regression: **768 test files / 2,632 tests / 2,632 PASS / 0 fail**.
  - parallel-safe: 758 files / 2,577 tests / 0 fail
  - exclusive release/package/raster: 10 files / 55 tests / 0 fail
- Candidate: **RCQ-6006367D PASS**.
- Raster: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: **RQ-D4630257 PASS**, Action 9/9, baseline mutation disabled.

## Next Direction

1. **Spawn parallel sibling-lane identity separation**: count memory is still keyed primarily by edge/target/kind. If two simultaneous same-kind entrances exist on the same edge and target, give them distinct presentation lineage keys so their `×N` debounce/origin budgets cannot cross-feed.
2. **Projectile cumulative incoming-direction origin guard**: per-frame direction compatibility is safe, but a gradually curving barrage could rotate far from its original trajectory over many small steps. Add a bounded lineage-origin direction guard without changing projectile motion.
3. **Boss post-strict-epoch slot handoff continuity**: strict slot transitions are now coherent inside the epoch. Next, seed the first post-epoch hold from the final strict slot when it remains valid so strict→normal handoff cannot produce a one-frame label snap.

Add a new atlas only if a genuinely new gameplay state becomes hard to identify with existing world/UI assets.
