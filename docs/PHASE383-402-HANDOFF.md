# Arcane Last Stand — Phase 383~402 Handoff

## Baseline
- Source lineage: verified Phase 382 archive comment `1f11c1a173057734140c753222ffde93b2d8be30`.
- Phase 382 archive SHA-256: `8a80d8144b9f82575ba712166fed0858673c07c63e3047c5d6deba7c899977d4`.
- Restored local baseline commit: `32c3ec5` (the archive intentionally contains tracked source only, not `.git`).
- Baseline regression: 769/769 pass before Phase 383 work.
- Work branch: `work/phase383-402` in `.worktrees/phase383-402`.
- Product invariant: exactly 9 combat actions; no new blocking modal, permanent currency, runtime button, or Snapshot schema field.

## Phase 383~386 — Completed Build Meta Audit
New files:
- `src/game/completed-build-meta-audit.ts`
- `tests/completed-build-meta-audit.test.mjs`

The audit expands the existing build matrix from trait/archetype readiness into actual late-run components. It combines four heroes, eight legal release relics, all 15 unordered two-fusion pairs from the six fusion families, three hero-specific Final Forms, four Build Overdrive archetypes, and Threat 0/3/5.

Coverage:
- 4 heroes × 8 relics × 15 fusion pairs × 3 Final Forms × 4 archetypes × 3 Threat levels = 17,280 completed-build samples.
- Real `relicModifiers`, `fusionModifiers`, `finalFormModifiers`, `overdriveModifiers`, hero release model, and Threat pressure are reused.
- No runtime balance normalization is applied from the audit.

Current locks:
- Maximum hero-top spread: 1.0703 <= 1.35.
- Maximum within-hero completed-build spread: 1.2326 <= 2.10.
- Minimum Threat-5 release margin: 0.697 >= 0.62.
- Maximum Threat-0 release margin: 1.2092 <= 3.25.
- Threat margin monotonicity: PASS.
- Threat-5 release traps: 0.

## Phase 387~390 — Six-Boss Completed-Build Matchup Audit
New files:
- `src/game/boss-build-matchup-audit.ts`
- `tests/boss-build-matchup-audit.test.mjs`

Every Threat-5 completed build is scored against all six existing boss identities using the current `bossArchetypeTuning` and `bossArchetypeSpecial` pressure channels. This is a release comparison model, not a second combat simulator.

Coverage:
- 5,760 Threat-5 completed builds × 6 bosses = 34,560 matchup samples.
- Every boss summary retains explicit best/worst build evidence and all four heroes in its top envelope.

Current locks:
- Maximum boss best/worst completed-build spread: 1.3188 <= 2.10.
- Maximum hero top-envelope spread across bosses: 1.0855 <= 1.35.
- Minimum worst-build release margin: 0.6984 >= 0.55.
- Boss identity coverage: 6/6.
- Top-hero structural access: 4/4 for every boss.

Per-boss best/worst spread:
- Inferno: 1.3188.
- Summoner: 1.2921.
- Juggernaut: 1.3156.
- Abyss Witch: 1.3076.
- Twin Maw: 1.3131.
- Time Eater: 1.3097.

## Phase 391~394 — 30 / 60 / 120 Minute Gold · XP · Shop Purchasing Power
New files:
- `src/game/progression-purchasing-power-audit.ts`
- `tests/progression-purchasing-power-audit.test.mjs`

The audit combines existing projected balance growth, Gold density, and the actual first-shop/token cadence. Three bounded economy bands model weaker, neutral, and Gold-favored runs without introducing a runtime economy modifier.

Coverage:
- Threat 0/3/5 × 30/60/120 minutes × conservative/neutral/gold = 27 samples.
- Conservative/neutral/gold evidence multipliers: 0.85 / 1.00 / 1.12.
- Core-purchase purchasing-power proxy: 220 Gold, used only for release evidence.

Current locks:
- Minimum affordable core purchases: 24 >= 3.
- Minimum Gold per available shop: 519.54 >= 180.
- Maximum economy-band spread: 1.32 <= 1.50.
- Gold monotonicity: PASS.
- Projected level monotonicity: PASS.
- Shop purchasing-power monotonicity: PASS.
- Threat level-progression parity: PASS.

Threat-5 conservative checkpoints:
- 30m: 12,469 Gold, projected level 63, 24 available shops / 24 affordable core purchases.
- 60m: 41,832 Gold, projected level 93, 48 / 48.
- 120m: 147,708 Gold, projected level 140, 96 / 96.

## Phase 395~398 — Long-Run Build Choice Diversity Audit
New files:
- `src/game/build-choice-diversity-audit.ts`
- `tests/build-choice-diversity-audit.test.mjs`

The diversity audit evaluates the near-optimal completed-build pool instead of only the single highest score. This avoids overreacting to a repeated theoretical #1 build when many practically equivalent alternatives remain viable.

Coverage:
- 4 heroes × Threat 0/3/5 × 30/60/120 minutes = 36 choice snapshots.
- Near-optimal thresholds tighten from 88% to 90% to 92% with time; a minimum top pool of 24 is retained for audit stability.

Current locks:
- Maximum relic concentration: 0.224 <= 0.75.
- Maximum fusion-pair concentration: 0.085 <= 0.65.
- Maximum Final Form concentration: 0.681 <= 0.75.
- Maximum archetype concentration: 0.451 <= 0.75.
- Fixation samples: 0.
- Minimum alternatives across every audited snapshot: 8 relics, 15 fusion pairs, 3 Final Forms, 4 archetypes.
- Smallest near-optimal pool: 505 builds.

## Phase 399~402 — Candidate / Manifest Completed-Build Meta Gate
Modified:
- `src/game/release-candidate-audit.ts`
- `tests/release-candidate-audit.test.mjs`
- `tests/release-manifest.test.mjs`

`ReleaseCandidateEvidence` now requires:
- `completedBuildMeta`;
- `bossBuildMatchups`;
- `progressionPurchasingPower`;
- `buildChoiceDiversity`.

Any failure adds a fail-closed issue:
- `completed-build-meta`;
- `boss-build-matchups`;
- `progression-purchasing-power`;
- `build-choice-diversity`.

The compact Candidate summary adds:
- `complete meta 1.0703/1.2326`;
- `boss gap 1.3188`;
- `buy power 24`;
- `diversity 0.681`.

Current deterministic Candidate signature: `RCQ-2A81A675`.

The Manifest already consumes the Candidate audit as a required fail-closed child gate. Phase 402 therefore verifies that existing seam instead of adding a second duplicated manifest implementation. This keeps the release path easier to maintain while preserving the same blocking behavior.

## Verification target
Phase 382 baseline: 769 tests.
Phase 383~402 adds 20 tests, target total: 789.

Required before integration:
- `npm run build`.
- `npm test` => 789/789.
- `npm run verify:raster` => 5/5 PASS.
- `npm run verify:release` => PASS.
- `npm run verify:candidate` => `RCQ-2A81A675` PASS.
- `npm run verify:manifest -- --out release-manifest.json` => PASS with expanded Candidate summary.
- `git diff --check` clean.
- Static HTTP smoke for root, entry scripts, four new audits, Candidate, and Manifest modules.
- Final ZIP generated only from verified tracked `main` using `git archive`.

## Important non-goals / caveats
1. These four modules are deterministic release audits, not frame-accurate run replay simulators.
2. No runtime stats were normalized because the audited combinations pass the release bounds; adding live correction would create more tuning and maintenance burden than benefit.
3. The purchasing-power core price of 220 Gold is an audit proxy for a meaningful purchase, not a new shop rule.
4. The diversity audit intentionally measures the near-optimal pool rather than declaring the exact mathematical #1 build a meta problem by itself.
5. No new package command is required; the existing Candidate and Manifest commands remain the single release workflow.
6. Existing 9-action combat surface, permanent currencies, and Snapshot schema remain unchanged.
