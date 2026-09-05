# Phase 3201~3218 — Core Guard Survival Arbitration / Secondary Cycle Lineage / Safe-lane Forecast Agreement

## Scope
Presentation-only battlefield continuity pass. Core damage formulas, projectile/contact collision, splash/chain damage, boss hazard geometry/damage/lifetime, mythic safe-lane scoring, action count, persistence schema, and balance remain unchanged.

## Phase 3201~3206 — Core World-space Guard ↔ Survival-response Core Guard Arbitration
- Added `core-guard-survival-response-arbitration-rendering.ts` and deterministic audit.
- EnemyManager exposes a read-only `coreWorldGuardPresentationState()` from existing projectile/contact Core Guard presentation queues.
- The global `coreGuard` survival-response cue now yields to an active world-space Core Guard cue for the same blocked-pressure window.
- Once a survival cue observes world-space ownership, that cue latches retirement and never reappears after the world-space cue fades.
- Weak/non-owned world traces do not suppress an independent survival cue.
- Reduced Flash can only lower the surviving global cue.
- The latch exists only on transient VFX queue entries and is never persisted.

## Phase 3207~3212 — Secondary Impact Split→Merge→Split Cycle Lineage
- Enhanced `secondary-impact-cluster-split-lineage-rendering.ts` with explicit `retired` tombstones.
- Merge-time unmatched child lineages near the live merged cluster retire immediately from matching while remaining briefly as bounded tombstones.
- Retired lineages are excluded from both matching and lookup, preventing a rapid re-split from resurrecting an old child key onto the wrong branch.
- Repeated merge/split cycles allocate fresh child identities while the current active branch retains its live lineage.
- Existing 0.24s bounded retirement and shared `stableClusterKey` readability-budget integration remain intact.
- Added `secondary-impact-cluster-cycle-lineage-audit.ts`.

## Phase 3213~3218 — Mythic Safe-lane Forecast `nextTarget` Pre-agreement
- Added `boss-cleared-safe-lane-forecast-arbitration-rendering.ts` and deterministic audit.
- The current mythic safe-lane presentation now carries transient forecast target, urgency, and transition timing metadata.
- Stable/distant forecasts keep the current safe-lane target authoritative.
- High-urgency forecasts within 1.8s of transition promote `nextTarget` for cleared-ground arbitration before the transition occurs.
- Existing corridor/cross cleared-ground arbitration therefore no longer contradicts the lane the player is about to be asked to move toward.
- Current safe-lane scoring, safe-zone behavior, collision, and auto-move behavior remain unchanged.

## TDD / Regression
New tests:
- `tests/phase3201-3206-core-guard-survival-response-arbitration.test.mjs`
- `tests/phase3207-3212-secondary-impact-cluster-cycle-lineage.test.mjs`
- `tests/phase3213-3218-boss-cleared-safe-lane-forecast-arbitration.test.mjs`

Verification on the feature worktree:
- Initial RED was strengthened until all 18/18 new tests failed before production implementation.
- GREEN: 18/18 passed after implementation.
- Related Phase 2931~3218 plus sensitive Phase 2402/2526/2536/2560/2653 contracts: 288/288 PASS.
- Full regression: 825 files / 2,969 tests / 0 fail.
  - parallel-safe: 815 files / 2,914 tests / 0 fail
  - exclusive: 10 files / 55 tests / 0 fail
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9
- `git diff --check`: clean

## Assets
No new image atlas. Existing survival-response, Core Guard, secondary impact, cleared-ground, and mythic safe-lane visuals already provide sufficient identity; this pass removes ownership contradictions rather than increasing VFX density.

## Packaging
Rebuild and force-stage full `dist/` before commit. After fast-forward merge to reconstructed `main`, rerun the full test inventory, release gates, archive reproducibility, provenance, package runtime, and package run-cycle checks against merged HEAD before creating the Phase 3218 Git-archive ZIP.

## Next Direction
Prefer another bounded continuity pass before decorative expansion:
1. coordinate world-space Core Guard ownership with the global `coreHit` survival-response cue on heavily mitigated hits, so a strongly blocked Core event cannot read as both full guard and full damage;
2. propagate cycle-safe secondary lineage into count/label anchor ownership so a label cannot remain attached to a retired child after merge/split cycles;
3. let map safe-lane transition VFX and geometry identity icons use the same imminent forecast target selected by cleared-ground arbitration, so line, label, icon, and cleared-ground memory all agree on the upcoming lane.
