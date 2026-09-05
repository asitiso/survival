# Arcane Last Stand — Phase 663~682 Handoff

## Baseline
- Source baseline: `main@96a7fbb` (`96a7fbbe520663ca029a26533aa7504dcf31a0bc`)
- Baseline regression: 1049/1049 PASS
- Combat action contract: 9/9
- No Snapshot schema / permanent currency / blocking modal changes

## Phase 663~666 — Four-to-Eight-Hour Shop Silence
- New `four-eight-hour-shop-silence.ts`.
- At 4h+, completed Rank5/Rank5 builds with >=2 potions hide routine shop token-count pressure and secondary `선택` text while leaving the shop fully clickable.
- Incomplete gear or low potions restores visible need immediately.
- No token cadence, price, inventory, or purchase-rule mutation.
- Modeled visit reduction: 66%.

## Phase 667~670 — Reward Scan Focus
- New `four-eight-hour-reward-focus.ts`.
- Preserves all 3 reward cards and original order; never auto-selects.
- Routine completed builds expose one non-relic `유지` recommendation with reduced copy.
- Final Form / Signature-relevant reward text disables compaction so identity-specific information is not lost.
- Modeled routine read reduction: 58%.

## Phase 671~674 — Routine Toast Quieting
- New `four-eight-hour-toast-focus.ts` integrated at the existing `showEventToast()` seam.
- Suppresses routine shop/supply/goblin/objective/reward-growth noise after 4h.
- Preserves MYTHIC, boss-arena, Final Form, SIGNATURE, core danger, TACTIC, weakpoint, OVERDRIVE, fusion activation information.
- Presentation-only: combat/economy mutation false.

## Phase 675~678 — Priority Focus + Real Zero-Label Fix
- New `four-eight-hour-priority-focus.ts`.
- Fixed `prioritizeLandscapeBuildLabels()` so explicit `maxLabels=0` actually returns zero labels; prior `Math.floor(... ) || 4` revived four labels.
- Completed 4h+ routine builds now truly show zero routine build labels.
- Active Final Form / SIGNATURE identity can preserve one identity line.
- Incomplete builds retain two recovery lines; Mythic/boss/critical danger and projectile capacity remain preserved.

## Phase 679~682 — Candidate Flow Health Gate
- New `four-eight-hour-flow-health-audit.ts`.
- 80 deterministic samples.
- Shop silence / reward scan / toast silence / priority preservation coverage: 100% / 100% / 100% / 100%.
- Estimated decision-pause reduction: 49%.
- Combat-stat inflation: 0%.
- Economy mutation: false.
- Action count: 9.
- Snapshot mutation: false.
- Reward auto-selection: false.
- Critical information preserved: true.
- Final Form identity preserved: true.
- Candidate issue key: `four-eight-hour-flow-health`.

## Verification target
- Regression target: 1069 tests.
- Raster: 5/5.
- Release signature expected unchanged: `RQ-9085A5AD`.
- Candidate signature changes because new fail-closed evidence is part of the payload.
- Final Manifest must include deterministic archive gate from a clean commit.
