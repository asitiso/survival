# Phase 2949~2966 — Hero Action Transition Coherence / Specialist Turn-Stop Signatures / Boss Post-Special Recovery Body Language

## Scope
Presentation-only battlefield character motion refinement. This pass continues the Phase 2931~2948 character-motion layer without changing combat formulas, cooldowns, AI movement speed, collision, damage timing, save schema, or action count.

## Phase 2949~2954 — Hero Action Transition Coherence
- Added `src/game/hero-action-transition-rendering.ts`.
- Actual hero hit, confirmed spell cast, and actual perfect-evade events now feed a short presentation transition state.
- Hit → cast keeps a bounded portion of recoil instead of visually snapping through neutral.
- Cast → evade suppresses the cast recovery pop and carries the hero forward into the evade read.
- Rapid hit → cast → evade sequences are capped to bounded translation, rotation, and scale.
- Reduced Motion preserves transition identity while compressing displacement and rotation.
- Added `src/game/hero-action-transition-audit.ts` with 64 deterministic samples.

## Phase 2955~2960 — Specialist Turn / Stop Signatures
- Added `src/game/specialist-turn-stop-rendering.ts`.
- Assassin blink arrival now retains exit direction through the following turn instead of immediately losing directional intent.
- Shieldbearer brace recovery pivots around a wider grounded stance during reorientation.
- Siege Golem stopping motion settles vertically with restrained rotation and heavier grounding.
- Nullifier turn/stop response stays intentionally restrained so its field identity remains primary.
- The layer reuses existing `renderMotion` and specialist locomotion state; no gameplay state or new asset is required.
- Reduced Motion keeps role identity while compressing transform amplitude.
- Added `src/game/specialist-turn-stop-audit.ts` with 64 deterministic samples.

## Phase 2961~2966 — Boss Post-Special Recovery Body Language
- Added `src/game/boss-special-recovery-rendering.ts`.
- Recovery is triggered only when `updateBossSpecial()` actually executes a boss special.
- Archetype-specific release language now mirrors the anticipation identity added in Phase 2943~2948:
  - inferno: rebound after flare
  - summoner: controlled descent after channel
  - juggernaut: forward follow-through and heavy settle
  - abyssWitch: descending uncoil
  - twinMaw: counter-yaw after split attack
  - timeEater: release from compression
- Recovery fully decays to neutral with no residual transform.
- Existing boss sprites are reused; pre-special body language and post-special recovery do not overlap because they are driven by separate parts of the existing special timer cycle.
- Reduced Motion preserves stance identity while compressing displacement and rotation.
- Added `src/game/boss-special-recovery-audit.ts` with 72 deterministic samples.

## TDD / Review
New tests:
- `tests/phase2949-2954-hero-action-transition-coherence.test.mjs`
- `tests/phase2955-2960-specialist-turn-stop-signatures.test.mjs`
- `tests/phase2961-2966-boss-special-recovery-body-language.test.mjs`

TDD:
- Initial RED: 18/18 failed before implementation.
- GREEN: 18/18 passed after implementation.
- Related character-motion regression: 76/76 PASS.
- `git diff --check`: clean.

Full regression:
- parallel-safe: 773 files / 2,662 tests / 0 fail
- exclusive serial: 10 files / 55 tests / 0 fail
- total: 783 files / 2,717 tests / 0 fail

Release gates:
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9

## Assets
No new image atlas was added in this pass.
The existing hero motion/cast atlas, specialist sprites/VFX, and boss sprites already provide the needed visual identity. A new atlas would add maintenance, loading, and battlefield clutter without a proportional readability gain.

## Next Direction
For the next battlefield-character quality pass, prioritize:
1. hero ultimate wind-up → release → recovery body continuity, using existing ultimate signature assets where possible;
2. regular/specialist enemy hit → stagger → death transition coherence so defeated sprites do not visually pop out of motion;
3. boss heavy-hit stagger hierarchy that respects archetype/phase and never obscures special telegraphs.
