# Phase 3453~3506 — Directional Ownership & Hazard Handoff Cycle

## Starting point
- Local base: `main@dd0b9368a4f0f83582fee6ace94a0b285cbe5827` (Phase 3452)
- GitHub Phase 3452 source sync completed before this cycle through verified one-shot workflow.
- Workflow: **3× Incremental Fast Train → Risk-Adaptive Integration Gate**.
- Scope remained presentation-only: no damage, collision, AI, economy, save, or action-count formula changes.

## Fast Train 1 — Phase 3453~3470
Commit: `9661607` — `Phase 3453-3470 fast train facing ownership`

### Phase 3453~3458 — Hero body-facing owner
- Unifies movement / cast / ultimate facing ownership.
- Ultimate has priority over normal cast when both retain direction.
- Hero battle sprite mirror follows the owned facing rather than raw movement alone.
- No new atlas.

### Phase 3459~3464 — Character silhouette direction owner
- Specialist/boss silhouette trail direction follows locomotion, attack, recovery, hit, or boss special owner.
- Existing target/hit vectors are reused presentation-only.
- No gameplay trajectory changes.

### Phase 3465~3470 — Safe-lane gap feather
- Hard safe-lane hazard gaps receive bounded edge feathering.
- Destination locator remains authoritative.
- Reduced Flash lowers alpha only, never gap geometry.

TDD: 18 RED → 18 GREEN.
Related regression: 334/334 PASS after minimal source-contract compatibility updates for Phase 3398/3452 safe-lane drawing ownership.

## Fast Train 2 — Phase 3471~3488
Commit: `cf5aecf` — `Phase 3471-3488 fast train facing hysteresis and feather continuity`

### Phase 3471~3476 — Hero body-facing hysteresis
- Briefly retains cast/ultimate direction when ownership returns to movement.
- Opposite facing blends instead of one-frame 180° snap.
- Mirror hysteresis prevents chatter near vertical facing.
- Reduced Motion adopts desired facing directly.

### Phase 3477~3482 — Character silhouette direction pivot
- Specialist/boss attack/recovery/hit/special silhouette direction pivots from locomotion toward owned direction.
- Hit ownership pivots more decisively than ordinary recovery.
- Reduced Motion adopts owned direction directly.

### Phase 3483~3488 — Safe-lane gap feather hysteresis
- New imminent gap appears immediately.
- Moving boundaries interpolate.
- Removed hazard gets a short bounded release tail.
- Reduced Motion tracks current geometry directly.

TDD: 18 RED → 18 GREEN.
Related regression: 180/180 PASS.
Phase 3464 source contract was updated to assert the new owner → pivot chain rather than direct owner → draw consumption.

## Fast Train 3 — Phase 3489~3506
Commit: `a46188c` — `Phase 3489-3506 fast train directional ownership and hazard handoff`

### Phase 3489~3494 — Hero directional overlay owner
- Body-facing owner also arbitrates movement/cast directional overlays.
- Opposite locomotion texture is strongly suppressed during retained cast/ultimate facing.
- Nearby locomotion direction keeps more texture.
- One directional owner remains visible instead of contradictory overlays.

### Phase 3495~3500 — Character silhouette trail budget
- Large direction pivots shorten and dim silhouette trails.
- Hit is most conservative; boss special retains more identity than recovery.
- Reduced Motion caps both trail alpha and distance.
- Prevents ghost silhouettes from visually crossing the character body during hard turns.

### Phase 3501~3506 — Safe-lane hazard gap handoff
- Overlapping/moving same hazard keeps smooth feather hysteresis.
- Disconnected new hazard gap snaps immediately to the new danger geometry.
- Materially expanding danger also snaps outward immediately.
- Removed hazard still uses bounded release.
- Prevents interpolation from temporarily drawing the lane through a newly unsafe area.

TDD: 18 RED → 18 GREEN.
Related regression: 198/198 PASS.

## Risk-Adaptive Integration Gate
Risk: **MEDIUM**.

Reason:
- Major real-time render orchestration files `game.ts` and `enemies.ts` changed.
- Changes are presentation state / angles / alpha / trail distance / safe-lane geometry only.
- No damage, collision, AI, save, economy, balance, or input action formula changed.

Verification:
- Extended Regression: **96 files / 576 tests / 576 PASS** (Phase 2931+ presentation continuity suite).
- Production build: PASS.
- Raster CI: **5/5 PASS**
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`
- Release Gate: **PASS `RQ-D4630257`**
- Candidate Audit: **PASS `RCQ-6006367D`**
- Action invariant: **9/9**

`verify:manifest` remains reserved for formal release/package checkpoints because it internally re-runs the full test/archive/package pipeline.

## Asset policy
No new image atlas was added in this cycle. Existing hero battle/cast/motion sprites and enemy presentation assets were sufficient; code-side ownership and directional continuity produced the higher-value visual improvement.

## Integration policy
Fast-forward the tested feature SHA to local `main`, then run only fresh build + the 54 new Phase 3453~3506 tests as main smoke. Do not repeat the extended/full suite after a byte-identical fast-forward.
