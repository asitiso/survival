# Phase 3039~3056 — Hero Hit Ground Handoff / Regular Defeat Retirement / Boss Special-Origin Handoff

## Scope
Presentation-only battlefield ground-contact coherence pass. Combat formulas, cooldowns, AI decisions, collision, damage timing, action count, persistence schema, and balance remain unchanged. The pass closes the remaining body/shadow origin gaps around hero hit recoil, non-specialist deaths, and boss summon/materialize/teleport transitions.

## Phase 3039~3044 — Hero Hit-Recoil / Shadow Compression & Recovery Handoff
- Added `src/game/hero-hit-ground-handoff-rendering.ts` and deterministic audit.
- Heavy hero hit recoil compresses and slightly broadens the ground shadow while following only a bounded fraction of body recoil.
- Recovery hands ground ownership back smoothly instead of snapping from hit-anchored shadow to locomotion shadow.
- Cast, perfect evade, and ultimate immediately override stale hit-ground ownership so higher-priority action readability remains intact.
- Shadow offset is bounded independently from body displacement, preventing heavy damage from making the hero appear to skate across the ground.
- Reduced Motion tightens shadow displacement and compression while preserving the same ownership priority.
- Existing hero sprite and VFX assets are reused.

## Phase 3045~3050 — Regular / Elite Defeated-Body Ground Retirement
- Added `src/game/regular-defeat-ground-retirement-rendering.ts` and deterministic audit.
- Extended grounded retirement from specialists to grunt, hound, brute, archer, bomber, shaman, golden, and elite enemies.
- Fatal shadows follow only a small bounded fraction of the defeated-body displacement.
- Brute and elite retirement remain broader/heavier; hound and archer retirement remain lighter while sharing the existing sprite atlas.
- Fatal ground pulse remains disabled for these retirement poses, avoiding extra VFX density in large kills.
- Shadow retirement reaches zero before the defeated-body queue expires, preventing one-frame ground remnants after the pose ends.
- Existing specialist retirement behavior and its source contract remain preserved.

## Phase 3051~3056 — Boss Summon / Materialize / Teleport Special-Origin Handoff
- Added `src/game/boss-special-origin-handoff-rendering.ts` and deterministic audit.
- Added render-only `bossSpecialOriginHandoff` state; it is not serialized into persistence snapshots.
- Newly summoned adds receive a short materialize ownership window that mutes locomotion/contact motion while their shadow settles at the new origin.
- Boss summon actions briefly suppress stale contact pulses so the boss ground cue does not compete with add materialization.
- Boss dash/teleport actions capture the pre-displacement origin with a bounded trail cap while existing boss ground rebase remains authoritative for boss shadow position.
- Shadow alpha, locomotion motion, and contact-pulse ownership share the same special-origin state.
- Integration review found and removed a duplicate special-origin locomotion attenuation path; the attenuation is now applied exactly once.
- Reduced Motion shortens the handoff and tightens origin displacement.

## TDD / Regression
New tests:
- `tests/phase3039-3044-hero-hit-ground-handoff.test.mjs`
- `tests/phase3045-3050-regular-elite-defeat-ground-retirement.test.mjs`
- `tests/phase3051-3056-boss-special-origin-handoff.test.mjs`

TDD:
- Initial RED: 18/18 failed before production implementation.
- GREEN: 18/18 passed after integration.
- Teleport ground-origin cap boundary was reproduced and tightened to a 20 px maximum.
- Diff review found duplicate special-origin locomotion attenuation; regression coverage was added and the multiplier was reduced to one application.
- Existing Phase 3032 `retirement` integration contract was restored after a source-regression test caught the renamed variable.
- Related Phase 2931~3056 battlefield motion regression: 126/126 PASS.
- `git diff --check`: clean.

Full regression:
- parallel-safe: 788 files / 2,752 tests / 0 fail
- exclusive serial: 10 files / 55 tests / 0 fail
- total: 798 files / 2,807 tests / 0 fail

Release gates:
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9

## Assets
No new image atlas was added. Existing hero/enemy/boss sprites already provide the required identity. Ground-origin ownership corrections produce a larger readability gain than another asset layer and avoid extra loading, memory, and maintenance cost.

## Next Direction
Prefer the last high-value ground/motion coherence gaps before adding decorative VFX:
1. hero knockback/critical-damage ground recovery should share the same final settle owner with movement restart, avoiding a one-frame shadow snap after crisis hits;
2. enemy spawn/materialize ground handoff should be generalized from boss-summoned adds to ordinary lane spawns only where portal VFX is active, avoiding universal spawn overhead;
3. boss large-displacement aftermath should arbitrate debris/dust origin with the same rebase owner so aftermath particles never point back to a stale pre-dash origin.
