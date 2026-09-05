# Phase 2207~2214 Handoff — Run Mission Pace + Reward Identity Integration

## Scope
- Phase 2207: Run Mission pace identity atlas (`ON TRACK / CATCH UP / CRITICAL`).
- Phase 2208~2209: existing tactical mission row gains one pace icon plus one reward preview icon.
- Phase 2210: mission-start toast preserves the existing mission icon and previews the actual reward.
- Phase 2211: mission-success toast shows the actual reward; mission failure clears the reward helper.
- Phase 2212: helper-only attention arbitration for hero/core critical and imminent boss special (`<= 1.2s`).
- Phase 2213: exact 60-sample deterministic mission pace/reward audit.
- Phase 2214: Release Freeze fail-closed evidence + Candidate signature binding.

## Asset contract
### `assets/ui/run-mission-pace-icons.png`
- 288×96 RGBA
- 3×1 atlas
- cell 96×96
- 3/3 pixel-unique cells
- IDs: `onTrack`, `catchUp`, `critical`
- SHA-256: `4a6d40c7738ff496b1c916a407effb1f26e703dc92140abb38b4d9fb866de40f`
- static only; text fallback preserved; image-load failure never blocks gameplay

No new reward atlas was added. Mission rewards reuse the existing `assets/ui/objective-reward-icons.png` (`shopToken / gold / potion`) to avoid duplicate visual vocabulary.

## Pace contract
`runMissionPaceIdentityForRatios(progressRatio, elapsedRatio)` uses only current mission progress and elapsed mission time:
- `delta >= -0.08` → `ON TRACK`
- `delta >= -0.25` → `CATCH UP`
- otherwise → `CRITICAL`

No mission gameplay state or timer was added.

## Presentation integration
- Existing tactical mission row remains the only HUD row.
- Pace and reward helpers occupy existing row space; `drawStatusRow(...)` signature remains unchanged.
- Start toast keeps the historical direct `미션 시작 · ... transition.started.id` integration contract.
- Completion helper uses the actual `transition.completed.reward` after existing `applyMissionRewardToState()` processing.
- Failure toast intentionally shows no reward helper.
- New helpers hide during hero critical, core critical, or boss special timer `<= 1.2s`; mission title/progress/time remain visible.

## Gameplay freeze
Unchanged:
- mission IDs: `massacre / eliteHunt / goldRush`
- durations: `30 / 40 / 35s`
- rewards: `Shop Token 1 / 320G / Potion 1`
- first mission: `105s`
- next delay: `80~110s`
- boss safety window: `12s`
- danger-scaled targets and caps
- `applyMissionRewardToState()`
- Actions: 9/9
- endless snapshot schema

## Deterministic audit
`auditRunMissionPaceRewardIdentityAssets()`:
- exactly 60 samples
- 3 pace identities
- 3/3 atlas coverage and unique cells
- pace boundaries `-0.08 / -0.25`
- durations `30 / 40 / 35`
- schedule `105 / 12 / 80~110`
- rewards frozen
- target scaling checked at danger 1 and 11
- Actions 9/9
- snapshot schema mutation false

Result: **60/60 PASS**.

## Compatibility regression found and resolved
The first full regression caught a Phase 2090~2097 source-level contract: the mission-start toast call must remain directly visible in `updateRunMission()` as `미션 시작 ... transition.started.id`. The initial helper refactor broke that contract. The direct call was restored while retaining reward preview state, and the full regression was restarted from zero.

## Fresh verification evidence
Feature branch after compatibility fix:
- TypeScript build: PASS
- test files: 603
- tests: **1,956 / 1,956 PASS / 0 FAIL**
  - general: 511 files / 1,638 tests
  - Release/Candidate/Raster class: 92 files / 318 tests
- Candidate: **RCQ-FD5955E5 PASS**
- Release Quality Gate: **RQ-D4630257 PASS**
- Raster: **5/5 PASS**
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`

## Reconstructed Git note
The delivered ZIP does not include `.git`. Local Git history is reconstructed only for isolated worktree development, verification, local main merge, and packaging. The resulting local SHA is not an upstream repository SHA.
