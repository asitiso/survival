# Phase 3111~3128 — Multi-hit / Threat / Hazard Lifecycle Ownership Continuity

## Scope
Presentation-only battlefield continuity pass. Canonical projectile positions, velocities, collision checks, damage, pierce budget, target selection, boss hazard geometry/damage, action count, persistence schema, and balance remain unchanged. The pass retires launch presentation ownership after the first piercing impact, lets threat cues follow the temporary visible projectile position, and gives boss hazards one telegraph→active→aftermath lifecycle owner.

## Phase 3111~3116 — Piercing / Multi-hit Impact Carry Retirement
- Added `projectile-multihit-impact-retirement-rendering.ts` and deterministic audit.
- First impact may inherit the residual launch displacement already used by the projectile sprite.
- After the first impact, `visualLaunchOffset`, `visualLaunchTtl`, and `visualLaunchMaxTtl` are explicitly retired.
- A projectile that continues through pierce therefore returns to canonical trail ownership before subsequent hits.
- Subsequent impacts receive zero arrival carry, preventing duplicate launch trail / impact residue on the same projectile.
- Canonical `pierceLeft`, `hitIds`, damage, splash, slow, terrain impact, and collision flow are unchanged.

## Phase 3117~3122 — Projectile Threat / Near-miss Position Handoff
- Added `projectile-threat-position-handoff-rendering.ts` and deterministic audit.
- `EnemyProjectileView.pos` remains canonical gameplay position.
- A separate `visualPos` is exposed only for presentation systems.
- `dangerProjectileCues()` uses `visualPos ?? pos` for visual time/direction proximity while retaining canonical projectile data.
- World projectile threat rings/trails and edge threat indicators render from the same `visualPos` during launch convergence.
- When convergence completes, the handoff returns to canonical position automatically.
- Review found and fixed an initial double Reduced Motion compression: live launch offsets are already compressed at creation, so threat presentation now matches the actual visible projectile position for valid live offsets.

## Phase 3123~3128 — Boss Hazard Telegraph → Active → Aftermath Lifecycle Owner
- Added `boss-hazard-lifecycle-owner-rendering.ts` and deterministic audit.
- Telegraph, active hazard, and aftermath states are mutually exclusive lifecycle owners.
- Telegraph owner controls hazard shape / special stamp / lifecycle atlas alpha before activation.
- Active owner fully retires telegraph alpha after activation.
- After hazard expiry, the separate aftermath queue becomes the only lifecycle owner.
- Reduced Flash compresses aftermath intensity without reviving telegraph or active ownership.
- Existing launch-line→telegraph handoff remains intact and composes with the lifecycle owner without changing gameplay geometry.

## TDD / Regression
New tests:
- `tests/phase3111-3116-projectile-multihit-impact-retirement.test.mjs`
- `tests/phase3117-3122-projectile-threat-position-handoff.test.mjs`
- `tests/phase3123-3128-boss-hazard-lifecycle-owner.test.mjs`

TDD / review fixes:
- Initial RED: 18/18 failed before production implementation.
- GREEN: 18/18 passed after minimal presentation integration.
- `exactOptionalPropertyTypes` build failure fixed by allowing explicit `undefined` for presentation-only `visualPos`.
- Review found threat cue Reduced Motion was being compressed twice. The Phase 3120 test was changed to the stricter live-parity contract, observed RED, then the helper was fixed so threat position matches the visible projectile position.
- Related Phase 2931~3128 plus Phase 2402 / 2560 / 2653 contracts: 198/198 PASS.
- `git diff --check`: clean.

Final full regression on feature worktree:
- parallel-safe: 800 files / 2,824 tests / 0 fail
- exclusive serial: 10 files / 55 tests / 0 fail
- total: 810 files / 2,879 tests / 0 fail

Release gates after final fixes:
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9

## Assets
No new image atlas added. Existing projectile sprites, threat indicators, hazard lifecycle atlas, and hazard aftermath atlas already contain enough visual identity. Ownership correction gives the higher readability gain without extra loading, memory, or maintenance cost.

## Packaging
Rebuild and force-stage the full `dist/` tree before commit. After fast-forward merge to reconstructed `main`, rerun the full 810-file regression, release gates, archive reproducibility, provenance, package runtime smoke, and package run-cycle checks against the merged HEAD.

## Next Direction
Projectile and hazard lifecycle ownership is now coherent through impact/expiry. Prefer the next high-value battlefield gaps:
1. projectile deflection / shield-block presentation should hand ownership from incoming threat to block impact without leaving a stale danger ring;
2. splash / chain secondary impacts should inherit only canonical impact identity so secondary bursts never reuse the primary launch owner;
3. boss hazard aftermath should retire into terrain ambience / cleared-ground readability without overlapping the next hazard telegraph in the same lane.
