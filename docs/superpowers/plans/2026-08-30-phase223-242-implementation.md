# Phase 223-242 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Deliver Phase 223-242 combat polish, foldable touch ergonomics, and auditable raster baseline approval on top of Phase 222.

**Architecture:** Add five small deterministic modules and compose them into existing Game/Input/render seams. Keep all new combat state transient; reuse Final Form, Mythic safe-zone, safe-area, and raster contracts rather than creating parallel systems.

**Tech Stack:** TypeScript ESM, Canvas 2D, Node `node:test`.

**Spec:** `docs/superpowers/specs/2026-08-30-phase223-242-design.md`

## Global Constraints
- Exactly 9 combat actions.
- No blocking modal or new combat menu.
- No new Run Snapshot field for Phase 223-242 state.
- Existing Mythic geometry remains authoritative.
- Non-foldable touch layout remains behaviorally unchanged.
- Raster baseline updates require explicit report token approval.

---

### Task 1: Final Form Evade Finisher Identity
**Files:**
- Create: `src/game/endless/final-form-evade-finisher.ts`
- Modify: `src/game/game.ts`
- Test: `tests/final-form-evade-finisher.test.mjs`

**Interfaces:**
- Consumes: `HeroFinalFormId`, `finalFormMobilityProfile`, `finalFormAttackPattern`, `ArenaDodgeFinisherProfile`.
- Produces: `finalFormEvadeFinisher(formId, base)` returning bounded family-specific damage/radius/push/slow/chain/core-heal values.

- [x] Write failing tests proving all 12 forms map deterministically and remain within caps.
- [x] Run focused test and verify failure from missing module/API.
- [x] Implement profile derivation with four existing identity families.
- [x] Wire the x5 finisher seam in `Game.updateBossArena` to use the form-aware profile and bounded chain/core effects.
- [x] Run focused and existing dodge/Final Form tests.

### Task 2: Safe Lane Forecast
**Files:**
- Create: `src/game/endless/safe-lane-forecast.ts`
- Modify: `src/game/game.ts`
- Test: `tests/safe-lane-forecast.test.mjs`

**Interfaces:**
- Consumes: current `MythicSafeLaneHint`, current/next `MythicSafeZoneState`, elapsed encounter milliseconds.
- Produces: `safeLaneForecast(...)` with current target, next target, urgency, phase label, and transition milliseconds.

- [x] Write failing tests for stable, collapse, collapsed, and reform forecasts.
- [x] Verify RED.
- [x] Implement deterministic forecast with no movement side effect.
- [x] Render a compact forecast cue at the existing SAFE LANE drawing seam.
- [x] Run focused and safe-lane/safe-zone tests.

### Task 3: Mythic Attack / Safe-Zone Synchronization
**Files:**
- Create: `src/game/endless/mythic-safe-zone-pressure.ts`
- Modify: `src/game/game.ts`
- Test: `tests/mythic-safe-zone-pressure.test.mjs`

**Interfaces:**
- Consumes: `BossArchetype`, `MythicSafeZoneState|null`, destroyed weakpoint ratio.
- Produces: bounded `specialCooldownMultiplier`, `summonMultiplier`, `dashMultiplier`, `projectileMultiplier`, `damageMultiplier`.

- [x] Write failing tests that stable < collapsed pressure and weakpoint destruction reduces peak pressure.
- [x] Verify RED.
- [x] Implement phase/archetype bounded pressure profile.
- [x] Compose it with existing Mythic/Last Law boss modifiers without replacing them.
- [x] Run focused Mythic regression tests.

### Task 4: Foldable Touch Density
**Files:**
- Create: `src/game/foldable-touch-density.ts`
- Modify: `src/core/touch-controls.ts`
- Modify: `src/core/input.ts`
- Test: `tests/foldable-touch-density.test.mjs`

**Interfaces:**
- Consumes: `LandscapeSafeAreaProfile`, `ACTION_BUTTONS`.
- Produces: per-action touch scale map and `hitTestActionButtonWithProfile` behavior.

- [x] Write failing tests proving foldable-only adaptive scales, unchanged visual positions/IDs, and nearest-button resolution.
- [x] Verify RED.
- [x] Implement foldable scale profile with caps 0.88..1.30 and hinge-aware cluster reduction.
- [x] Wire `InputState` to choose the profile from the current canvas safe area.
- [x] Run touch/input/foldable regressions.

### Task 5: Raster Baseline Approval & Report
**Files:**
- Create: `src/game/render-raster-baseline-report.ts`
- Test: `tests/render-raster-baseline-report.test.mjs`
- Modify: `src/game/render-raster-baseline.ts` only if a small shared export is required.

**Interfaces:**
- Consumes: default raster specs, current render/raster contracts.
- Produces: `rasterBaselineReport()`, `approveRasterBaselineChange(report, token)`, deterministic approval token and per-viewport changed-cell metrics.

- [x] Write failing tests for exact baseline pass, changed critical layout fail, wrong token rejection, and matching token approval.
- [x] Verify RED.
- [x] Implement deterministic reporting/approval without file rewriting.
- [x] Add five-viewport regression coverage.

### Task 6: Phase Integration and Full Regression
**Files:**
- Create: `tests/phase223-242-integration.test.mjs`
- Modify: `README.md`
- Create: `docs/PHASE223-242-HANDOFF.md`

**Interfaces:**
- Verifies: 9 actions, no new snapshot keys, Game/Input integration tokens, five render/raster viewport gates.

- [x] Write integration tests for all five systems and constraints.
- [x] Run focused integration suite.
- [x] Run `npm run build` and full `npm test`.
- [x] Run `git diff --check` and document placeholder scan.
- [x] Commit only the verified tree, re-run full verification on the commit, fast-forward `main`, and re-run full verification on merged `main`.
- [x] Run HTTP smoke and generate a `git archive` ZIP with `unzip -t` and SHA-256 verification.
