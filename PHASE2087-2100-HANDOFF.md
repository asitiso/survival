# Phase 2087~2100 Handoff — Hero Combat State + Tactical Toast Visual Expansion

## Scope

Phase 2087~2100 expands combat-state imagery without increasing the verification sample volume beyond the established release pattern.

- New image identities: **8**
  - Hero Meter: 4
  - Arcane Combo: 4
- Existing image identities newly reused on event toasts: **21**
  - Tactical Status: 15
  - Spell Fusion / Build Identity: 6
- Total visual connections covered by this pass: **29**
- Deterministic asset audit: **60 samples total** (kept at the existing verification volume by request)
- No new combat actions and no snapshot schema changes.

## Phase 2087~2090 — Hero Meter Identity

Added `assets/ui/hero-meter-icons.png`:

- 192×192 RGBA
- 2×2
- cell 96×96
- 4/4 unique cells
- arkan / seria / kain / edric
- static only, motion amplitude 0
- image load failure is presentation-only and non-blocking

Runtime integration:

- 22px emblem beside the existing Hero Meter bar
- active meter receives a bounded static glow/frame
- activation toast reuses the same emblem
- long-run/foldable text suppression continues to use the existing density policy while the emblem remains available when the atlas is loaded
- all existing text remains as fallback

Asset SHA-256:

`fd5bc99988576235419b024b85ea6c973897eafdbe5db96651d53d2197574de3`

## Phase 2091~2094 — Arcane Combo Identity

Added `assets/ui/arcane-combo-icons.png`:

- 192×192 RGBA
- 2×2
- cell 96×96
- 4/4 unique cells
- inferno-chain / frozen-control / storm-velocity / guardian-fortress
- static only, motion amplitude 0

Runtime integration:

- existing ARCANE HUD gains the family emblem
- tier badge uses I / II / III
- tier-up toast reuses the family emblem
- tier 0 remains hidden
- existing combo text remains intact as fallback

Asset SHA-256:

`9ff3261c2be555f41ebb15d4123e795f1d38c5ee079ee1af4bd26e997047cc11`

## Phase 2095~2097 — Existing Asset Reuse Expansion

No duplicate image files were created for already-covered identities.

### Tactical Status atlas reused on existing toast surfaces

15 identities:

- Field Event: goldenGoblin, supplyDrop, manaStorm, goldenNight, eliteRush
- Battlefield Objective: riftSeal, beaconDefense, cursedAltar
- Run Mission: massacre, eliteHunt, goldRush
- Threat Directive: swarmFront, ironMarch, artilleryLine, hexConvoy

Connected existing start/outcome notifications to the same tactical identity atlas where those notifications already exist. No new gameplay events or reward behavior were introduced.

### Build Identity atlas reused for Fusion activation

All 6 Fusion identities now accompany the existing `융합 발동 · ...` toast using `build-identity-icons.png`.

## Frozen gameplay contracts

The following gameplay source files are unchanged from the Phase 2086 reconstructed baseline:

- `src/game/hero-meters.ts`
- `src/game/arcane-combos.ts`
- `src/game/field-events.ts`
- `src/game/battlefield-objectives.ts`
- `src/game/run-missions.ts`
- `src/game/threat-directives.ts`
- `src/game/spell-fusions.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/types.ts`

Examples of frozen contracts:

- Hero Meter durations: Arkan 7s / Seria 6.5s / Kain 5.5s / Edric 6s
- Hero Meter activation and modifiers unchanged
- Arcane Combo score sources unchanged
- Arcane Combo tier thresholds 1 / 3 / 5 unchanged
- Tier III multipliers power 1.12 / cooldown 0.94 / area 1.12 unchanged
- Field Event modifiers and schedules unchanged
- Objective timing/reward logic unchanged
- Mission targets/rewards unchanged
- Threat Directive rotation/modifiers unchanged
- Fusion definitions/modifiers/proc behavior unchanged
- Actions 9/9
- snapshot schema unchanged

## Phase 2098~2099 — Deterministic Audit

`auditHeroCombatVisualIdentityAssets()` uses exactly **60 deterministic samples**.

Coverage:

- Hero Meter 4/4, unique cells 4/4
- Arcane Combo 4/4, unique cells 4/4
- Tactical toast reuse 15/15
- Fusion toast reuse 6/6
- text fallback preserved
- image load failure non-blocking
- motion amplitude 0
- hero meter contract mutation false
- combo contract mutation false
- tactical contract mutation false
- fusion contract mutation false
- Actions 9/9
- snapshot schema mutation false

## Phase 2100 — Release Freeze

Release Freeze evidence:

- `heroCombatVisualIdentityAssetsPassed = true`
- `heroCombatVisualIdentityAssetsSamples = 60`

Candidate evidence:

- normal: **PASS · RCQ-0069A009**
- forged child pass=false with parent pass=true: **REVIEW · release-freeze · RCQ-B2AEA704**
- sample count 60→61: **PASS · RCQ-AEFFCEA2**

Release Quality Gate:

- **RQ-D4630257**

Raster:

- 16:9 — RR-FE2C6B74
- 20:9 — RR-0937F125
- 4:3 — RR-4C84B218
- foldable — RR-023FFC4B
- 32:9 — RR-737044D6

## TDD / Regression evidence

RED:

- 6 new tests
- 1 existing gameplay-contract test passed
- 5 expected failures due missing identity modules / Game bindings / audit / Release Freeze evidence

GREEN:

- new tests 6/6 PASS
- focused regression 53/53 PASS
- feature branch full regression: **536 test files / 1,848 tests / 1,848 PASS / fail 0**

The reconstructed-main and final ZIP re-extraction verification results are reported in the final delivery message after merge and packaging.
