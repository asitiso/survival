# Damage Source Combat Identity Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five static damage-source identities to the existing hero damage-reason cue while preserving all gameplay and timing contracts.

**Architecture:** Use one 3×2 96px-cell PNG and a focused mapping module. Load it asynchronously in `Game`, render icon+existing text only when ready, fall back to the untouched text cue otherwise, then bind a 60-sample deterministic audit into Release Freeze/Candidate fail-closed evidence.

**Tech Stack:** TypeScript, Canvas 2D, Node test runner, PNG static assets.

**Spec:** `docs/superpowers/specs/2026-09-02-damage-source-identity-design.md`

## Global Constraints
- Heavy threshold stays 0.12 and critical threshold stays 0.32 of max HP.
- Dwell stays 0.72s / 0.95s / 1.15s for normal/heavy/critical.
- Density guard stays 0.22s.
- Same-source merge and source-switch arbitration stay unchanged.
- No damage calculation, source classification, action, or snapshot-schema changes.
- All new presentation is static and non-blocking.

---

### Task 1: Phase 1985 Damage Source Atlas
**Files:**
- Create: `src/game/damage-source-identity-assets.ts`
- Create: `assets/ui/damage-source-icons.png`
- Create/Test: `tests/phase1985-damage-source-identity-assets.test.mjs`

**Interfaces:**
- Consumes: `DamageReasonSource` from `damage-reason-feedback.ts`.
- Produces: `DAMAGE_SOURCE_IDENTITY_ATLAS`, `DAMAGE_SOURCE_IDENTITY_SOURCES`, `damageSourceIdentityIcon()`, `auditDamageSourceIdentityAtlas()`.

- [ ] Write a failing test asserting five sources, five unique in-bounds cells, static motion 0, text fallback and non-blocking metadata.
- [ ] Run the test and confirm failure because the new module is missing.
- [ ] Implement the mapping module and five-cell PNG.
- [ ] Build and rerun the test to green.
- [ ] Commit the task.

### Task 2: Phase 1986~1990 Live Cue Integration
**Files:**
- Modify: `src/game/game.ts`
- Create/Test: `tests/phase1986-1990-damage-source-identity-integration.test.mjs`
- Regression: `tests/damage-reason-feedback.test.mjs`, `tests/damage-reason-density.test.mjs`

**Interfaces:**
- Consumes: `damageSourceIdentityIcon(state.source)` and atlas image readiness.
- Produces: icon+text damage cue when ready and original text-only fallback when unavailable.

- [ ] Write a failing integration/source-contract test for async loading, icon rendering branch, preserved text, severity hierarchy, and no new timing behavior.
- [ ] Run and confirm the expected missing-wiring failure.
- [ ] Add one asynchronous atlas loader and icon-first/text-preserving cue rendering.
- [ ] Run build plus focused integration/damage-reason regressions to green.
- [ ] Commit the task.

### Task 3: Phase 1991 Deterministic Audit
**Files:**
- Create: `src/game/damage-source-identity-asset-audit.ts`
- Create/Test: `tests/phase1991-damage-source-identity-audit.test.mjs`

**Interfaces:**
- Produces: `auditDamageSourceIdentityAssets()` with exactly 60 deterministic samples.

- [ ] Write a failing audit test for 5/5 coverage, 5/5 cells, severity/merge/density/timing invariants, fallback, motion 0, 9 Actions, and snapshot non-mutation.
- [ ] Run and confirm failure because the audit module is missing.
- [ ] Implement the 60-sample audit using real damage-reason helpers.
- [ ] Build and rerun audit plus damage-reason tests to green.
- [ ] Commit the task.

### Task 4: Phase 1992 Release Fail-Closed
**Files:**
- Modify: `src/game/release-freeze-audit.ts`
- Modify: `src/game/release-candidate-audit.ts`
- Create/Test: `tests/phase1992-damage-source-identity-release-gate.test.mjs`

**Interfaces:**
- Produces: `damageSourceIdentityAssetsPassed` and `damageSourceIdentityAssetsSamples` in Release Freeze and Candidate signature/consistency/reporting.

- [ ] Write a failing test requiring 60 samples, forged lower evidence to force `REVIEW · release-freeze`, and sample-count mutation to alter signature.
- [ ] Run and confirm the current gate incorrectly lacks/bypasses the evidence.
- [ ] Bind the audit into Freeze passed calculation, evidence return, Candidate consistency, signature payload, and report line.
- [ ] Run focused Release tests to green.
- [ ] Commit the task.

### Task 5: Verification, Handoff, Merge, Package
**Files:**
- Create: `PHASE1985-1992-HANDOFF.md`
- Update generated `dist/` through the normal build.

- [ ] Run fresh TypeScript build and focused Phase 1985~1992 tests.
- [ ] Run every test file in six deterministic batches and require zero failures.
- [ ] Run Candidate, Release Quality Gate, Raster 5 profiles, forged evidence, and sample-count mutation checks.
- [ ] Write Handoff with exact evidence and commit it.
- [ ] Rerun full branch verification, locally merge to reconstructed `main`, and rerun the same verification on merged `main`.
- [ ] Remove the owned worktree/feature branch, create the full merged ZIP, test ZIP integrity and SHA-256.
- [ ] Extract the ZIP into a fresh directory, run `npm ci`, fresh build, all test batches, Candidate/Release/Raster, and recheck SHA-256.
