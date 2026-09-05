# Phase 2111~2118 Handoff — Spell Evolution Visual Identity Integration

## Scope

Presentation-only integration for existing spell evolution gameplay. Adds one static 8-cell crest atlas and composes it with the existing 24 hero ability icons across milestone choice preview, acquisition toast, and persistent action-button recall.

## Phase map

- Phase 2111 — `spell-evolution-crests.png` atlas, 384×192, 4×2, 96px cells, 8/8 used.
- Phase 2112 — Lv.4→5 / Lv.9→10 growth choice preview crest.
- Phase 2113 — acquisition toast using existing hero ability art + crest and actual `spellEvolution().name`.
- Phase 2114~2115 — persistent action-button crest for spell1~4 + ultimate1~2 at Tier 1/2.
- Phase 2116 — compact long-run presentation, static/no-motion fallback-safe behavior.
- Phase 2117 — exactly 60 deterministic visual identity samples.
- Phase 2118 — Release Freeze fail-closed evidence and candidate signature binding.

## Asset contract

`assets/ui/spell-evolution-crests.png`

- 384×192 RGBA
- 4 columns × 2 rows
- cell 96×96
- row 0: Arkan / Seria / Kain / Edric Awakened
- row 1: Arkan / Seria / Kain / Edric Final
- 8/8 raster cells unique
- animation: false
- motion amplitude: 0
- image load failure never blocks gameplay
- text/base ability fallback preserved
- SHA-256: `44f52495aba8460706a7391e1b4f96fe94e88a34ea1f163c231ee3d61d1d83b1`

## Gameplay freeze

No changes to:

- `src/game/spell-evolutions.ts`
- `src/game/spells.ts`
- `src/domain/run-snapshot.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/types.ts`
- `assets/ui/hero-ability-icons.png`

Locked behavior includes:

- Tier 0: Lv.1~4
- Tier 1: Lv.5~9
- Tier 2: Lv.10
- all 48 hero × spell × evolved-tier names
- damage/area/projectile/jump/tick/cooldown/duration/pierce/splash/knockback/pull/slow/delay contracts
- Actions 9/9
- snapshot schema unchanged

## TDD evidence

Initial Phase tests: 6 total.

- Existing evolution gameplay contract: PASS
- New visual identity asset/integration/audit/release evidence: 5 expected FAIL

After implementation: 6/6 PASS.

## Phase 2117 deterministic audit

`auditSpellEvolutionIdentityAssets()`:

- exactly 60 samples
- crest count 8
- crest coverage 100%
- crest unique cells 8
- hero ability combinations 24
- evolution name combinations 48
- milestone preview coverage 100%
- action recall coverage 100%
- toast coverage 100%
- text fallback preserved
- image failure non-blocking
- motion amplitude 0
- evolution contract mutation false
- Actions 9/9
- snapshot mutation false

## Feature branch verification

- TypeScript build: PASS
- Focused regression: 23/23 PASS
- Full regression: 546 test files / 1860 tests / 1860 PASS / fail 0
- Release Candidate: `RCQ-275B18DD` PASS
- Forged `spellEvolutionIdentityAssetsPassed=false`: `RCQ-F2524648` REVIEW / `release-freeze`
- Sample count 60→61: `RCQ-785DA8E6` PASS with changed signature
- Release Quality Gate: `RQ-D4630257` PASS
- Raster: 5/5 PASS
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`

## Git provenance

The delivered Phase 2110 ZIP did not contain the original repository `.git` history. Git in this working session is reconstructed only for isolation, verification, local integration, and packaging; resulting SHAs are reconstructed-local SHAs, not upstream repository SHAs.
