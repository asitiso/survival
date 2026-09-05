# Phase 1977~1984 Handoff — Boss Weakpoint Node Identity Integration

## Scope
This pass adds static icon identity to the six existing boss weakpoint node kinds without changing boss balance, weakpoint geometry, AUTO weakpoint selection, inputs, actions, or snapshot schema.

## Phase 1977 — Boss Weakpoint Atlas
- `flamePylon`, `summonCore`, `armorPlate`, `curseAnchor`, `mawSigil`, `clockShard`
- `assets/bosses/boss-weakpoint-icons.png`
- 288×192, 3×2, cell 96×96
- 6/6 unique cells, all in bounds
- Static only: motion amplitude 0
- Text fallback preserved and load failure non-blocking

## Phase 1978~1982 — Rendering and AUTO consistency
- `Game` asynchronously loads the atlas; asset readiness never blocks startup.
- Existing node circle, HP bar, color, weakpoint ring, primary label policy and attention ordering are preserved.
- Atlas ready: node body draws the matching icon.
- Atlas unavailable/failed: existing `PYLON / CORE / PLATE / CURSE / MAW / TIME` text remains.
- Primary weakpoint remains selected by HP ratio → hero distance → stable id.
- `autoWeakpointAimPoint()` remains unchanged and redirects to the same primary weakpoint contract.

## Phase 1983 — 60 deterministic samples
Audit: `auditBossWeakpointIdentityAssets()`
- Node identity coverage: 6/6
- Unique atlas cells: 6/6
- Body coverage: 100%
- Primary weakpoint coverage: 100%
- Text fallback: 100%
- Load failure non-blocking: 100%
- Motion amplitude: 0
- Tier 0 node HP: 210
- Tier 2 node HP: 320
- `armorPlate` radius: 27
- Other node radius: 31
- Six archetype alive/destroyed `BossEncounterSystem.modifiers` contracts preserved
- AUTO weakpoint selection contract preserved
- Actions: 9/9
- Snapshot schema mutation: false

## Phase 1984 — Release fail-closed
Release Freeze fields:
- `bossWeakpointIdentityAssetsPassed = true`
- `bossWeakpointIdentityAssetsSamples = 60`

Release evidence on feature branch:
- Normal Candidate: `PASS · RCQ-89A4E903`
- Forged lower evidence (`bossWeakpointIdentityAssetsPassed=false`, upper `passed=true`): `REVIEW · release-freeze · RCQ-C499B822`
- Sample count mutation 60→61: `PASS · RCQ-BFAAB954`
- Release Quality Gate: `PASS · RQ-D4630257`
- Raster profiles: 5/5 PASS

## Regression evidence
Fresh TypeScript build: PASS

Focused weakpoint regression:
- 24 / 24 PASS

Full feature-branch regression:
- 476 test files
- 283 + 291 + 270 + 291 + 318 + 305 = 1,758 tests
- 1,758 / 1,758 PASS
- fail 0

## Frozen gameplay
No changes to:
- `tierHp = 210 + variantTier * 55`
- weakpoint node count/offsets
- node radii
- `BossEncounterSystem.modifiers`
- weakpoint damage handling or Inferno vulnerability timing
- `primaryWeakpointNode()` sorting
- `autoWeakpointAimPoint()` sorting/range behavior
- boss AI, boss damage, specials, summons or dash values
- 9 Actions
- RunSnapshot schema
