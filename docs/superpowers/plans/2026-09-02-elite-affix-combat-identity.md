# Elite Affix Combat Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six static elite-affix identities to live combat while preserving the existing affix text as a non-blocking asset fallback and binding the evidence into Release Freeze.

**Architecture:** A focused atlas/presentation module owns cells and on-body geometry. `EnemyManager` only owns async image readiness and drawing. A deterministic audit proves the presentation contract without touching affix gameplay state.

**Tech Stack:** TypeScript, Canvas 2D, Node test runner, PNG asset.

**Spec:** `docs/superpowers/specs/2026-09-02-elite-affix-combat-identity-design.md`

## Global Constraints
- Do not change elite affix gameplay modifiers, selection probability, Danger 7 two-affix rule, low-HP frenzy threshold, or mana-shield values.
- Do not change enemy geometry, collision, movement, targeting, economy, persistence schema, or 9-action input contract.
- Static art only; motion amplitude 0.
- Existing Korean affix text remains the fallback when the atlas is unavailable.
- Asset loading must be asynchronous and non-blocking.

---

### Task 1: Affix atlas contract
**Files:** Create `src/game/elite-affix-identity-assets.ts`; Create `assets/enemies/elite-affix-icons.png`; Test `tests/elite-affix-identity-assets.test.mjs`.
**Interfaces:** Produces `ELITE_AFFIX_IDENTITY_ATLAS`, `eliteAffixIdentityRect()`, `eliteAffixIdentityPresentation()`, and `eliteAffixIdentityRowLayout()`.
- [ ] Write a failing test asserting 6/6 unique in-bounds cells, static presentation, and one/two-affix centered layout.
- [ ] Run the test and confirm failure is caused by the missing module/contract.
- [ ] Implement the minimal atlas and geometry helper plus exact 3×2 PNG.
- [ ] Re-run the test and confirm PASS.
- [ ] Commit the task.

### Task 2: Live elite rendering and fallback
**Files:** Modify `src/game/enemies.ts`; Test `tests/elite-affix-identity-integration.test.mjs` and affected enemy rendering tests.
**Interfaces:** Consumes Task 1 helpers; preserves `eliteAffixLabel()` fallback.
- [ ] Write a failing integration test asserting async/non-blocking atlas setup, icon draw path, static active emphasis, and existing text fallback.
- [ ] Run and confirm the intended failure.
- [ ] Add atlas image readiness to `EnemyManager` and replace the affix text-only block with icon-first/fallback-text rendering.
- [ ] Run focused tests and existing elite-affix tests until all pass.
- [ ] Commit the task.

### Task 3: Deterministic audit
**Files:** Create `src/game/elite-affix-identity-asset-audit.ts`; Test `tests/elite-affix-identity-asset-audit.test.mjs`.
**Interfaces:** Produces `auditEliteAffixIdentityAssets()` and deterministic sample evidence.
- [ ] Write a failing test for coverage, unique cells, one/two-affix layouts, clamp policy, text fallback, non-blocking behavior, motion 0, unchanged modifier snapshots, unchanged geometry, Actions 9/9 and schema mutation false.
- [ ] Run and confirm failure.
- [ ] Implement the audit with a fixed sample count and explicit issues.
- [ ] Re-run and confirm PASS.
- [ ] Commit the task.

### Task 4: Release Freeze fail-closed binding
**Files:** Modify `src/game/release-freeze-audit.ts`, `src/game/release-candidate-audit.ts`, release scripts/tests; Test `tests/elite-affix-identity-release-freeze.test.mjs`.
**Interfaces:** Adds `eliteAffixIdentityAssetsPassed` and `eliteAffixIdentityAssetsSamples` to release evidence/signature.
- [ ] Write a failing forged-evidence test and sample-count signature mutation test.
- [ ] Run and confirm the current Candidate incorrectly accepts forged lower evidence.
- [ ] Bind audit result into Freeze pass calculation, returned evidence, Candidate consistency, signature payload, and report.
- [ ] Run focused release tests and confirm forged evidence becomes REVIEW.
- [ ] Commit the task.

### Task 5: Full verification and handoff
**Files:** Create `PHASE1961-1968-HANDOFF.md`; build `dist`; package final archive.
**Interfaces:** Delivers verified Phase 1968 source ZIP and affix atlas.
- [ ] Run fresh TypeScript build and focused Phase 1961~1968 regression.
- [ ] Run every test file exhaustively in deterministic batches and total pass/fail counts.
- [ ] Run Release Candidate, Release Quality Gate, Raster profiles, and fail-closed mutation checks.
- [ ] Commit handoff evidence, merge into reconstructed `main`, and repeat full verification on merged `main`.
- [ ] Remove owned worktree/feature branch, create ZIP from clean `main`, verify archive integrity/SHA-256, re-extract into a fresh directory, and repeat build/full tests/release gates there.
