# Phase 3237~3290 — Risk-Adaptive Visual Continuity Integration Cycle

## Scope
Presentation-only battlefield continuity pass executed as **3× Incremental Fast Train → Risk-Adaptive Integration Gate**. Core damage formulas, projectile/contact collision, spell damage, enemy AI, boss mechanics, safe-lane scoring, economy, persistence schema, Action count, and balance remain unchanged.

## Fast Train 1 — Phase 3237~3254 · Visual Arbitration
- Added Core Guard damage-source body language so projectile and contact pressure remain visually distinguishable while one global damage owner stays authoritative.
- Added primary projectile-impact label blocker exposure and spatial arbitration for secondary `×N` lineage labels.
- Secondary labels now avoid primary labels, screen edges, and sibling labels, and hide rather than overlap when no clean slot exists.
- Safe-lane boundary handoff now suppresses the bridge when current and next targets have effectively converged, eliminating one-frame duplicate arrival/bridge presentation.
- Commit: `738f234`.
- New TDD: 18 RED → 18 GREEN.
- Related regression: 143/143 PASS.

## Fast Train 2 — Phase 3255~3272 · Visual Hysteresis
- Added 0.18s Core Guard source hysteresis to prevent rapid projectile/contact pressure from flickering body identity.
- Added bounded secondary label placement hold so readable `×N` anchors remain stable but immediately yield when blocked.
- Added safe-lane promotion hysteresis with separate enter/exit thresholds so forecast/current ownership does not chatter around the transition threshold.
- All state is transient presentation memory and resets with the run.
- Commit: `ffd415a`.
- New TDD: 18 RED → 18 GREEN.
- Related regression: 161/161 PASS.

## Fast Train 3 — Phase 3273~3290 · Mixed-pressure / Priority / Handoff Lifecycle
- Added mixed-source Core Guard composition: rapid mixed projectile/contact pressure uses balanced geometry and two reduced accents without creating a second damage owner.
- Added deterministic secondary label priority: larger held counts place first, then TTL, then lineage key; hidden/expired/singleton entries never consume placement opportunity.
- Added safe-lane detail lifecycle fields so settled handoff retires stale forecast text/direction identity and keeps only one subdued arrival locator.
- Preserved the Phase 3254 direct `handoffSettled` direction gate while layering the newer `directionVisible` lifecycle gate.
- Commit: `6dd016f`.
- New TDD: 18 RED → 18 GREEN.
- Related regression: 179/179 PASS.

## Integration Gate
Risk classification: **MEDIUM**.

Reason:
- production changes touch `game.ts`, `spells.ts`, and `enemies.ts`, so a narrow LOW-risk gate is insufficient;
- however, the changes are limited to render metadata, transient presentation state, label placement, and visual handoff arbitration;
- no damage/collision/persistence/economy/balance formula changed, so a full ~3k regression would add substantial repeated cost with little extra signal for this cycle.

Risk-adaptive verification:
- Extended regression: **102 test files / 528 tests / 528 PASS / 0 fail**.
- Raster CI: **5/5 PASS** (`16:9`, `20:9`, `4:3`, `foldable`, `32:9`).
- Release gate: **PASS**, signature `RQ-D4630257`.
- Action invariant: **9/9**.
- Candidate audit: **PASS**, signature `RCQ-6006367D`.
- `git diff --check`: clean.

`verify:manifest` is intentionally not part of this Integration Gate. That command internally reruns the full test inventory plus archive reproducibility, provenance, package runtime, and run-cycle checks; doing so here would defeat the selected Risk-Adaptive workflow. It remains a formal release/package gate.

## Assets
No new image atlas in this cycle. Existing Core Guard, projectile-impact, secondary-impact, safe-lane, and map-transition assets already provide sufficient identity. The higher-value improvement was ownership stability and collision-free presentation rather than adding more decorative assets.

## Verification Policy Going Forward
Continue with **3× Incremental Fast Train → Risk-Adaptive Integration Gate**:
- Train 1/2: new TDD + affected regression + build/diff check + isolated commit.
- Train 3: same, then cumulative risk classification.
- LOW: affected regression.
- MEDIUM: extended regression + release visual/candidate gates.
- HIGH: full regression + full release/package gates.
- Formal release/package checkpoint: `verify:manifest`, archive reproducibility/provenance, package runtime/run-cycle, release ZIP/bundle as required.
