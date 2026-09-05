# Phase 323~342 Release Tuning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Tighten release-candidate gameplay and make performance/balance regressions release-blocking.

**Architecture:** Preserve existing runtime seams. Add deterministic audit modules beside current tuning modules, use one transient thermal hysteresis state in `Game`, and compose all evidence into the existing Candidate/Manifest chain.

**Tech Stack:** TypeScript, Node test runner, existing Canvas runtime and release scripts.

**Spec:** `docs/superpowers/specs/2026-08-30-phase323-342-release-tuning-design.md`

## Global Constraints
- Exactly 9 combat actions.
- No Snapshot schema growth.
- No enemy-logic or danger-telegraph thermal nerf.
- Boss ordinal >= 3 stays neutral in the runtime boss curve.
- Gold/XP long-run multipliers stay within 1.00~1.08.
- No automatic raster baseline mutation.

---

### Task 1: Precise 0~30 minute timetable
**Files:**
- Modify: `src/game/first-thirty-minute-director.ts`
- Create: `src/game/opening-thirty-timetable.ts`
- Create: `tests/opening-thirty-timetable.test.mjs`
- Modify: `tests/first-thirty-minute-director.test.mjs`

**Interfaces:**
- Produces `openingThirtyTimetableAudit()` and smooth `firstThirtyMinuteProfile()` output.

- [x] Write RED tests proving minute-resolution samples, bounded adjacent pressure deltas, stable budgets, and smooth 10~30 interpolation.
- [x] Run targeted tests and confirm RED due to missing timetable/smoothing behavior.
- [x] Implement deterministic interpolation without changing 0~10 behavior or public band names.
- [x] Run targeted tests to GREEN.

### Task 2: First six boss clear audit
**Files:**
- Create: `src/game/boss-clear-time-audit.ts`
- Create: `tests/boss-clear-time-audit.test.mjs`

**Interfaces:**
- Produces `auditFirstSixBosses()` with estimated clear seconds, normalized difficulty, spike checks, and `passed`.

- [x] Write RED tests for six checkpoints, eased first three bosses, neutral bosses four through six, bounded clear-time ratio, and bounded adjacent difficulty jump.
- [x] Run targeted tests and confirm RED.
- [x] Implement audit from `bossDifficultyCurve` plus deterministic normalized DPS progression.
- [x] Run targeted tests to GREEN.

### Task 3: Thermal recovery hysteresis
**Files:**
- Create: `src/game/endless/thermal-recovery-hysteresis.ts`
- Modify: `src/game/game.ts`
- Create: `tests/endless-thermal-recovery-hysteresis.test.mjs`

**Interfaces:**
- Produces `createThermalRecoveryState`, `advanceThermalRecovery`, `thermalPolicyForEffectiveTier`, and `auditThermalRecoveryHysteresis`.

- [x] Write RED tests for fast escalation, slower recovery, no one-frame flap, and preserved logic/telegraph multipliers.
- [x] Run RED tests.
- [x] Implement transient hysteresis and integrate it only in Game presentation paths.
- [x] Run targeted thermal and Game integration tests to GREEN.

### Task 4: 2~12 hour economy audit
**Files:**
- Modify: `src/game/endless/long-run-reward-density.ts`
- Create: `tests/endless-long-run-economy-audit.test.mjs`

**Interfaces:**
- Produces `auditLongRunEconomy()` with drought/healthy/saturated scenarios across 120~720 minutes.

- [x] Write RED tests for seven checkpoints, 1.00~1.08 bounds, saturated damping to 1.00, and no late multiplier spike.
- [x] Run RED tests.
- [x] Implement deterministic audit reusing the existing runtime policy.
- [x] Run targeted tests to GREEN.

### Task 5: Candidate and Manifest enforcement
**Files:**
- Modify: `src/game/release-candidate-audit.ts`
- Modify: `src/game/release-manifest.ts`
- Modify: `scripts/release-candidate-audit.mjs`
- Modify: `scripts/release-manifest.mjs`
- Modify: `tests/release-candidate-audit.test.mjs`
- Modify: `tests/release-manifest.test.mjs`
- Create: `tests/phase339-release-budget-integration.test.mjs`

**Interfaces:**
- Candidate evidence includes opening timetable, first-six bosses, thermal recovery, long-run economy, and explicit device performance ceilings.
- Manifest includes compact Candidate budget summary and fails closed when supplied Candidate evidence fails.

- [x] Write RED tests for new evidence fields, explicit device ceilings, fail-closed behavior, and Manifest summary inclusion.
- [x] Run RED tests.
- [x] Implement Candidate/Manifest extensions and CLI output.
- [x] Run Candidate/Manifest tests to GREEN.

### Task 6: Release hardening and handoff
**Files:**
- Modify: `README.md`
- Create: `docs/PHASE323-342-HANDOFF.md`
- Modify: this plan checklist to completed state.

- [x] Run `npm run build`.
- [x] Run full `npm test`.
- [x] Run `npm run verify:raster`.
- [x] Run `npm run verify:release`.
- [x] Run `npm run verify:candidate`.
- [x] Run `npm run verify:manifest`.
- [x] Run `git diff --check` and placeholder scan.
- [x] Commit exact verified tree, merge fast-forward to `main`, re-run full verification, HTTP smoke key modules, and create verified Git archive ZIP.
