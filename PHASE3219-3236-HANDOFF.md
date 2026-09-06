# Phase 3219~3236 — Core Hit Guard Ownership / Secondary Lineage Label Anchors / Safe-lane Forecast Visual Coherence

## Scope
Presentation-only battlefield continuity pass. Core damage formula, projectile/contact collision, splash/chain damage, boss hazard geometry/damage/lifetime, mythic safe-lane scoring, action count, persistence schema, and balance remain unchanged.

## Phase 3219~3224 — Core Guard ↔ `coreHit` Survival-response Ownership
- Added `core-hit-world-guard-arbitration-rendering.ts` and deterministic audit.
- `onCoreDamage()` still computes the same canonical `applied` damage; presentation metadata now also records `mitigationRatio = prevented / incoming` for the transient `coreHit` cue.
- Unmitigated / lightly mitigated hits keep the existing `coreHit` response authoritative.
- Medium mitigation shares emphasis between world-space Core Guard and `coreHit`, reducing the damage cue rather than stacking two full-strength responses.
- Strong mitigation with an active world-space Core Guard transfers ownership completely to the guard cue.
- Once a strongly blocked `coreHit` cue yields to world ownership, that same transient cue cannot reanimate after the world guard fades.
- Reduced Flash only lowers remaining `coreHit` emphasis.

## Phase 3225~3230 — Secondary Impact Cycle-safe Count Label Anchor
- Added `secondary-impact-lineage-label-anchor-rendering.ts` and deterministic audit.
- Extended split-lineage presentation state with `secondaryImpactActiveLineageAnchorFor()`.
- Active lineage centers now own the optional `×N` secondary-impact count label.
- Retired merge tombstones are never eligible as label anchors, so a rapid split→merge→split cannot leave the label attached to an obsolete child.
- Labels are shown once per active lineage, only when held count > 1 and the shared readability budget allows that cluster to remain visible.
- Existing secondary impact damage, launch ownership, cluster budget, held-count timing, and lineage retirement remain unchanged.

## Phase 3231~3236 — Mythic Safe-lane Forecast Visual Coherence
- Added `safe-lane-forecast-visual-coherence-rendering.ts` and deterministic audit.
- Reuses the same imminent forecast target already selected by cleared-ground arbitration.
- When forecast promotion is not imminent, the current safe-lane target remains authoritative.
- During a high-urgency imminent transition, the primary safe-lane line, arrival stamp, transition path, Last Law icon, arena-geometry icon, label, and law bar all use the same promoted `nextTarget`.
- The current→next forecast bridge remains secondary when the promoted target becomes primary.
- Preserved Phase 2584~2586 source-continuity contracts while allowing presentation-only forecast target promotion.
- Gameplay safe-lane selection, scoring, movement, collision, and safe-zone behavior remain unchanged.

## TDD / Regression
New tests:
- `tests/phase3219-3224-core-hit-world-guard-arbitration.test.mjs`
- `tests/phase3225-3230-secondary-impact-lineage-label-anchor.test.mjs`
- `tests/phase3231-3236-safe-lane-forecast-visual-coherence.test.mjs`

Verification:
- Initial RED: 18/18 failed before production implementation.
- GREEN: 18/18 passed after implementation.
- Related Phase 2931~3236 plus survival/projectile label-sensitive legacy contracts: 337/337 PASS.
- Full regression: 828 files / 2,987 tests / 0 fail.
  - parallel-safe: 818 files / 2,932 tests / 0 fail
  - exclusive: 10 files / 55 tests / 0 fail
- Phase 2583~2588 legacy safe-lane source contracts were discovered by full regression, restored as source-continuity documentation, then rerun successfully.
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9
- `git diff --check`: clean

## Assets
No new image atlas. Existing survival-response, projectile impact, map safe-lane transition, Last Law, and arena-geometry assets already provide sufficient identity. This pass improves ownership and anchor coherence rather than increasing asset density.

## Local Fast Train
- GitHub API / Actions are not used inside the implementation loop.
- No ZIP is generated for this pass.
- Local Git worktree + local TDD/regression is the hot path.
- GitHub is reserved for periodic batch synchronization after several completed trains.

## Next Direction
Prefer another bounded presentation-continuity pass:
1. separate projectile-vs-contact Core Guard icon/body language during mixed pressure while retaining one global damage owner;
2. arbitrate secondary `×N` label placement against primary projectile impact labels and screen-edge occupancy so cycle-safe identity also remains spatially readable;
3. make safe-lane forecast promotion hand back to the new current lane without a one-frame arrival/bridge duplication at the exact transition boundary.
