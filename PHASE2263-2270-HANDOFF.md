# Phase 2263~2270 Handoff — Spell Evolution Effective Modifier + Tier Delta Projection Integration

This pass continues from the verified Phase 2262 reconstructed main at `3cf16eeb1ecc060a9f5854b3d3086b03b8c4a8f0`.

## Scope

Phase 2263~2270 removes memorization from the existing Lv.4→5 and Lv.9→10 Spell Evolution choice moments. Existing hero-specific evolution crests remain the primary identity. Only at a real evolution boundary, the existing level-up and boss-growth cards now add the upcoming tier identity plus up to two highest-salience real effective modifier identities derived from the frozen `spellEvolution()` result before and after the upgrade. Successful evolution toast reuses the same real projection.

No new HUD row, gameplay modifier, upgrade-generation rule, action, or persisted state was introduced.

### Phase 2263 — Spell Evolution Modifier Identity Atlas

- Added `assets/ui/spell-evolution-modifier-icons.png`.
- 384×192 / 4×2 / cell 96×96.
- Eight identities: damage / area / projectile / chain / cadence / duration / control / pierce.
- 8/8 cells pixel-unique.
- All eight identities occur in the real 4 heroes × 6 spells × two evolution-boundary projection matrix.
- Static art; animation false; motion amplitude 0; text remains authoritative; load failure does not block gameplay.
- File size: 4,343 bytes.
- SHA-256: `ac25f7dce40238209617934e9d39493ab1dadf67c41591117117307cdcdbed33`.

### Phase 2264 — Tier Delta Identity Atlas

- Added `assets/ui/spell-evolution-tier-delta-icons.png`.
- 192×96 / 2×1 / cell 96×96.
- `1차 진화 / 최종 진화` (`awaken / final`).
- 2/2 cells pixel-unique.
- File size: 1,061 bytes.
- SHA-256: `ec360465f81adc6aed74d4bfdc9979d0eaf3ac7e4d04f66a29ec4bc7b343c611`.

### Phase 2265 — Real Evolution Projection

- Added `projectSpellEvolutionSelection(heroId, spellId, currentLevel)`.
- Reads the real frozen `spellEvolution()` at current level and current+1.
- Returns a projection only when the tier actually advances.
- Lv.4→5 maps to `awaken`; Lv.9→10 maps to `final`.
- Real before/after deltas are grouped into damage, area, projectile, chain, cadence, duration, control, and pierce identities.
- Only the two highest-salience real effects are surfaced.
- Non-boundary upgrades return `null` and keep the Phase 2262 presentation path.
- Verified reference example: Arkan Fire Bolt Lv.4→5 → `1차 진화 실효 · 피해 +13.4% · 투사체 +1`.

### Phase 2266 — Level-up + Boss Growth Choice Integration

At a real evolution boundary, existing spell growth cards keep their current spell identity and crest while adding:

1. upcoming tier identity;
2. up to two real effective modifier identities;
3. real numerical projection hint.

The generic `LevelUp` secondary-identity contract remains exactly three icons via the existing `secondaryIdentityStyles.slice(0,3)` path. Spell Evolution does not request a wider cap, so Contract, Ascension, Fusion, and other decision surfaces retain their existing behavior.

### Phase 2267 — Evolution Confirmation + Attention Safety

- Successful evolution computes the projection from the actual level that was just crossed.
- Existing evolution crest remains the primary toast identity.
- Up to two modifier helper icons appear beside it.
- Helpers are suppressed while hero critical, core critical, or boss-special countdown ≤1.2s.
- Run reset and `showEventToast()` clear projection state so unrelated notifications cannot inherit stale evolution icons.
- Text remains authoritative if the new atlas fails to load.

During implementation, an automated patch initially matched an identical reset-state anchor instead of `showEventToast()`. The integration test correctly continued to fail. Root-cause inspection identified the duplicate anchor; the fix was applied only at the real toast-start boundary and the accidental duplicate reset assignment was removed. The integration suite then passed 5/5.

### Phase 2268~2269 — Deterministic Projection Audit

`auditSpellEvolutionProjectionIdentityAssets()` emits exactly 60 deterministic samples:

- 4 heroes × 6 spells × 2 transition levels (4 and 9) = 48 real projection samples;
- 12 frozen aggregate contracts = 12.

The audit binds:

- 8 modifier identities / full atlas coverage;
- 2 tier-delta identities / full atlas coverage;
- 4 heroes;
- 6 spells;
- transition levels `[4, 9]`;
- 48 non-empty evolved-name combinations across Lv.5/Lv.10;
- exact tier boundaries 4→5 and 9→10;
- non-boundary projection rejection;
- Actions 9/9;
- presentation-only / no snapshot mutation contract.

### Phase 2270 — Release Freeze / Candidate Binding

Release Freeze binds:

- `spellEvolutionProjectionIdentityAssetsPassed`;
- `spellEvolutionProjectionIdentityAssetsSamples = 60`.

Release Candidate fails closed when this evidence is forged, includes the sample count in its signature payload, and reports `spell-evolution-projection-identity-assets safe (60)`.

## Gameplay Freeze

The following gameplay/storage files were verified unchanged from the Phase 2262 baseline:

- `src/game/spell-evolutions.ts`
- `src/game/upgrades.ts`
- `src/game/endless/snapshot.ts`

Therefore the following contracts remain frozen:

- Lv.5 first evolution threshold;
- Lv.10 final evolution threshold;
- all existing evolution multipliers, bonuses, caps, hero/spell-specific names and combinations;
- upgrade/boss-growth candidate generation and ordering;
- Actions 9/9;
- Snapshot schema unchanged.

## Review Evidence

- `git diff --check`: clean.
- Gameplay freeze file diff: empty.
- All 48 real boundary projections were enumerated; all 8 modifier identity categories are exercised by real data.
- Existing hero-specific evolution crest assets are reused instead of duplicated.
- Non-boundary upgrades retain the existing Phase 2262 visual path.
- Choice-card helper count remains within the pre-existing generic three-icon contract.

## Verification Evidence Before Handoff Commit

### TDD / focused regression

- Initial new Phase tests observed RED before production implementation: 9 expected failures, 1 existing gameplay-freeze contract already green.
- Final focused Phase 2263~2270 tests: 10/10 PASS.
- Toast stale-state regression was observed failing before the targeted fix, then passed after correction.

### Full regression — final worktree code

- Test files: 631.
- Tests: 2,027.
- Pass: 2,027.
- Fail: 0.
- Entire sorted test-file set executed in bounded batches with no file omitted or duplicated.

### Release gates — final worktree code

- Build: PASS.
- Release Candidate: PASS — `RCQ-4F8D4B5B`.
- Release Quality Gate: PASS — `RQ-D4630257`.
- Raster profiles: 5/5 PASS.
  - 16:9 `RR-FE2C6B74`
  - 20:9 `RR-0937F125`
  - 4:3 `RR-4C84B218`
  - foldable `RR-023FFC4B`
  - 32:9 `RR-737044D6`
- Spell Evolution Projection Identity audit: PASS (60 samples).
- Actions: 9/9.
- Snapshot schema mutation: false.

## Packaging Note

The final delivery archive must be produced from the clean merged reconstructed main, generated deterministically twice, byte-compared, re-extracted, and independently verified before handoff. Its final main SHA and archive SHA-256 are therefore reported with the delivered artifact rather than embedded here.
