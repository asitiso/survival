# Phase 2175~2182 Handoff — Arena Hazard + Mythic Geometry Identity Integration

## Scope
- Added six normal/APEX boss arena hazard identities for `firePool`, `summonSigil`, `shockLane`, `cursePool`, `twinCross`, and `timeZone`.
- Added six Mythic arena geometry identities for `solar-ring`, `brood-pockets`, `iron-corridor`, `void-orbit`, `twin-cross`, and `broken-clock`.
- Normal/APEX arena rendering shows only the single earliest active telegraph identity; the icon disappears once that hazard activates.
- Mythic safe-lane rendering shows one current geometry identity beside the existing safe-lane guidance.
- Geometry identity is suppressed during hero/core critical attention and active Mythic Last Law.
- No new HUD row, gameplay tuning, action count, or endless snapshot schema changes.

## Phase map
- Phase 2175 — Arena Hazard Identity atlas, six static cells.
- Phase 2176 — Mythic Arena Geometry atlas, six static cells.
- Phase 2177 — arena hazard atlas loading and non-Mythic primary telegraph selection.
- Phase 2178 — active-hazard suppression and one-icon cap.
- Phase 2179 — Mythic geometry atlas loading and safe-lane integration.
- Phase 2180 — critical/Last Law suppression and weakpoint-relief identity stability.
- Phase 2181 — exactly 60 deterministic arena/geometry identity audit samples.
- Phase 2182 — Release Freeze fail-closed evidence + candidate signature binding.

## Asset contract
### assets/bosses/boss-arena-hazard-icons.png
- 288x192 RGBA / 3x2 / cell 96x96
- 6/6 used and pixel-unique
- SHA-256: 63c7803d5b5b2cd73988780ecb38ead8d27d9964c019492a7ab897b7f24f9f71

### assets/bosses/mythic-arena-geometry-icons.png
- 288x192 RGBA / 3x2 / cell 96x96
- 6/6 used and pixel-unique
- SHA-256: 3ede704fe272ace3e3e9b3352b0692ccbe9ae5a51796c7949536838641398a38

Both atlases are static only (`animated=false`, `motionAmplitude=0`), preserve fallback rendering, and image-load failure never blocks gameplay.

## Presentation contract
- Earliest normal/APEX arena telegraph is selected by lowest remaining `telegraph`, then lowest hazard id as a deterministic tie break.
- At most one normal/APEX hazard identity is visible, and only while `hazard.telegraph > 0`.
- Mythic bosses do not render the normal/APEX hazard identity; they use one geometry identity at the existing safe-lane seam.
- Geometry identity reads `mythicArenaGeometryProfile(...).id` directly, so weakpoint relief changes radius/rotation/safe gap/pressure without changing identity.
- Hero/core critical and active Last Law suppress Mythic geometry identity.

## Gameplay freeze
No feature changes to:
- BossArena base telegraph 1.05s
- BossArena hazard TTL 5.4s
- hazard damage/radius/cadence/slow/push behavior
- Mythic geometry placementRadius/rotationRate/safeGapRadians/pressure tuning
- Actions 9/9
- endless snapshot schema

## Deterministic audit
- `auditArenaGeometryIdentityAssets()`: exactly 60 samples
- Result: 60/60 PASS, issues 0

## Verification evidence
- TypeScript build: PASS
- 584 test files
- 1,920 tests / 1,920 PASS / 0 FAIL (split full regression)
- Release Candidate: PASS `RCQ-34C7A26D`
- Release Quality Gate: PASS `RQ-D4630257`
- Raster 5/5 PASS: `RR-FE2C6B74`, `RR-0937F125`, `RR-4C84B218`, `RR-023FFC4B`, `RR-737044D6`

## Reconstructed Git note
The delivered Phase 2174 ZIP did not contain upstream `.git` history. Git history in this continuation is reconstructed solely for isolation, verification, local merge, and packaging. Resulting SHA values are reconstructed-local SHAs, not upstream repository SHAs.
