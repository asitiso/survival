# Phase 2191~2198 Handoff — Tactical Objective Action + Reward Preview Identity Integration

## Scope

This pass closes the tactical objective decision loop without changing objective gameplay: what to do, what the next successful streak reward will be, and what was actually earned are now visually linked.

## Phase 2191 — Objective Action Identity

- New `assets/ui/objective-action-icons.png`
- 288×96 RGBA, 3×1, 96×96 cells
- `seal / defend / endure`
- 3/3 pixel-unique cells
- SHA-256: `15015df46f4098e6ff7fce128ca8f77102e9fa7e54de0436dab9d74fd935d7de`
- Objective mapping: `riftSeal→seal`, `beaconDefense→defend`, `cursedAltar→endure`
- Static, zero motion amplitude, load failure never blocks gameplay

## Phase 2192 — Objective Reward Identity

- New `assets/ui/objective-reward-icons.png`
- 384×96 RGBA, 4×1, 96×96 cells
- `gold / shopToken / potion / temporaryPower`
- 4/4 pixel-unique cells
- SHA-256: `4c173f7df54cbf556010388149ad2099e20b1a8d61600930014d5d5f1c5382a9`
- Preview amount uses the same rounding contract as `applyObjectiveRewards()`
- `temporaryPower` remains unscaled

## Phase 2193~2194 — Action + Next Reward Preview

- Existing objective world marker gets one compact action identity only when helper identities are allowed.
- Existing tactical objective row previews `objectiveRewardFor(active.id, currentStreak + 1)`.
- Maximum reward preview icons: 2.
- Fate `objectiveRewardMultiplier` is applied to displayed gold/token/potion quantities using the existing rounding rule.
- No objective timing, success condition, reward table, or streak rule changed.

## Phase 2195 — Earned Reward Confirmation

- Objective completion toast is driven from the actual `transition.rewards` result rather than a prediction.
- Existing tactical-status objective icon remains the first toast identity; up to two earned reward identities are appended.
- Displayed earned quantities use the same current Fate objective multiplier as reward application.

## Phase 2196 — Attention Arbitration

- Only the newly added action/reward helper identities are suppressed during Hero critical, Core critical, or boss special timer ≤ 1.2 seconds.
- Existing objective marker, progress/HP/time text, and objective row stay visible.
- No new HUD row.

## Phase 2197 — Deterministic Audit

- Exactly 60 deterministic samples.
- 60/60 PASS.
- Frozen contracts include:
  - `riftSeal`: odd streak 120G / even streak shop token 1
  - `beaconDefense`: odd streak potion 1 / even streak shop token 1
  - `cursedAltar`: 180G + temporary power 20
  - objective durations: 34 / 28 / 22 seconds
  - failure streak reset
  - max two preview icons
  - Actions 9/9
  - no snapshot schema change

## Phase 2198 — Release Freeze

- Release Freeze fail-closed evidence:
  - `objectiveActionRewardIdentityAssetsPassed`
  - `objectiveActionRewardIdentityAssetsSamples = 60`
- Forged child evidence forces Release Candidate to REVIEW.
- Sample count mutation changes Release Candidate signature.

## Verification Evidence

- TypeScript build: PASS
- Full regression: 594 test files / 1,937 tests / 1,937 PASS / 0 FAIL
- Release Candidate: `RCQ-307579F1` PASS
- Release Quality Gate: `RQ-D4630257` PASS
- Raster: 5/5 PASS
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`

## Gameplay Freeze

- `objectiveRewardFor()` unchanged
- `applyObjectiveRewards()` unchanged
- `riftSeal / beaconDefense / cursedAltar` rules unchanged
- objective durations 34 / 28 / 22 unchanged
- Fate objective reward multipliers unchanged
- failure streak reset unchanged
- Actions 9/9 unchanged
- endless snapshot schema unchanged

## Reconstructed Git Note

The distributed source ZIP does not include the original `.git` directory. Git history is reconstructed only to isolate this pass in a worktree, verify it, merge it into a reconstructed `main`, and package the resulting full source.
