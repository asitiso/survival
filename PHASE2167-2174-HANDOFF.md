# Phase 2167~2174 Handoff — Variant Pressure + APEX Secondary Pattern Identity Integration

## Scope
- Added six boss-archetype Variant Pressure crests for enhanced/extreme boss tiers.
- Added six APEX Secondary Pattern identities for the actual `apexSecondaryArchetype` channel.
- Boss spawn toast now reuses live boss fields to show variant tier and APEX secondary identity only when applicable.
- Non-Mythic boss-pressure recall now shows variant and APEX secondary identities without adding a HUD row.
- Imminent APEX specials show the secondary pattern beside the existing primary special-intent cue.
- Mythic bosses remain on their dedicated multi-channel identity path and never render these APEX/variant duplicate recalls.
- No gameplay tuning, action count, or endless snapshot schema changes.

## Phase map
- Phase 2167 — Variant Pressure atlas, six static cells + tier I/II badge contract.
- Phase 2168 — APEX Secondary Pattern atlas, six static cells.
- Phase 2169 — atlas loading + spawn toast integration.
- Phase 2170 — non-Mythic persistent variant/APEX recall.
- Phase 2171 — APEX secondary special-intent pairing.
- Phase 2172 — urgent-attention suppression, Mythic duplication guard, failure-safe fallback.
- Phase 2173 — exactly 60 deterministic variant/APEX identity audit samples.
- Phase 2174 — Release Freeze fail-closed evidence + candidate signature binding.

## Asset contract
### assets/bosses/boss-variant-pressure-icons.png
- 288x192 RGBA / 3x2 / cell 96x96
- 6/6 used and pixel-unique
- SHA-256: 47042e0a2bca2d4c14072e0fb58d9afb44b4e3be29bc287bc6e49daec2f00175

### assets/bosses/apex-secondary-pattern-icons.png
- 288x192 RGBA / 3x2 / cell 96x96
- 6/6 used and pixel-unique
- SHA-256: a0dc0587c127282e18939f36cbc0d28d39000a313db1c2a03e1be667340617cf

Both atlases are static only (`animated=false`, `motionAmplitude=0`), preserve text fallback, and image-load failure never blocks gameplay.

## Presentation contract
- Variant identity reads `boss.bossVariantTier` directly. Tier 0 renders nothing; tier 1/2 share the same archetype crest with I/II badge.
- APEX identity reads `boss.isApex` + `boss.apexSecondaryArchetype` directly.
- Persistent recalls are suppressed for Mythic bosses, hero/core critical, and imminent specials (`specialTimer <= 1.2s`).
- APEX secondary special intent is drawn only while the existing special countdown has 1~3 visible segments.
- Existing boss-pressure and event-toast layers are reused; no new HUD row.

## Gameplay freeze
No feature changes to:
- `bossVariantTierForOrdinal()`
- tier 1/2 variant tuning, including 0.90 / 0.80 special-interval factors
- `apexPatternPair()` / `apexBossProfile()`
- APEX pressure multipliers 0.86 cadence / 1.28 projectile density / 1.16 summon count
- boss phase boundaries and archetype tuning
- Actions 9/9
- endless snapshot schema

## Deterministic audit
- `auditVariantApexIdentityAssets()`: exactly 60 samples
- Result: 60/60 PASS, issues 0

## Verification evidence
- TypeScript build: PASS
- 579 test files
- 1,912 tests / 1,912 PASS / 0 FAIL (split full regression)
- Release Candidate: PASS `RCQ-4D2D0313`
- Release Quality Gate: PASS `RQ-D4630257`
- Raster 5/5 PASS: `RR-FE2C6B74`, `RR-0937F125`, `RR-4C84B218`, `RR-023FFC4B`, `RR-737044D6`

## Reconstructed Git note
The delivered Phase 2166 ZIP did not contain upstream `.git` history. Git history in this continuation is reconstructed solely for isolation, verification, local merge, and packaging. Resulting SHA values are reconstructed-local SHAs, not upstream repository SHAs.
