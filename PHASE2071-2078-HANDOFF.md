# Phase 2071~2078 Handoff — World Evolution Active Combat Identity Integration

## Scope

This pass adds a dedicated static identity atlas for the five non-calm Endless World Evolution states and connects it to the existing evolution toast and persistent top status area without adding a new HUD row.

World identities:
- `stormfront` — 폭풍전선
- `ruins` — 붕괴유적
- `mana_bloom` — 마나개화
- `blood_moon` — 혈월
- `sanctuary` — 성역

`calm` intentionally has no icon.

## Asset

- `assets/ui/world-evolution-icons.png`
- 288×192 RGBA
- 3×2 grid
- 96×96 cells
- 5 used cells / 1 unused
- 4,876 bytes
- SHA-256 `5a36ef7bd7917b802e8b9506af8ff0737aa7ca55c2231bb8540d4734347c7c94`
- 5/5 raster-unique cells
- static only, motion amplitude 0

## Runtime integration

- `world_evolved` keeps the existing `전장 변이 · ...` text and now carries the corresponding identity icon.
- Current non-calm world is persistently recalled beside the existing Battlefield Identity in the top status panel.
- No new HUD row is created.
- Foldable / long-run / boss-dense states retain the icon and suppress the optional short text label.
- Field Node identity remains local to world-space nodes; World Evolution identity remains global in the status panel.
- Atlas load failure is presentation-only and never blocks gameplay.

## Gameplay freeze

Protected gameplay files remain unchanged:
- `src/game/endless/world-evolution.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/types.ts`

Contracts audited without mutation:
- evolution cadence: 8 / 16 / 24 / 32 minutes ...
- previous world excluded from the next weighted pick
- Fate / Fusion / Threat weighting behavior
- five field-node plans, counts, radii, and TTLs
- existing World modifiers and clamps
- Actions 9/9
- snapshot schema unchanged

## Audit / release evidence

`auditWorldEvolutionIdentityAssets()` uses exactly 60 deterministic samples:
- identity coverage 5/5
- unique cells 5/5
- toast coverage 100%
- persistent recall coverage 100%
- fallback coverage 100%
- max visible recall icons 1
- image-load failure non-blocking
- motion amplitude 0
- evolution timing mutation false
- weighted-pick mutation false
- node-contract mutation false
- modifier-contract mutation false
- Actions 9/9
- snapshot schema mutation false

Release Freeze fields:
- `worldEvolutionIdentityAssetsPassed`
- `worldEvolutionIdentityAssetsSamples = 60`

Candidate evidence observed on the feature tree before merge:
- normal: `PASS · RCQ-058AE585`
- forged child evidence false with parent passed true: `REVIEW · release-freeze · RCQ-79E0BE20`
- sample count 60→61: `PASS · RCQ-69955A0E`
- Release Quality Gate: `RQ-D4630257`
- Raster: 5/5 PASS

## Tests

New test files:
- `tests/phase2071-world-evolution-identity-assets.test.mjs`
- `tests/phase2072-2075-world-evolution-identity-integration.test.mjs`
- `tests/phase2076-2077-world-evolution-identity-audit.test.mjs`
- `tests/phase2078-world-evolution-identity-release-gate.test.mjs`

TDD RED was verified first: 1 existing gameplay-contract test passed and 5 new identity/release tests failed before implementation.

Feature-tree full regression after implementation:
- 528 test files
- 1,836 tests
- 1,836 PASS
- 0 failures

Final reconstructed-main and delivery ZIP verification are performed after this handoff is committed.
