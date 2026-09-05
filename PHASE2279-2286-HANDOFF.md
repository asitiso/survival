# Phase 2279~2286 Handoff — Shop Purchase Before/After + Replacement Tradeoff Projection

## Baseline
- Source delivery: `arcane-last-stand-phase2278-full-merged.zip`
- Archive provenance comment: `91c8d13d84536c3c2139d07fbef39096b0f7d51c`
- Reconstructed local baseline commit: `bfac14085b058237da0f23fe7f50945e615d8239`
- Work branch: `work/phase2279-2286`

## Goal
Reduce shop replacement mistakes and pre-purchase calculation time without changing shop balance. Cards now show the authoritative purchase action plus current→after equipment bonus deltas, including both the largest loss and gain when a developed item would be replaced.

## Phase 2279 — Purchase Action Atlas
- `assets/ui/shop-purchase-action-icons.png`
- 480×96 / 5×1 / cell 96×96
- IDs: `equip / upgrade / legendary / replace / potion`
- Labels: `신규 / 강화 / 전설 / 교체 / 물약`
- Static, zero motion, text fallback preserved, asset failure never blocks purchase
- Pixel validation: 5/5 cells unique

## Phase 2280~2281 — Authoritative Purchase Projection
- New `shop-purchase-projection.ts`
- Uses the real `purchaseOffer()` path for simulated equipment result
- Uses the real `equipmentBonuses()` before/after values
- Top two net deltas only
- Lower-is-better channels (`cooldown`, incoming damage, core damage) are compared correctly
- Developed-item replacement exposes both lost old bonus and gained new bonus
- Unaffordable cards can still preview the equipment consequence; affordability itself is not mutated

## Phase 2282 — Shop Card Integration
- Existing 9 item icons remain unchanged
- Adds one compact 20×20 purchase-action icon beside rank/action text
- Adds compact authoritative delta text
- Does not add another shop mode, button or HUD row
- Existing Quick Buy control and recommendation layout are unchanged

## Phase 2283 — Post-purchase Truthfulness
- `purchase-impact-feedback.ts` now reuses the same authoritative before→after projection
- Existing `재사용 대기시간` wording contract for Rapid Wand is preserved while still showing the new numeric `쿨타임` delta
- Replacement is identified explicitly as `replace` presentation kind

## Phase 2284 — Gameplay / Quick-buy Freeze
Unchanged from baseline:
- `src/domain/economy.ts`
- `src/game/shop-data.ts`
- `src/game/shop-guidance.ts`
- `src/game/endless/snapshot.ts`
- `src/game/game.ts`
- shop offer count / prices / power values / rank progression / legendary 1.35 factor
- protected replacement Quick Buy rule (`legendary || rank >= 3`)
- Actions 9/9
- snapshot schema

## Phase 2285 — Deterministic Audit
- `auditShopPurchaseProjectionIdentityAssets()`
- 5 equipment scenarios × 9 catalog items = 45 runtime samples
- 15 frozen-contract samples
- Total exactly 60
- Explicit coverage of all five purchase action IDs

## Phase 2286 — Release Freeze / Candidate Binding
- Release Freeze binds pass state + 60 sample count
- Release Candidate fails closed when pass evidence is forged
- Candidate signature changes when sample count changes
- Candidate markdown includes `shop-purchase-projection-identity-assets safe (60)`

## TDD / Regression Evidence
- Initial RED: 1/10 frozen contract PASS, 9/10 new requirements FAIL for missing implementation
- GREEN: focused 10/10 PASS
- Existing shop compatibility suite found one wording regression: Rapid Wand post-purchase feedback lost the historical `재사용 대기시간` term
- Root cause was presentation vocabulary only; numeric projection was correct
- Minimal compatibility fix preserves the old term in purchase feedback while keeping `쿨타임 before→after` projection
- Existing purchase-feedback + new integration regression set: 9/9 PASS

## Verification
- Full suite: 639 test files / 2,047 tests / 2,047 PASS / 0 FAIL
- Candidate: `RCQ-62311C4F` PASS
- Release Quality: `RQ-D4630257` PASS
- Raster: 5/5 PASS
- Atlas: 480×96 / 5/5 pixel-unique / 3,641 bytes
- `git diff --check`: clean
