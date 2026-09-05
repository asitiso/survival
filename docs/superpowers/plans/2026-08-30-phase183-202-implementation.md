# Phase 183–202 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Ship five bounded combat/readability/render-fidelity upgrades for Phase 183–202 without increasing the 9-action control surface.

**Architecture:** New pure modules live beside existing endless/presentation modules. Game integration consumes their outputs through existing arena, Final Form, HUD, and rendering hooks. Persistent snapshot schema remains unchanged.

**Tech Stack:** TypeScript ES modules, Canvas 2D logical coordinates, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-phase183-202-design.md`

## Global Constraints
- Exactly 9 combat actions.
- No new blocking combat modal.
- Snapshot compatibility with Phase 182.
- Danger telegraphs remain full priority.

---

### Task 1: Perfect Evade Chain
**Files:** Create `src/game/endless/arena-dodge-chain.ts`; Test `tests/arena-dodge-chain.test.mjs`; Modify `src/game/game.ts`.
- [x] Write failing tests for bounded chain growth, timeout, and hit reset.
- [x] Run targeted test and verify module-not-found RED.
- [x] Implement chain state and reward composition.
- [x] Integrate reward consumption into current arena dodge hook.
- [x] Run targeted tests GREEN.

### Task 2: Mythic Safe-Lane Motion
**Files:** Create `src/game/endless/mythic-safe-lane.ts`; Test `tests/mythic-safe-lane.test.mjs`; Modify `src/game/game.ts`.
- [x] Write failing deterministic safe-lane tests for multiple geometry shapes.
- [x] Verify RED.
- [x] Implement hazard-distance scoring and bounded hint profile.
- [x] Render a non-blocking safe marker during Mythic arena play.
- [x] Verify GREEN.

### Task 3: Flow × Final Form Link
**Files:** Create `src/game/endless/final-form-flow-link.ts`; Test `tests/final-form-flow-link.test.mjs`; Modify `src/game/game.ts`.
- [x] Write failing tests for Flow 5 link creation, family differentiation, and bounded multipliers.
- [x] Verify RED.
- [x] Implement pure link profile.
- [x] Apply link only when Final Form signature attack fires.
- [x] Verify GREEN.

### Task 4: Foldable Dual Panel
**Files:** Modify `src/game/landscape-safe-area.ts`, `src/game/game.ts`, `src/game/render-contract.ts`; Test `tests/foldable-dual-panel.test.mjs`.
- [x] Write failing tests that require hero/status panels on opposite sides of hinge.
- [x] Verify RED.
- [x] Extend safe-area profile with optional hero/status panel rectangles.
- [x] Use these rectangles in HUD and render contract.
- [x] Verify GREEN.

### Task 5: Raster Contract Approximation
**Files:** Create `src/game/render-raster-contract.ts`; Test `tests/render-raster-contract.test.mjs`; Modify `src/game/render-contract.ts` exports if needed.
- [x] Write failing tests for deterministic raster signatures and similarity degradation on moved/missing primitives.
- [x] Verify RED.
- [x] Implement low-resolution occupancy rasterization and similarity.
- [x] Audit five representative viewport classes.
- [x] Verify GREEN.

### Task 6: Integration and verification
**Files:** Create `tests/phase183-202-integration.test.mjs`; update README/handoff.
- [x] Add static/runtime integration assertions, including action count 9 and no snapshot schema expansion.
- [x] Run targeted integration tests.
- [x] Run full `npm test`.
- [x] Run build and `git diff --check`.
- [x] Update docs and generate final archive only from verified HEAD.
