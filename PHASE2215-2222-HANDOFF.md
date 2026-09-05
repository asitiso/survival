# Phase 2215~2222 Handoff — Run Contract Requirement + Boon Decision Identity Integration

## Scope
Presentation-only run-contract decision clarity. Contract gameplay, schedules, failure rules, boon duration/modifiers, actions and snapshot schema remain frozen.

## Phase map
- Phase 2215 — Run Contract Requirement atlas: 5 identities, 480×96, 5×1, 96×96, static/fallback/non-blocking.
- Phase 2216 — Run Contract Boon Effect atlas: 5 identities, 480×96, 5×1, 96×96, static/fallback/non-blocking.
- Phase 2217 — LevelUpOverlay optional secondary identity slot; contract choices alone populate Requirement + Boon helpers.
- Phase 2218 — Active CONTRACT row pace identity reuses Phase 2207 mission pace atlas.
- Phase 2219 — Active CONTRACT row previews one boon-effect identity beside existing family identity.
- Phase 2220 — Success toast closes family → boon effect; failure toast does not claim a boon; helper icons yield to hero/core critical and boss special ≤1.2s.
- Phase 2221 — Exactly 60 deterministic audit samples.
- Phase 2222 — Release Freeze fail-closed evidence and Candidate signature binding.

## Frozen gameplay contracts
- Offer schedule: 4 / 9 / 14 / 19 minutes, then every 7 minutes (26m next).
- Durations: Slayer 45s / Warden 30s / Arcane 40s / Hunter 60s / Survivor 20s.
- Warden allowed core loss: 20% of baseline core HP.
- Survivor: any hero_damaged event fails immediately.
- Boon duration: 90 seconds.
- Slayer: XP ×1.12 / Mastery ×1.08.
- Warden: core damage taken ×0.88 / Potion ×1.10.
- Arcane: Fusion ×1.10 / cooldown ×0.92.
- Hunter: Gold ×1.15 / Boss damage ×1.08.
- Survivor: core damage taken ×0.92 / Potion ×1.15.
- Actions: 9/9.
- Endless snapshot schema: unchanged.

## New assets
- assets/ui/run-contract-requirement-icons.png
  - SHA-256: 5d41391c8814e35dad0a3cc7bda4970ee930d41a13360afcb2fc1fb6bb9702f0
  - 480×96 / 5 cells / 5 pixel-unique cells.
- assets/ui/run-contract-boon-effect-icons.png
  - SHA-256: 426e01b75e20cce9f80755547c5a7fa7ec36cc20b3bd4dbfc1b1a7287c5247b1
  - 480×96 / 5 cells / 5 pixel-unique cells.

## Verification evidence on feature branch
- TypeScript build: PASS.
- Tests: 607 files / 1,966 tests / 1,966 PASS / 0 FAIL (split to avoid harness timeout).
- Phase 2221 audit: exactly 60 / 60 PASS.
- Candidate: RCQ-C490E95F PASS.
- Release Quality Gate: RQ-D4630257 PASS.
- Raster: 5 / 5 PASS:
  - 16:9 RR-FE2C6B74
  - 20:9 RR-0937F125
  - 4:3 RR-4C84B218
  - foldable RR-023FFC4B
  - 32:9 RR-737044D6

## Release Freeze behavior
- runContractDecisionIdentityAssetsPassed is fail-closed.
- runContractDecisionIdentityAssetsSamples is bound into Candidate signature.
- Forged false evidence yields Candidate REVIEW.
- Sample-count mutation changes Candidate signature.

## Git note
ZIP deliveries omit .git. Any SHA reported for this pass is from the reconstructed local repository, not an upstream repository SHA.
