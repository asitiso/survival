# Phase 3291~3344 — Battlefield Density & Attention Budget Integration Cycle

## Scope
Presentation-only battlefield clarity pass executed as **3× Incremental Fast Train → Risk-Adaptive Integration Gate**. Damage formulas, collision, spell tuning, enemy AI, safe-lane selection/scoring, economy, persistence schema, Action count, and balance remain unchanged.

## Fast Train 1 — Phase 3291~3308 · Visual Load / Motion / Attention
- Added a shared Core Guard visual-load budget so the `coreHit` atlas cue and projectile/contact guard accents cannot combine into an overbright duplicate read.
- Strong mitigation yields damage-cue alpha toward guard identity while retaining one authoritative damage owner.
- Added bounded secondary `×N` label motion settling: first placement snaps, large clean-placement changes travel by a capped render step, tiny drift settles immediately, Reduced Motion snaps directly.
- Added safe-lane combat-attention budgeting: critical hero/core states and active Last Law keep the primary locator but demote bridge/detail/direction clutter.
- Commit: `5376a16`.
- New TDD: 18 RED → 18 GREEN.
- Related regression: 174/174 PASS.

## Fast Train 2 — Phase 3309~3326 · Accent Timing / Count Change / Recovery
- Mixed Core Guard projectile line and contact ring now peak at different cue-life phases so both identities remain readable without simultaneous maximum emphasis.
- Added bounded count-change emphasis for secondary lineage labels; unchanged counts decay toward neutral and Reduced Flash compresses the pulse.
- Added safe-lane attention recovery hysteresis so secondary navigation detail does not pop fully back on the first frame after a critical state ends.
- Commit: `e689cb7`.
- New TDD: 18 RED → 18 GREEN.
- Related regression: 192/192 PASS.

## Fast Train 3 — Phase 3327~3344 · Dense Stack / Capacity / Identity Ownership
- Added repeated Core Hit stack budgeting across simultaneously alive `coreHit` cues; newer/high-life cues retain priority while total weighted load stays capped.
- Added quality-aware secondary label capacity after existing lineage priority: High 4 / Medium 3 / Low 2 maximum visible `×N` labels.
- Added explicit safe-lane identity arbitration with one owner: Combat attention → Last Law → forecast direction → passive mythic geometry.
- This prevents law, direction, and geometry icons from competing at the same safe-lane anchor.
- Commit: `d225a4e`.
- New TDD: 18 RED → 18 GREEN.
- Related regression: 210/210 PASS.

## Integration Gate
Risk classification: **MEDIUM**.

Reason:
- production changes touch live rendering/state seams in `game.ts` and `spells.ts`;
- changes are restricted to transient presentation budgets, alpha/geometry timing, label position/count memory, and identity visibility;
- no combat, collision, AI, economy, persistence, safe-lane gameplay scoring, or balance formula changed.

Risk-adaptive verification:
- Extended regression: **72 test files / 392 tests / 392 PASS / 0 fail**.
- Raster CI: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release gate: **PASS**, signature `RQ-D4630257`.
- Action invariant: **9/9**.
- Candidate audit: **PASS**, signature `RCQ-6006367D`.
- `git diff --check`: clean.

`verify:manifest` remains a formal package/release gate because it intentionally reruns full inventory plus archive/provenance/package-runtime checks and would duplicate this MEDIUM integration gate.

## Assets
No new atlas. Existing Core Guard, survival-response, projectile-impact, safe-lane transition, Last Law, and arena-geometry assets already provide enough identity. The higher-value improvement in this cycle was controlling simultaneous emphasis and ownership rather than adding decorative density.

## Next Direction
Prefer another presentation-continuity cycle before adding decorative atlases:
1. orient Core Guard projectile/contact accents using the actual incoming pressure vector without changing hit/collision behavior;
2. add inward edge bias for moving secondary lineage labels so settled motion remains readable near viewport corners;
3. arbitrate safe-lane primary path opacity against overlapping imminent boss-hazard telegraphs while never hiding the navigational locator.
