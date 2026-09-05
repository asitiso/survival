# Arcane Last Stand — Phase 583~602 Handoff

## Baseline

- Starting main: `9e3eed99154fb653d45f3f2cc0febd15135be4df`
- Starting regression: 969/969 PASS
- Phase 582 Candidate: `RCQ-A8FDE59B`
- Release Gate: `RQ-9085A5AD`

## Phase 583~586 — 10~20m Midgame Upgrade Bridge

- Reuses the existing 3-card level-up overlay; no new modal or choice count.
- Between 10 and 20 minutes, exactly one current card may receive `빌드 연결` guidance.
- Priority: nearest fusion component / final evolution / first evolution / spell power / cooldown / current spell growth.
- Card order and actual upgrade math are unchanged.
- Guidance disappears before 10 minutes and at 20 minutes so mature builds are not permanently directed.

## Phase 587~590 — Repeat-Shop Same-Item Fast Path

- Reuses the existing safe `추천 바로 구매` control.
- From 3 to 15 minutes only, a safe same-item weapon/armor rank-up keeps quick-buy promoted above the product grid.
- Replacements and potions are not trained as repeat one-tap habits.
- Estimated repeat-purchase pointer travel reduction: 42%.
- New control count: 0; existing `safeQuickPurchase()` still owns click-time safety.

## Phase 591~594 — Post-Boss Next Goal

- After a boss reward in the 9~30 minute band, the existing event toast shows one concise `다음 목표` line.
- Priority reuses build recovery structure: empty weapon/armor → first relic → nearest fusion component.
- Reward cards, reward probabilities, relic/fusion rules, and boss reward count stay unchanged.
- Guidance is transient only and adds no Action or Snapshot field.

## Phase 595~598 — Midgame Build Velocity Audit

- Reuses Phase 375~378 build-completion samples at 15/20/25 minutes.
- 4 heroes × 4 archetypes × Threat 0/3/5 = 48 combinations.
- 144 progress samples.
- Minimum 15→20 minute completion gain: 0.129.
- Minimum 20-minute completion progress: 0.920.
- All coherent builds complete by 25 minutes.
- Threat parity remains true.
- Read-only release audit; Action 9 and Snapshot schema unchanged.

## Phase 599~602 — First-30-Minute Flow Health Candidate Gate

- Combines the existing 0~10 health evidence with four midgame checks: upgrade bridge, repeat-shop fast path, post-boss next goal, and build velocity.
- 280 deterministic samples.
- Midgame upgrade coverage: 100%.
- Repeat-shop fast-path coverage: 100% for modeled safe same-item states.
- Post-boss next-goal coverage: 100% for modeled incomplete-build states.
- Estimated 0~30 decision-pause reduction: 59.5%.
- Modeled combat-stat inflation: 0%.
- Action count: 9; Snapshot mutation false.
- Candidate fail-closed issue id: `first-thirty-flow-health`.

## Verification before integration

- New Phase tests: 20/20 PASS.
- Full regression: 989/989 PASS.
- Raster: 5/5 PASS.
- Release Gate: `RQ-9085A5AD`.
- Candidate: `RCQ-852D960F`.
- First-30 flow health: PASS · 280 samples · pause -59.5% · stat +0%.
- Build velocity: PASS · 48 combinations · 20m floor 92% · completion 20~25m.
- Baseline mutation: disabled.
- Combat Action invariant: 9/9.

## Files added

- `src/game/midgame-upgrade-guidance.ts`
- `src/game/repeat-shop-fast-path.ts`
- `src/game/boss-reward-next-goal.ts`
- `src/game/midgame-build-velocity-audit.ts`
- `src/game/first-thirty-flow-health-audit.ts`
- matching 5 test files / 20 Phase tests

## Files changed

- `src/game/game.ts`
- `src/game/release-candidate-audit.ts`
- `README.md`

## Integration procedure

1. Commit the Phase 583~602 feature tree.
2. Run `verify:manifest` on the clean feature commit so deterministic archive verification can execute.
3. Merge into `main`.
4. Re-run 989-test regression and Manifest on merged main.
5. Smoke static-server paths for the new runtime/audit modules.
6. Create final tracked-source ZIP with `git archive` and compare it to Manifest archive evidence.
7. Remove feature worktree/branch only after merged-main verification passes.
