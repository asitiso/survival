# Phase 1895~1902 Handoff — Residual Combat Motion Alignment

## Execution Scope
This continuation covers six functional units while keeping Phase numbering compact. The pass removes the last independent low-priority battlefield pulses that can compete with the existing Combat Attention / Secondary Motion systems. No combat balance, AI, cooldown, reward, control, or snapshot schema changes are included.

## Phase 1895 — Residual Motion Ownership
A new `residualCombatMotionPolicy()` sits below primary Combat Attention and the existing secondary-motion owner.

Priority when combat primary is `normal`, Reduced Flash is OFF, and no meaningful secondary cue owns motion:
1. black-hole-vortex
2. terrain-crystal
3. golden-enemy
4. bomber-body
5. final-form-flow
6. none

`core-ambient` is intentionally allowed to yield to a more informative residual cue. When that happens the core ambient amplitude is forced to 0, preserving one moving low-priority owner.

## Phase 1896 — Golden / Bomber Body Rings
- Golden-enemy body ring no longer pulses independently when another motion owner exists.
- Bomber body ring no longer duplicates the already-higher-priority danger/priority ring motion.
- Ring color, enemy sprite, threat telegraph, target behavior, HP, speed, rewards, and explosion timing are unchanged.

## Phase 1897 — Terrain Crystal Motion
- Active crystal scale now consumes the residual-motion policy.
- `performance.now()` animation was removed from Terrain rendering; Terrain uses its deterministic update clock.
- Charge count, threshold, blast radius, blast damage, cooldown, map layout, and collision are unchanged.

## Phase 1898 — Final Form Flow Aura
- Final-form Flow aura radius motion consumes the residual owner.
- Flow streak state, trail count, trail length, mobility family, buffs, and final-form mechanics are unchanged.
- When steady, the aura and directional trails remain visible.

## Phase 1899 — Black Hole Vortex
- Black-hole radius pulse and decorative orbit movement now consume the residual owner.
- When motion is suppressed, orbit arcs remain as static identity geometry rather than disappearing.
- Pull, damage, tick rate, duration, radius, cooldown, evolution, fusion modifiers, and targeting are unchanged.

## Phase 1900 — Reduced Flash Screen-Effect Motion
`screenEffectScale()` now freezes radial expansion at scale 1 when Reduced Flash is enabled for:
- shockwave
- pulse
- glow

The effect still renders and alpha remains capped by the existing Reduced Flash rules. Flash visibility and all gameplay telegraphs remain intact.

## Phase 1901 — 48-Sample Deterministic Audit
`auditResidualCombatMotion()` locks:
- 5 residual features × 8 attention/secondary contexts = 40 samples
- 8 Reduced Flash screen-effect scale samples
- total 48 samples
- maximum animated residual owners: 1
- Reduced Flash residual amplitude: 0
- higher-attention / meaningful-secondary residual amplitude: 0
- Reduced Flash screen-effect radial scale delta: 0
- Actions: 9/9
- RunSnapshot schema mutation: false

## Phase 1902 — Release Fail-Closed
Release Freeze binds:
- `residualCombatMotionPassed`
- `residualCombatMotionSamples`

Candidate consistency requires the lower evidence; Candidate signature includes the sample count.
- forged `residualCombatMotionPassed=false` + top-level `passed=true` => Candidate REVIEW
- sample-count mutation => Candidate signature changes

## Verification
- Dedicated Phase tests: 11/11 PASS
- Focused terrain/spell/enemy/presentation/accessibility regression: 137/137 PASS
- Full regression: 432 test files / 1,658 tests / 1,658 PASS
- Fresh TypeScript build: PASS
- Release Freeze: PASS · `residual-combat-motion safe (48)`
- Candidate: PASS · `RCQ-4785B17A`
- Forged residual evidence: REVIEW (`release-freeze`)
- Sample-count mutation signature: `RCQ-2511D021`
- Actions: 9/9
- Snapshot schema mutation: false

## Asset Delta
- New image files: 0
- Existing image assets remain unchanged.
- This pass deliberately avoids new art because motion arbitration creates more user benefit than another asset layer in these six locations.

## Frozen Systems
No changes to enemy/boss spawn cadence, AI, enemy stats, hero stats, spell damage/cooldowns, black-hole gameplay effects, crystal gameplay effects, field rewards, economy, audio scheduler, haptic patterns, AUTO targeting, 9 Actions, persistence, or RunSnapshot schema.
