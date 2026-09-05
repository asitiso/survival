# Phase 2135~2142 Handoff — Boss Archetype + Special Intent Identity Integration

## Scope
- Added two new static identity atlases covering all six boss archetypes twice: persistent archetype identity + imminent special intent.
- Connected boss spawn toast, persistent boss-pressure recall, special countdown cue, and existing toast layer without adding a HUD row.
- Gameplay tuning, boss schedules, Actions 9/9, and snapshot schema remain unchanged.

## Phase map
- Phase 2135 — 6 boss archetype identities + 6 boss special-intent identities.
- Phase 2136 — boss encounter/spawn toast identity.
- Phase 2137 — persistent archetype recall in existing boss-pressure layer.
- Phase 2138 — special-intent countdown identity above the active boss.
- Phase 2139 — static 3-segment urgency encoding (1.2s / .8s / .4s bands), no animation.
- Phase 2140 — compact/Mythic coexistence and image-failure text fallback.
- Phase 2141 — exactly 60 deterministic identity/pattern contract audit samples.
- Phase 2142 — Release Freeze fail-closed evidence and release candidate signature binding.

## Asset contract
### `assets/ui/boss-archetype-icons.png`
- 288×192 RGBA / 3×2 / cell 96×96
- 6/6 used and pixel-unique
- inferno / summoner / juggernaut / abyssWitch / twinMaw / timeEater
- SHA-256: `2bdf81b25a433a188da961ea7eca8a514d4097969043ce67bd81cb5067c1b348`

### `assets/ui/boss-special-intent-icons.png`
- 288×192 RGBA / 3×2 / cell 96×96
- 6/6 used and pixel-unique
- FLAME FAN / BROOD CALL / IRON CHARGE / VOID CURSE / TWIN CROSS / TIME PRESSURE
- SHA-256: `86b356a2d7435478626df9991e71ee0071828876cbc08757d65389b45f9f51e5`

Both atlases:
- static only (`animated=false`, `motionAmplitude=0`)
- text fallback preserved
- image load failure never blocks gameplay

## Presentation contract
- Encounter toast can carry the boss archetype crest beside existing Mythic Phase / arena mutation identities.
- Persistent recall adds one compact archetype icon to the existing boss-pressure band; no new HUD row.
- When the existing `specialTimer` enters the final 1.2 seconds, the matching special-intent icon appears above the boss.
- Urgency uses static segments: >.8s = 1, .4~.8s = 2, <=.4s = 3.
- No new movement/pulse is introduced; Reduced Motion/Reduced Flash contracts are not expanded.

## Gameplay freeze
No feature changes to:
- `src/game/boss-patterns.ts`
- `src/game/enemies.ts`
- `src/game/boss-encounters.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/types.ts`

Locked examples audited:
- Inferno Phase I 5.4s / 7 fan projectiles
- Summoner Phase III summon count 7
- Juggernaut Phase II dash 160
- Abyss Witch Phase I ring 4
- Twin Maw Phase III fan 8
- Time Eater Phase II 4.7s / projectile speed ×1.00
- Actions 9/9
- snapshot schema unchanged

## Deterministic audit
`auditBossArchetypeIntentAssets()` contains exactly 60 samples.

Result: 60/60 PASS, issues 0.

## Verification evidence
- TypeScript build: PASS
- 559 test files
- 1,880 tests / 1,880 PASS / 0 FAIL (split regression)
- Release Candidate: PASS `RCQ-965956FB`
- Release Quality Gate: PASS `RQ-D4630257`
- Raster 5/5 PASS: `RR-FE2C6B74`, `RR-0937F125`, `RR-4C84B218`, `RR-023FFC4B`, `RR-737044D6`

## Reconstructed Git note
The delivered Phase 2134 ZIP did not contain upstream `.git` history. Git history in this continuation is reconstructed solely for isolation, verification, local merge, and packaging. Resulting SHA values are reconstructed-local SHAs, not upstream repository SHAs.
