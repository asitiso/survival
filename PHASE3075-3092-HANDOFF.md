# Phase 3075~3092 — Projectile / Hazard Visual Launch Origin Coherence

## Scope
Presentation-only battlefield launch-origin pass. Projectile gameplay positions, velocity, target selection, collision, damage timing, chain-jump budgets, boss hazard gameplay geometry, action count, persistence schema, and balance remain unchanged. The pass makes newly spawned projectiles and hazards visually depart from the final rendered body pose instead of appearing detached from fast-moving or recently rebased actors.

## Phase 3075~3080 — Hero Normal / Ultimate Projectile Launch Origin
- Added `src/game/hero-projectile-launch-origin-rendering.ts` and deterministic audit.
- The final rendered hero body offset is cached and passed into spell presentation as `visualBodyOffset`.
- Normal and ultimate launch origins follow the final body pose plus normalized facing, with bounded forward distance.
- Projectile gameplay `pos` and `vel` remain unchanged; `visualLaunchOffset` + short TTL affect only initial rendering and converge to gameplay position.
- Ultimate launch retains stronger forward pose ownership while staying bounded.
- Reduced Motion tightens body/facing displacement and convergence lifetime.
- Chain Lightning keeps its canonical propagation points and jump budget. Review restored the existing `for(let i=1;...)` propagation loop and applies visual launch origin only to the first visual segment.
- Existing circular projectile fallback remains anchored to canonical `projectile.pos`; launch-origin offset applies to the sprite path so the existing fail-open rendering contract is preserved.

## Phase 3081~3086 — Ranged Enemy Projectile Launch Origin
- Added `src/game/ranged-enemy-projectile-launch-origin-rendering.ts` and deterministic audit.
- Archer release origin follows the existing attack pullback / lunge / resolve pose and normalized facing.
- Live `fireEnemyProjectile()` captures a bounded presentation offset and short convergence TTL.
- Enemy projectile gameplay trajectory, including the existing `260 * endlessProjectileSpeedMultiplier` velocity formula, remains unchanged.
- Reduced Motion compresses release displacement and TTL while preserving the attack-pose owner.
- Existing enemy sprites and projectile visuals are reused.

## Phase 3087~3092 — Boss Special Projectile / Hazard Launch Origin
- Added `src/game/boss-special-launch-origin-rendering.ts` and deterministic audit.
- Boss projectile launch origin combines existing special body-language pose with bounded large-displacement rebase ownership.
- Fan / ring projectile gameplay origins and velocity formulas remain unchanged; only the first render frames use `visualLaunchOffset` and converge back to the canonical trajectory.
- Boss arena hazards keep their gameplay `hazard.pos` and geometry unchanged. Newly created hazards may carry a short `launchOrigin` cue connecting the current boss body owner to the hazard for roughly 0.22 s.
- Large-displacement handoff is bounded so launch visuals never follow the full stale pre-dash origin.
- Reduced Motion compresses projectile and hazard visual offsets while retaining owner semantics.
- Existing boss telegraphs / hazard rendering are reused; no new hazard gameplay type was introduced.

## TDD / Regression
New tests:
- `tests/phase3075-3080-hero-projectile-launch-origin.test.mjs`
- `tests/phase3081-3086-ranged-enemy-projectile-launch-origin.test.mjs`
- `tests/phase3087-3092-boss-special-launch-origin.test.mjs`

TDD / review fixes:
- Initial RED: 18/18 failed before production implementation.
- GREEN: 18/18 passed after integration.
- Phase 2402 fallback rendering contract: full regression exposed that moving the circular fallback to `visualPos` violated the established fail-open contract. The fix restored fallback drawing at canonical `projectile.pos` while retaining visual launch offset for the sprite path.
- Phase 2560 Chain Lightning propagation contract: full regression exposed that inserting the visual start into the propagation loop changed the required source structure. The fix draws only the first visual segment from the presentation origin and restores the canonical `for(let i=1;...)` propagation loop / points.
- Related Phase 2931~3092 battlefield motion regression: 162/162 PASS after the final fixes.
- `git diff --check`: clean.

Full regression on the feature worktree after final fixes:
- parallel-safe: 794 files / 2,788 tests / 0 fail
- exclusive serial: 10 files / 55 tests / 0 fail
- total: 804 files / 2,843 tests / 0 fail

Release gates on the feature worktree after final fixes:
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9

## Assets
No new image atlas was added. Existing hero spell/projectile sprites, archer projectile visuals, boss sprites, and hazard telegraphs already carry sufficient identity. Correcting launch-origin attachment provides a larger readability gain than another asset layer and avoids additional loading, memory, and maintenance cost.

## Packaging
The Phase 3074 reconstructed repository tracks `dist/`. Final packaging must rebuild and force-stage the complete runtime `dist/` tree so the Git archive remains directly runnable and package smoke tests continue to see all required runtime modules.

## Next Direction
Launch-origin coherence is now established. Prefer the next high-value battlefield continuity gaps:
1. projectile trail / residue start points should share the temporary visual launch owner during convergence without changing the canonical trajectory;
2. ranged enemy and hero projectile arrival / impact presentation should hand off cleanly from the visual launch owner to the canonical gameplay impact point;
3. boss hazard launch cues should transition into active telegraph ownership without leaving a duplicate line or stale origin after materialization.
