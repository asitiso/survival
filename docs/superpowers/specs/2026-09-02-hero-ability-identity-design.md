# Hero Ability Identity Integration Design

## Goal

Give each hero's four normal spells and two ultimates a consistent, hero-specific visual identity across combat buttons and decision cards without changing gameplay, input, balance, persistence, or release contracts.

## Scope

Phase 1953~1960 covers presentation only:

- 4 heroes × 6 combat abilities = 24 static identities.
- One 6×4 atlas, 96×96 cells, no animation.
- Combat buttons use hero-specific art for `spell1..4` and `ultimate1..2`.
- Level-up and boss-reward cards use the same identity for the same spell.
- `potion`, `shop`, and `auto` continue using `action-icons.png`.
- Generic action icons remain as the first visual fallback for hero abilities.
- Existing text remains the final fallback and gameplay must never wait for image loading.

## Architecture

Add a focused `hero-ability-identity-assets.ts` module that maps `(HeroId, spell/action)` to one atlas cell and exposes canvas sprites plus CSS choice-card styles. `game.ts` loads the new atlas independently; when it is ready it draws hero-specific ability art, otherwise it uses the existing `action-icons.png` path unchanged. `growth-choice-icon-assets.ts` gains optional hero context so only spell choices select hero-specific art, while stat/relic/fusion/build identities keep existing behavior.

Decision creation remains data-only. `game.ts` decorates upgrade/boss reward spell choices with `identityIconStyle` at the presentation boundary, so RNG, choice order, modifiers, and reward semantics are unchanged.

## Ability identity contract

Canonical action order per hero:

1. `spell1` — projectile/basic identity.
2. `spell2` — chain identity.
3. `spell3` — burst identity.
4. `spell4` — field identity.
5. `ultimate1` — falling/impact ultimate identity.
6. `ultimate2` — vortex/control ultimate identity.

Rows are heroes in stable order: `arkan`, `seria`, `kain`, `edric`. Columns are the six actions above. Every pair has exactly one cell and no cells are shared.

The legacy spell IDs map as follows: `fireBolt→spell1`, `chainLightning→spell2`, `frostNova→spell3`, `flameField→spell4`, `meteorStorm→ultimate1`, `blackHole→ultimate2`.

## Asset design

`assets/ui/hero-ability-icons.png` is 576×384, 6 columns × 4 rows, 96×96 per cell. Each hero keeps their established palette while silhouettes communicate the action role. Art is static, deliberately high-contrast at small size, and contains no text so Korean labels remain the accessibility/fallback source of truth.

## Fallback and loading

The hero-specific atlas loads asynchronously and does not participate in run startup. For combat ability buttons:

1. hero-specific atlas if ready;
2. legacy `action-icons.png` if ready;
3. existing text label if neither image is ready.

For decision cards, CSS references the hero-specific atlas when hero context is available. Missing context keeps current generic spell icons. Card title/description always remain present.

## Non-goals / frozen behavior

Do not change:

- `heroSpellIdentity()` numeric modifiers;
- spell tuning, cooldowns, casts, targets, fusion or Final Form attacks;
- AUTO behavior, boss assist, queued/READY/cooldown overlays;
- level-up RNG/order or boss reward RNG/order/rewards;
- Action IDs/count or touch geometry;
- persistence/snapshot schemas;
- economy, enemies, bosses, maps, Final Forms, Contracts, Oaths, Ascensions.

## Audit and release binding

`auditHeroAbilityIdentityAssets()` must emit exactly 48 deterministic samples: 24 combat-surface samples and 24 decision/fallback samples. It verifies 24/24 identity coverage, 24 unique cells, no bounds failures, hero/action match, primary and fallback coverage 100%, motion amplitude 0, text fallback preserved, legacy fallback preserved, image-load failure non-blocking, Actions 9/9, and snapshot schema mutation false.

Release Freeze binds `heroAbilityIdentityAssetsPassed` and `heroAbilityIdentityAssetsSamples = 48`. Release Candidate consistency and signature payload include both fields, so falsifying lower evidence cannot be hidden by forging only upper `passed` state and changing sample count mutates the signature.

## Verification

Run Fresh TypeScript build, focused Phase 1953~1960 tests, the complete sorted test-file set in exhaustive batches if a monolithic Node test process stalls, Release Candidate, Release Quality Gate, Raster profiles, ZIP integrity, and repeat build/full tests/release gates from a fresh extraction of the final ZIP.
