# Phase 163–182 Combat Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Deliver Phase 163–182 combat polish while preserving nine actions and current save compatibility.

**Architecture:** Add five small deterministic modules and connect them through existing BossArena, Game, Input, HUD, audio, and presentation seams. Simulation-critical state remains owned by existing systems; new presentation state stays transient.

**Tech Stack:** TypeScript, Canvas 2D, Node test runner, static Node server.

**Spec:** `docs/superpowers/specs/2026-08-30-phase163-182-combat-polish-design.md`

## Global Constraints
- Exactly 9 combat actions.
- No new blocking overlays or management menus.
- No save-schema expansion for transient presentation state.
- TDD red-green-refactor for every new production behavior.
- Danger telegraphs remain intact at low presentation quality.

---

### Task 1: Arena Dodge Reward
**Files:**
- Create: `src/game/endless/arena-dodge-reward.ts`
- Modify: `src/game/boss-arena.ts`
- Modify: `src/game/game.ts`
- Test: `tests/arena-dodge-reward.test.mjs`

**Interfaces:**
- Produces `ArenaDodgeTracker`, `ArenaDodgeReward`, `advanceArenaDodgeTracker(...)`.
- `BossArenaSystem` exposes active hazard snapshots; Game owns one transient tracker.

- [x] Write tests proving telegraph enter→safe exit awards once, actual contact cancels, and reward caps are bounded.
- [x] Run targeted test and confirm RED because module/API is absent.
- [x] Implement pure tracker/reward logic and minimal Game wiring.
- [x] Run targeted + BossArena tests and confirm GREEN.
- [x] Commit subsystem.

### Task 2: Flow Hitstop & Impact
**Files:**
- Modify: `src/game/endless/final-form-flow-feedback.ts`
- Modify: `src/game/audio.ts`
- Modify: `src/game/game.ts`
- Test: `tests/final-form-flow-impact.test.mjs`

**Interfaces:**
- Produces `flowImpactProfile(previousStreak,nextStreak,family,tier)` with bounded `freezeMs`, `shake`, `particleCount`, `soundKind`.

- [x] Write tests for threshold-only impact, bounded pseudo-hitstop, and low-quality cue preservation.
- [x] Run targeted test for RED.
- [x] Implement profile and presentation-only timer/cue wiring; simulation dt remains unchanged.
- [x] Run flow/audio targeted tests for GREEN.
- [x] Commit subsystem.

### Task 3: Opening Boss Entrance
**Files:**
- Create: `src/game/opening-boss-entrance.ts`
- Modify: `src/game/game.ts`
- Test: `tests/opening-boss-entrance.test.mjs`

**Interfaces:**
- Produces `openingBossEntrance(elapsedSeconds)` with stage `anticipation|arrival|release|null` and bounded visual/audio metadata.

- [x] Write tests for deterministic timing around 540s and full neutrality at/after 600s.
- [x] Run RED.
- [x] Implement pure profile and one-shot Game presentation hooks without changing boss spawn schedule.
- [x] Run opening tests GREEN.
- [x] Commit subsystem.

### Task 4: Foldable & Extreme Safe Area
**Files:**
- Modify: `src/game/landscape-safe-area.ts`
- Modify: `src/game/landscape-hud.ts`
- Modify: `src/core/input.ts`
- Test: `tests/landscape-foldable-safe-area.test.mjs`

**Interfaces:**
- Extends `LandscapeAspectClass` with `foldable` and `extreme` and optional `hingeExclusion` while preserving existing fields.

- [x] Write tests for 2208×1840 foldable landscape, 32:9 extreme-wide, and existing 16:9/20:9/4:3 behavior.
- [x] Run RED.
- [x] Implement classification/profile and shared HUD/Input consumption.
- [x] Run safe-area/input tests GREEN.
- [x] Commit subsystem.

### Task 5: Deterministic Render Contract Harness
**Files:**
- Create: `src/game/render-contract.ts`
- Modify: `src/game/visual-regression-probe.ts`
- Test: `tests/render-contract.test.mjs`
- Test: `tests/endless-phase163-182-integration.test.mjs`

**Interfaces:**
- Produces `renderContract(viewportWidth,viewportHeight)`, `renderContractSignature(...)`, and `auditRenderContract(...)`.

- [x] Write RED tests for deterministic primitives, viewport bounds, hinge exclusion, required state labels, and nine actions.
- [x] Implement primitive generation/signature/audit using existing visual probe and safe-area profiles.
- [x] Run render/integration tests GREEN.
- [x] Run full `npm test`, `npm run build`, `git diff --check`.
- [x] Update README/handoff and commit final integration.
