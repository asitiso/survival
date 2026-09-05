# Phase 2119~2126 Handoff — Run Foundation Identity Completion

## Scope
- Reused existing identity art only; no new PNG assets were added or modified.
- Run Trait: 8/8 decision-path identities reused for combat-start toast and persistent recall.
- Relic: 14/14 build-identity cells reused for acquisition/swap toast.
- Hero Ascension: 24/24 deep-run decision identities reused for selection toast while preserving existing persistent recall.

## Presentation contract
- Trait persistent recall: one static 18px icon in the existing build-identity band; no new HUD row.
- Trait start toast: `전투 성향 · <trait>` only for a real run start/retry/replay. Snapshot restore silently initializes the tracker.
- Relic reward: `유물 장착 · <relic>` uses the existing relic identity cell.
- Ascension selection: `승천 선택 · <title>` uses the exact selected ascension identity cell.
- All reused images remain static (`motionAmplitude = 0`), text fallbacks remain, and image load failure does not block gameplay.

## Gameplay freeze
The following files/assets have zero feature diff:
- `src/game/run-traits.ts`
- `src/game/relics.ts`
- `src/game/endless/hero-ascension.ts`
- `src/domain/run-snapshot.ts`
- `src/game/endless/snapshot.ts`
- `src/game/endless/types.ts`
- `assets/ui/decision-path-icons.png`
- `assets/ui/build-identity-icons.png`
- `assets/ui/deep-run-decision-icons.png`

Existing contracts preserved:
- all 8 Run Trait multipliers,
- all 14 Relic modifiers and hero/boss/mastery eligibility,
- Hero Ascension milestones 35/50/65 minutes,
- maximum 3 selected ascensions,
- Hero Ascension modifier clamps,
- Actions 9/9,
- snapshot schema unchanged.

## Deterministic audit
`auditRunFoundationIdentityAssets()` contains exactly 60 deterministic samples:
- 8 Trait identity samples,
- 14 Relic identity samples,
- 24 Ascension identity samples,
- 14 aggregate gameplay/presentation/fallback/action checks.

Result: 60/60 PASS, issues 0.

## Release evidence
- normal Candidate: `PASS · RCQ-6978A837`
- forged `runFoundationIdentityAssetsPassed=false` with parent `passed=true`: `REVIEW · RCQ-934A28B6`, issue `release-freeze`
- sample count `60→61`: signature changes to `RCQ-46DCDF28`
- Release Quality Gate: `RQ-D4630257`
- Raster: 5/5 PASS (`RR-FE2C6B74`, `RR-0937F125`, `RR-4C84B218`, `RR-023FFC4B`, `RR-737044D6`)

## Feature branch regression
- 550 test files
- 1,866 tests
- 1,866 PASS / 0 FAIL
- six batches: 418 + 440 + 274 + 169 + 119 + 446 = 1,866

## Reconstructed Git note
The delivered Phase 2118 ZIP did not contain upstream `.git` history. Git history used here is reconstructed solely to isolate, verify, and merge this continuation. Any SHA in this handoff is therefore a reconstructed local SHA, not an upstream repository SHA.
