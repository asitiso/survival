# Phase 3399~3452 — Character Motion Continuity & Multi-Hazard Navigation Cycle

## Scope
Presentation-first battlefield motion pass executed as **3× Incremental Fast Train → Risk-Adaptive Integration Gate**. The cycle focuses on hero cast/ultimate facing continuity, specialist/boss recovery-vs-hit visual ownership, layered character motion budgeting, and deterministic safe-lane multi-hazard gap merging. Damage formulas, collision, enemy AI, spell cooldown/cast timing, safe-lane gameplay scoring/selection, economy, persistence schema, Action count, and balance remain unchanged.

## Fast Train 1 — Phase 3399~3416 · Cast Aim Hold / Specialist Recovery Yield / Boss Recovery Yield
- Added a transient hero cast aim hold so the cast/recovery overlays preserve the cast-facing direction through the short recovery window even if locomotion facing changes immediately afterward.
- The aim hold is reset per run, decays only in presentation time, and never modifies spell cooldowns or cast timing.
- Added specialist recovery-hit handoff: committed pullback/lunge remains authoritative, but late attack resolve yields to strong heavy/critical hit stagger instead of stacking both silhouettes at full strength.
- Added boss recovery-stagger handoff: early special recovery stays authoritative, new special telegraphs remain protected, while late recovery can yield to strong heavy/critical stagger.
- Commit: `461ee80`.
- New TDD: 18 RED → 18 GREEN.
- Related regression: 29 files / **173 tests / 173 PASS**.

## Fast Train 2 — Phase 3417~3434 · Ultimate Aim Continuity / Silhouette Reentry
- Added a separate transient hero ultimate aim continuity state so meteor/void body language keeps the activation-facing direction through release and early recovery.
- Reduced Motion keeps direction identity but shortens the hold window.
- Specialist recovery-hit handoff now exposes a silhouette reentry scale: when hit ownership is strong, movement/recovery afterimage emphasis is reduced and returns monotonically as hit pressure clears.
- Boss recovery-stagger handoff gets the same explicit silhouette reentry control, including telegraph protection and shorter suppression under Reduced Motion.
- The live enemy renderer multiplies dynamic silhouette alpha by those ownership/reentry scales instead of drawing full movement afterimages during competing hit/recovery layers.
- Commit: `c15e108`.
- New TDD: 18 RED → 18 GREEN.
- Related regression: 32 files / **191 tests / 191 PASS**.

## Fast Train 3 — Phase 3435~3452 · Cast Retarget / Motion Layer Budget / Multi-Hazard Gap Merge
- Hero cast aim hold now includes a bounded retarget blend for chained casts. Large direction reversals receive a short interpolation window; small corrections use a proportionally shorter window; Reduced Motion switches directly to the new direction.
- Added character motion layer budget for specialist/boss live rendering. When attack, recovery, hit and special layers overlap, one presentation owner remains full-strength while competing transform layers are bounded.
- The budget is presentation-only and composes into existing attack resolve, hit stagger and boss recovery/stagger scales rather than changing animation/gameplay timers.
- Safe-lane path gap logic now deterministically merges only imminent, route-crossing hazards whose gap intervals overlap the primary gap. Disjoint hazards do not create a second navigation hole.
- Input ordering cannot change the merged gap geometry, and the safe target locator remains authoritative outside route segmentation.
- Commit: `52b0a4c`.
- New TDD: 18 RED → 18 GREEN after correcting three initially too-weak tests that were already satisfied by legacy behavior.
- Related regression: 65 files / **389 tests / 389 PASS**.

## Integration Gate
Risk classification: **MEDIUM**.

Reason:
- live presentation seams in `game.ts`, `enemies.ts`, hero cast/ultimate transient state, and safe-lane render geometry are touched;
- all new state is transient presentation state and all new budgets modify render geometry/alpha/scales only;
- no damage, collision, AI, spell timing, economy, persistence, safe-lane gameplay scoring, Action count, or balance formula changed.

Risk-adaptive verification:
- Extended regression: **94 test files / 563 tests / 563 PASS / 0 fail**.
- Fresh production build: PASS.
- Raster CI: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release gate: **PASS**, signature `RQ-D4630257`.
- Action invariant: **9/9**.
- Candidate audit: **PASS**, signature `RCQ-6006367D`.
- `git diff --check`: clean.

`verify:manifest` remains reserved for formal package/release checkpoints because it intentionally reruns the full test/archive/provenance/package-runtime inventory and would duplicate this MEDIUM gate.

## Assets
No new atlas was added. Existing hero cast/motion, hero battle, specialist, boss and hazard visuals already contain enough identity; this cycle improves continuity and ownership rather than increasing decorative density.

## Next Direction
Prefer another character-rendering continuity cycle before adding new art:
1. arbitrate the hero base facing indicator against locked cast/ultimate aim so the body pointer cannot contradict an active spell-facing owner;
2. make specialist/boss motion silhouettes trail the resolved owner direction rather than generic locomotion facing when hit/recovery owns the pose;
3. feather safe-lane merged-gap endpoints and retain hazard ownership cues without reducing locator authority.
