# Phase 2101~2110 Handoff — Synergy Identity + Legendary Awakening Recall Integration

## Scope
- Phase 2101~2105: 10 Synergy identities added as a dedicated static atlas and connected to persistent build recall + activation toast.
- Phase 2106~2108: 8 Legendary equipment identities reuse the existing shop item atlas for sustained awakening recall and proc toast identity.
- Phase 2109: exactly 60 deterministic presentation/gameplay contract audit samples.
- Phase 2110: Release Freeze fail-closed evidence, regression, reconstructed-main delivery packaging.

## New / reused assets
- New: `assets/ui/synergy-icons.png` — 384×288 RGBA, 4×3, 96×96 cells, 10 used cells, 10/10 raster-unique.
- New atlas SHA-256: `07d0a75c400b977b236d084e6162f47a48c74ca666b493aa3409a28cf84cf6dc`.
- Reused unchanged: `assets/ui/shop-items.png` for 8 Legendary equipment identities.
- Existing shop atlas SHA-256: `9d80a3640893c70625b4ecb59dd7edeb856668a66e706805e578d7027e54b5f9`.

## Presentation behavior
- Synergy recall shows at most 2 current synergy icons in the compact build identity band.
- Newly activated synergy gets the existing text toast plus its dedicated synergy icon.
- Restored runs seed the synergy tracker silently to avoid fake activation toasts.
- Sustained Legendary awakenings are derived from existing equipment + existing runtime modifiers and show at most 2 equipment icons.
- Nova, Magnet, Core Heal, and boss bonus-gold toast paths reuse the exact equipped shop item icon.
- Image load failure preserves existing text/gameplay paths; all identity motion amplitude is 0.

## Frozen gameplay contracts
No changes to:
- `src/game/synergies.ts`
- `src/game/legendary-effects.ts`
- `src/game/shop-item-assets.ts`
- `assets/ui/shop-items.png`
- `src/domain/run-snapshot.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/types.ts`

Existing synergy formulas, Legendary trigger counters/durations/cooldowns/proc values, Actions 9/9, and snapshot schema remain unchanged.

## Deterministic audit
`auditSynergyLegendaryIdentityAssets()`:
- exactly 60 samples
- Synergy identity 10/10, unique cells 10/10
- Legendary reuse 8/8
- Sustained recall coverage 100%
- Proc toast coverage 100%
- max Synergy recall icons 2
- max Legendary recall icons 2
- text fallback preserved
- image failure non-blocking
- motion amplitude 0
- Synergy contract mutation false
- Legendary contract mutation false
- Actions 9/9
- snapshot schema mutation false

## Feature branch verification
- Focused regression: 30/30 PASS.
- Full regression: 541 test files / 1,854 tests / 1,854 PASS / fail 0.
- Candidate: PASS `RCQ-507D7763`.
- Forged lower evidence: REVIEW `RCQ-5236ADC2`, issue `release-freeze`.
- Sample count 60→61 changes signature to `RCQ-CBBDB234`.
- Release Quality Gate: PASS `RQ-D4630257`.
- Raster: 5/5 PASS.

Final merged-main and fresh ZIP re-extraction verification are reported in the final delivery message.
