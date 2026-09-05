# Phase 3129~3146 — Guard / Secondary Impact / Hazard Terrain Retirement Continuity

## Scope
Presentation-only battlefield continuity pass. Canonical projectile positions and velocities, projectile collision, enemy/hero damage formulas, pierce budget, splash/chain damage, boss hazard geometry/damage, action count, persistence schema, and balance remain unchanged. The pass hands an incoming projectile cue into a guard impact when real mitigation already occurred, keeps splash/chain secondary impacts canonical, and retires boss hazard aftermath before a new nearby telegraph claims the same ground.

## Phase 3129~3134 — Projectile Guard Impact Handoff
- Added `projectile-guard-impact-handoff-rendering.ts` and deterministic audit.
- `EnemyUpdateContext.onHeroDamage()` may return the already-calculated applied damage for presentation consumers; legacy void callbacks remain valid.
- Game returns the exact existing `applied` value after all existing damage multipliers; no damage formula is changed.
- Enemy projectile impact compares incoming damage with returned applied damage only to derive a bounded prevention ratio.
- When mitigation is meaningful, threat ownership is retired and a short perpendicular guard/deflect line reuses the existing impact moment.
- Existing archer/boss impact stamps remain, but their alpha is reduced as guard ownership rises so the same impact is not double-emphasized.
- Reduced Flash compresses only the guard impact alpha.

## Phase 3135~3140 — Splash / Chain Secondary Impact Canonical Identity
- Added `secondary-impact-canonical-rendering.ts` and deterministic audit.
- Splash secondary hits and Chain Lightning jumps after the primary target receive `{entryOffset:{x:0,y:0}}` unconditionally.
- Secondary impacts therefore never inherit the primary projectile's launch/arrival owner.
- Existing hero projectile impact atlas is reused at smaller size/alpha for secondary hits.
- Reduced Flash is passed through the live spell world and applied only to the secondary impact visual alpha.
- Damage calls, splash radius, chain jump budget, target search, slow application, and terrain/magic-target interactions are unchanged.

## Phase 3141~3146 — Boss Hazard Aftermath → Terrain Ambience Retirement
- Added `boss-hazard-aftermath-terrain-retirement-rendering.ts` and deterministic audit.
- Fresh expiry remains owned by the existing hazard aftermath atlas.
- Late aftermath transitions into a lower-weight residual/terrain ambience using the existing `residual` sprite; no new atlas is added.
- The renderer checks live `bossArena.hazards` for a nearby telegraphed successor.
- A new telegraph within the local ground handoff radius retires the old aftermath immediately, preventing stacked old-residual + new-danger emphasis on the same lane.
- Reduced Flash further compresses terrain ambience without changing hazard lifetime or geometry.

## TDD / Regression
New tests:
- `tests/phase3129-3134-projectile-guard-impact-handoff.test.mjs`
- `tests/phase3135-3140-secondary-impact-canonical-identity.test.mjs`
- `tests/phase3141-3146-boss-hazard-aftermath-terrain-retirement.test.mjs`

TDD / review fixes:
- Initial RED: 18/18 failed before production implementation.
- GREEN: 18/18 passed after minimal integration.
- Review found secondary impact Reduced Flash alpha was calculated but not carried into the live impact queue. The Phase 3140 source contract was strengthened, observed RED, and `alphaScale` was added only to presentation impact metadata.
- Related Phase 2931~3146 plus Phase 2402 / 2560 / 2653 contracts: 233/233 PASS.
- `git diff --check`: clean.

Final full regression on feature worktree:
- parallel-safe: 803 files / 2,842 tests / 0 fail
- exclusive serial: 10 files / 55 tests / 0 fail
- total: 813 files / 2,897 tests / 0 fail

Release gates after final fixes:
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9

## Assets
No new image atlas added. Existing projectile impact, survival response, and boss hazard aftermath assets are sufficient. The value comes from ownership retirement and canonical anchoring rather than more VFX density.

## Packaging
Rebuild and force-stage the full `dist/` tree before commit. After fast-forward merge to reconstructed `main`, rerun the full 813-file regression, release gates, archive reproducibility, provenance, package runtime smoke, and package run-cycle checks against the merged HEAD.

## Next Direction
Prefer another ownership/readability pass before adding new effects:
1. core projectile mitigation should share the same incoming-threat → core-guard impact handoff without changing core damage math;
2. dense splash/chain secondary impact stamps should enter the existing impact-cluster/readability budget so multi-hit builds stay legible at high projectile density;
3. repeated boss hazards in the same lane should share a short cleared-ground memory so safe ground reads consistently between aftermath retirement and the next telegraph.
