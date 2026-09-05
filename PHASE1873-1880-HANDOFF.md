# Phase 1873~1880 Handoff — Tactical Status Identity + Objective Attention Alignment

## Scope

This is a double-workload bounded pass using only eight phase numbers. It improves two existing combat-reading bottlenecks at once without changing combat rules:

1. Tactical Stack rows for Field Events, Battlefield Objectives, Run Missions, and Threat Directives gain deterministic static icon identities.
2. The Battlefield Objective world marker stops pulsing independently during higher-priority combat attention or Reduced Flash.

## Phase 1873 — Tactical Status Icon Atlas

- Added `assets/ui/tactical-status-icons.png`.
- Atlas: 384×384, 4×4, 96px cells.
- 15 unique identities:
  - Field Events 5: goldenGoblin, supplyDrop, manaStorm, goldenNight, eliteRush
  - Battlefield Objectives 3: riftSeal, beaconDefense, cursedAltar
  - Run Missions 3: massacre, eliteHunt, goldRush
  - Threat Directives 4: swarmFront, ironMarch, artilleryLine, hexConvoy
- `src/game/tactical-status-icon-assets.ts` owns deterministic cell mapping and presentation metadata.
- Static icons only: motion amplitude 0.
- Unknown ids preserve text-only fallback.

## Phase 1874 — Tactical Stack Integration

- Tactical Stack rows now pass the domain id as `iconId`.
- Existing title, detail, accent, ordering, max-row budget, and gameplay logic are unchanged.
- Icons render at 30px only when the atlas is decoded and ready.
- If the image is loading or fails, the original text row renders unchanged.
- Asset loading is async and never gates the game loop.

## Phase 1875 — Objective Marker Attention Policy

- Added `src/game/tactical-status-attention.ts`.
- Battlefield Objective marker motion is allowed only when:
  - objective is active
  - global Combat Attention primary is `normal`
  - Reduced Flash is OFF
- Normal amplitude remains bounded at 0.05.
- Motion amplitude is 0 during:
  - hero critical
  - core critical
  - critical damage
  - boss response
  - heavy damage
  - boss countdown
  - Reduced Flash

## Phase 1876 — World Objective Identity

- Battlefield Objective world marker reuses the same 15-icon atlas.
- riftSeal / beaconDefense / cursedAltar get a visual symbol inside the existing ring.
- Existing progress ring, HP/progress timing, ENTER label, objective radius, activation logic, rewards, and failure rules remain unchanged.
- Failed/late atlas load preserves the original ring + text marker.

## Phase 1877~1878 — Integration Safety

- Tactical icons do not alter Field Event modifiers, mission targets/rewards, objective runtime, or threat composition.
- No new audio, haptic, pulse, flash, shake, or blocking modal.
- Existing Combat Attention priority remains authoritative.
- Existing Action count remains 9/9.
- RunSnapshot schema remains unchanged.

## Phase 1879 — Combined Deterministic Audit

`auditTacticalStatusAssets()` locks 40 samples:

- icon coverage 15/15
- unique cells 15/15
- atlas bounds 0 failures
- tactical icon motion amplitude 0
- normal objective marker amplitude 0.05 max
- Reduced Flash objective amplitude 0
- hero/core/damage/boss-response/heavy/boss-countdown objective amplitude 0
- text fallback preserved
- gameplay mutation false
- Snapshot schema mutation false
- Actions 9/9
- world objective icon coverage 3/3

## Phase 1880 — Release Fail-Closed / Package

- Release Freeze adds `tacticalStatusAssetsPassed` / `tacticalStatusAssetsSamples`.
- Candidate consistency fails if child evidence is false even if top-level `passed=true` is forged.
- Candidate signature binds the 40-sample count.
- Candidate markdown includes `tactical-status-assets safe (40)`.

## Frozen behavior

- Field Event schedules and modifiers
- Battlefield Objective timings, runtime, rewards, streaks, activation/failure
- Run Mission schedules, targets, progress, rewards
- Threat Directive rotation, composition weights, spawn pressure
- hero/core HP and damage
- enemy/boss AI and cadence
- spell cooldowns and damage
- shop/economy
- audio/haptics
- 9 Actions
- RunSnapshot schema

## Verification

- New + focused regression: 42/42 PASS
- Full regression: 423 test files, 1,626/1,626 PASS
- Release Candidate: PASS
- Candidate signature: `RCQ-20762FAB`
- Release Freeze evidence: `tactical-status-assets safe (40)`
