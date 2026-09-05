# Arcane Last Stand — Phase 643~662 Handoff

## Baseline
- Source baseline: `main@a79fee1`
- Baseline tests: 1029/1029
- Scope: 2~4h+ long-run repetition relief without changing combat economy, reward count, Action count, or Snapshot schema.

## Phase 643~646 — Ultra-Long Shop Focus
- New `ultraLongShopFocus()` policy starts at 2h and stays active afterward.
- Completed Rank 5 weapon/armor + 2+ potions: shop remains clickable, but routine token count is hidden and the secondary label becomes `선택`.
- Incomplete gear or low potions immediately restores the normal visible token count and shop emphasis.
- Shop tokens, prices, token cadence, and purchase rules are unchanged.
- Modeled visit-pressure reduction: 56%.

## Phase 647~650 — Ultra-Long Boss Reward Focus
- Keeps all three reward cards in the same order.
- Completed build after 2h gets exactly one non-relic `유지` recommendation.
- Overlay copy is shortened to `완성 빌드 · 유지 성장 1개만 확인`.
- No automatic reward choice and no reward removal.
- Incomplete builds retain the normal reward presentation.

## Phase 651~654 — Four-Hour HUD Focus
- 2~4h completed build: maximum 1 routine build label.
- 4h+ completed build: routine build labels 0, EXP number text hidden, inactive meter text hidden.
- Incomplete builds retain at least 2 build labels for recovery.
- HP/EXP/meter bars and danger telegraphs are always preserved.
- Boss/mythic states further shorten routine status copy only.

## Phase 655~658 — Ultra-Long Critical Priority
- 4h+ routine AUTO text disappears while its target ring stays visible.
- Boss weakpoint text and boss/danger cues remain preserved.
- Critical hero/core states keep actionable projectile warning capacity.
- Before 4h, existing readable AUTO labels remain unchanged.

## Phase 659~662 — 2~4h Flow Health Candidate Gate
- 80 deterministic samples across elapsed checkpoints, boss/no-boss, and critical/non-critical states.
- Shop quiet coverage: 100%.
- Reward compact coverage: 100%.
- HUD minimal coverage: 100%.
- Critical priority coverage: 100%.
- Modeled combat-stat inflation: 0%.
- Economy mutation: false.
- Estimated decision-pause reduction: 50%.
- Action count: 9.
- Snapshot mutation: false.
- Auto reward selection: false.
- Candidate issue on regression: `two-four-hour-flow-health`.

## Verification target
- Tests: 1049/1049
- Raster: 5/5
- Release: `RQ-9085A5AD`
- Candidate: `RCQ-E5E1B6D1`
- Final Manifest/archive signatures must be regenerated from merged clean `main`.

## Product invariants preserved
- Combat Action surface stays 9 actions.
- No new permanent currency.
- No Snapshot schema field.
- No new blocking modal.
- No reward auto-selection.
- No shop token/economy mutation.
