# Phase 2913~2930 — Cast Orientation / Attack Resolve / Boss Locomotion Weight

## Scope
Presentation-only character motion refinement. This pass extends the existing Phase 2895~2912 kinematic/attack/recoil layer without changing combat formulas, AI movement speed, damage timing, collision, action count, or save schema.

## Phase 2913~2918 — Hero Cast Orientation Coherence
- Added `src/game/hero-cast-orientation-rendering.ts`.
- Cast/recover overlays now derive orientation from the hero's actual facing vector.
- Moving casts retain controlled locomotion lead while stationary casts suppress locomotion drift.
- Sharp turns are bounded before/during cast so the hero does not visually over-rotate.
- Recover state biases the body back toward neutral instead of snapping from cast to locomotion.
- Integrated into `Game.drawHero()` using the existing hero motion/cast atlases.
- Added `src/game/hero-cast-orientation-audit.ts` with 48 deterministic samples.

## Phase 2919~2924 — Enemy Attack Resolve / Settle
- Added `src/game/enemy-attack-resolve-rendering.ts`.
- Enemy instances now hold presentation-only `attackResolveMotion` state.
- The state is triggered only when the canonical update loop confirms a real attack/heal/projectile/contact action.
- Resolve speed varies by role:
  - assassin / hound: fast return
  - shieldbearer / brute: heavier return
  - siegeGolem / elite / boss: slow, bounded settle
- Rendering combines the new resolve offsets with existing windup/lunge motion without altering `attackTimer` or `attackInterval` semantics.
- Added `src/game/enemy-attack-resolve-audit.ts` with 64 deterministic samples.

## Phase 2925~2930 — Boss Locomotion Weight
- Added `src/game/boss-locomotion-weight-rendering.ts`.
- Boss turn response becomes visually heavier by phase while actual movement speed is untouched.
- Motion recovery produces bounded downward settle and stronger grounded shadow presence.
- Strong settle at low movement can emit a small Canvas contact ellipse; no new art atlas was necessary.
- Reduced Motion keeps the weight cue but compresses rotation, displacement, and pulse size.
- Added `src/game/boss-locomotion-weight-audit.ts` with 48 deterministic samples.

## Tests
New tests:
- `tests/phase2913-2918-hero-cast-orientation-rendering.test.mjs`
- `tests/phase2919-2924-enemy-attack-resolve-rendering.test.mjs`
- `tests/phase2925-2930-boss-locomotion-weight-rendering.test.mjs`

TDD:
- RED: 18/18 failed before implementation.
- GREEN: 18/18 passed after implementation.
- Related hero/enemy/boss rendering regression: 45/45 PASS.

Full regression execution plan:
- parallel-safe: 767 files / 2,626 tests / 0 fail
- exclusive serial: 10 files / 55 tests / 0 fail
- total: 777 files / 2,681 tests / 0 fail

Release gates:
- Candidate: `RCQ-6006367D` PASS
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Action invariant: 9/9

## Assets
No image assets added or changed in this pass.
The existing hero battle / motion / cast atlases and boss sprite/phase assets already provide sufficient visual identity. The remaining quality gap was timing and weight, so an extra atlas would add clutter without new information.

## Next Direction
For another battlefield-character quality pass, prioritize:
1. hero cast cadence chaining — consecutive spell casts should transition between cast/recover states without popping back to neutral;
2. specialist locomotion signatures — assassin blink arrival, shieldbearer brace, siege-golem plant/step weight;
3. boss special-action body language — archetype-specific pre-special posture using existing boss sprites and VFX before considering any new art.
