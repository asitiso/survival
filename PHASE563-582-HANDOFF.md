# Arcane Last Stand — Phase 563~582 Handoff

## Baseline

- Starting main: `f0354b84f643ad03ad307cd551a8524e69235891`
- Starting regression: 949/949 PASS
- Phase 562 Candidate: `RCQ-E797A7E9`
- Release Gate: `RQ-9085A5AD`

## Phase 563~566 — Opening AUTO Balance Audit

- 4 normal spells × 1/3/5/8 minute checkpoints = 16 samples.
- Uses the existing AUTO intent and spell tuning paths.
- Max modeled damage multiplier: 1.00.
- Max cooldown benefit multiplier: 1.00.
- Max survival multiplier: 1.00.
- Manual override coverage: 100%.
- Action count 9; Snapshot mutation false.

## Phase 567~570 — Opening Upgrade Guidance Bias Audit

- 12 deterministic low-HP/evolution/offense/cadence choice states.
- Recommendations span 7 IDs: max HP, four normal spells, spell power, cooldown.
- Maximum recommendation concentration: 16.7%.
- Survival/evolution/offense/cadence category coverage: 100%.
- Choice order/count mutation: false.

## Phase 571~574 — Opening Shop Fast-Path Success Audit

- 4 heroes × 4 build archetypes × 2 coin states = 32 samples.
- Actual shop guidance, quick recommendation, click-time safe purchase, and opening fast-path promotion are combined.
- Actionable coverage: 100%.
- Estimated successful one-tap rate: 100%.
- Unsafe quick exposure: 0.
- Unaffordable quick exposure: 0.
- Normal card purchase preserved; combat Actions remain 9.

## Phase 575~578 — First Boss Prep Cue Density Audit

- 36 countdown/token/HP/potion states.
- Maximum concurrent prep cue: 1.
- False cue outside 12-second window: 0.
- Prepared-state silence coverage: 100%.
- Only existing `shop` and `potion` Actions can be highlighted.

## Phase 579~582 — Opening 0~10 Health Candidate Gate

- Combines the four new audits into 96 deterministic opening samples.
- Max modeled combat-stat inflation: 0%.
- Estimated pause reduction: 74%.
- Action count: 9.
- Snapshot mutation: false.
- Candidate fail-closed issue id: `opening-ten-minute-flow`.

## Verification before integration

- New Phase tests: 20/20 PASS.
- Full regression: 969/969 PASS.
- Raster: 5/5 PASS.
- Release Gate: `RQ-9085A5AD`.
- Candidate: `RCQ-A8FDE59B`.
- Candidate opening 0~10 health: PASS · 96 samples · stat +0% · pause -74%.
- Baseline mutation: disabled.
- Combat Action invariant: 9/9.

## Files added

- `src/game/opening-auto-balance-audit.ts`
- `src/game/opening-upgrade-bias-audit.ts`
- `src/game/opening-shop-fast-path-audit.ts`
- `src/game/opening-boss-prep-density-audit.ts`
- `src/game/opening-ten-minute-flow-audit.ts`
- matching `dist/game/*.js`
- 5 test files / 20 Phase tests

## Files changed

- `src/game/release-candidate-audit.ts`
- generated `dist/game/release-candidate-audit.js`
- `README.md`

## Final integration procedure

1. Commit the Phase 563~582 feature tree.
2. Run Manifest on the clean feature commit so deterministic archive verification can execute.
3. Merge into `main`.
4. Re-run 969-test regression and Manifest on merged main.
5. Smoke the static server paths.
6. Create final tracked-source ZIP with `git archive` and compare against Manifest archive evidence.
7. Remove feature worktree/branch only after merged-main verification passes.
