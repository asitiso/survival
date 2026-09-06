# Phase 3345~3398 — Directional Clarity & Hazard Navigation Integration Cycle

## Scope
Presentation-first battlefield continuity pass executed as **3× Incremental Fast Train → Risk-Adaptive Integration Gate**. Damage formulas, collision, enemy AI, safe-lane scoring/selection, spell tuning, economy, persistence schema, Action count, and balance remain unchanged. The only combat-path interface addition is an optional enemy damage origin used to derive a transient Core Guard pressure vector for rendering.

## Fast Train 1 — Phase 3345~3362 · Pressure Direction / Edge Bias / Hazard Occlusion
- Core Guard projectile/contact body language now uses the actual incoming pressure vector when available.
- Enemy core-damage callbacks can provide an optional origin; `Game` converts it to a presentation-only core-relative vector after damage is already resolved.
- Projectile guard deflect geometry rotates perpendicular to incoming pressure while contact guard arcs face the pressure source. Missing/degenerate vectors retain the previous neutral fallback.
- Secondary lineage `×N` labels gain bounded inward viewport-edge bias while preserving primary/secondary blocker clearances.
- Safe-lane primary path alpha yields to nearby imminent boss-arena telegraphs, but the navigational target locator always remains visible.
- Commit: `dd85c14`.
- New TDD: 18 RED → 18 GREEN.
- Related regression: 63 files / 327 tests / 327 PASS.

## Fast Train 2 — Phase 3363~3380 · Direction Hold / Connector Ownership / Recovery
- Added Core Guard pressure-vector hysteresis with a short presentation-only hold so rapidly alternating opposite hits do not flip the guard silhouette every frame.
- Reduced Motion bypasses directional interpolation while preserving source identity.
- Added a short lineage connector from moving/edge-biased secondary `×N` labels back toward their canonical cluster anchor; settled unshifted labels remain connector-free.
- Connector length and alpha are bounded, and Reduced Flash lowers emphasis without changing endpoints.
- Added safe-lane hazard-occlusion recovery hysteresis: new danger dims immediately, while path brightness returns monotonically rather than popping to full on the first clear frame.
- Commit: `b0837cc`.
- New TDD: 18 RED → 18 GREEN.
- Related regression: 66 files / 345 tests / 345 PASS.

## Fast Train 3 — Phase 3381~3398 · Directional Ownership / Connector Capacity / Path Gap
- Added directional Core Guard stack ownership so the freshest/highest-life directional cue owns full orientation emphasis while older competing directions yield accent alpha without hiding their damage cue.
- Directionless Core Guard cues remain neutral and cannot steal directional ownership.
- Added quality-aware secondary connector capacity: High 2 / Medium 2 / Low 1 connector lines, independent from the existing count-label capacity.
- Added imminent-hazard path segmentation: when a <=0.52s telegraph actually crosses the hero→safe-target route, the safe-lane line leaves a bounded visual gap through that hazard instead of drawing directly across it.
- The target locator is external to segmentation and remains visible even when the hazard is near the destination.
- Commit: `4e2a5df`.
- New TDD: 18 RED → 18 GREEN.
- Related regression: 69 files / 363 tests / 363 PASS.

## Integration Gate
Risk classification: **MEDIUM**.

Reason:
- live render/state seams in `game.ts`, `spells.ts`, and the enemy core-damage callback interface in `enemies.ts` are touched;
- the new third core-damage argument is optional origin metadata and does not change returned/applied damage;
- all new state is transient presentation state or deterministic render geometry/alpha/capacity logic;
- no damage, collision, AI, economy, persistence, safe-lane gameplay scoring, or balance formula changed.

Risk-adaptive verification:
- Extended regression: **108 test files / 597 tests / 597 PASS / 0 fail**.
- Two legacy Phase 3152/3170 source-contract regexes were widened to accept the additive optional origin parameter; the new Phase 3350 contract still requires live origin propagation.
- Raster CI: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release gate: **PASS**, signature `RQ-D4630257`.
- Action invariant: **9/9**.
- Candidate audit: **PASS**, signature `RCQ-6006367D`.
- `git diff --check`: clean.

`verify:manifest` remains reserved for formal package/release checkpoints because it intentionally reruns the full inventory plus archive/provenance/package-runtime verification and would duplicate this MEDIUM gate.

## Assets
No new atlas. Existing Core Guard, projectile-impact, safe-lane, boss-arena telegraph, and lineage label visuals already contain sufficient visual identity. This cycle improves spatial ownership, direction, and occlusion rather than adding decorative density.

## Next Direction
Prefer another battle-screen continuity cycle, with character motion as the next high-value visual area:
1. make hero cast/ultimate body orientation preserve target direction through short recovery without affecting cast timing;
2. make specialist/boss attack recovery silhouettes yield cleanly to hit-stagger ownership so animation cues do not visually fight;
3. extend safe-lane hazard gaps to deterministic multi-hazard merging only when two imminent telegraphs overlap the same route, keeping the locator authoritative.
