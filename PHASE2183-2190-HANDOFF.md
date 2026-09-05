# Phase 2183~2190 Handoff — Mythic Safe-Zone Lifecycle + Transition Direction Identity Integration

## Scope
- Added four static Mythic safe-zone lifecycle identities for `stable`, `collapse`, `collapsed`, and `reform`.
- Added eight static transition-direction identities for `N / NE / E / SE / S / SW / W / NW`.
- Lifecycle identity is rendered as one compact companion beside the existing SAFE ZONE circular guidance.
- Transition direction is rendered only when the existing safe-lane forecast urgency is `>= 0.65` and reads `currentTarget -> nextTarget` directly.
- Hero/core critical attention and active Mythic Last Law suppress both new cues.
- No auto-move, route correction, gameplay tuning, action-count, or endless snapshot schema changes.

## Phase map
- Phase 2183 — Safe-Zone Lifecycle identity atlas, four static cells.
- Phase 2184 — Safe-Zone Transition Direction atlas, eight static cells + deterministic 8-way quantization.
- Phase 2185 — lifecycle atlas loading and SAFE ZONE companion integration.
- Phase 2186 — lifecycle attention suppression and text fallback preservation.
- Phase 2187 — forecast direction atlas loading and urgency-gated transition integration.
- Phase 2188 — critical/Last Law suppression with no auto-move state.
- Phase 2189 — exactly 60 deterministic lifecycle/direction identity audit samples.
- Phase 2190 — Release Freeze fail-closed evidence + candidate signature binding.

## Asset contract
### assets/bosses/mythic-safe-zone-lifecycle-icons.png
- 384x96 RGBA / 4x1 / cell 96x96
- 4/4 used and pixel-unique
- SHA-256: 5cd3d379d8f518ea11da31b7e53448fbb085283b0a1b72dbf82af20144a6c359

### assets/bosses/safe-zone-transition-direction-icons.png
- 384x192 RGBA / 4x2 / cell 96x96
- 8/8 used and pixel-unique
- SHA-256: e8cfed578bea7ae5c9987466c21f365bec425ac4c4781f7e2bc13b974fadff80

Both atlases are static only (`animated=false`, `motionAmplitude=0`), preserve text fallback, and image-load failure never blocks gameplay.

## Presentation contract
- Lifecycle identity reads the existing `mythicSafeZoneState().phase` directly.
- Direction identity reads the existing `safeLaneForecast.currentTarget -> nextTarget` vector directly and quantizes it to eight deterministic directions.
- Direction cue appears only while `forecast.urgency >= 0.65`.
- No new HUD row is added; both cues reuse the existing Mythic safe-zone / safe-lane seams.
- Hero/core critical attention or active Mythic Last Law suppresses the new cues.

## Gameplay freeze
No feature changes to:
- SAFE TIMELINE decision boundaries: 1100 / 520 / 220 ms
- default safe-zone lifecycle: 9000 ms cycle, 4800 / 6200 / 7800 / 9000 ms boundaries
- safe-zone phase radius scaling and damage multipliers
- safe-lane forecast phase urgency and transition timing
- autoMove remains false
- Actions 9/9
- endless snapshot schema

## Deterministic audit
- `auditSafeZoneLifecycleDirectionIdentityAssets()`: exactly 60 samples
- Result: 60/60 PASS, issues 0

## Verification evidence
- TypeScript build: PASS
- 589 test files
- 1,928 tests / 1,928 PASS / 0 FAIL (split full regression; monolithic command exceeded harness duration only)
- Release Candidate: PASS `RCQ-75C1B767`
- Release Quality Gate: PASS `RQ-D4630257`
- Raster 5/5 PASS: `RR-FE2C6B74`, `RR-0937F125`, `RR-4C84B218`, `RR-023FFC4B`, `RR-737044D6`

## Reconstructed Git note
The delivered Phase 2182 ZIP did not contain upstream `.git` history. Git history in this continuation is reconstructed solely for isolation, verification, local merge, and packaging. Resulting SHA values are reconstructed-local SHAs, not upstream repository SHAs.
