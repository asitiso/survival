# Phase 3615~3668 — Initial Travel Continuity & Impact Finish Cycle

## Integration model
- 3× Incremental Fast Train
- Each train: new TDD RED→GREEN, related regression, build/diff check, separate commit
- Cumulative risk: MEDIUM
- Integration gate: Extended Regression + Raster + Release + Candidate
- `verify:manifest` intentionally deferred to formal package/release work

## Fast Train 1 — Phase 3615~3632
Commit: `11b0a20` — `Phase 3615-3632 fast train initial travel continuity`

### Phase 3615~3620 — Hero muzzle-to-projectile travel continuity
- Stores presentation-only absolute `visualLaunchWorldOrigin` at fire time.
- First ~130ms keeps a bounded visual bridge from the launch muzzle to the moving projectile.
- Gameplay projectile position, velocity, targeting, damage and collision remain unchanged.

### Phase 3621~3626 — Specialist strike impact-side finish
- Late strike-origin arrival adds a short directional finish beyond the target-side contact point.
- Length is bounded and Reduced Flash lowers alpha.
- Actual hit point and damage are unchanged.

### Phase 3627~3632 — Boss shared-anchor travel continuity
- Boss projectile visual metadata preserves the shared special anchor for the first ~150ms of travel.
- Anchor history is strictly capped and Reduced Motion tightens it.
- Warning/launch gameplay coordinates are unchanged.

Verification:
- New TDD: 18/18 GREEN
- Related regression: 31 files / 186 tests / 186 PASS

## Fast Train 2 — Phase 3633~3650
Commit: `cbbadc8` — `Phase 3633-3650 fast train travel handoff continuity`

### Phase 3633~3638 — Hero travel handoff
- When separation exceeds the visual cap, the bridge slides its start forward so its end remains attached to the projectile instead of leaving a gap.
- Short travel still starts at the immutable muzzle origin.

### Phase 3639~3644 — Specialist finish response arbitration
- Active core contact-guard response owns the impact moment and suppresses the secondary specialist finish.
- Partial response scales the finish rather than hard-cutting it.

### Phase 3645~3650 — Boss anchor travel release
- Old anchor history slides forward once separation exceeds the cap.
- Initial nearby travel preserves the shared anchor; expired history releases cleanly.

Verification:
- New TDD: 18/18 GREEN
- Related regression: 34 files / 204 tests / 204 PASS

## Fast Train 3 — Phase 3651~3668
Commit: `9b574fb` — `Phase 3651-3668 fast train travel bridge density budget`

### Phase 3651~3656 — Hero travel bridge density budget
- Sparse volleys keep all bridges.
- Dense volleys keep newest bridges first with a bounded capacity.
- Evolved projectiles retain a small readability preference without changing ownership.

### Phase 3657~3662 — Specialist impact-finish density budget
- Sparse finishes remain visible.
- Dense specialist packs cap old finish accents while preserving newest/heavy cues.

### Phase 3663~3668 — Boss anchor-bridge density budget
- Large boss projectile rings no longer draw every anchor connector at full visibility.
- Newest bridge cues win capacity; Reduced Motion tightens the budget.

Verification:
- New TDD: 18/18 GREEN
- Related regression: 37 files / 222 tests / 222 PASS

## Risk-Adaptive Integration Gate
Risk: **MEDIUM**

Reason:
- Presentation-only metadata/render orchestration changed in `spells.ts` and `enemies.ts`.
- No gameplay projectile coordinates, velocities, damage, collision, AI, economy, persistence, cooldown, target selection or action-count formulas changed.

Gate evidence:
- Extended Regression: **123 files / 738 tests / 738 PASS**
- Raster: **5/5 PASS**
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`
- Release Quality Gate: **PASS** — `RQ-D4630257`
- Action invariant: **9/9**
- Candidate Audit: **PASS** — `RCQ-6006367D`
- `verify:manifest`: intentionally not run for this MEDIUM integration

## Asset policy
No new atlas was added. Existing hero/projectile/specialist/boss assets are sufficient; the higher-value improvement was temporal continuity from action origin into the first travel frames and density control under combat load.

## Recommended next bounded cycle
1. Couple hero projectile bridge release to impact/chain handoff so launch history retires before multihit identity changes.
2. Give specialist impact-side finish a target-relative tangent/normal variation by specialist role while preserving response ownership.
3. Extend boss shared-anchor continuity to spawned hazard materialization footprints, then arbitrate it against boss movement/phase-overlay ownership.
