# Deep Run Decision Identity Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add shared visual identity and compact recall/progress presentation for the 24 Hero Ascensions, 5 Run Contract families, and 6 Long Run Oaths without changing gameplay or persistence.

**Architecture:** One 7×5 static PNG atlas is the only new visual asset. A focused asset module owns mapping and style helpers; existing decision cards opt into the new style, while canvas HUD drawing stays fallback-first and attention-budgeted. A deterministic audit is bound fail-closed into Release Freeze and Release Candidate signatures.

**Tech Stack:** TypeScript, Canvas 2D, DOM/CSS inline background sprites, Node `node:test`, Pillow for deterministic PNG generation.

**Spec:** `docs/superpowers/specs/2026-09-02-deep-run-decision-identity-design.md`

## Global Constraints

- Keep all existing Ascension, Contract, Oath gameplay rules and values unchanged.
- Add no Action button; `ACTION_BUTTONS.length` must remain 9.
- Do not mutate RunSnapshot or ExtensionSnapshot schemas.
- Asset loading must remain asynchronous and non-blocking.
- Motion amplitude must remain 0 and no pulse/loop animation may be added.
- Existing text must remain a complete fallback.

---

### Task 1: Deep-run identity atlas contract

**Files:**
- Create: `src/game/deep-run-decision-identity-assets.ts`
- Create: `assets/ui/deep-run-decision-icons.png`
- Test: `tests/phase1945-deep-run-identity-assets.test.mjs`

**Interfaces:**
- Produces: `DEEP_RUN_DECISION_ATLAS`, `DEEP_RUN_ASCENSION_IDS`, `DEEP_RUN_CONTRACT_IDS`, `DEEP_RUN_OATH_IDS`, `deepRunDecisionIdentityIcon()`, `deepRunDecisionIdentityStyle()`, `auditDeepRunDecisionIdentityAtlas()`.

- [ ] **Step 1: Write the failing atlas test** asserting 24+5+6 identities, 35 unique cells, 7×5 bounds, motion 0, fallback true, and the PNG path.
- [ ] **Step 2: Run** `npm run build && node --test tests/phase1945-deep-run-identity-assets.test.mjs` and verify failure because the module does not exist.
- [ ] **Step 3: Generate** a 672×480 PNG with 35 deterministic 96×96 symbolic cells and implement the atlas module.
- [ ] **Step 4: Re-run** the focused test and verify PASS.
- [ ] **Step 5: Commit** `feat: add deep run decision identity atlas`.

### Task 2: Ascension and Contract decision-card integration

**Files:**
- Modify: `src/ui/levelup.ts`
- Modify: `src/game/endless/host.ts`
- Modify: `src/game/game.ts`
- Test: `tests/phase1946-1948-deep-run-choice-integration.test.mjs`

**Interfaces:**
- Consumes: `deepRunDecisionIdentityStyle()` from Task 1.
- Produces: optional `ChoiceCard.identityIconStyle`, Contract cards with `identityIconStyle`, Ascension presentation cards with `identityIconStyle`.

- [ ] **Step 1: Write failing tests** that source-inspect the optional card style/fallback and runtime-check Contract family identity styles.
- [ ] **Step 2: Run** the focused test and verify expected failures.
- [ ] **Step 3: Implement** `identityIconStyle?: string` in `ChoiceCard`; render it when present, otherwise keep `growthChoiceIconStyle()`. Map Ascension and Contract cards to the shared atlas without changing their IDs or callbacks.
- [ ] **Step 4: Run** the focused test and existing decision continuity tests; verify PASS.
- [ ] **Step 5: Commit** `feat: connect deep run identity to decisions`.

### Task 3: Compact Contract/Oath progress and Ascension recall policy

**Files:**
- Create: `src/game/deep-run-decision-attention.ts`
- Modify: `src/game/endless/contracts.ts`
- Modify: `src/game/game.ts`
- Test: `tests/phase1947-1950-deep-run-hud-identity.test.mjs`

**Interfaces:**
- Produces: `contractHudLine(state)`, `deepRunDecisionAttention(input)`, canvas helper `drawDeepRunDecisionIdentityHud()`.
- Consumes: existing `oathHudLine()` and shared identity atlas.

- [ ] **Step 1: Write failing tests** for Contract count/time formatting and attention priority: danger/boss hides routine Ascension recall; active Contract/Oath outrank Ascensions; max Ascension icons is 3.
- [ ] **Step 2: Run** focused tests and verify failures because helpers are missing.
- [ ] **Step 3: Implement** pure formatting/policy helpers with no gameplay state mutation.
- [ ] **Step 4: Integrate** Contract/Oath labels and icons plus selected Ascension icon strip into `drawHud()`, respecting existing label caps and conditional atlas readiness.
- [ ] **Step 5: Run** focused HUD tests plus long-run HUD/focus regressions and verify PASS.
- [ ] **Step 6: Commit** `feat: add deep run hud recall and progress`.

### Task 4: Deterministic identity audit

**Files:**
- Create: `src/game/deep-run-decision-identity-asset-audit.ts`
- Test: `tests/phase1951-deep-run-identity-audit.test.mjs`

**Interfaces:**
- Produces: `auditDeepRunDecisionIdentityAssets()` returning exactly 70 deterministic samples, coverage, unique cell count, motion/fallback/non-blocking flags, action count, snapshot mutation false, issues, passed.

- [ ] **Step 1: Write failing audit test** asserting 70 samples, 35/35 coverage, 35 unique cells, no bounds errors, motion 0, fallback/non-blocking true, Actions 9/9, schema mutation false.
- [ ] **Step 2: Run** focused test and verify missing-module failure.
- [ ] **Step 3: Implement** audit using the Task 1 mapping and primary/fallback surfaces.
- [ ] **Step 4: Re-run** and verify PASS.
- [ ] **Step 5: Commit** `test: audit deep run decision identity`.

### Task 5: Release Freeze fail-closed binding

**Files:**
- Modify: `src/game/release-freeze-audit.ts`
- Modify: `src/game/release-candidate-audit.ts`
- Test: `tests/phase1952-deep-run-identity-release-gate.test.mjs`

**Interfaces:**
- Adds: `deepRunDecisionIdentityPassed:boolean`, `deepRunDecisionIdentitySamples:number` to `ReleaseFreezeAudit`.
- Release Candidate consistency and FNV signature payload consume both fields.

- [ ] **Step 1: Write failing gate test** asserting normal audit PASS, 70 samples, forged lower evidence causes `REVIEW` with `release-freeze`, and sample +1 changes signature.
- [ ] **Step 2: Run** focused test and verify failures before release binding exists.
- [ ] **Step 3: Bind** the audit into Release Freeze `passed`, returned evidence, Candidate consistency, signature payload, and markdown line.
- [ ] **Step 4: Run** focused release tests and verify PASS.
- [ ] **Step 5: Commit** `test: bind deep run identity to release freeze`.

### Task 6: Full verification and delivery

**Files:**
- Create: `PHASE1945-1952-HANDOFF.md`
- Build output: `dist/**`
- Package: `/mnt/data/arcane-last-stand-phase1952-full-merged.zip`

**Interfaces:**
- Produces the final merged delivery and evidence record.

- [ ] **Step 1: Run** `npm run build` and all Phase 1945~1952 focused tests.
- [ ] **Step 2: Run** all repository test files; if a monolithic Node process stalls, split the sorted test list into six exhaustive batches and sum pass/fail counts.
- [ ] **Step 3: Run** `npm run verify:candidate`, `npm run verify:release`, and `npm run verify:raster`.
- [ ] **Step 4: Merge** the feature branch into reconstructed local `main` only after fresh green verification and re-run full tests on merged `main`.
- [ ] **Step 5: Write** Handoff with exact sample counts/signatures/test counts and explicitly label reconstructed Git provenance.
- [ ] **Step 6: Zip** the clean merged source without `.git/.worktrees`; run `unzip -t` and compute SHA-256.
- [ ] **Step 7: Re-extract** the ZIP to a fresh directory and repeat fresh build, full tests, Candidate, release gate, and archive integrity checks.
