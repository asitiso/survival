# Phase 4059-4064 Threat Impact Resolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the Threat → Impact visual chain by retiring transitional decoration cleanly back into canonical projectile, impact, hazard, safe-lane, and locomotion presentation.

**Architecture:** Add one presentation-only policy module beside the Phase 4047-4058 continuity/recovery modules, then consume its scalar outputs in the existing Canvas render paths. No gameplay state, damage, collision, AI, economy, persistence, or action-count logic changes.

**Tech Stack:** TypeScript ES2022, Canvas 2D, Node test runner, npm/tsc.

**Spec:** Approved Phase 4059-4064 Fast Train 3 continuation in the current conversation.

## Global Constraints

- Presentation-only changes.
- TDD RED before production code.
- Reuse existing VFX/assets; do not add image assets unless clearly necessary.
- Preserve canonical body/safe-lane readability even when transition effects are suppressed.
- Respect Reduced Motion and Reduced Flash.
- Fast Train 3 ends with one cumulative full regression and release/candidate gates before main merge.

---

### Task 1: Phase 4059 Projectile canonical reclaim

**Files:**
- Create: `src/game/threat-impact-resolution-rendering.ts`
- Test: `tests/phase4059-4064-threat-impact-resolution.test.mjs`
- Modify: `src/game/enemies.ts`

**Interfaces:**
- Consumes: continuity owner, launch/travel life, projectile speed.
- Produces: `projectileCanonicalReclaimPresentation()` with transition/body alpha scales.

- [ ] Write a failing test proving transition decoration decreases while canonical projectile body returns to alpha 1 as launch/travel life approaches zero.
- [ ] Run the new test and confirm RED because the module/function does not exist.
- [ ] Implement `projectileCanonicalReclaimPresentation()` minimally.
- [ ] Apply only transition alpha/body alpha scalars to projectile rendering.
- [ ] Build and run the phase test GREEN.

### Task 2: Phase 4060 Impact footprint retirement

**Files:**
- Modify: `src/game/threat-impact-resolution-rendering.ts`
- Modify: `src/game/spells.ts`
- Test: `tests/phase4059-4064-threat-impact-resolution.test.mjs`

**Interfaces:**
- Consumes: impact life and reaction kind.
- Produces: `impactFootprintRetirementPresentation()` with footprint/aftermath/sprite scales.

- [ ] Add RED test proving late impact footprint retires faster than the canonical response and death retains slightly longer aftermath than hit.
- [ ] Implement helper and connect it to impact footprint rendering.
- [ ] Run phase test GREEN.

### Task 3: Phase 4061 Hazard edge → ground-memory resolution

**Files:**
- Modify: `src/game/threat-impact-resolution-rendering.ts`
- Modify: `src/game/game.ts`
- Test: `tests/phase4059-4064-threat-impact-resolution.test.mjs`

**Interfaces:**
- Consumes: active hazard life, cleared-ground memory life, whether hazard is still active.
- Produces: `hazardGroundResolutionPresentation()`.

- [ ] Add RED test proving no safe/cleared-ground boost is emitted while a hazard is still active.
- [ ] Implement helper and use it to scale active hazard residue versus cleared-ground memory.
- [ ] Run phase test GREEN.

### Task 4: Phase 4062 Safe-lane canonical normalization

**Files:**
- Modify: `src/game/threat-impact-resolution-rendering.ts`
- Modify: `src/game/game.ts`
- Test: `tests/phase4059-4064-threat-impact-resolution.test.mjs`

**Interfaces:**
- Consumes: reclaim release, hazard pressure, memory count.
- Produces: `safeLaneCanonicalResolutionPresentation()`.

- [ ] Add RED test proving safe-lane boost peaks during release but returns to exactly 1 when pressure/release are absent.
- [ ] Implement helper and multiply it into safe-lane base alpha.
- [ ] Run phase test GREEN.

### Task 5: Phase 4063 Silhouette locomotion settle

**Files:**
- Modify: `src/game/threat-impact-resolution-rendering.ts`
- Modify: `src/game/enemies.ts`
- Test: `tests/phase4059-4064-threat-impact-resolution.test.mjs`

**Interfaces:**
- Consumes: silhouette owner, locomotion weight, motion blend, turn amount.
- Produces: `silhouetteLocomotionSettlePresentation()`.

- [ ] Add RED test proving locomotion owner returns exact neutral scales and recovery owner approaches them monotonically.
- [ ] Implement helper and apply only to transitional silhouette decoration, never canonical body visibility.
- [ ] Run phase test GREEN.

### Task 6: Phase 4064 Final continuity arbitration budget

**Files:**
- Modify: `src/game/threat-impact-resolution-rendering.ts`
- Modify: `src/game/enemies.ts`
- Modify: `src/game/spells.ts`
- Modify: `src/game/game.ts`
- Test: `tests/phase4059-4064-threat-impact-resolution.test.mjs`

**Interfaces:**
- Consumes: active transition count, newest rank, class.
- Produces: `continuityResolutionBudgetPresentation()` with visibility/effect strength while canonical readability remains 1.

- [ ] Add RED test proving older decoration is retired first under density while canonical body/safe-lane scales stay exactly 1.
- [ ] Implement helper and consume it in projectile/impact/hazard or silhouette transition layers.
- [ ] Run new phase tests and directly related Phase 4047-4058 regressions.
- [ ] Commit Fast Train 3.
- [ ] Run full `npm test`, `verify:raster`, `verify:release`, `verify:manifest`, and `verify:candidate` once for all three trains.
- [ ] Merge the cumulative branch to local main, re-run smoke/build, then synchronize authoritative GitHub main and verify remote SHA/tree.
