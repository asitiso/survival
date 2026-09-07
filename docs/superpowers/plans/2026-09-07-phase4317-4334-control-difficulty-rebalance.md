# Phase 4317-4334 Control & Difficulty Rebalance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Humanize AUTO, reduce manual input friction, and rebase Threat 0-5 while preserving gameplay-mode fairness and release invariants.

**Architecture:** Keep `chooseSpellTarget` as the low-level target ranker. Add runtime-only controller state around it for AUTO cadence/switch/cast/weakpoint decisions; extend existing manual buffer/memory plus a pure manual weakpoint assist; replace linear Threat modifiers with a table and compose new projectile/boss cadence fields into existing runtime pressure paths.

**Tech Stack:** TypeScript, Canvas game runtime, Node test runner, existing release audit framework.

**Spec:** `docs/superpowers/specs/2026-09-07-phase4317-4334-control-difficulty-rebalance-design.md`

## Global Constraints
- AUTO ON/OFF must not alter enemy stats/rewards/save schema.
- Manual assistance must not alter player damage/cooldown tuning.
- Exactly 9 combat actions remain.
- Runtime AUTO state is not persisted.
- TDD RED must be observed before production implementation for every Train.

---

### Task 1: Phase 4317-4322 AUTO Brain Humanization

**Files:**
- Create: `src/game/auto-combat-brain.ts`
- Modify: `src/game/game.ts`
- Modify: `src/game/spells.ts`
- Modify: `src/game/auto-weakpoint-aim.ts`
- Modify: `src/game/auto-transition-latency-audit.ts`
- Modify: `src/game/auto-weakpoint-effect-audit.ts`
- Test: `tests/phase4317-4322-auto-humanization.test.mjs`

**Interfaces:**
- Produces `AutoCombatBrain` with `reset()`, `selectTarget(...)`, `selectWeakpoint(...)`, and `canAutoCast(...)`.
- Extends `SpellWorld` with optional `preferredAutoWeakpointId`.
- Extends `autoWeakpointAimPoint` input with optional `preferredNodeId` and uses 0.82 aim blend for AUTO boss weakpoints.

- [ ] Write RED tests asserting 0.14s review cadence, delayed normal/core switches, 0.14s inter-cast gap, delayed weakpoint switching, non-perfect weakpoint aim, and no manual-mode impact.
- [ ] Run build + new test and verify expected failures.
- [ ] Implement minimal `AutoCombatBrain` runtime state and Game integration.
- [ ] Update weakpoint aim/audits to represent humanized precision/latency.
- [ ] Run focused AUTO regressions and commit.

### Task 2: Phase 4323-4328 Manual Input Forgiveness

**Files:**
- Create: `src/game/manual-weakpoint-assist.ts`
- Modify: `src/game/cast-intent-buffer.ts`
- Modify: `src/game/manual-target-stability.ts`
- Modify: `src/game/spells.ts`
- Modify: `src/game/manual-target-stability-audit.ts`
- Test: `tests/phase4323-4328-manual-forgiveness.test.mjs`

**Interfaces:**
- `CAST_INTENT_BUFFER_WINDOW_SECONDS = 0.32`.
- `MANUAL_TARGET_MEMORY_SECONDS = 1.15`.
- `manualWeakpointAssistAimPoint(...)` returns boss center for invalid/non-boss cases and otherwise a 0.38 blend toward the selected live node.

- [ ] Write RED tests for 0.32s buffer, 1.15s memory, priority override retention, 38% weakpoint assist, and no exact snap.
- [ ] Run build + new test and verify expected failures.
- [ ] Implement constants and pure assist, connect only manual boss aim path.
- [ ] Update manual stability audit expectations.
- [ ] Run focused manual/input regressions and commit.

### Task 3: Phase 4329-4334 Threat Curve Rebase & Control Matrix

**Files:**
- Modify: `src/domain/threat-level.ts`
- Modify: `src/game/phase14-runtime.ts`
- Modify: `src/game/game.ts`
- Modify: `src/game/balance-simulator.ts`
- Create: `src/game/control-difficulty-matrix-audit.ts`
- Modify: `src/game/release-candidate-audit.ts`
- Test: `tests/phase4329-4334-threat-control-matrix.test.mjs`

**Interfaces:**
- Add `projectileSpeedMultiplier` and `bossSpecialCadenceMultiplier` to `ThreatLevelModifiers`.
- Add matching composed fields to `ThreatComposedPressure`.
- `controlDifficultyMatrixAudit()` evaluates 4 heroes x 6 threats x AUTO/average-manual/skilled-manual control efficiency model and pressure monotonicity.

- [ ] Write RED tests for exact six-tier table, Threat 2=baseline, T0/T1 below-baseline pressure, T5 shard/variant caps, projectile and boss cadence composition, and control efficiency ordering.
- [ ] Run build + new test and verify expected failures.
- [ ] Implement explicit Threat table and runtime composition.
- [ ] Update balance simulator lower clamp to preserve easier tiers.
- [ ] Add release matrix audit and candidate integration.
- [ ] Run Phase 4317-4334 related regressions and commit.

### Task 4: Full Verification & Publication

- [ ] Run `npm run build` and verify exit 0.
- [ ] Run all `tests/*.test.mjs` and verify fail 0.
- [ ] Run `npm run verify:raster`.
- [ ] Run `npm run verify:release`.
- [ ] Run `npm run verify:candidate`.
- [ ] Run `git diff --check` and confirm clean working tree after generated dist commit.
- [ ] Publish the three Fast Train commits on a branch stacked on PR #7, stage only relevant generated dist, and create a draft PR. Do not merge main.
