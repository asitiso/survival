# Phase 2079~2086 Handoff — Boss Arena Mutation Combat Identity Integration

## Scope
- Added a dedicated static 5-kind Boss Arena Mutation atlas: `assets/ui/boss-arena-mutation-icons.png`.
- Added identity metadata/audit modules for `rotating_front`, `fractured_ring`, `gravity_well`, `mirror_lanes`, `shrinking_sanctum`.
- Normal boss mutation toast retains existing text and adds the matching icon.
- Mythic boss entrance keeps the Mythic message while carrying the base Arena Mutation icon so mutation information is not lost.
- Existing boss pressure area now recalls exactly one active Arena Mutation icon; Mythic/4h+ uses compact sizing.
- Recall adds a static 1~3 segment intensity cue; no new HUD row or animation.
- Image-load failure is presentation-only and non-blocking.

## Gameplay freeze
No gameplay changes were made to:
- `src/game/endless/boss-arena-mutations.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/types.ts`

Frozen contracts include Tier <2 null behavior, Tier clamp 0~10, deterministic archetype+encounter+tier kind selection, intensity `clamp(0.35 + tier*0.055, 0.35, 0.9)`, cadence/radius/telegraph/damage/maxHazards/orbitOffset modifier formulas, and Mythic wrapping through `mythicArenaIdentityProfile()`.

## Asset
- 288×192 RGBA, 3×2, cell 96×96
- 5 used cells / 1 reserve cell
- 5/5 raster-unique used cells
- SHA-256: `b3d70b382bfda673052479fdb821c7cda31923dda5b6a6f5afd2c1d940c2f101`

## Audit / release evidence
- `auditBossArenaMutationIdentityAssets()` = exactly 60 deterministic samples.
- 5/5 identity and unique-cell coverage.
- normal toast / Mythic toast / persistent recall / fallback = 100%.
- max visible recall icons = 1; motion amplitude = 0; image load failure non-blocking.
- tier / deterministic selection / intensity / modifier contracts unchanged.
- Actions 9/9; snapshot schema mutation false.
- Candidate normal: `PASS · RCQ-F8F31E7F`.
- Forged child evidence with parent `passed=true`: `REVIEW · release-freeze · RCQ-24086DCE`.
- Sample count 60→61 changes signature to `PASS · RCQ-7751CCB0`.

## Tests
- TDD RED: 1 existing gameplay-contract test passed, 5 new presentation/audit/release tests failed before implementation.
- GREEN: new Phase tests 6/6 pass.
- Focused Boss Arena/Mythic/Release regression: 24/24 pass.
- Feature-tree full regression: 532 test files / 1,842 tests / 1,842 pass / 0 fail.
