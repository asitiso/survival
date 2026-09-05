# Specialist Enemy Intent Identity Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six static specialist intent identities to enemy bodies and AUTO target guidance while preserving all specialist gameplay and legacy visual fallbacks.

**Architecture:** A focused atlas module owns specialist type→cell mapping, compact clamped on-body geometry, and static emphasis rules. `Game` loads the atlas independently and passes it to `EnemyManager`; `autoTargetIndicator()` adds optional identity metadata so the same atlas is reused for AUTO targeting. A deterministic audit is bound fail-closed into Release Freeze and Candidate signatures.

**Tech Stack:** TypeScript, Canvas 2D, browser `Image`, Node `node:test`, static PNG atlas.

**Spec:** `docs/superpowers/specs/2026-09-02-specialist-enemy-intent-identity-design.md`

## Global Constraints

- Exactly six identities: bomber, shaman, shieldbearer, assassin, siegeGolem, nullifier.
- Atlas: `assets/enemies/specialist-intent-icons.png`, 288×192, 3×2, 96×96 cells.
- Presentation only: no AI, balance, spawn, geometry, targeting-score, persistence, or action-contract changes.
- No new timers or animated effects; motion amplitude 0.
- Existing specialist primitives and AUTO label/ring remain as fallback.
- Image load failure never blocks gameplay.

---

### Task 1: Specialist intent atlas and presentation contract

**Files:**
- Create: `src/game/specialist-intent-identity-assets.ts`
- Create: `assets/enemies/specialist-intent-icons.png`
- Create: `tests/phase1969-specialist-intent-identity-assets.test.mjs`

**Interfaces:**
- Produces: `SPECIALIST_INTENT_TYPES`, `SPECIALIST_INTENT_ATLAS`, `specialistIntentIcon(type)`, `specialistIntentOnBodyLayout(radius,pos)`, `specialistIntentEmphasis(type,state)`, `auditSpecialistIntentAtlas()`.

- [ ] **Step 1: Write failing atlas/geometry/emphasis tests** that assert stable six-type order, 3×2 unique cells, exact PNG dimensions, 16~18px clamped on-body geometry, motion amplitude 0, fallback flags, and state-derived emphasis for guard/blink/core/nullifier.
- [ ] **Step 2: Run `npm run build && node --test tests/phase1969-specialist-intent-identity-assets.test.mjs`** and verify RED because the module does not exist.
- [ ] **Step 3: Implement the minimal mapping/presentation module and create the exact atlas** with no behavior dependencies.
- [ ] **Step 4: Re-run the focused test** and require PASS.
- [ ] **Step 5: Commit** `feat: add specialist enemy intent atlas`.

### Task 2: On-body and AUTO target integration

**Files:**
- Modify: `src/game/enemies.ts`
- Modify: `src/game/game.ts`
- Modify: `src/game/auto-target-visibility.ts`
- Create: `tests/phase1970-1974-specialist-intent-integration.test.mjs`

**Interfaces:**
- Consumes: Task 1 atlas helpers.
- Produces: independent `Game` atlas loader/readiness fields; extended `renderEnemies(... specialistIntentAtlasImage, specialistIntentAtlasReady, heroPos)` presentation inputs; optional `specialistIntent` metadata on `TargetIndicator`.

- [ ] **Step 1: Write failing source/behavior tests** asserting independent image load, icon-first body draw, preservation of all six existing legacy primitives, optional AUTO specialist identity, same-atlas AUTO draw, and absence of edits to `autoPriority()`/`AUTO_SWITCH_MARGIN`.
- [ ] **Step 2: Run focused tests** and verify RED on missing loader/render metadata.
- [ ] **Step 3: Implement Game loader and pass atlas plus hero position into EnemyManager rendering.**
- [ ] **Step 4: Draw one clamped specialist icon per specialist with static emphasis; leave legacy primitives intact.**
- [ ] **Step 5: Extend AUTO target metadata/draw without altering label, urgency, radius, target scoring or switch behavior.**
- [ ] **Step 6: Run focused plus existing enemy-specialist/auto-target tests** and require PASS.
- [ ] **Step 7: Commit** `feat: integrate specialist intent in combat guidance`.

### Task 3: Deterministic audit

**Files:**
- Create: `src/game/specialist-intent-identity-asset-audit.ts`
- Create: `tests/phase1975-specialist-intent-identity-audit.test.mjs`

**Interfaces:**
- Produces: `auditSpecialistIntentIdentityAssets()` with fixed sample count and explicit invariant fields.

- [ ] **Step 1: Write failing audit tests** for 6/6 coverage, six unique cells, body/AUTO surfaces, edge clamp, state emphasis, legacy fallback, non-blocking load, motion 0, frozen specialist constants, frozen auto-target contract, Actions 9/9, and snapshot schema mutation false.
- [ ] **Step 2: Run focused audit test** and verify RED.
- [ ] **Step 3: Implement deterministic samples by calling real production helpers and comparing frozen constants/source-contract evidence.**
- [ ] **Step 4: Re-run focused audit tests** and require PASS.
- [ ] **Step 5: Commit** `test: audit specialist intent identity`.

### Task 4: Release Freeze fail-closed binding

**Files:**
- Modify: `src/game/release-freeze-audit.ts`
- Modify: `src/game/release-candidate-audit.ts`
- Create: `tests/phase1976-specialist-intent-release-gate.test.mjs`

**Interfaces:**
- Produces Freeze fields: `specialistIntentIdentityAssetsPassed:boolean`, `specialistIntentIdentityAssetsSamples:number`.

- [ ] **Step 1: Write failing release-gate tests** asserting normal Freeze fields, forged lower false + upper true => Candidate REVIEW/release-freeze, and sample-count mutation changes signature.
- [ ] **Step 2: Run release-gate test** and verify RED because fields are absent/not bound.
- [ ] **Step 3: Import audit into Release Freeze; bind passed calculation, returned evidence, report details, Candidate consistency and signature payload.**
- [ ] **Step 4: Run Phase 1975/1976 and neighboring release tests** and require PASS.
- [ ] **Step 5: Commit** `test: bind specialist intent to release freeze`.

### Task 5: Handoff, exhaustive verification, merge and delivery

**Files:**
- Create: `PHASE1969-1976-HANDOFF.md`
- Generated: `dist/**` only through the existing build.

**Interfaces:**
- Produces: clean verified feature branch, local reconstructed-main merge, full-source Phase 1976 ZIP, external handoff copy, external atlas copy.

- [ ] **Step 1: Fresh `npm ci`/`npm run build` and focused Phase 1969~1976 regressions.**
- [ ] **Step 2: Enumerate every `tests/*.test.mjs`, split sorted list exhaustively into six batches, and require zero failures across the aggregate.**
- [ ] **Step 3: Run normal Candidate/Release/Raster plus forged evidence and sample-count mutation; record signatures.**
- [ ] **Step 4: Write Handoff with exact evidence, commit, rebuild, and verify generated `dist` has no uncommitted drift.**
- [ ] **Step 5: Re-run exhaustive branch verification, merge locally into reconstructed `main`, then repeat build/full tests/release gates on merged `main`.**
- [ ] **Step 6: Remove owned worktree/branch only after merged verification is green.**
- [ ] **Step 7: Create ZIP excluding `.git`, `.worktrees`, `node_modules`, transient logs; run `unzip -t`, compute SHA-256.**
- [ ] **Step 8: Extract ZIP to a fresh directory, run `npm ci`, build, exhaustive full tests, Candidate/Release/Raster, and report the delivery artifacts.**
