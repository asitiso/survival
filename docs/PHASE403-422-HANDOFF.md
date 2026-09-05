# Arcane Last Stand — Phase 403~422 Handoff

## Baseline
- Source lineage: verified Phase 402 archive comment `ec6b73ff442f68299ae94bc1f4602a9e0d4cc9ce`.
- Phase 402 archive SHA-256: `04b8a3fee9933cc3a2f5385e7a4dbc8d1a41cffbb431c5f25536d5e3d91b86fa`.
- Restored local baseline commit: `7b48885` (archive contains tracked source only, not `.git`).
- Baseline regression: 789/789 pass before Phase 403 work.
- Work branch: `work/phase403-422` in `.worktrees/phase403-422`.
- Product invariant: exactly 9 combat actions; no new blocking modal, permanent currency, runtime button, or Snapshot schema field.

## Phase 403~406 — Build Pivot Recovery Audit
New files:
- `src/game/build-pivot-recovery-audit.ts`
- `tests/build-pivot-recovery-audit.test.mjs`

For every hero / Threat / 30·60·120 minute context, the current best completed build is used as a reference. The audit then locks three axes and changes exactly one of `relic`, `fusion`, `finalForm`, or `archetype`, choosing the best legal alternative on that axis.

Coverage:
- 4 heroes × 3 Threat levels × 3 progression checkpoints × 4 pivot axes = 144 samples.
- No respec button, refund rule, new currency, or runtime mutation is introduced.

Current locks:
- Minimum one-axis recovery ratio: 0.9504 >= 0.78.
- Maximum recovery loss: 0.0496 <= 0.22.
- Maximum hero recovery spread: 1.0466 <= 1.18.
- Threat recovery parity: PASS.
- Dead pivots below release floor: 0.

Decision: a dedicated respec subsystem would add UI, save-state, pricing, and maintenance cost while the current build structure already preserves at least 95.04% of the best score after a single-axis change. The audit therefore keeps this release simple and measures recovery without adding another player-facing system.

## Phase 407~410 — Six-Boss Gauntlet Versatility Audit
New files:
- `src/game/boss-gauntlet-versatility-audit.ts`
- `tests/boss-gauntlet-versatility-audit.test.mjs`

Every Threat-5 completed build from Phase 387~390 is folded back into one six-boss sequence. Matchup values are normalized against each hero's specialist top for that boss, then summarized as a geometric gauntlet score and a worst-boss versatility floor.

Coverage:
- 5,760 completed builds.
- 6/6 boss identities for every build.
- 4 hero generalist winners retained.

Current locks:
- Minimum top-generalist versatility floor: 0.9994 >= 0.82.
- Maximum specialist advantage over generalist: 1.0006 <= 1.18.
- Maximum hero gauntlet spread: 1.082 <= 1.18.
- Catastrophic top-generalist builds: 0.

## Phase 411~414 — 2 / 4 / 8 / 12 Hour Long-Run Meta Drift
New files:
- `src/game/long-run-meta-drift-audit.ts`
- `tests/long-run-meta-drift-audit.test.mjs`

The audit re-ranks the completed-build pool at four long-run checkpoints with only a gentle increase in survival/core importance. The same near-optimal threshold is used at every hour so the audit itself does not create fake concentration by narrowing the candidate pool over time.

Coverage:
- 4 heroes × Threat 0/3/5 × 2/4/8/12h = 48 snapshots.
- At least 24 near-optimal builds retained per snapshot.

Current locks:
- Maximum 2h→12h component concentration delta: 0.062 <= 0.20.
- Minimum 2h→12h top-pool retention: 1.0 >= 0.35.
- Maximum relic concentration: 0.230 <= 0.75.
- Maximum fusion-pair concentration: 0.086 <= 0.65.
- Maximum Final Form concentration: 0.705 <= 0.75.
- Maximum archetype concentration: 0.460 <= 0.75.
- Fixation snapshots: 0.

During implementation an over-aggressive audit weighting initially pushed 12h Final Form concentration above the release bound. The game was not retuned. Instead, the audit model was corrected to use gentle long-run weighting and a constant candidate threshold, removing an audit-induced false concentration signal.

## Phase 415~418 — Hero Long-Run Efficiency Audit
New files:
- `src/game/hero-long-run-efficiency-audit.ts`
- `tests/hero-long-run-efficiency-audit.test.mjs`

This audit combines each hero's best long-run completed-build score with the existing Threat pressure model and the real long-run reward-density policy. It is release evidence only and does not grant runtime multipliers.

Coverage:
- 4 heroes × Threat 0/3/5 × 2/4/8/12h = 48 checkpoints.

Current locks:
- Maximum hero efficiency spread: 1.1112 <= 1.20.
- Minimum Threat-5 efficiency retention versus Threat 0: 0.7835 >= 0.75.
- Minimum 12h retention versus 2h: 1.0 >= 0.92.
- Threat monotonicity: PASS.

## Phase 419~422 — Candidate / Manifest Long-Run Meta Health Gate
Modified:
- `src/game/release-candidate-audit.ts`
- `tests/release-candidate-audit.test.mjs`
- `tests/release-manifest.test.mjs`

`ReleaseCandidateEvidence` now requires:
- `buildPivotRecovery`;
- `bossGauntletVersatility`;
- `longRunMetaDrift`;
- `heroLongRunEfficiency`.

Any failure adds a fail-closed issue:
- `build-pivot-recovery`;
- `boss-gauntlet-versatility`;
- `long-run-meta-drift`;
- `hero-long-run-efficiency`.

The compact Candidate summary adds:
- `pivot 0.9504`;
- `gauntlet 0.9994/1.0006`;
- `meta drift 0.062/1`;
- `long hero 1.1112/0.7835`.

Pre-integration deterministic Candidate signature: `RCQ-D6DF7FFE`.

The Manifest already requires Candidate `ok=true`. Phase 422 verifies the real expanded Candidate summary flows through that existing seam. No duplicate manifest-side implementation is added.

## Verification target
Phase 402 baseline: 789 tests.
Phase 403~422 adds 20 tests, target total: 809.

Required before integration:
- `npm run build`.
- `npm test` => 809/809.
- `npm run verify:raster` => 5/5 PASS.
- `npm run verify:release` => PASS.
- `npm run verify:candidate` => PASS with expanded long-run meta-health summary.
- `npm run verify:manifest -- --out release-manifest.json` => PASS.
- `git diff --check` clean.
- Static HTTP smoke for root, entry scripts, four new audits, Candidate, and Manifest modules.
- Final ZIP generated only from verified tracked `main` using `git archive`.

## Important non-goals / caveats
1. These four modules are deterministic release audits, not frame-accurate long-run replay simulators.
2. No runtime build repair or respec system was added because the measured one-axis recovery floor is already high; adding one now would create more management and learning burden than player benefit.
3. Gauntlet normalization is hero-relative and intended to detect specialist traps, not to replace actual boss combat simulation.
4. Long-run meta scoring changes weights gently and keeps the same candidate threshold at all hours to avoid the audit manufacturing its own meta collapse.
5. No new package command is required; Candidate and Manifest remain the single release workflow.
6. Existing 9-action combat surface, permanent currencies, and Snapshot schema remain unchanged.
