# Threat Rhythm Stability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce simultaneous secondary-VFX peaks and synchronized rebound during dense combat while preserving canonical projectile bodies, impact edges, boss telegraphs, safe-lane identity, and specialist silhouettes.

**Architecture:** Add three presentation-only helper modules after the existing Phase 4173~4190 readability stack. Train 1 staggers secondary rhythm by deterministic slots, Train 2 gates recovery so slots do not snap back together, and Train 3 arbitrates dense-scene rhythm admission. Wire only secondary decoration alpha/trail factors into `enemies.ts`, `spells.ts`, and `game.ts`; primary/canonical rendering remains unattenuated.

**Tech Stack:** TypeScript, Canvas 2D presentation layer, Node.js 24 test runner, GitHub Actions, existing build/raster/release/candidate verification scripts.

**Spec:** Approved conversation design for Phase 4191~4208 — Threat Rhythm Stagger / Recovery / Dense Rhythm Arbitration.

## Global Constraints

- Presentation-only: do not change damage, collision, AI, economy, persistence, spawn/hazard gameplay, or canonical targeting.
- Preserve Reduced Motion and Reduced Flash behavior.
- Do not create a new image atlas unless a readability identity gap is discovered; this pass targets timing/composition rather than artwork identity.
- Each Fast Train must establish RED before production code, then GREEN, affected regression, `git diff --check`, and one feature commit.
- Train 1 affected regression target: 70 tests; Train 2: 77; Train 3: 84.
- After Train 3, run the complete test-file regression in 8 deterministic shards, then raster, release, and candidate gates once.
- Stage only exact generated `dist/game/*.js` files; never force-add the entire `dist/game` directory.

---

### Task 1: Phase 4191~4196 Threat Rhythm Stagger

**Files:**
- Create: `src/game/threat-impact-rhythm-stagger-rendering.ts`
- Create: `tests/phase4191-4196-threat-rhythm-stagger.test.mjs`
- Modify: `src/game/enemies.ts`, `src/game/spells.ts`, `src/game/game.ts`
- Generate: `dist/game/threat-impact-rhythm-stagger-rendering.js`, plus changed runtime dist files.

**Interfaces:**
- Consumes existing final-settle/focus-transfer stress and phase signals.
- Produces `projectileThreatRhythmPresentation`, `impactThreatRhythmPresentation`, `hazardThreatRhythmPresentation`, `safeLaneThreatRhythmPresentation`, `specialistThreatRhythmPresentation`, and `threatRhythmBudgetPresentation`.

- [ ] **Step 1: Write the failing test**
  - Add six contracts proving deterministic slot separation, primaryScale=1, dense budget peak limits, safe-lane preservation, and Reduced Motion/Flash bounded outputs; add one source-wiring contract.
- [ ] **Step 2: Run test to verify it fails**
  - Run `npm run build && node --test tests/phase4191-4196-threat-rhythm-stagger.test.mjs`.
  - Expected: FAIL because `dist/game/threat-impact-rhythm-stagger-rendering.js` does not exist.
- [ ] **Step 3: Write minimal implementation**
  - Implement clamp/smooth/slot helpers and deterministic quarter-cycle slot offsets. Return `primaryScale:1` and bounded `secondaryScale`; budget returns a dense-scene `maxConcurrentPeaks` of 1~3.
  - Wire only after `*FocusTransferBudget.secondaryScale` in secondary trails/fills/decorations.
- [ ] **Step 4: Run test and affected regression**
  - Run new test plus Phase 4137~4190 nine prior 7-test files; expected 70/70 PASS.
  - Run `git diff --check`.
- [ ] **Step 5: Commit**
  - Commit message: `feat: add Phase 4191-4196 threat rhythm stagger`.

### Task 2: Phase 4197~4202 Threat Rhythm Recovery

**Files:**
- Create: `src/game/threat-impact-rhythm-recovery-rendering.ts`
- Create: `tests/phase4197-4202-threat-rhythm-recovery.test.mjs`
- Modify/generate the same runtime source/dist files.

**Interfaces:**
- Consumes final-settle release, current rhythm slot, and stress.
- Produces five per-surface recovery helpers plus `threatRhythmRecoveryBudgetPresentation`.

- [ ] **Step 1: Write the failing test**
  - Six phase contracts verify slot-dependent recovery delay, gradual release, safe-lane primary preservation, specialist recovery, and global rebound cap; one source-wiring contract.
- [ ] **Step 2: Verify RED**
  - Run build + the new test; expected module-not-found failure.
- [ ] **Step 3: Implement minimal recovery**
  - Apply deterministic slot delays before smooth recovery, bounded by stress; `primaryScale` remains 1. Wire factors after Train 1 rhythm budget factors only on secondary effects.
- [ ] **Step 4: Verify GREEN + affected regression**
  - Run all prior affected files + Train 1 + Train 2; expected 77/77 PASS; run `git diff --check`.
- [ ] **Step 5: Commit**
  - Commit message: `feat: add Phase 4197-4202 threat rhythm recovery`.

### Task 3: Phase 4203~4208 Dense Threat Rhythm Arbitration

**Files:**
- Create: `src/game/threat-impact-dense-rhythm-rendering.ts`
- Create: `tests/phase4203-4208-dense-threat-rhythm.test.mjs`
- Modify/generate the same runtime source/dist files.

**Interfaces:**
- Consumes active-count, age/rank, phase, stress, critical state, and safe-lane visibility.
- Produces five dense arbitration helpers plus `denseThreatRhythmBudgetPresentation`.

- [ ] **Step 1: Write the failing test**
  - Six phase contracts verify dense slot admission, critical/canonical priority, safe-lane floor, older-secondary thinning, and a unified concurrent-peak cap; one wiring contract.
- [ ] **Step 2: Verify RED**
  - Run build + new test; expected module-not-found failure.
- [ ] **Step 3: Implement minimal arbitration**
  - Reduce open secondary slots as active count rises; never attenuate primaryScale. Critical cues retain a higher secondary minimum but still obey flash/motion caps.
- [ ] **Step 4: Verify GREEN + affected regression**
  - Run all affected files through Train 3; expected 84/84 PASS; run `git diff --check`.
- [ ] **Step 5: Commit**
  - Commit message: `feat: add Phase 4203-4208 dense threat rhythm arbitration`.

### Task 4: Integration Gate and Exact-Tree Promotion

**Files:**
- Temporary: `.github/phase4191-4208-fast.py`, `.github/workflows/phase4191-4208-fast-trains.yml`, `.github/workflows/phase4191-4208-integration.yml`.
- Final product tree: Task 1~3 source/dist/tests plus this plan document; temporary CI files removed before promotion.

**Interfaces:**
- Consumes the three feature commits.
- Produces one verified clean tree promoted to `main`.

- [ ] **Step 1: Run full regression**
  - Discover every `tests/*.test.mjs`, sort deterministically, distribute by index modulo 8, and require all 8 shards PASS.
- [ ] **Step 2: Run phase contracts and release gates**
  - Run the three new test files (21 contracts total), `git diff --check`, `npm run verify:raster`, `npm run verify:release`, and `npm run verify:candidate`.
- [ ] **Step 3: Clean verified tree**
  - Create a clean branch at the tested head and delete temporary runner/workflow files only.
- [ ] **Step 4: Promote exact tree**
  - Re-read current `main`; if unchanged, create a new commit whose tree SHA is exactly the verified clean tree and whose parent is the current main SHA, then fast-forward `main`.
- [ ] **Step 5: Fresh final verification**
  - Confirm final `main` SHA/tree/parent, compare old→new with no behind commits, confirm expected changed product/test files, and confirm temporary workflow files are absent.

## Self-Review

- Spec coverage: all five visual surface classes are covered in all three trains; Reduced Motion/Flash and presentation-only constraints are explicit; one-time integration gates are included.
- Placeholder scan: no deferred implementation items are used; each task has concrete files, test commands, expected outcomes, and commit boundaries.
- Type consistency: all three helper families share `{ primaryScale, secondaryScale, presentationOnly }` semantics; later tasks consume slots/release signals produced or already available from earlier stages.