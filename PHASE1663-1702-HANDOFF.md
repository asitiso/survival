# Phase 1663~1702 — Target Guidance Motion Alignment

## Scope
Bounded combat-HUD motion alignment pass. AUTO target selection, weakpoint selection/effects, boss mechanics, HP, damage, healing, potion behavior, cooldowns, economy, audio scheduling, haptic patterns, snapshot schema, and the 9-action surface remain unchanged.

## Phase 1663~1670 — Target Guidance Motion Ownership
- Added `targetGuidanceMotionPolicy()` beneath the existing global combat-attention policy.
- Target-guidance motion is allowed only while global combat attention is `normal` and Reduced Flash is off.
- Motion ownership order is fixed to: primary boss weakpoint → AUTO target → none.
- When weakpoint and AUTO target are both visible, only the primary weakpoint can animate.

## Phase 1671~1678 — AUTO Target Motion Alignment
- Replaced the unconditional AUTO target `sin(elapsed * 8) * .08` pulse with policy-controlled amplitude.
- AUTO ring remains rendered when valid, but becomes steady while a weakpoint owns target-guidance motion.
- Any hero/core critical, critical/heavy damage, boss response, or boss countdown also makes the AUTO ring steady.
- Existing AUTO label arbitration and target-selection behavior were not changed.

## Phase 1679~1686 — Weakpoint Motion Alignment
- Replaced unconditional per-node weakpoint `sin(elapsed * 7 + node.id) * .08` pulses with policy-controlled amplitude.
- Only the current `primaryWeakpointNode()` may animate; secondary live weakpoints remain steady.
- Weakpoint motion is suppressed during higher-priority combat attention and Reduced Flash.
- Weakpoint targeting, HP, break behavior, vulnerability, boss cadence, and labels retain their prior rules.

## Phase 1687~1694 — Critical / Accessibility / Transition Safety
- hero critical → target guidance steady
- core critical → target guidance steady
- critical damage → target guidance steady
- boss response → target guidance steady
- heavy damage → target guidance steady
- boss countdown → target guidance steady
- Reduced Flash → target guidance motion amplitude 0
- loss of both weakpoint and AUTO target → no stale motion owner

## Phase 1695~1700 — Target Guidance Attention Audit
Added `target-guidance-attention-audit.ts` with 25 deterministic samples.

Locked targets:
- animated target-guidance owners <= 1
- critical target-guidance motion amplitude = 0
- Reduced Flash target-guidance motion amplitude = 0
- duplicate weakpoint/AUTO motion = 0
- stale motion replay = 0
- valid AUTO/weakpoint indicator visibility = 100%
- action reachability = 9/9
- snapshot schema mutation = false

## Phase 1701~1702 — Release Fail-Closed
- Release Freeze now contains `targetGuidanceAttentionPassed` and `targetGuidanceAttentionSamples`.
- Candidate consistency requires target-guidance attention evidence to pass.
- Candidate signature binds the target-guidance sample count.
- Forging parent `passed=true` while target-guidance evidence is false fails closed with `release-freeze`.

## Verification
- Targeted AUTO / weakpoint / combat-attention / accessibility / foldable regression: 34/34 PASS.
- Full suite across all 393 test files, split only to stay within command runtime limits:
  - batch A: 381/381 PASS
  - batch B: 383/383 PASS
  - batch C: 410/410 PASS
  - batch D1: 95/95 PASS
  - batch D2: 92/92 PASS
  - batch D3: 90/90 PASS
  - batch D4: 105/105 PASS
  - total: 1556/1556 PASS
- `npm run verify:candidate`: PASS
- Candidate signature: `RCQ-DF217CF3`
- Release Freeze: `target-guidance-attention safe (25)`

## Source Changes
- `src/game/combat-cue-priority.ts`
- `src/game/game.ts`
- `src/game/target-guidance-attention-audit.ts` (new)
- `src/game/release-freeze-audit.ts`
- `src/game/release-candidate-audit.ts`
- `tests/phase1663-1702-target-guidance-attention.test.mjs` (new)

## Repository Note
The supplied Phase 1662 source tree does not contain `.git`, so no truthful branch/main merge commit can be produced from this archive alone. The delivered ZIP is the fully merged Phase 1702 source tree based directly on the supplied Phase 1662 package.
