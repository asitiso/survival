# Phase 1887~1894 Handoff — Secondary Combat Motion Arbitration

## Scope
This execution deliberately covers six functional units while keeping Phase numbering compact. The goal is to remove the remaining independent secondary pulses from the battlefield and route them through the existing Combat Attention system. No gameplay tuning is changed.

## Phase 1887 — Priority Threat Ring Alignment
- `drawPriorityThreats()` is restored to the live render path; the method previously existed but was not called.
- Boss/bomber/shaman priority rings remain visible.
- Only the first priority threat may animate when the shared secondary-motion owner is `priority-threat`.
- Additional priority threats remain steady.
- `폭발` / `주술` labels remain visible.

## Phase 1888 — Freeze Status Ring Alignment
- Frozen-enemy rings no longer all pulse independently.
- When freeze owns secondary motion, only the frozen enemy nearest the hero animates.
- All other frozen enemies remain steady and readable.
- Slow timers, slow factors, spell damage, and status duration are unchanged.

## Phase 1889 — Supply Crate Identity + Motion
- The battlefield supply crate reuses the existing `supplyDrop` cell from `assets/ui/tactical-status-icons.png`; no new PNG is added.
- If the atlas is not ready, the original gold-cross crate presentation remains the fallback.
- Crate scale motion is allowed only when `supply-crate` owns secondary motion.
- Supply reward RNG, potion grant, free equipment generation, and event completion logic are unchanged.

## Phase 1890 — Boss Arena Telegraph Alignment
- Telegraph geometry is always visible.
- Only the soonest-activating telegraphed boss-arena hazard may animate when `boss-hazard` owns secondary motion.
- Other telegraphs remain steady at a high-visibility alpha.
- Active hazards remain steady.
- Hazard timing, radius, shape, collision, damage, safe-lane logic, and Mythic Last Law logic are unchanged.

## Phase 1891 — Endless Field Node Focus
- Visible field nodes no longer all pulse simultaneously.
- When `field-node` owns secondary motion, only the nearest active field node may animate.
- Other field nodes remain steady.
- Node expiry, pickup radius, rewards, healing, core recovery, gold, and strain damage are unchanged.

## Phase 1892 — Guardian Core Ambient Ring Alignment
- The core's decorative outer ring keeps its existing gentle pulse only when no higher secondary cue owns motion.
- Critical HP/damage, boss response, boss countdown, or Reduced Flash makes the core ring steady.
- Core HP, radius, Edric aura, damage intake, and targeting are unchanged.

## Shared Secondary Motion Priority
Normal combat + Reduced Flash OFF:
1. boss hazard
2. priority threat
3. supply crate
4. field node
5. freeze status
6. core ambient
7. none

Any non-normal Combat Attention primary or Reduced Flash ON forces owner `none` and all six motion amplitudes to 0.

The policy is computed once per render frame and shared by all six renderers, avoiding repeated enemy sorting/scanning.

## Phase 1893 — 48-Sample Deterministic Audit
Six feature-presence profiles × eight attention contexts = 48 deterministic samples.

Locked results:
- samples 48/48
- maximum animated secondary owners: 1
- maximum secondary motion amplitude: 0.08
- Reduced Flash motion amplitude: 0
- hero/core critical, critical/heavy damage, boss response, boss countdown motion amplitude: 0
- supply icon reuse: true
- visibility preserved: true
- Actions: 9/9
- RunSnapshot schema mutation: false

## Phase 1894 — Release Fail-Closed
Release Freeze now binds:
- `secondaryCombatMotionPassed`
- `secondaryCombatMotionSamples`

Candidate consistency requires the evidence. Candidate signature includes the sample count.
- forged lower evidence false + top-level passed true → Candidate REVIEW
- sample-count mutation → Candidate signature changes

## Verification
- Focused secondary-motion + attention + field-event + boss-arena regression: 28/28 PASS before final refactor; dedicated Phase suite 14/14 PASS after refactor
- Full regression: 429 test files / 1,647 tests / 1,647 PASS
- Fresh TypeScript build: PASS
- Release Freeze: PASS · `secondary-combat-motion safe (48)`
- Candidate: PASS · `RCQ-049012FA`
- Forged secondary evidence: REVIEW (`release-freeze`)
- Candidate sample-count mutation signature: changed (`RCQ-E21C31A1`)
- Actions: 9/9
- Snapshot schema mutation: false

## Asset Delta
- New image files: 0
- Reused image: `assets/ui/tactical-status-icons.png` → `supplyDrop`

## Frozen Systems
No changes to boss cadence, enemy spawn cadence, enemy AI, HP/damage, spell cooldowns, heal/potion values, supply reward RNG, field-node rewards, hazard damage/collision, economy, audio scheduler, haptic patterns, AUTO targeting, 9 Actions, or RunSnapshot schema.
