# Phase 1623~1662 — Boss Countdown Attention Alignment

## Scope
Bounded HUD-only alignment pass. Boss timing/cadence, HP, damage, healing, potion behavior, AUTO, cooldowns, economy, audio scheduling, haptic patterns, snapshot schema, and the 9-action surface remain unchanged.

## Phase 1623~1630 — Countdown Global Priority
- Added boss countdown to `combatAttentionPolicy()` without changing `combatCuePriorityPolicy()` ordering semantics.
- Priority is now: hero critical → core critical → critical damage → boss response → heavy damage → boss countdown → normal.
- Countdown remains visible while higher-priority warnings own motion.

## Phase 1631~1638 — Boss Warning Single Motion
- Replaced unconditional `0.75 + sin(elapsed * 8) * 0.18` motion with attention-policy controlled motion.
- Countdown animates only when it is the primary warning.
- Higher-priority warning active: countdown is steady.
- Reduced Flash: countdown motion amplitude is 0.
- Banner text and remaining seconds stay visible.

## Phase 1639~1646 — Opening Prep Coordination
- Existing shop/potion prep assist remains intact and never auto-acts.
- Prep assist ring becomes steady while boss countdown owns attention or a critical warning is primary.
- Prep label remains visible.
- No new action or interaction surface was added.

## Phase 1647~1654 — Spawn / Transition Safety
- `bossCountdown <= 0` immediately removes countdown policy visibility/motion.
- Boss response can immediately take over after spawn.
- Next countdown cycle starts cleanly from the same policy path.
- Existing Phase 1622 haptic arbitration was not changed.

## Phase 1655~1660 — Countdown Attention Audit
Added `boss-countdown-attention-audit.ts` with 25 deterministic samples.

Locked targets:
- animated primary combat warnings <= 1
- countdown visibility = 100%
- critical countdown motion amplitude = 0
- Reduced Flash countdown motion amplitude = 0
- stale countdown replay = 0
- opening prep duplicate motion = 0
- action reachability = 9/9
- snapshot schema mutation = false

## Phase 1661~1662 — Release Fail-Closed
- Release Freeze now contains `bossCountdownAttentionPassed` and `bossCountdownAttentionSamples`.
- Candidate consistency requires countdown attention evidence to pass.
- Candidate signature binds the countdown attention sample count.
- Forging parent `passed=true` while countdown evidence is false fails closed.

## Verification
- Targeted attention/opening-prep/haptic regression: 19/19 PASS.
- Release Freeze + post-freeze consistency regression: 32/32 PASS.
- Full test suite, split into four bounded groups due command runtime limits:
  - batch A: 399/399 PASS
  - batch B: 428/428 PASS
  - batch C: 283/283 PASS
  - batch D: 439/439 PASS
  - total: 1549/1549 PASS
- `npm run verify:candidate`: PASS
- Candidate signature: `RCQ-C10D2CDE`
- Release Freeze: `boss-countdown-attention safe (25)`

## Source Changes
- `src/game/combat-cue-priority.ts`
- `src/game/game.ts`
- `src/game/boss-countdown-attention-audit.ts` (new)
- `src/game/release-freeze-audit.ts`
- `src/game/release-candidate-audit.ts`
- `tests/phase1623-1662-boss-countdown-attention.test.mjs` (new)

## Repository Note
The supplied Phase 1622 ZIP does not contain `.git`, so no truthful branch/main merge commit can be produced from this archive alone. The delivered ZIP is the fully merged Phase 1662 source tree based directly on the supplied Phase 1622 package.
