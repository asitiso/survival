# Arcane Last Stand — Phase 623~642 Handoff

## Baseline

- Starting main: `b7dfc6cc898fae494108190c1d736722db922cf5`
- Starting regression: 1009/1009 PASS
- Phase 622 Candidate: `RCQ-ECB3E85B`
- Release Gate: `RQ-9085A5AD`

## Phase 623~626 — Late-Run Maintenance Silence

- Active only from 60 to 120 minutes after mature boss progression.
- Reuses `buildRecoveryGuidance()` only when a real equipment/relic/fusion gap remains.
- Fully completed builds return no maintenance target instead of repeating `완성 빌드 유지` after every boss reward.
- Incomplete builds receive exactly one `정비 목표` using the existing recovery priority.
- New Action count 0; no Snapshot field.

## Phase 627~630 — Shop Visit Need Reduction

- 60~120 minute builds with Rank 5 weapon + Rank 5 armor + at least 2 potions mark the existing Shop Action as optional.
- The button remains fully usable; only its visual emphasis is reduced and the secondary label becomes `선택`.
- Rank <5 equipment or potion reserve below 2 keeps the original shop emphasis.
- No new shop button or purchase path is introduced.
- Modeled unnecessary-visit reduction contribution: 50% in fully maintained states.

## Phase 631~634 — Deep-Run HUD Focus

- Completed 60~120 minute builds cap build labels at 1.
- Three completion signals keep 2 labels.
- Incomplete builds keep 4 labels.
- HP/EXP/hero meters and danger telegraphs remain unchanged.

## Phase 635~638 — Deep-Run Boss Reward Decision Reduction

- Applies only to completed 60~120 minute builds.
- Preserves all three cards in their original order.
- Marks exactly one non-relic growth reward `유지 추천` when available.
- Relic replacement remains selectable.
- No automatic reward selection.

## Phase 639~642 — 60~120 Flow Health Candidate Gate

- 80 deterministic samples across four heroes and five late-run timestamps.
- Maintenance-silence coverage: 100%.
- Shop de-emphasis coverage: 100% in modeled completed states.
- One-line HUD coverage: 100%.
- Reward guidance coverage: 100%.
- Estimated decision-pause reduction: 48%.
- Modeled combat-stat inflation: 0%.
- Action count: 9; Snapshot mutation false; critical HUD preserved.
- Candidate fail-closed issue id: `sixty-one-twenty-flow-health`.

## Verification before integration

- New Phase tests: 20/20 PASS.
- Full regression: 1029/1029 PASS.
- Raster: 5/5 PASS.
- Release Gate: `RQ-9085A5AD`.
- Candidate: `RCQ-41D8FF97`.
- 60~120 flow health: PASS · 80 samples · pause -48% · stat +0%.
- Baseline mutation: disabled.
- Combat Action invariant: 9/9.

## Files added

- `src/game/late-run-maintenance-goal.ts`
- `src/game/late-run-shop-need.ts`
- `src/game/deep-run-hud-focus.ts`
- `src/game/deep-run-boss-reward-guidance.ts`
- `src/game/sixty-one-twenty-flow-health-audit.ts`
- matching 5 test files / 20 Phase tests

## Files changed

- `src/game/game.ts`
- `src/game/release-candidate-audit.ts`
- `README.md`

## Integration procedure

1. Commit the Phase 623~642 feature tree.
2. Run `verify:manifest` on the clean feature commit so deterministic archive verification can execute.
3. Merge into `main`.
4. Re-run 1029-test regression and Manifest on merged main.
5. Smoke static-server paths for the new runtime/audit modules.
6. Create final tracked-source ZIP with `git archive` and compare it to Manifest archive evidence.
7. Remove feature worktree/branch only after merged-main verification passes.
