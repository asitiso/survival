# Arcane Last Stand — Phase 363~382 Handoff

## Baseline
- Starting main: `d7c702c` (Phase 362).
- Baseline regression: 749/749 pass before Phase 363 work.
- Work branch: `work/phase363-382` in `.worktrees/phase363-382`.
- Product invariant: exactly 9 combat actions; no new blocking modal, permanent currency, or snapshot field.

## Phase 363~366 — Hero / Trait / Archetype / Threat Matrix
New files:
- `src/game/hero-build-combination-audit.ts`
- `tests/hero-build-combination-audit.test.mjs`

Legal combinations are four heroes × five legal traits per hero (four global traits + that hero's mastery trait) × four build archetypes × Threat 0/3/5 = 240 checkpoints.

The model reuses the existing hero release model, real `runTraitBonuses`, existing Overdrive archetype modifier identities, and the existing 30-minute Threat pressure model. It is release evidence only and does not normalize runtime hero stats.

Current locks:
- Max legal-combination viability spread: 1.2156 <= 1.55.
- Minimum Threat-5 release margin: 0.7735 >= 0.62.
- Maximum release margin: 1.2552 <= 1.75.
- Archetype role-axis distinctness: 1.2496 >= 1.06.
- Threat monotonicity: PASS.
- Threat-5 release traps: 0.

## Phase 367~370 — Boss Reward Fairness
New files:
- `src/game/boss-reward-fairness-audit.ts`
- `tests/boss-reward-fairness-audit.test.mjs`

The audit uses the real `buildBossRewardChoices` generator across four heroes × six boss archetypes × three progression states = 72 samples.

Progression states:
- `early`: ultimate growth + relic;
- `fusion_ready`: eligible fusion + growth + relic;
- `late`: maxed ultimates / two equipped fusions, so fallback growth + relic.

Current locks:
- Every sample returns exactly 3 choices.
- Every sample has exactly 1 relic.
- Every sample has a valid growth path.
- Fusion appears exactly when the audited state is fusion-ready.
- Hero structural access spread: 1.0.
- Hero relic-pool spread: 1.0.
- Invalid reward samples: 0.
- Boss-specific relic access: complete.

## Phase 371~374 — 30 / 60 / 120 Minute Failure Margin
New files:
- `src/game/long-horizon-failure-margin-audit.ts`
- `tests/long-horizon-failure-margin-audit.test.mjs`

The model combines existing Director pressure, Threat modifiers, Ascension modifiers, hero survival/core-guard identity, and a bounded long-run adaptation factor. It reports relative reserve margin, not fabricated death probability.

36 samples: four heroes × Threat 0/3/5 × 30/60/120 minutes.

Current locks:
- Minimum hero reserve: 0.6826 >= 0.62.
- Minimum core reserve: 0.7289 >= 0.62.
- Maximum hero reserve spread: 1.3111 <= 1.60.
- Maximum core reserve spread: 1.6285 <= 1.85.
- Threat 0→3→5 lowers both margins for every hero/time point.
- Edric remains the strongest core-reserve identity.

## Phase 375~378 — Build Completion Speed
New files:
- `src/game/build-completion-speed-audit.ts`
- `tests/build-completion-speed-audit.test.mjs`

The audit uses existing projected hero-level growth and bounded focus efficiencies for `burst / cycle / domain / fortress`. Hero affinity only changes focus efficiency inside a narrow 0.94~1.06 envelope; Threat does not secretly alter level-driven build-choice throughput.

Coverage:
- 384 progress samples: 4 heroes × 4 archetypes × 3 Threat levels × 8 time checkpoints.
- 48 hero/archetype/threat completion summaries.

Current locks:
- Coherent build completion window: 20~25 minutes.
- Max hero completion-time spread: 1.25 <= 1.35.
- Threat parity: exact for level-driven completion.
- All audited builds reach full critical-investment progress by 60 minutes.

## Phase 379~382 — Candidate / Manifest Combination Gate
Modified:
- `src/game/release-candidate-audit.ts`
- `tests/release-candidate-audit.test.mjs`
- `tests/release-manifest.test.mjs`

`ReleaseCandidateEvidence` now requires:
- `heroBuildCombinations`;
- `bossRewardFairness`;
- `longHorizonFailureMargin`;
- `buildCompletionSpeed`.

Any failure adds a fail-closed issue:
- `hero-build-combinations`;
- `boss-reward-fairness`;
- `long-horizon-failure-margin`;
- `build-completion-speed`.

Current Candidate summary adds:
- `matrix 1.2156`;
- `reward fair 1/1`;
- `reserve 0.6826/0.7289`;
- `build 20-25m`.

Current deterministic Candidate signature before final integration: `RCQ-620AF767`.

## Verification target
Phase 362 baseline: 749 tests.
Phase 363~382 adds 20 tests, target total 769.

Required before integration:
- `npm run build`.
- `npm test` => 769/769.
- `npm run verify:raster` => 5/5 PASS.
- `npm run verify:release` => `RQ-9085A5AD` PASS.
- `npm run verify:candidate` => PASS with all four new locks.
- `npm run verify:manifest` => PASS with expanded candidate summary.
- `git diff --check` clean.
- static HTTP smoke for root/main/game/new audit modules.
- final ZIP created only from verified tracked `main` via `git archive`.

## Important non-goals / caveats
1. Combination, reward, failure-margin, and build-speed modules are deterministic release audits, not frame-accurate replay simulators.
2. No runtime hero/trait/archetype normalization was added because all legal combinations pass the release-trap guard.
3. Boss reward generation itself was not rewritten; the real generator already passes equal structural-access checks.
4. Threat does not currently alter level-based build completion speed because `projectBalanceAt().estimatedLevel` is Threat-independent; the audit locks that parity explicitly.
5. Edric intentionally remains the strongest core-protection identity.
6. Existing 9-action combat surface and snapshot schema remain unchanged.
