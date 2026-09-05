# Phase 2223~2230 — Fate Tradeoff + Cumulative Impact Identity Integration

## Scope
- Phase 2223: Fate Benefit Vector atlas (4 cells)
- Phase 2224: Fate Cost Vector atlas (5 cells)
- Phase 2225~2226: Fate choice-card before/after impact identities
- Phase 2227: selected Fate toast impact helpers
- Phase 2228: cumulative Fate recall helpers with critical-attention suppression
- Phase 2229: exactly 60 deterministic audit samples
- Phase 2230: Release Freeze fail-closed evidence + Candidate signature binding

## New assets
- `assets/ui/fate-benefit-vector-icons.png`
  - 384x96 / 4x1 / 96x96 cells
  - IDs: xp-growth, gold-shop, core-guard, objective-reward
  - 4/4 pixel-unique cells
  - SHA-256: `4b9a935e632d5d1b9f257a49cb08a254d40365b7af25dac251c04ac03401eaef`
- `assets/ui/fate-cost-vector-icons.png`
  - 480x96 / 5x1 / 96x96 cells
  - IDs: horde-pressure, elite-frequency, enemy-speed, boss-variant, growth-tax
  - 5/5 pixel-unique cells
  - SHA-256: `16f8be59fa3702442f24541b6efab81041b41b991e4d398ceee86fd66f718f92`

## Runtime behavior
- Choice cards compute real `composeFateModifiers(current)` -> `composeFateModifiers([...current,candidate])` deltas.
- Only the strongest actual benefit and cost are shown.
- Repeated picks and modifier caps naturally affect the displayed identity because the composed values are compared after caps.
- Selected Fate toast shows the actual impact for that pick.
- Existing Fate HUD row remains; cumulative strongest benefit/cost adds two compact helper icons.
- New helper icons hide during hero/core critical or boss special timer <= 1.2s.
- Missing images remain non-blocking and text is preserved.

## Gameplay freeze
No changes to Fate checkpoints, modifiers, composition caps, action count, or snapshot schema.
- Checkpoints: 360 / 720 / 1080 seconds
- Frenzy: spawn 1.14, elite interval 0.90, XP 1.18, boss variant +0.25, objective reward 1.08
- Golden: enemy speed 1.08, gold 1.22, shop token 1.18, boss variant +0.15, objective reward 1.12
- Guardian: XP 0.98, gold 0.96, core damage taken 0.82, objective reward 1.06
- Existing caps remain unchanged.
- Actions: 9/9
- Snapshot schema: unchanged

## Verification
- Full regression: 611 test files / 1,975 tests / 1,975 PASS / 0 FAIL
- Candidate: `RCQ-D33C7E69` PASS
- Release Quality Gate: `RQ-D4630257` PASS
- Raster: 5/5 PASS
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`
