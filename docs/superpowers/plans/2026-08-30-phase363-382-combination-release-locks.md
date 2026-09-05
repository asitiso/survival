# Phase 363~382 Combination Release Locks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add deterministic release locks for legal hero/trait/archetype/threat combinations, boss rewards, long-horizon failure margins, and build completion speed, then require all of them in Candidate/Manifest.

**Architecture:** Four focused audit modules consume existing runtime data and expose deterministic evidence. `release-candidate-audit.ts` is the only gate integration point; `release-manifest.ts` continues to preserve the candidate summary without duplicating audit logic.

**Tech Stack:** TypeScript, Node test runner, existing balance/director/reward modules.

**Spec:** `docs/superpowers/specs/2026-08-30-phase363-382-combination-release-locks-design.md`

## Global Constraints
- Exactly 9 combat actions.
- No snapshot schema changes.
- No new permanent economy or blocking UI.
- TDD for every production behavior.
- Candidate/Manifest fail closed.

---

### Task 1: Hero/Trait/Archetype/Threat Matrix
**Files:**
- Create: `src/game/hero-build-combination-audit.ts`
- Test: `tests/hero-build-combination-audit.test.mjs`

**Interfaces:**
- Consumes: `HERO_PROFILES`, `heroReleaseModel`, `RUN_TRAITS`, `masteryTraitId`, `runTraitBonuses`, `BuildArchetype`, `heroThreatPressureIndex`.
- Produces: `heroBuildCombinationCheckpoints()` and `auditHeroBuildCombinations()`.

- [x] Write RED tests for 240 legal checkpoints, legal mastery trait ownership, Threat monotonicity, and bounded viability spread.
- [x] Run the focused test and confirm failure from the missing module.
- [x] Implement legal trait enumeration, bounded archetype profiles, real trait multiplier composition, and deterministic viability/margin metrics.
- [x] Run focused tests and existing hero/trait/archetype tests.

### Task 2: Boss Reward Fairness
**Files:**
- Create: `src/game/boss-reward-fairness-audit.ts`
- Test: `tests/boss-reward-fairness-audit.test.mjs`

**Interfaces:**
- Consumes: `buildBossRewardChoices`, `bossArchetypeForOrdinal`, real spell state structure, relic/fusion reward kinds.
- Produces: `bossRewardFairnessSamples()` and `auditBossRewardFairness()`.

- [x] Write RED tests for 72 hero/boss/progression samples, exactly three choices, relic access, growth access, and bounded structural disparity.
- [x] Confirm RED from missing module.
- [x] Implement deterministic RNG fixtures and progression states using the real reward generator.
- [x] Run focused tests plus existing upgrade/fusion/relic tests.

### Task 3: Long-Horizon Failure Margin
**Files:**
- Create: `src/game/long-horizon-failure-margin-audit.ts`
- Test: `tests/long-horizon-failure-margin-audit.test.mjs`

**Interfaces:**
- Consumes: `heroReleaseModel`, `heroThreatPressureIndex`, `HERO_PROFILES`.
- Produces: 36 deterministic 30/60/120 minute hero/core reserve samples and an audit.

- [x] Write RED tests for 36 samples, Threat monotonicity, positive reserve, bounded hero/core spread, and Edric core leadership.
- [x] Confirm RED from missing module.
- [x] Implement time-scaled player adaptation against existing threat pressure without inventing death probabilities.
- [x] Run focused tests plus damage-distribution audits.

### Task 4: Build Completion Speed
**Files:**
- Create: `src/game/build-completion-speed-audit.ts`
- Test: `tests/build-completion-speed-audit.test.mjs`

**Interfaces:**
- Consumes: `projectBalanceAt`, `heroReleaseModel`, `BuildArchetype`.
- Produces: completion checkpoints and per-hero/archetype completion-minute summaries.

- [x] Write RED tests for all 48 hero/archetype/threat combinations, monotonic progress, bounded completion window, and bounded hero spread.
- [x] Confirm RED from missing module.
- [x] Implement deterministic focused-pick estimation from existing projected level growth.
- [x] Run focused tests plus balance simulator tests.

### Task 5: Candidate and Manifest Gate
**Files:**
- Modify: `src/game/release-candidate-audit.ts`
- Test: `tests/release-candidate-audit.test.mjs`
- Test: `tests/release-manifest.test.mjs`

**Interfaces:**
- Consumes: the four new audits.
- Produces: fail-closed Candidate evidence and compact summary preserved by Manifest.

- [x] Write RED tests requiring all four evidence blocks and REVIEW on a mutated failure.
- [x] Extend Candidate evidence, issues, signature payload, markdown, and compact budget summary.
- [x] Verify Manifest preserves the expanded candidate summary unchanged.
- [x] Run focused Candidate/Manifest tests.

### Task 6: Release Verification and Handoff
**Files:**
- Create: `docs/PHASE363-382-HANDOFF.md`
- Modify: `README.md`

**Interfaces:**
- Produces: Phase 382 release evidence and full-source archive.

- [x] Run build and full test suite.
- [x] Run `verify:raster`, `verify:release`, `verify:candidate`, and `verify:manifest`.
- [x] Run `git diff --check` and placeholder scan.
- [x] Update handoff/README with measured evidence.
- [x] Commit, reverify committed tree, fast-forward `main`, reverify merged `main`, HTTP smoke, and create `git archive` ZIP.
