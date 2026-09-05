# Phase 2931~2948 — Cast Cadence Chain / Specialist Locomotion Signatures / Boss Special Body Language

## Scope
Presentation-only battlefield character motion refinement. This pass continues the Phase 2913~2930 character-motion layer without changing combat formulas, cooldowns, AI speed, collision, damage timing, save schema, or action count.

## Phase 2931~2936 — Hero Cast Cadence Chaining
- Added `src/game/hero-cast-cadence-rendering.ts`.
- Consecutive successful casts inside a short presentation bridge window retain cast continuity instead of visually dropping back to neutral between casts.
- Chain state is driven only by already-confirmed successful casts from `handleSuccessfulCast()`.
- Moving cast chains retain a bounded forward lead while stationary chains stay centered.
- Recovery overlay strength is reduced during an active chain, then returns naturally when the bridge expires.
- Reduced Motion preserves chain identity while compressing displacement and scale.
- Added `src/game/hero-cast-cadence-audit.ts` with 48 deterministic samples.

## Phase 2937~2942 — Specialist Locomotion Signatures
- Added `src/game/specialist-locomotion-signature-rendering.ts`.
- Assassin blink now gets a short arrival compression/catch-up motion at the actual blink event.
- Shieldbearer guard blocks trigger a bounded brace stance with wider footing.
- Siege Golem confirmed contact attacks trigger a heavy plant/settle motion and short ground pulse.
- Ground pulse is strictly event-bound; an idle Siege Golem emits no residual ring.
- Nullifier remains visually neutral in this layer so its existing field identity is not duplicated.
- Reduced Motion compresses displacement while retaining role identity.
- Added `src/game/specialist-locomotion-signature-audit.ts` with 60 deterministic samples.

## Phase 2943~2948 — Boss Special-Action Body Language
- Added `src/game/boss-special-body-language-rendering.ts`.
- Existing `specialTimer` telegraph timing now also drives archetype-specific body posture:
  - inferno: flare / forward expansion
  - summoner: channel / lift
  - juggernaut: charge brace / compression
  - abyssWitch: levitation
  - twinMaw: split yaw
  - timeEater: tight compression
- Body language reuses the current boss sprites and telegraph colors; no gameplay timing or projectile logic changed.
- Existing telegraph rings receive a small bounded radius reinforcement from the same charge value.
- Reduced Motion preserves stance identity while compressing transforms.
- Added `src/game/boss-special-body-language-audit.ts` with 72 deterministic samples.

## TDD / Review
New tests:
- `tests/phase2931-2936-hero-cast-cadence-chain.test.mjs`
- `tests/phase2937-2942-specialist-locomotion-signatures.test.mjs`
- `tests/phase2943-2948-boss-special-body-language.test.mjs`

TDD:
- Initial RED: 18/18 failed before implementation.
- Initial GREEN: 18/18 passed after implementation.
- Diff review found a Siege Golem idle ground-ring leak.
- Added a regression assertion first: 5/6 pass, 1/6 fail with idle alpha `0.09` instead of `0`.
- Fixed the root cause in the presentation formula; specialist suite returned to 6/6 pass.

Related character-render regression:
- 57/57 PASS before the final idle-ring regression fix.
- Specialist regression after the fix: 6/6 PASS.

Full regression after the final fix:
- parallel-safe: 770 files / 2,644 tests / 0 fail
- exclusive serial: 10 files / 55 tests / 0 fail
- total: 780 files / 2,699 tests / 0 fail

Release gates after the final fix:
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9

## Assets
No new image atlas was added in this pass.
The existing hero motion/cast atlases, specialist VFX, boss sprites, and boss telegraphs already carry the necessary visual identity. Adding another atlas would increase maintenance and battlefield clutter without a proportional readability gain.

## Next Direction
For the next battlefield-character quality pass, prioritize:
1. hit-to-cast and cast-to-evade transition coherence for the hero;
2. specialist turn/stop signatures, especially assassin exit direction and shieldbearer reorientation after brace;
3. boss post-special recovery body language so large actions resolve with the same archetype identity used during anticipation.
