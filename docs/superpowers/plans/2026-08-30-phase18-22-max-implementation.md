# Phase 18–22 Maximum Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement spell fusion, fate choices, expanded enemy/boss tactics including Apex, bounded hero mastery, and mobile pause/resume/onboarding/balance safeguards on top of the Phase 17 playable.

**Architecture:** New rule/state systems live in focused pure modules. `Game` only owns orchestration and presentation hooks. Existing spell, boss, reward and lobby overlays are extended rather than replaced, and persistent data remains versioned/bounded.

**Tech Stack:** TypeScript, HTML5 Canvas, Web Audio, localStorage, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-phase18-22-max-design.md`

## Global Constraints
- Preserve six combat spell buttons and global AUTO control.
- Preserve enemy cap 320, projectile cap 150, feedback cap 96 and bounded VFX budgets.
- Use RED → GREEN for every production behavior change.
- Persistent payloads require sanitizer tests.
- No new external runtime dependency.

---

### Task 1: Fusion Catalog and Eligibility
**Files:** Create `src/game/spell-fusions.ts`; Test `tests/spell-fusions.test.mjs`.
**Produces:** fusion definitions, component pair lookup, eligibility, hero display names, max-two rule helper.
- [ ] Write tests for six unique normal-spell pairs, level-10 eligibility, hero-specific naming and bounded modifiers.
- [ ] Run targeted test and confirm missing-module RED.
- [ ] Implement the pure catalog/eligibility helpers.
- [ ] Run full regression.
- [ ] Commit `feat: define bounded spell fusion catalog`.

### Task 2: Fusion Runtime State
**Files:** Create `src/game/fusion-runtime.ts`; Test `tests/fusion-runtime.test.mjs`.
**Produces:** equip/replace state, two-slot cap, trigger cooldowns and modifier lookup.
- [ ] Write tests for equipping at most two, no duplicates and bounded trigger cadence.
- [ ] Verify RED.
- [ ] Implement runtime.
- [ ] Run full regression and commit.

### Task 3: Fusion Boss Rewards
**Files:** Modify `src/game/upgrades.ts`, `src/ui/levelup.ts`; Test `tests/fusion-rewards.test.mjs`.
**Produces:** boss reward card union can surface one eligible fusion while preserving relic/upgrade behavior.
- [ ] Test that ineligible fusions never appear and eligible unlocked fusions can appear.
- [ ] Verify RED.
- [ ] Implement reward card support with compact copy.
- [ ] Full regression and commit.

### Task 4: Fusion Combat Integration
**Files:** Modify `src/game/spells.ts`, `src/game/game.ts`; Create `src/game/fusion-integration.ts`; Test `tests/fusion-integration.test.mjs`.
**Produces:** fusion modifiers applied through existing spell casts, no new action id/button.
- [ ] Test representative fusion damage/area/control changes and unchanged no-fusion baseline.
- [ ] Verify RED.
- [ ] Implement integration.
- [ ] Full regression and commit.

### Task 5: Fate Definitions and Checkpoints
**Files:** Create `src/game/fate-paths.ts`; Test `tests/fate-paths.test.mjs`.
**Produces:** three paths, 6/12/18 minute checkpoints, bounded modifier composition.
- [ ] Test exact checkpoint triggering, one choice per checkpoint, distinct modifiers and caps.
- [ ] Verify RED, implement, regress, commit.

### Task 6: Fate Choice Overlay and Runtime
**Files:** Create `src/game/fate-runtime.ts`, `src/ui/fate-select.ts`; Test `tests/fate-runtime.test.mjs`.
**Produces:** pending choice state, pause semantics, accumulated fate profile.
- [ ] Test pending/choose/reset lifecycle and composed profile.
- [ ] Verify RED, implement, regress, commit.

### Task 7: Fate Combat/Reward Integration
**Files:** Create `src/game/fate-integration.ts`; Modify `src/game/game.ts`; Test `tests/fate-integration.test.mjs`.
**Produces:** pressure/xp/gold/core/boss/objective modifiers folded once into runtime.
- [ ] Test no double application and readable HUD summary.
- [ ] Verify RED, implement, regress, commit.

### Task 8: Four Tactical Regular Enemies
**Files:** Modify `src/game/enemies.ts`; Create `src/game/enemy-specialists.ts`; Test `tests/enemy-specialists.test.mjs`.
**Produces:** shieldbearer, assassin, siege golem, nullifier stats/behaviors and bounded nullifier aura aggregation.
- [ ] Test distinct target/defense/reposition/aura behaviors and spawn availability gates.
- [ ] Verify RED, implement, regress, commit.

### Task 9: Three New Boss Archetypes
**Files:** Modify `src/game/boss-patterns.ts`, `src/game/boss-presentation.ts`, `src/game/boss-encounters.ts`, `src/game/enemies.ts`; Test `tests/boss-expansion.test.mjs`.
**Produces:** abyss witch, twin maw, time eater with distinct specials and telegraphs.
- [ ] Test six-archetype rotation and unique pattern channels.
- [ ] Verify RED, implement, regress, commit.

### Task 10: Apex Boss Rules
**Files:** Create `src/game/apex-boss.ts`; Modify `src/game/enemies.ts`, `src/game/game.ts`; Test `tests/apex-boss.test.mjs`.
**Produces:** 20m+ eligibility, max-two-pattern composition, no enemy-budget multiplication.
- [ ] Test eligibility, deterministic bounded composition and pressure caps.
- [ ] Verify RED, implement, regress, commit.

### Task 11: Mastery Profile and XP
**Files:** Create `src/domain/mastery-profile.ts`, `src/domain/mastery-rewards.ts`; Test `tests/mastery-profile.test.mjs`.
**Produces:** per-hero level 1–20, bounded XP curve, versioned storage, run reward function.
- [ ] Test sanitization, progression, cap and per-hero independence.
- [ ] Verify RED, implement, regress, commit.

### Task 12: Mastery Unlock Catalog
**Files:** Create `src/game/mastery-unlocks.ts`; Modify fusion/relic/trait candidate helpers; Test `tests/mastery-unlocks.test.mjs`.
**Produces:** milestone trait/fusion/relic/evolution-choice unlock metadata.
- [ ] Test milestone gating and no locked-choice selection.
- [ ] Verify RED, implement, regress, commit.

### Task 13: Mastery Lobby and Results Integration
**Files:** Modify `src/ui/lobby.ts`, `src/ui/results.ts`, `src/game/game.ts`; Test `tests/mastery-integration.test.mjs`.
**Produces:** compact mastery display and run-end mastery XP update.
- [ ] Test display summary and run completion update helper.
- [ ] Verify RED, implement, regress, commit.

### Task 14: Pause/Visibility Lifecycle
**Files:** Create `src/game/pause-state.ts`; Modify `src/main.ts`, `src/game/game.ts`; Test `tests/pause-state.test.mjs`.
**Produces:** manual/automatic pause state and update suppression without losing rendering.
- [ ] Test pause reasons and resume ordering.
- [ ] Verify RED, implement, regress, commit.

### Task 15: Run Snapshot and Reconstruction
**Files:** Create `src/domain/run-snapshot.ts`; Modify `src/game/game.ts`, `src/ui/lobby.ts`; Test `tests/run-snapshot.test.mjs`.
**Produces:** versioned bounded snapshot, validation, save/load/clear, reconstruction profile with no enemy/projectile serialization.
- [ ] Test valid roundtrip, corrupt-data rejection, bounded arrays and absence of entity swarm payloads.
- [ ] Verify RED, implement, regress, commit.

### Task 16: First-Run Onboarding
**Files:** Create `src/game/onboarding.ts`; Modify `src/game/game.ts`; Test `tests/onboarding.test.mjs`.
**Produces:** gameplay-signal driven tutorial steps and persisted completion flag.
- [ ] Test ordered progression, skipped repeated hints and completion persistence.
- [ ] Verify RED, implement, regress, commit.

### Task 17: Balance Projection Simulator
**Files:** Create `src/game/balance-simulator.ts`; Test `tests/balance-simulator.test.mjs`.
**Produces:** 10/20/30/45m pressure/economy/DPS projections and monotonic sanity checks.
- [ ] Test bounded enemy budget, monotonic pressure, increasing XP requirement and plausible gold/DPS bands.
- [ ] Verify RED, implement, regress, commit.

### Task 18: Final Product Integration and Documentation
**Files:** Modify `src/game/game.ts`, `src/ui/lobby.ts`, `src/ui/results.ts`, `README.md`, generated `dist/**`; Test `tests/phase22-integration.test.mjs`.
**Produces:** full Phase 18–22 flow, compact HUD summaries, resume offer, mastery/fate/fusion state presentation and final distribution.
- [ ] Write integration tests for unchanged action count, performance caps, resume payload and end-to-end modifier composition.
- [ ] Verify RED.
- [ ] Integrate remaining runtime/UI hooks and documentation.
- [ ] Run `npm test`, `npm run build`, `git diff --check`, HTTP smoke checks, ZIP integrity.
- [ ] Commit final delivery state.
