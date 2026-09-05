# Phase 3057~3074 — Crisis Ground Settle / Portal Materialize Ground Handoff / Boss Displacement Aftermath Origin

## Scope
Presentation-only battlefield origin-coherence pass. Combat formulas, cooldowns, AI decisions, collision, damage timing, action count, persistence schema, and balance remain unchanged. This pass closes the final high-value ground/motion gaps around crisis-hit recovery, ordinary portal spawns, and boss large-displacement aftermath origin.

## Phase 3057~3062 — Hero Critical / Knockback Final Ground Settle
- Added `src/game/hero-crisis-ground-settle-rendering.ts` and deterministic audit.
- Strong hit presentation events (intensity >= 0.9) start a short crisis settle state; ordinary hits do not create the extra state.
- The crisis owner persists after direct hit recoil fades so movement restart inherits the same ground owner instead of snapping for one frame.
- The existing hit-ground handoff remains authoritative during the actual impact; review found and removed an initial duplicate `groundMotionScale × movementRestartScale` suppression path.
- Recovery ground motion converges monotonically back to normal locomotion while shadow follow, width, and height remain tightly bounded.
- Reduced Motion shortens the settle lifetime and compresses distortion.
- Existing hero sprites and response VFX are reused.

## Phase 3063~3068 — Ordinary Lane Portal Spawn Materialize Ground Handoff
- Added `src/game/enemy-portal-ground-materialize-rendering.ts` and deterministic audit.
- Ordinary `spawn()` enemies receive materialize ground ownership only on the same path that queues the existing spawn portal VFX.
- Boss spawns are excluded from this layer; boss-summoned adds keep their existing boss-special-origin materialize owner.
- Regular, specialist, and elite spawns use different shadow width/weight while locomotion and ground pulse are briefly muted.
- The optional `spawnGroundMaterialize` state retires to `undefined` after the portal handoff window, avoiding permanent per-enemy presentation overhead.
- Reduced Motion is passed through `EnemyUpdateContext` so the live state lifetime is shortened, not only the final draw amplitude.
- Existing spawn-pressure / battlefield-interaction atlases are reused.

## Phase 3069~3074 — Boss Large-Displacement Aftermath Origin Rebase
- Added `src/game/boss-displacement-aftermath-origin-rendering.ts` and deterministic audit.
- Boss contact/dust-style aftermath cues follow a bounded fraction of the same ground rebase origin used by the boss shadow after large displacement.
- The aftermath origin is capped to 18 px horizontally / 11 px vertically (11 / 7 under Reduced Motion), preventing cues from pointing back to the full stale pre-dash origin.
- Existing special-action priority suppresses stale aftermath density during active special-origin handoff.
- Review found that multiplying the new aftermath scale with existing `bossGroundRebase` and `bossSpecialOriginHandoff` pulse scales would triple-attenuate the same signal; the final integration uses `Math.min(...)` as an upper-bound arbitration instead of another product.
- No new debris particle system was added; the existing boss contact/aftermath cue is translated to the shared rebase owner.

## TDD / Regression
New tests:
- `tests/phase3057-3062-hero-crisis-ground-settle.test.mjs`
- `tests/phase3063-3068-enemy-portal-ground-materialize.test.mjs`
- `tests/phase3069-3074-boss-displacement-aftermath-origin.test.mjs`

TDD / review fixes:
- Initial RED: 18/18 failed before production implementation.
- GREEN: 18/18 passed after initial integration.
- Boss aftermath duplicate attenuation: source regression test failed first, then final `Math.min(...)` arbitration passed.
- Live Reduced Motion portal lifetime: integration test failed first, then `EnemyUpdateContext.reducedMotion` wiring passed.
- Hero crisis duplicate ground suppression: source regression test failed first, then impact-time duplicate suppression was removed and settle-only ownership passed.
- Related Phase 2931~3074 battlefield motion regression: 144/144 PASS.
- `git diff --check`: clean.

Full regression after final fixes:
- parallel-safe: 791 files / 2,770 tests / 0 fail
- exclusive serial: 10 files / 55 tests / 0 fail
- total: 801 files / 2,825 tests / 0 fail

Release gates after final fixes:
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9

## Assets
No new image atlas was added. Existing hero response, spawn portal, enemy, and boss sprites already provide the required identity. Correcting ownership/origin coherence provides a larger readability gain than an additional asset layer and avoids extra loading, memory, and maintenance cost.

## Packaging
The uploaded Phase 3056 ZIP did not contain `.git`, so the repository baseline was reconstructed locally. Because the project `.gitignore` excludes `dist/`, the reconstructed baseline did not track runtime build output. The Phase 3074 feature commit force-tracks the current complete `dist/` tree so the final Git archive retains the same directly runnable package structure expected by package smoke tests.

## Next Direction
Ground/motion origin coherence is now mature enough to stop adding more ground-only layers. Prefer the next high-value battlefield readability gaps:
1. hero normal-cast / ultimate projectile launch origin should follow the final body pose and facing owner during fast movement and action handoff;
2. ranged enemy projectile launch origin should follow attack pullback/lunge/resolve transforms so arrows and casts never appear to detach from the moving body;
3. boss special projectile / hazard launch origin should share special body-language and rebase ownership after large displacement, without changing projectile gameplay trajectories.
