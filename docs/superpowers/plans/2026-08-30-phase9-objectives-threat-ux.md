# Phase 9 Objectives, Threat Directives, and Mobile UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add automatic run missions, rotating late-run enemy-composition directives, and compact critical-danger feedback.

**Architecture:** Missions, directives, and danger-state calculations are pure modules. The Game applies rewards and rendering; EnemyManager only consumes composition/multiplier inputs.

**Tech Stack:** TypeScript ES2022, HTML5 Canvas, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-phase9-objectives-threat-ux-design.md`

## Global Constraints

- No mission-selection modal or failure penalty.
- Threat directives begin at 8 minutes.
- Keep the 320-enemy cap.
- Reuse existing gold, potion, and shop-token state.
- Every production behavior begins with a failing test.

---

### Task 1: Run Mission Director

**Files:**
- Create: `src/game/run-missions.ts`
- Test: `tests/run-missions.test.mjs`

**Interfaces:**
- Produces `RunMissionDirector.update(dt, snapshot, bossCountdown)` with start/success/failure transitions and reward data.

- [ ] Write failing tests for timing, boss suppression, progress deltas, target scaling, success, expiration, and cooldown.
- [ ] Run tests and confirm RED.
- [ ] Implement three mission types and bounded reward data.
- [ ] Run full tests and confirm GREEN.
- [ ] Commit `feat: add automatic run missions`.

### Task 2: Threat Directives and Spawn Weights

**Files:**
- Create: `src/game/threat-directives.ts`
- Modify: `src/game/enemies.ts`
- Test: `tests/threat-directives.test.mjs`
- Test: `tests/enemies.test.mjs`

**Interfaces:**
- Produces `threatDirectiveAt(seconds)` and `threatDirectiveModifiers()`.
- Enemy update context accepts optional regular enemy weight multipliers.

- [ ] Write failing tests for 8-minute start, 120-second rotation, four identities, and distinct weighted compositions.
- [ ] Run tests and confirm RED.
- [ ] Implement directives and weighted spawn selection after 8 minutes while preserving early-game spawn rules.
- [ ] Run full tests and confirm GREEN.
- [ ] Commit `feat: add rotating threat directives`.

### Task 3: Critical Danger UI Model

**Files:**
- Create: `src/game/danger-ui.ts`
- Test: `tests/danger-ui.test.mjs`

**Interfaces:**
- Produces `dangerUiState(heroRatio, coreRatio)` and `priorityThreatIds(enemies, heroPos, limit)`.

- [ ] Write failing tests for threshold edge transitions and two-target priority cap.
- [ ] Run tests and confirm RED.
- [ ] Implement pure danger/priority helpers.
- [ ] Run full tests and confirm GREEN.
- [ ] Commit `feat: add mobile danger state model`.

### Task 4: Phase 9 Game Integration and HUD Stack

**Files:**
- Modify: `src/game/game.ts`
- Modify: `src/game/enemies.ts`
- Modify: `README.md`
- Test: `tests/phase9-integration.test.mjs`

**Interfaces:**
- Game applies mission rewards, directive multipliers, haptic edge events, danger vignette, priority rings, and compact mission/directive HUD stack.

- [ ] Add failing integration tests for mission reward application, directive context, and haptic edge-state helper behavior.
- [ ] Run tests and confirm RED.
- [ ] Wire mission/directive state to existing run counters and enemy update context.
- [ ] Render mission/directive stack and critical HP/core feedback without covering controls.
- [ ] Add optional vibration with feature detection and edge-triggering only.
- [ ] Update README with Phase 8+9 behavior.
- [ ] Run full tests, `npm run build`, HTTP smoke checks, and ZIP integrity check.
- [ ] Commit `feat: deepen long-run objectives and mobile clarity`.
