# Phase 2127~2134 Handoff — Mythic Phase Active Identity Integration

## Scope
- Added one new static `mythic-phase-icons.png` atlas for actual Mythic Phase 1/2/3 combat state.
- Added Mythic encounter Phase I identity, persistent phase recall, true 70%/35% transition toasts, and weakpoint-pressure segments.
- Kept the existing general `BOSS PHASE II / III` cinematic untouched and separate from the Mythic modifier phase.

## Asset contract
- `assets/ui/mythic-phase-icons.png`
- 288×192 RGBA / 3×2 / cell 96×96
- used cells 3/3 unique; remaining three cells unused
- Phase I `각성 결집`, Phase II `압박 격화`, Phase III `최종 폭주`
- static only: `animated=false`, `motionAmplitude=0`
- text fallback preserved; image load failure never blocks gameplay
- SHA-256: `6fcae709eb68495030ec9e572c462c2aeac717001844ce46d338c02ffa49e7ef`

## Presentation contract
- Mythic encounter toast keeps existing Mythic label and boss-arena mutation while adding Phase I crest.
- Persistent Mythic recall is one icon in the existing boss-pressure layer; no new HUD row.
- True Mythic transitions use `MYTHIC PHASE II · 압박 격화` and `MYTHIC PHASE III · 최종 폭주`.
- Weakpoint pressure uses three static segments derived from remaining weakpoint ratio; destroying weakpoints reduces filled segments.
- Non-Mythic bosses never show the Mythic Phase crest.

## Gameplay freeze
The following files have zero feature diff:
- `src/game/endless/mythic-phases.ts`
- `src/game/boss-patterns.ts`
- `src/game/enemies.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/types.ts`

Existing contracts preserved:
- Mythic phase thresholds 70% / 35%,
- Phase I base 0.94 / 0.96 / 1.02 / 1.02,
- Phase II base 0.92 / 0.88 / 1.10 / 1.08,
- Phase III base 0.90 / 0.80 / 1.16 / 1.14,
- weakpoint counterplay and clamps unchanged,
- general boss phase thresholds remain 66% / 33%,
- Actions 9/9,
- snapshot schema unchanged.

## Deterministic audit
`auditMythicPhaseIdentityAssets()` contains exactly 60 deterministic samples.

Result: 60/60 PASS, issues 0.

## Release evidence
- normal Candidate: `PASS · RCQ-45650361`
- forged `mythicPhaseIdentityAssetsPassed=false` with parent `passed=true`: `REVIEW · RCQ-07C6FF2C`, issue `release-freeze`
- sample count `60→61`: signature changes to `RCQ-6B8530BA`
- Release Quality Gate: `RQ-D4630257`
- Raster: 5/5 PASS (`RR-FE2C6B74`, `RR-0937F125`, `RR-4C84B218`, `RR-023FFC4B`, `RR-737044D6`)

## Feature branch regression
- 555 test files
- 1,873 tests
- 1,873 PASS / 0 FAIL
- six batches: 317 + 289 + 308 + 308 + 332 + 319 = 1,873

## Reconstructed Git note
The delivered Phase 2126 ZIP did not contain upstream `.git` history. Git history used here is reconstructed solely to isolate, verify, and merge this continuation. Any SHA in this handoff is therefore a reconstructed local SHA, not an upstream repository SHA.
