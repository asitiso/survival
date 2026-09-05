# Arcane Last Stand — Phase 603~622 Handoff

## Baseline

- Starting main: `00535a8a7ae75b628023b612c995e01e808ddd08`
- Starting regression: 989/989 PASS
- Phase 602 Candidate: `RCQ-852D960F`
- Release Gate: `RQ-9085A5AD`

## Phase 603~606 — Second-Boss Build Goal

- Activates only from 30 to 60 minutes and after at least two defeated bosses.
- Reuses the existing build-recovery priority and existing event toast.
- Incomplete builds get exactly one equipment/relic/fusion goal.
- Completed builds receive `다음 목표 · 완성 빌드 유지`.
- New Action count: 0; no Snapshot field.

## Phase 607~610 — Late-Shop Fast Path

- Reuses the existing safe quick-buy control between 30 and 60 minutes.
- Safe same-item rank-ups are promoted above the product grid.
- Affordable potions may also be promoted because they cannot replace equipment.
- Different weapon/armor replacement is never promoted by this late repeat path.
- Estimated pointer-travel reduction: 46%; new control count 0.

## Phase 611~614 — Completed-Build HUD Focus

- 30~60 minute completed-build state is derived from rank4+ weapon, rank4+ armor, active relic, and two fusions.
- Four completion signals: build labels cap at 2.
- Three signals: cap at 3.
- Less-complete builds retain the existing 4-label allowance.
- Critical HP/EXP/meter bars and danger telegraphs are always preserved.

## Phase 615~618 — Repeat Boss Reward Decision Reduction

- Applies only to completed builds in the 30~60 minute window.
- Keeps all three reward cards in their original order.
- Marks exactly one non-relic growth card `유지 추천` when possible.
- Does not auto-select a reward or remove relic replacement choice.

## Phase 619~622 — 30~60 Flow Health Candidate Gate

- 80 deterministic samples across four heroes and five midrun timestamps.
- Second-boss goal coverage: 100%.
- Late-shop fast-path coverage: 100% in modeled safe states.
- Completed-HUD compression coverage: 100%.
- Repeat reward guidance coverage: 100%.
- Estimated decision-pause reduction: 48%.
- Modeled combat-stat inflation: 0%.
- Action count: 9; Snapshot mutation false; critical HUD preserved.
- Candidate fail-closed issue id: `thirty-sixty-flow-health`.

## Verification before integration

- New Phase tests: 20/20 PASS.
- Full regression: 1009/1009 PASS.
- Raster: 5/5 PASS.
- Release Gate: `RQ-9085A5AD`.
- Candidate: `RCQ-ECB3E85B`.
- 30~60 flow health: PASS · 80 samples · pause -48% · stat +0%.
- Baseline mutation: disabled.
- Combat Action invariant: 9/9.

## Files added

- `src/game/second-boss-build-goal.ts`
- `src/game/late-shop-fast-path.ts`
- `src/game/completed-build-hud-focus.ts`
- `src/game/repeat-boss-reward-guidance.ts`
- `src/game/thirty-sixty-flow-health-audit.ts`
- matching 5 test files / 20 Phase tests

## Files changed

- `src/game/game.ts`
- `src/game/release-candidate-audit.ts`
- `README.md`

## Integration procedure

1. Commit the Phase 603~622 feature tree.
2. Run `verify:manifest` on the clean feature commit so deterministic archive verification can execute.
3. Merge into `main`.
4. Re-run 1009-test regression and Manifest on merged main.
5. Smoke static-server paths for the new runtime/audit modules.
6. Create final tracked-source ZIP with `git archive` and compare it to Manifest archive evidence.
7. Remove feature worktree/branch only after merged-main verification passes.
