# Phase 2967~2984 — Hero Ultimate Body Continuity / Enemy Hit-Death Coherence / Boss Heavy-Hit Stagger Hierarchy

## Scope
Presentation-only battlefield character-motion refinement. This pass continues the Phase 2949~2966 transition work without changing combat formulas, cooldowns, AI, collision, damage timing, action count, or snapshot schema.

## Phase 2967~2972 — Hero Ultimate Body Continuity
- Added `src/game/hero-ultimate-body-continuity-rendering.ts`.
- Successful Meteor Storm / Black Hole casts now drive a short wind-up → release → recovery body sequence while the existing gameplay cast remains immediate.
- Meteor Storm uses grounded wind-up, upward release, and controlled recovery.
- Black Hole uses inward compression and counter-rotation so the two ultimates read differently before the existing VFX resolves.
- Ordinary cast-recovery body pop is suppressed while the ultimate continuity layer owns the pose.
- The state fully returns to neutral with no residual transform.
- Reduced Motion preserves phase/stance identity while compressing translation and rotation.
- Added a deterministic 64-sample presentation audit.

## Phase 2973~2978 — Enemy Hit → Stagger → Death Transition Coherence
- Added `src/game/enemy-hit-death-transition-rendering.ts`.
- Existing hit severity is translated into bounded normal/heavy/critical stagger identity for non-boss enemies.
- Fatal hits snapshot the enemy's final facing, motion blend, turn, impact direction, radius, and hit tier.
- `Game` keeps a bounded defeated-body presentation queue so a killed sprite carries the final hit direction briefly instead of disappearing at the damage frame.
- Assassin/light roles tumble farther, while shieldbearer/brute/siege-golem deaths settle more heavily.
- Existing enemy sprite atlas cells are reused for the defeated-body continuation; no duplicate death atlas is introduced.
- Queue length is capped at 20 and lifetime is shortened under Reduced Motion.
- Reduced Motion keeps role/direction/alpha identity while compressing displacement and rotation.
- Added a deterministic 72-sample presentation audit.

## Phase 2979~2984 — Boss Heavy-Hit Stagger Hierarchy
- Added `src/game/boss-heavy-hit-stagger-rendering.ts`.
- Only existing heavy/critical damage tiers trigger the dedicated boss stagger layer; normal hits keep the normal response path.
- Critical hits read stronger than heavy hits while displacement, rotation, and scale remain bounded.
- Six boss archetypes receive restrained posture differences; Juggernaut stays more grounded while caster archetypes can rotate/shift more visibly.
- Later boss phases are more stable so high-frequency late-fight damage does not make the boss silhouette noisy.
- Existing special-attack telegraph windows have hard priority: when `specialTimer <= 1.2`, dedicated stagger and generic recoil are compressed to 8% so anticipation body language remains readable.
- Reduced Motion preserves stagger tier/stance identity while compressing transforms.
- Added a deterministic 72-sample presentation audit.

## TDD / Regression
New tests:
- `tests/phase2967-2972-hero-ultimate-body-continuity.test.mjs`
- `tests/phase2973-2978-enemy-hit-death-transition-coherence.test.mjs`
- `tests/phase2979-2984-boss-heavy-hit-stagger-hierarchy.test.mjs`

TDD:
- Initial RED: 18/18 failed before production implementation.
- GREEN: 18/18 passed after implementation.
- Related battlefield motion/VFX regression: 110/110 PASS.
- `git diff --check`: clean.

Full regression:
- parallel-safe: 776 files / 2,680 tests / 0 fail
- exclusive serial: 10 files / 55 tests / 0 fail
- total: 786 files / 2,735 tests / 0 fail

Release gates:
- Raster: 5/5 PASS
- Release: `RQ-D4630257` PASS
- Candidate: `RCQ-6006367D` PASS
- Action invariant: 9/9

## Assets
No new image atlas was added in this pass.
The existing hero ultimate VFX, enemy sprite atlas, and boss sprites already carry enough identity; adding another atlas would increase loading and maintenance cost without a proportional battlefield-readability gain.

## Next Direction
For the next character-quality pass, prioritize arbitration between the motion layers now present rather than adding more simultaneous effects:
1. hero ultimate recovery → movement / normal spell handoff so the next action cleanly takes ownership of the body pose;
2. enemy attack wind-up / hit-stagger / fatal transition priority so a hit does not visually fight an already committed specialist attack;
3. boss heavy-hit stagger ↔ special recovery arbitration so recent heavy damage never destabilizes a high-priority special-action silhouette.
