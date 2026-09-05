# Phase 2787~2804 Handoff

## Baseline

- Input: `arcane-last-stand-phase2786-full-merged.zip`
- Previous Candidate: `RCQ-3B6981F7`
- Previous Release: `RQ-D4630257`
- Uploaded ZIP contains no `.git`; this pass updates the extracted reconstructed source tree directly.

## Phase 2787~2792 — Spawn-Lane Same-Kind Long-Gap Resurrection Guard

Problem: edge/target/kind count memory lasts 0.34s, so a lane that disappeared long enough to be a new presentation event could still resurrect an old held `×N` count.

Implementation:
- `SPAWN_LANE_SAME_KIND_RESURRECTION_GUARD_SECONDS = 0.18`
- same edge + target + kind re-entry after a gap over the guard resets the old display/pending count memory even though the 0.34s cleanup TTL has not expired.
- brief gaps remain continuous and retain the existing 0.18s downward debounce.
- continuous observation never triggers the reset.
- canonical spawn cue count, remaining TTL, spawn rate, target, pathing, and enemy state are untouched.

Audit:
- `spawn-lane-same-kind-resurrection-guard-audit.ts`
- deterministic 64 samples / action count 9 / presentation-only / no snapshot mutation.

## Phase 2793~2798 — Projectile Shared-Identity Retirement

Problem: shared projectile identities had a 0.34s memory window. When all real impact clusters disappeared and a new impact arrived before expiry, old numeric identity + count/anchor memories could be reused and resurrect a stale `×N` or held label anchor.

Implementation:
- `updateProjectileImpactIdentityCoherence()` now reports `retiredIdentityIds`.
- when there are zero actual impact clusters, all shared identities retire immediately instead of staying eligible for reuse.
- count hold and label anchor modules expose retirement helpers that discard the exact same identity set.
- `EnemyManager` applies one retirement set to identity/count/anchor memories before the next count/placement update.
- this allows numeric identity ids to be reused safely because dependent presentation memories have already been removed.
- projectile collision, damage, TTL, impact stamps, and clustering rules are unchanged.

Audit:
- `projectile-impact-shared-identity-retirement-audit.ts`
- deterministic 64 samples / action count 9 / presentation-only / no snapshot mutation.

## Phase 2799~2804 — Boss Safe-Response Rebase Budget Guard

Problem: same-slot displacement rebases could refresh the hold window indefinitely across a short chain of boss dashes.

Implementation:
- `BOSS_SAFE_RESPONSE_SLOT_REBASE_WINDOW_SECONDS = 0.55`
- `BOSS_SAFE_RESPONSE_SLOT_REBASE_MAX_COUNT = 2`
- slot memory now records `rebaseWindowStartedAt` and `rebaseCount`.
- up to two same-slot displacement rebases inside one cadence window are allowed.
- the next displacement handoff uses the strict current placement and starts a fresh budget instead of extending smooth-follow indefinitely.
- after the cadence window expires, an isolated dash can use smooth same-slot rebase again.
- small relative-follow movement does not consume rebase budget.
- new boss/cycle starts with a fresh budget.
- hero/core/extra protected-anchor safety remains immediate and dominant.
- boss AI, boss cycle, safe-response availability, and ring confirmation are untouched.

Audit:
- `boss-safe-response-rebase-budget-guard-audit.ts`
- deterministic 64 samples / action count 9 / presentation-only / no snapshot mutation.

## Release Binding

All three audits are bound into `release-freeze-audit.ts` and `release-candidate-audit.ts` with pass bits + sample counts in candidate signature material and markdown evidence.

Forgery evidence from baseline Candidate `RCQ-65362609`:
- pass bit false:
  - spawn same-kind resurrection guard -> `RCQ-0CA92B8B` / REVIEW / `release-freeze`
  - projectile shared-identity retirement -> `RCQ-8D36112F` / REVIEW / `release-freeze`
  - boss rebase-budget guard -> `RCQ-B4CAC4AB` / REVIEW / `release-freeze`
- sample count +1:
  - spawn -> `RCQ-AABCBF0A`
  - projectile -> `RCQ-9B51A8AE`
  - boss -> `RCQ-13CC54A2`
- sample-count mutations remain logically PASS but change the Candidate signature.

## Asset Decision

- New image assets: **0**
- Phase 2786 vs Phase 2804 `assets/`: **120 / 120 files, byte-level unchanged**
- This pass resolves stale presentation identity reuse; new art would add clutter without improving state identification.

## Changed Source/Test Files

14 files changed/added versus Phase 2786:
- `src/game/spawn-lane-edge-count-downward-debounce.ts`
- `src/game/spawn-lane-same-kind-resurrection-guard-audit.ts`
- `src/game/projectile-impact-identity-coherence.ts`
- `src/game/projectile-impact-count-hold.ts`
- `src/game/projectile-impact-label-anchor-hold.ts`
- `src/game/projectile-impact-shared-identity-retirement-audit.ts`
- `src/game/enemies.ts`
- `src/game/boss-safe-response-slot-hysteresis.ts`
- `src/game/boss-safe-response-rebase-budget-guard-audit.ts`
- `src/game/release-freeze-audit.ts`
- `src/game/release-candidate-audit.ts`
- `tests/phase2787-2792-spawn-lane-same-kind-long-gap-resurrection-guard.test.mjs`
- `tests/phase2793-2798-projectile-impact-shared-identity-retirement.test.mjs`
- `tests/phase2799-2804-boss-safe-response-rebase-budget-guard.test.mjs`

## Verification

- Baseline build: PASS.
- Baseline latest contracts: 36/36 PASS.
- TDD RED: 18/18 fail before implementation.
- GREEN: 18/18 PASS.
- Related regression: 231/231 PASS.
- Full regression: **762 test files / 2,596 tests / 2,596 PASS / 0 fail**.
  - parallel-safe: 752 files / 2,541 tests / 0 fail
  - exclusive release/package/raster: 10 files / 55 tests / 0 fail
- Candidate: **RCQ-65362609 PASS**.
- Raster: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: **RQ-D4630257 PASS**, Action 9/9, baseline mutation disabled.

## Next Direction

1. **Spawn same-kind spatial re-entry identity**: edge/target/kind freshness is now time-safe. Next, distinguish a materially shifted lane anchor on the same edge so a new lateral entrance cannot inherit the prior `×N` continuity purely because edge/target/kind match.
2. **Projectile partial identity retirement**: all-empty retirement is safe now. Next, retire a missing individual shared identity while other impact clusters remain active, avoiding stale candidate reuse in sustained mixed barrages.
3. **Boss strict-handoff cooldown/coherence**: the rebase chain is bounded. Next, keep one short strict-handoff epoch after budget exhaustion so an immediate follow-up dash cannot start a brand-new smooth budget on the very next frame.

Add a new atlas only if a genuinely new gameplay state becomes hard to identify with the existing world/UI assets.
