# Phase 2025~2032 Handoff — Ascension Mutator Threat Identity Integration

## Scope

This pass adds static combat identity assets for the four Ascension mutators without changing Ascension progression, RNG selection, runtime modifiers, combat actions, or snapshot schema.

## Phase 2025 — Ascension Mutator Atlas

- Added `assets/ui/ascension-mutator-icons.png`.
- 192×192 RGBA atlas, 2×2, 96×96 cells.
- Four unique static cells:
  - `accelerated_projectiles`
  - `reinforced_elites`
  - `volatile_death`
  - `scarce_shop`
- No animation; motion amplitude is 0.
- Added `ascension-mutator-identity-assets.ts` with atlas metadata and cell audit.

## Phase 2026~2030 — Runtime Presentation Integration

- Ascension mutator acquisition toast retains the existing Korean text and gains a 28px source icon when the atlas is ready.
- Active Ascension mutators are recalled in the existing build/Ascension status region as at most three 18px static icons.
- Atlas loading uses asynchronous `Image` decoding.
- Loading delay or failure leaves the existing text-only presentation intact and does not block gameplay.
- No new HUD row, timer, menu, blink, pulse, or rotational animation was added.

## Frozen Gameplay Contracts

The following existing files were not modified:

- `src/game/endless/ascension.ts`
- `src/game/endless/ascension-mutator-runtime.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/types.ts`

Locked behavior remains:

- Mutator award tiers: 3 / 6 / 9.
- Mutators remain unique, with deterministic seeded selection.
- Ascension tier cap: 10.
- Accelerated projectiles: projectile speed ×1.16.
- Reinforced elites: elite health ×1.28.
- Scarce shop: shop interval ×1.18.
- Volatile death: radius 108 / damage 64.
- Actions: 9/9.
- RunSnapshot schema unchanged.

## Phase 2031 — Deterministic Identity Audit

Added `auditAscensionMutatorIdentityAssets()` with 60 deterministic samples.

Verified:

- identity coverage 4/4
- unique cells 4/4
- toast coverage 100%
- active recall coverage 100%
- max visible recall icons 3
- text fallback 100%
- image load failure non-blocking 100%
- motion amplitude 0
- tier contract mutation false
- RNG contract mutation false
- runtime modifier mutation false
- Actions 9/9
- snapshot schema mutation false

## Phase 2032 — Release Fail-Closed

Release Freeze now binds:

- `ascensionMutatorIdentityAssetsPassed`
- `ascensionMutatorIdentityAssetsSamples = 60`

Candidate evidence after implementation:

- normal: `PASS · RCQ-B0EBA30F`
- forged lower evidence false with parent passed true: `REVIEW · release-freeze · RCQ-CBF6337E`
- sample count 60 → 61: `PASS · RCQ-80EE4A80`

## Verification

Feature-branch verification before merge:

- Fresh TypeScript build: PASS
- Focused regression: 21/21 PASS
- Full regression: 500 test files / 1,794 tests / fail 0
- Release Candidate: PASS · RCQ-B0EBA30F
- Release Quality Gate: PASS · RQ-D4630257
- Raster: 5/5 PASS
- Atlas: 192×192 RGBA / 4 unique cells

A final delivery ZIP is to be created from reconstructed `main` after merge and re-verified from a clean extraction with `npm ci`.
