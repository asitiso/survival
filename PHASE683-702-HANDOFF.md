# Arcane Last Stand — Phase 683~702 Handoff

## Baseline
- Source baseline: `main@6f3e3b3` (`6f3e3b31c014e077c1e89b74072fbc574e13240a`)
- Baseline regression: 1069/1069 PASS
- Combat action contract: 9/9
- No Snapshot schema / permanent currency / blocking modal changes

## Phase 683~686 — 8~12h Shop Dormancy
- New `eight-twelve-hour-shop-focus.ts`.
- At 8h+, Rank5/Rank5 + >=2 potion builds keep Shop fully clickable but hide token count / secondary pressure and use a low-attention visual alpha.
- Incomplete gear or low potions restores full visibility immediately.
- Presentation only: economy mutation false, new control count 0.
- Modeled attention reduction: 74%.

## Phase 687~690 — 8~12h Reward Focus
- New `eight-twelve-hour-reward-focus.ts`.
- Keeps all 3 boss reward cards, original order, and manual player choice.
- Routine completed builds expose exactly one non-relic `유지` recommendation and shorter overlay copy.
- Final Form / SIGNATURE relevant rewards disable compaction and preserve full detail.
- Reward auto-selection remains false.
- Modeled read reduction: 68%.

## Phase 691~694 — Deepest Routine Toast Silence
- New `eight-twelve-hour-toast-focus.ts` at the existing `showEventToast()` seam.
- Suppresses routine economy / supply / goblin / objective / ordinary boss-entry toasts after 8h.
- Preserves MYTHIC, Final Form, SIGNATURE, core/critical danger, TACTIC, Safe Link, Last Law, OVERDRIVE, fusion activation information.
- Generic weakpoint toast is not preserved because the actual weakpoint ring / boss telegraph remains visible; this avoids ordinary boss toast repetition.
- Presentation only: combat/economy mutation false.

## Phase 695~698 — 8~12h Deep HUD Focus
- New `eight-twelve-hour-hud-focus.ts`.
- Completed routine builds use zero routine build labels and status budget 30~34 chars; `compactLandscapeStatusLine()` minimum was lowered from 36 to 30 so the deepest budget is actually honored while T5 / danger remain mandatory. Incomplete builds retain two recovery labels.
- Routine AUTO text stays hidden but the target ring remains through existing combat presentation.
- Mythic / boss / critical danger retains 3~4 projectile warning capacity and all critical bars / danger telegraphs.
- Final Form / SIGNATURE identity is preserved as one line.
- Integration review found a boundary where pre-capping build labels could let OVERDRIVE outrank Final Form; the wiring now preserves Final Form/SIGNATURE from raw labels before deepest compression.

## Phase 699~702 — Candidate Flow Health Gate
- New `eight-twelve-hour-flow-health-audit.ts`.
- 80 deterministic samples.
- Shop dormancy / reward focus / toast silence / priority preservation coverage: 100% / 100% / 100% / 100%.
- Estimated decision-pause reduction: 52%.
- Combat-stat inflation: 0%.
- Economy mutation: false.
- Action count: 9.
- Snapshot mutation: false.
- Reward auto-selection: false.
- Critical / Mythic information preserved: true.
- Final Form identity preserved: true.
- Candidate issue key: `eight-twelve-hour-flow-health`.

## Verification target
- Regression target: 1089 tests.
- Raster: 5/5.
- Release signature expected unchanged: `RQ-9085A5AD`.
- Feature-tree Candidate signature: `RCQ-4DBAFD29`.
- Final Manifest must include deterministic archive gate from a clean commit.
