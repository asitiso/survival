# Phase 3147~3164 — Core Guard / Secondary Cluster / Cleared-Ground Memory Continuity

## Scope
Presentation-only battlefield readability pass. Core damage math, projectile positions/velocities/collision, pierce/splash/chain damage, boss hazard geometry/damage/lifetime, action count, persistence schema, and balance remain unchanged. The pass hands mitigated core projectile hits into a core-guard response, compresses dense secondary impact stamps using the existing impact-cluster budget, and preserves a short cleared-ground memory after boss hazard aftermath retires.

## Phase 3147~3152 — Core Projectile Guard Impact Handoff
- Added `core-projectile-guard-impact-handoff-rendering.ts` and deterministic audit.
- `onCoreDamage()` returns the exact already-calculated `applied` damage for presentation consumers; legacy void-compatible usage remains valid.
- Enemy projectile impact compares incoming damage with returned applied damage only to derive a bounded prevented ratio.
- Meaningful mitigation transfers visual ownership from ordinary projectile impact into a short core-guard arc/deflect response.
- Existing archer/boss impact alpha is reduced as core-guard ownership rises, avoiding duplicate emphasis.
- Reduced Flash compresses only presentation alpha/extent.
- Core damage multipliers and shield/core state mutation remain unchanged.

## Phase 3153~3158 — Secondary Impact Cluster Readability Budget
- Added `secondary-impact-cluster-readability-budget-rendering.ts` and deterministic audit.
- Reuses the existing `projectileImpactClusterLimit()` budget instead of introducing a second density system.
- Splash/chain secondary impact stamps are clustered within a bounded local radius and receive visibility/alpha/size compression under dense multi-hit conditions.
- Sparse secondary impacts remain fully readable.
- Primary projectile impacts are not compressed by this pass.
- Reduced Flash adds bounded secondary-only compression without changing hit registration, splash radius, chain jump budget, or damage.

## Phase 3159~3164 — Boss Hazard Cleared-Ground Memory
- Added `boss-hazard-cleared-ground-memory-rendering.ts` and deterministic audit.
- Existing hazard aftermath retains ownership first; cleared-ground memory appears only after aftermath retirement.
- Memory is a low-weight Canvas cue, capped and presentation-only, and is never persisted.
- A nearby successor boss telegraph immediately takes ownership and retires the cleared-ground cue.
- The successor telegraph receives only a small bounded presentation emphasis so the lane transition reads clearly.
- Reduced Flash lowers cleared-ground visibility without changing hazard timing, geometry, radius, or damage.

## TDD / Regression
New tests:
- `tests/phase3147-3152-core-projectile-guard-impact-handoff.test.mjs`
- `tests/phase3153-3158-secondary-impact-cluster-readability-budget.test.mjs`
- `tests/phase3159-3164-boss-hazard-cleared-ground-memory.test.mjs`

Verification completed on the feature worktree before handoff:
- Initial RED: 18/18 failed before implementation.
- GREEN: 18/18 passed after minimal integration.
- Related Phase 2931~3164 plus sensitive projectile contracts: 234/234 PASS.
- `git diff --check`: clean.
- Full regression: 816 files / 2,915 tests / 0 fail.
  - parallel-safe: 806 files / 2,860 tests / 0 fail
  - exclusive: 10 files / 55 tests / 0 fail
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9

## Assets
No new image atlas. Existing projectile/impact/hazard assets plus Canvas primitives are sufficient; this pass improves ownership and density control rather than adding VFX volume.

## Packaging
Rebuild and force-stage the full `dist/` tree before commit. After fast-forward merge to reconstructed `main`, rerun the full test inventory, release gates, archive reproducibility, provenance, package runtime, and package run-cycle checks against the merged HEAD before creating the Phase 3164 Git-archive ZIP.

## Next Direction
Prefer another bounded ownership/readability pass before adding effects:
1. core contact/melee mitigation can share core-guard memory while remaining visually distinct from projectile guard cues;
2. dense secondary impacts can retain stable cluster identity/held-count continuity so rapidly changing splash/chain clusters do not flicker;
3. boss cleared-ground memory can become geometry-aware for corridor/cross hazards or integrate with safe-lane guidance only where that clearly improves readability without adding noise.
