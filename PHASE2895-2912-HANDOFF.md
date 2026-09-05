# Phase 2895~2912 — Character Kinematic / Attack Anticipation / Contact Recoil Upgrade

## Scope
This pass continues the battlefield character-quality focus from Phase 2859~2894. It improves motion timing and weight using presentation-only state derived from existing movement, attack timers, and hit feedback. No gameplay formulas, collision rules, action count, persistence schema, or character identity art were changed.

## Baseline continuity repair
A fresh Phase 2894 extract exposed two old exact-source contracts that had drifted during the prior rendering pass:
- hero ground-shadow contract expected `ctx.ellipse(0, this.hero.radius + 11, ...)`
- enemy motion-shadow contract expected `ctx.ellipse(motionPresentation.shadowOffsetX, ...)`
Both were restored without losing the newer visual offsets by translating the canvas context before the canonical ellipse calls.
A second historical source contract for `heroResponseVfxSprite(this.hero.profileId,'flowBoost')` was also restored exactly.

## Phase 2895~2900 — Hero Kinematic Rendering
Added:
- `src/game/hero-kinematic-rendering.ts`
- `src/game/hero-kinematic-render-audit.ts`
- `tests/phase2895-2900-hero-kinematic-rendering.test.mjs`

Behavior:
- tracks presentation-only acceleration, deceleration, turn anticipation, settle, speed, and facing
- movement acceleration creates bounded forward lean
- abrupt direction changes create short turn anticipation
- movement stop creates settle/recovery rather than an immediate visual snap
- cast focus suppresses excessive movement lean so spell casting remains readable
- Reduced Motion scales the entire kinematic response down

## Phase 2901~2906 — Enemy Attack Anticipation / Lunge
Added:
- `src/game/enemy-attack-motion-rendering.ts`
- `src/game/enemy-attack-motion-render-audit.ts`
- `tests/phase2901-2906-enemy-attack-motion-rendering.test.mjs`

Behavior:
- uses canonical `attackTimer` and `attackInterval` only as read-only presentation inputs
- melee enemies pull back slightly near the end of the attack cycle, then lunge visually
- ranged enemies use a bounded aim-oriented body response toward the target
- boss / elite / siege-class displacement is capped by weight
- actual attack cadence, damage, range, projectile, and AI state remain unchanged

## Phase 2907~2912 — Character Ground Contact / Hit Recoil
Added:
- `src/game/character-contact-recoil-rendering.ts`
- `src/game/character-contact-recoil-render-audit.ts`
- `tests/phase2907-2912-character-contact-recoil-rendering.test.mjs`

Behavior:
- hero and enemy contact shadows now share a weight/motion-aware presentation function
- hero hit response converts the existing response intensity into a short bounded visual recoil
- enemy hit recoil derives from the existing `hitFlash` state; low shaman-heal flash does not trigger recoil
- heavier enemies receive smaller displacement to preserve mass
- visual white flash and recoil are capped and Reduced Motion aware

## Asset decision
No new image asset was added in this pass.
Phase 2894 already contains dedicated hero battle, motion, and cast atlases. The missing quality here was timing and physical response, so another atlas would add visual noise without new identity information.

Asset comparison against Phase 2894:
- baseline assets: 123 files
- Phase 2912 assets: 123 files
- byte-level changes: 0

## Verification
TDD:
- new contracts before implementation: 18/18 RED
- after implementation: 18/18 GREEN

Related rendering regression:
- 36/36 PASS

Full project test execution plan:
- parallel-safe: 764 files / 2,608 tests / 0 fail
- exclusive release/package/raster: 10 files / 55 tests / 0 fail
- total: 774 files / 2,663 tests / 0 fail

Release commands:
- Candidate: PASS / `RCQ-6006367D`
- Raster: 5/5 PASS
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`
- Release: PASS / `RQ-D4630257`
- Action invariant: 9/9

## Next recommended direction
1. hero cast direction body-pose alignment using existing cast atlas plus directional transform
2. specialist / elite attack resolve recovery so attack anticipation has a clearer end state
3. boss locomotion weight pass: phase-specific turn radius, dash settle, and foot-contact shock without altering boss AI
