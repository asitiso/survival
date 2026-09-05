# Phase 1863~1866 Handoff — Shop Item Identity Assets

## Scope

This pass adds compact, static item identity art to the existing combat shop without changing purchasing, reroll, quick-buy, equipment, potion, economy, combat, input, or persistence behavior.

### Phase 1863 — Shop Item Atlas
- Added `assets/ui/shop-items.png` as a 384×384 3×3 atlas, 128×128 per cell.
- Covers all 9 persistent shop identities: 4 weapons, 4 armors, 1 healing potion.
- Added `src/game/shop-item-assets.ts` for deterministic item-to-cell mapping and presentation metadata.
- Final atlas size: 97,135 bytes.

### Phase 1864 — Shop UI Integration / Fallback
- `ShopOverlay` now renders a compact static icon beside the existing kind/name text.
- Desktop icon size is 48px; compact landscape size is 38px.
- Existing item name, description, rank/equip state, recommendation, price, disabled state, and click handlers are unchanged.
- CSS uses the PNG atlas as the first background layer and a gradient as the fallback layer; failed image loading therefore never blocks shop use or removes text identity.
- No icon animation, pulse, flash, audio, or haptic was added.

### Phase 1865 — Deterministic Asset Audit
`auditShopItemAssets()` locks 25 samples:
- 9/9 item coverage
- 9/9 unique atlas cells
- 0 out-of-bounds cells
- motion amplitude 0
- text fallback preserved
- offer logic mutation false
- Snapshot schema mutation false
- desktop/mobile icon sizes remain compact

### Phase 1866 — Release Fail-Closed
- Added `shopItemAssetsPassed` and `shopItemAssetsSamples` to Release Freeze evidence.
- Candidate consistency requires shop-item evidence to pass.
- Candidate signature binds the sample count.
- Forging only top-level PASS while shop-item evidence is false causes Candidate REVIEW.

## Frozen behavior
- Shop offer generation and RNG
- Prices and price variance
- purchase/reroll/quick-buy behavior
- weapon/armor ranks and legendary evolution
- potion count and healing
- gold/economy/shop tokens
- combat stats, boss/enemy cadence, cooldowns
- 9 Actions
- audio/haptics
- RunSnapshot schema

## Verification
- Phase 1863~1866 tests: 8/8 PASS
- Full regression: 412 test files, 1,603/1,603 PASS
- Release Candidate: PASS
- Candidate signature: `RCQ-353566CE`
- Release Freeze evidence: `shop-item-assets safe (25)`
