# Phase 2805~2822 Handoff

## Baseline

- Input: `arcane-last-stand-phase2804-full-merged.zip`
- Previous Candidate: `RCQ-65362609`
- Previous Release: `RQ-D4630257`
- Uploaded ZIP contains no `.git`; this pass updates the extracted reconstructed source tree directly.

## Phase 2805~2810 — Spawn-Lane Same-Kind Spatial Re-entry

Problem: time-based freshness was already safe, but a materially shifted lane on the same edge could still inherit the previous held `×N` purely because edge/target/kind matched.

Implementation:
- `SPAWN_LANE_SAME_KIND_SPATIAL_REENTRY_DISTANCE = 96`
- count memory stores a cloned presentation `anchorPos`.
- north/south identity compares lateral X displacement only.
- east/west identity compares lateral Y displacement only.
- movement beyond 96px starts a fresh presentation count identity immediately.
- small anchor drift stays inside the existing 0.18s downward debounce continuity.
- perpendicular edge-normal jitter cannot split identity.
- canonical spawn cue count, spawn rate, portal TTL, target, pathing, and enemy state are untouched.

Audit:
- `spawn-lane-same-kind-spatial-reentry-audit.ts`
- deterministic 64 samples / action count 9 / presentation-only / no gameplay formula or snapshot mutation.

## Phase 2811~2816 — Projectile Partial Shared-Identity Retirement

Problem: all-empty retirement was safe, but while one barrage remained active, a disappeared neighboring identity could stay in the 0.34s candidate memory and be incorrectly reused by a new impact cluster.

Implementation:
- `projectileImpactPartialRetiredIdentityIds()` identifies unmatched previous shared identities after global one-to-one cluster assignment.
- every update now returns partial `retiredIdentityIds`, not only the all-empty case.
- matched identities retain the same numeric id and continuity.
- unmatched identities retire in the same frame even if other clusters remain active.
- newly unmatched/newly-created clusters cannot reuse stale count or label-anchor memories because `EnemyManager` already applies the exact retirement set to both dependent memories before update.
- global minimum-distance one-to-one assignment and incoming-direction identity remain unchanged.
- projectile collision, damage, TTL, impact stamp lifecycle, and compression rules are untouched.

Audit:
- `projectile-impact-partial-identity-retirement-audit.ts`
- deterministic 64 samples / action count 9 / presentation-only / no gameplay formula or snapshot mutation.

## Phase 2817~2822 — Boss Safe-Response Strict-Handoff Epoch

Problem: after rebase budget exhaustion, strict placement was used once but the newly reset memory could allow a fresh smooth budget on the immediately following frame/dash.

Implementation:
- `BOSS_SAFE_RESPONSE_SLOT_STRICT_HANDOFF_SECONDS = 0.18`
- slot memory now carries `strictHandoffUntil`.
- budget exhaustion starts one short strict-placement epoch.
- while the epoch is active, both large displacement and small movement use the current strict placement instead of relative-follow or same-slot rebase.
- strict memory tracks the current boss/label position during the epoch without spending rebase budget.
- after the epoch expires, a later isolated same-slot dash may start a fresh smooth rebase budget.
- boss/cycle identity changes clear the epoch immediately.
- hidden/unsafe strict placement still clears or follows the existing strict placement safety path.
- boss AI, cycle logic, safe-response availability, ring confirmation, cooldowns, and combat actions are untouched.

Audit:
- `boss-safe-response-strict-handoff-epoch-audit.ts`
- deterministic 64 samples / action count 9 / presentation-only / no gameplay formula or snapshot mutation.

## Release Binding

All three audits are bound into `release-freeze-audit.ts` and `release-candidate-audit.ts` with pass bits + sample counts in Candidate signature material and markdown evidence.

Baseline Candidate after this pass: `RCQ-A5F3BFF3`.

Forgery evidence:
- pass bit false:
  - spawn spatial re-entry -> `RCQ-CD8821FE` / REVIEW / `release-freeze`
  - projectile partial retirement -> `RCQ-51F4645A` / REVIEW / `release-freeze`
  - boss strict-handoff epoch -> `RCQ-49707706` / REVIEW / `release-freeze`
- sample count +1:
  - spawn -> `RCQ-0F95954C`
  - projectile -> `RCQ-A3820C18`
  - boss -> `RCQ-2F90E004`
- sample-count mutations remain logically PASS but change the Candidate signature.

## Asset Decision

- New image assets: **0**
- Phase 2804 vs Phase 2822 `assets/`: **120 / 120 files, byte-level unchanged**
- This pass solves presentation identity continuity and stale reuse; new art would add visual density without improving semantic distinction.

## Changed Source/Test Files

11 source/test files changed/added versus Phase 2804:
- `src/game/spawn-lane-edge-count-downward-debounce.ts`
- `src/game/spawn-lane-same-kind-spatial-reentry-audit.ts`
- `src/game/projectile-impact-identity-coherence.ts`
- `src/game/projectile-impact-partial-identity-retirement-audit.ts`
- `src/game/boss-safe-response-slot-hysteresis.ts`
- `src/game/boss-safe-response-strict-handoff-epoch-audit.ts`
- `src/game/release-freeze-audit.ts`
- `src/game/release-candidate-audit.ts`
- `tests/phase2805-2810-spawn-lane-same-kind-spatial-reentry.test.mjs`
- `tests/phase2811-2816-projectile-impact-partial-identity-retirement.test.mjs`
- `tests/phase2817-2822-boss-safe-response-strict-handoff-epoch.test.mjs`

## Verification

- Baseline build: PASS.
- Baseline recent contracts: 36/36 PASS.
- TDD RED: 18/18 fail before implementation.
- GREEN: 18/18 PASS.
- Related regression: **31 files / 197 tests / 197 PASS / 0 fail**.
- Full regression: **765 test files / 2,614 tests / 2,614 PASS / 0 fail**.
  - parallel-safe: 755 files / 2,559 tests / 0 fail
  - exclusive release/package/raster: 10 files / 55 tests / 0 fail
- Candidate: **RCQ-A5F3BFF3 PASS**.
- Raster: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release: **RQ-D4630257 PASS**, Action 9/9, baseline mutation disabled.

## Next Direction

1. **Spawn cumulative anchor-origin drift budget**: the latest anchor is now spatially safe per update. Next, keep a bounded origin/reference so repeated sub-threshold lateral moves cannot slowly walk hundreds of pixels while retaining one long-lived `×N` identity.
2. **Projectile split/merge lineage coherence**: partial retirement is now exact. Next, when one cluster splits into two or two nearby clusters merge into one, preserve one primary lineage deterministically and retire/allocate secondary identities without count/anchor swapping.
3. **Boss strict-epoch slot-transition coherence**: strict handoff is now sticky for 0.18s. Next, ensure a legitimate strict slot change during that epoch remains immediately visible while preventing rapid above/right/left oscillation from reopening smooth memory.

Add a new atlas only if a genuinely new gameplay state becomes hard to identify with existing world/UI assets.
