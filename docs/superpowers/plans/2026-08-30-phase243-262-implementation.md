# Phase 243~262 Combat Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Finish Mythic combat readability, foldable ergonomics, and render-regression reporting without adding combat actions or persistent runtime state.

**Architecture:** Five focused pure modules feed existing Game/Input seams. Combat authority stays in the existing finisher, BossArena geometry/collision, safe-zone, and Raster baseline layers; new code only composes bounded presentation, transient reward, input intent, and reporting.

**Tech Stack:** TypeScript, Canvas 2D, Node `node:test`, deterministic pure helpers.

**Spec:** `docs/superpowers/specs/2026-08-30-phase243-262-design.md`

## Global Constraints
- Keep exactly 9 combat actions.
- Add no snapshot field.
- Add no blocking UI or menu.
- Preserve non-foldable `hitTestActionButton(p)` path.
- Never auto-write raster baselines.

---

### Task 1: Final Form Finisher Feedback
**Files:**
- Create: `src/game/endless/final-form-finisher-feedback.ts`
- Modify: `src/game/audio.ts`
- Modify: `src/game/game.ts`
- Test: `tests/final-form-finisher-feedback.test.mjs`

- [x] Write failing tests for four distinct bounded family profiles and Game/audio integration.
- [x] Run targeted test and verify RED.
- [x] Add four sound kinds/descriptors and bounded presentation profile.
- [x] Integrate profile into the existing ×5 evade-finisher seam.
- [x] Run targeted and audio regressions.

### Task 2: SAFE Timeline Forecast
**Files:**
- Create: `src/game/endless/safe-telegraph-timeline.ts`
- Modify: `src/game/game.ts`
- Test: `tests/safe-telegraph-timeline.test.mjs`

- [x] Write failing tests for hazard activation, decision-window selection and urgency tiers.
- [x] Run targeted test and verify RED.
- [x] Implement deterministic timeline helper with `autoMove:false`.
- [x] Render compact timeline at existing SAFE LANE seam.
- [x] Run forecast/safe-zone regressions.

### Task 3: Mythic Tactic Reward
**Files:**
- Create: `src/game/endless/mythic-tactic-reward.ts`
- Modify: `src/game/game.ts`
- Test: `tests/mythic-tactic-reward.test.mjs`

- [x] Write failing tests for eligibility, caps, and no-economy reward.
- [x] Run targeted test and verify RED.
- [x] Implement archetype-specific bounded profiles.
- [x] Consume reward only from successful SAFE LINK in Mythic encounters with >=50% destroyed weakpoints.
- [x] Compose transient boss vulnerability into existing boss encounter modifiers.

### Task 4: Foldable Thumb Zones
**Files:**
- Create: `src/game/foldable-thumb-zones.ts`
- Modify: `src/core/input.ts`
- Test: `tests/foldable-thumb-zones.test.mjs`

- [x] Write failing tests for left/right/hinge intent and non-foldable neutrality.
- [x] Run targeted test and verify RED.
- [x] Implement deterministic zones from existing safe-area profile.
- [x] On foldable only, gate action hit-test to right thumb and joystick start to left thumb.
- [x] Verify prior foldable/non-foldable input tests.

### Task 5: Raster CI Diff Summary + Integration
**Files:**
- Create: `src/game/render-raster-ci-summary.ts`
- Create: `tests/render-raster-ci-summary.test.mjs`
- Create: `tests/phase243-262-integration.test.mjs`
- Modify: `README.md`
- Create: `docs/PHASE243-262-HANDOFF.md`

- [x] Write failing tests for clean PASS and changed REVIEW summaries.
- [x] Run targeted test and verify RED.
- [x] Implement pure deterministic CI summary; do not approve/write baselines.
- [x] Add integration tests enforcing 9 actions, no snapshot fields, and actual Game/Input wiring.
- [x] Run all targeted previous-phase regressions.
- [x] Run `npm run build`, full `npm test`, `git diff --check`, and five baseline reports.
- [x] Update README and handoff with exact results.
