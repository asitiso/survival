# Phase 2535~2552 Handoff — Hazard Aftermath / Enemy Finisher / Hero Crisis VFX

## Scope

This pass is presentation-only. It adds three bounded, fail-open battlefield VFX trains without changing combat balance, spawn/drop rules, action count, or snapshot schema.

## Train A — Phase 2535~2540: Boss Arena Hazard Aftermath VFX

- New atlas: `assets/bosses/boss-hazard-aftermath-vfx.png`
- 6 hazard kinds: `firePool`, `summonSigil`, `shockLane`, `cursePool`, `twinCross`, `timeZone`
- 2 states each: `detonate`, `residual`
- 12/12 unique cells, 128×128 cells, 3×4 atlas, 384×512
- Aftermath is queued only when an already-active hazard naturally expires by TTL.
- Existing telegraph/active lifecycle VFX, hazard damage, radius, duration, cap behavior and arena logic remain unchanged.
- Queue is bounded to 16 and bitmap load failure leaves the existing Canvas/hazard rendering untouched.

## Train B — Phase 2541~2546: Enemy Finisher VFX

- New atlas: `assets/enemies/enemy-finisher-vfx.png`
- 6 visual kill sources: `normal`, `explosion`, `freeze`, `ultimate`, `finalForm`, `fusion`
- 2 states each: `burst`, `afterglow`
- 12/12 unique cells, 128×128 cells, 6×2 atlas, 768×256
- Death rewards and death detection remain unchanged; `EnemyDeathVisualSource` is presentation metadata only.
- Existing enemy death afterglow/combat VFX remains as fallback.
- Frost Nova/Seria shatter tag freeze, splash/crystal/Arkan blast tag explosion, Meteor/Black Hole tag ultimate, fusion proc tags fusion.
- Final Form preserves the legacy exact damage-call contract and marks the already-produced death event afterward via `markLastDeathVisualSource('finalForm')`.
- Queue is bounded to 24.

## Train C — Phase 2547~2552: Hero Crisis VFX

- New atlas: `assets/heroes/hero-crisis-vfx.png`
- 4 heroes × 5 states: `hit`, `heavy`, `critical`, `nearDeath`, `recovery`
- 20/20 unique cells, 128×128 cells, 5×4 atlas, 640×512
- Presentation-only thresholds:
  - heavy: single applied hit >= 12% max HP
  - critical: single applied hit >= 32% max HP
  - nearDeath: crosses from >22% to <=22% HP
  - recovery: crosses from <=35% to >35% HP
- These thresholds do not alter HP, damage reduction, invulnerability, healing, potion values, or AI.
- Queue is bounded to 12; reset clears it and restores the HP-ratio baseline.
- Reduced Flash lowers alpha while preserving state identity.

## Release Binding

Three deterministic 64-sample audits were added:

- `boss-hazard-aftermath-vfx-audit.ts`
- `enemy-finisher-vfx-audit.ts`
- `hero-crisis-vfx-audit.ts`

Each audit requires:

- presentation only
- fail-open image loading
- no gameplay formula mutation
- no snapshot schema mutation
- action count 9

Release Freeze includes all three, and Release Candidate signature material includes each pass bit and sample count. Forging any pass bit to false causes Candidate `REVIEW` with `release-freeze`; changing any sample count changes the Candidate signature.

## Asset Evidence

- `boss-hazard-aftermath-vfx.png`: 163,370 bytes; SHA-256 `923aa50e1d73762cdbea4dd99d9de23112309b334d2580cff244277ce8c175b4`; 12/12 non-empty and pixel-unique.
- `enemy-finisher-vfx.png`: 171,782 bytes; SHA-256 `1fc9049b330308184accdfedc2ddd609e3a5a92a4be6d0ed69e3bcc852e947bc`; 12/12 non-empty and pixel-unique.
- `hero-crisis-vfx.png`: 266,441 bytes; SHA-256 `aaa56b2b749d9202cbbd3c946e1217623f685825f6921b3f5fc32ace1be4f7de`; 20/20 non-empty and pixel-unique.

Total: 44/44 non-empty, pixel-unique cells.

## Verification

- TDD RED: 18/18 new contracts failed before implementation.
- GREEN: 18/18 new contracts pass after implementation.
- Related boss hazard / death / freeze / fusion / final-form / survival VFX regressions: 200/200 pass.
- Legacy Final Form exact-call regression: 11/11 pass after preserving the old call form.
- Full feature-branch regression: 720 test files / 2,344 tests / 2,344 pass / 0 fail.
- Candidate/Release/Raster IDs are regenerated again immediately before commit and after main merge; use those fresh final values in the completion report.

## Next VFX Direction

Avoid adding more layers to these exact moments next pass. Higher-value remaining candidates are hero dash/evade trail states, objective activation/completion world VFX, crowd-control chain propagation, and boss weakpoint counterplay reward aftermath.
