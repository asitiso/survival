# Phase 343-362 Release Balance Lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deterministic hero/threat, boss-TTK, damage-distribution and thermal worst-case release audits, then make Candidate/Manifest fail closed on those audits.

**Architecture:** New audit modules consume existing runtime tuning functions without creating parallel gameplay state. Candidate Audit becomes the single release-lock aggregation point, and Manifest continues to carry Candidate evidence rather than duplicating balance logic.

**Tech Stack:** TypeScript, Node test runner, existing game release-audit modules.

**Spec:** `docs/superpowers/specs/2026-08-30-phase343-362-release-balance-lock-design.md`

## Global Constraints
- Exactly 9 combat actions.
- No new snapshot fields.
- No new runtime currency/menu/modal.
- Enemy logic and danger telegraphs remain 100% under thermal pressure.
- Existing Raster/Release/Candidate/Manifest gates remain mandatory.
- TDD RED must precede production implementation for every behavior change.

---

### Task 1: Shared hero release model + 4x3 first-30-minute audit

**Files:**
- Create: `src/game/hero-release-model.ts`
- Create: `src/game/hero-threat-release-audit.ts`
- Create: `tests/hero-threat-release-audit.test.mjs`

**Interfaces:**
- Produces `heroReleaseModel(heroId)` with offense/control/survival/coreGuard/composite indices.
- Produces `auditHeroThreatReleaseBalance()` with 72 checkpoints and spread/monotonic gates.

- [x] **Step 1: Write RED tests** asserting 4 heroes x 3 threats x 6 checkpoints, role-value spread ceilings, and monotonic threat pressure.
- [x] **Step 2: Run `npm run build && node --test tests/hero-threat-release-audit.test.mjs`** and confirm missing-module failure.
- [x] **Step 3: Implement deterministic model** using `HERO_PROFILES`, `heroSpellIdentity`, `directorSnapshot`, `openingThirtyMinuteSample`, and `threatLevelModifiers`.
- [x] **Step 4: Re-run targeted test** and require all assertions GREEN.
- [x] **Step 5: Run existing hero/threat/opening tests** to protect current contracts.

### Task 2: First-six-boss hero TTK variance

**Files:**
- Create: `src/game/hero-boss-ttk-audit.ts`
- Create: `tests/hero-boss-ttk-audit.test.mjs`

**Interfaces:**
- Consumes `heroReleaseModel()` and `firstSixBossCheckpoints()`.
- Produces 24 hero/boss TTK points and release spread gates.

- [x] **Step 1: Write RED tests** for 24 checkpoints, 15-75 second TTK window, <=1.30 per-boss hero spread, <=1.35 adjacent-boss ratio.
- [x] **Step 2: Verify RED** by running the targeted test before implementation.
- [x] **Step 3: Implement boss uptime power** from offense, control and movement identity without changing live boss combat.
- [x] **Step 4: Re-run targeted and existing first-six-boss tests** and require GREEN.

### Task 3: Hero death-source and core-loss distribution audit

**Files:**
- Create: `src/game/hero-damage-distribution-audit.ts`
- Create: `tests/hero-damage-distribution-audit.test.mjs`

**Interfaces:**
- Consumes shared hero model, `directorSnapshot`, `openingThirtyMinuteSample`, `threatLevelModifiers`.
- Produces 12 hero/threat distribution samples with normalized source shares and loss indices.

- [x] **Step 1: Write RED tests** for normalized source shares, source dominance ceilings, hero/core spread ceilings and threat monotonicity.
- [x] **Step 2: Verify RED** by running the targeted test.
- [x] **Step 3: Implement deterministic exposure model** with contact/projectile/arena/boss-special/core-siege sources.
- [x] **Step 4: Re-run targeted test** and require GREEN.

### Task 4: Thermal worst-case VFX audit

**Files:**
- Create: `src/game/endless/thermal-worst-case-audit.ts`
- Create: `tests/endless-thermal-worst-case-audit.test.mjs`

**Interfaces:**
- Consumes existing governor, comfort and thermal policies.
- Produces low/mid/high x 2h/8h/12h actual composed presentation caps.

- [x] **Step 1: Write RED tests** for 9 checkpoints, telegraph 24, logic 1, governor ceilings, readable VFX floors.
- [x] **Step 2: Verify RED** before implementation.
- [x] **Step 3: Implement the exact budget composition formula used by `Game.updatePresentationQuality()`**.
- [x] **Step 4: Run targeted thermal tests and existing governor/comfort/thermal suites**.

### Task 5: Candidate + Manifest release lock

**Files:**
- Modify: `src/game/release-candidate-audit.ts`
- Modify: `tests/release-candidate-audit.test.mjs`
- Modify: `tests/phase319-release-candidate-integration.test.mjs`
- Modify: `src/game/release-manifest.ts` only if summary formatting requires no new subsystem.
- Modify: `tests/release-manifest.test.mjs` if compact summary contract changes.

**Interfaces:**
- Candidate evidence adds `heroThreatBalance`, `heroBossTtk`, `damageDistribution`, `thermalWorstCase`.
- Candidate signature payload and markdown include these required gates.
- Manifest continues to consume Candidate via existing `candidateAudit` evidence.

- [x] **Step 1: Write RED Candidate tests** asserting all four new audits are present and fail closed independently.
- [x] **Step 2: Implement Candidate collection/gating/signature/markdown**.
- [x] **Step 3: Re-run Candidate and Manifest tests** and require GREEN.
- [x] **Step 4: Run `npm run verify:candidate` and `npm run verify:manifest`** and capture signatures.

### Task 6: Release hardening, documentation and integration

**Files:**
- Create: `docs/PHASE343-362-HANDOFF.md`
- Modify: `README.md`
- Modify: this plan checklist to completed state.

- [x] **Step 1: Run `npm run build`**.
- [x] **Step 2: Run `npm test`** and capture exact total/pass/fail.
- [x] **Step 3: Run `npm run verify:raster`**.
- [x] **Step 4: Run `npm run verify:release`**.
- [x] **Step 5: Run `npm run verify:candidate`**.
- [x] **Step 6: Run `npm run verify:manifest`**.
- [x] **Step 7: Run `git diff --check` and placeholder scan**.
- [ ] **Step 8: Commit exact verified tree, re-run full verification on commit, fast-forward to `main`, then re-run full verification on merged `main`.**
- [ ] **Step 9: Start static server and require HTTP 200 for root, main/game and Phase 343-362 modules.**
- [ ] **Step 10: Create final ZIP with `git archive`, run `unzip -t`, count entries and record SHA-256.**
