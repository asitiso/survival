# Phase 303-322 Release Candidate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Smooth the release-candidate gameplay curve and make balance/performance evidence mandatory in the release manifest.

**Architecture:** Add four small pure policy/audit modules and one aggregate release-candidate audit. Game composes bounded policies at existing pressure, boss-spawn, presentation, and death-reward seams; Release Manifest consumes the aggregate audit without adding gameplay persistence.

**Tech Stack:** TypeScript, Node test runner, existing Canvas game runtime and npm verification scripts.

**Spec:** `docs/superpowers/specs/2026-08-30-phase303-322-release-candidate-design.md`

## Global Constraints

- Exactly 9 combat actions.
- No Snapshot schema change.
- No blocking UI or permanent currency.
- Thermal relief changes presentation only; danger telegraphs and enemy logic remain intact.
- First-30-minute extension returns neutral at minute 30.
- Boss curve affects only the first three normal boss spawns and never creates extra late difficulty.
- Long-run reward multipliers are transient and capped at 1.08.
- Release gates fail closed and never auto-mutate raster baselines.

---

### Task 1: First 30 Minute Momentum

**Files:**
- Create: `src/game/first-thirty-minute-director.ts`
- Modify: `src/game/game.ts`
- Create: `tests/first-thirty-minute-director.test.mjs`

**Interfaces:**
- Produces: `firstThirtyMinuteProfile(elapsedSeconds)` and `auditFirstThirtyMinutes()`.
- Game consumes `spawnPressureMultiplier`, `eliteIntervalMultiplier`, and `rewardMultiplier` at existing opening seams.

- [x] **Step 1: Write failing tests** for neutral pre-10/post-30 behavior, bounded 10-30 bands, and passing audit.
- [x] **Step 2: Run** `npm run build && node --test tests/first-thirty-minute-director.test.mjs` and verify module-not-found/contract failure.
- [x] **Step 3: Implement** the four-band pure policy and deterministic audit.
- [x] **Step 4: Run** the targeted test and verify PASS.
- [x] **Step 5: Add source-level Game integration assertions** that pressure and death rewards compose the new profile without changing shop/enemy-budget multipliers.

### Task 2: Early Boss Difficulty Curve

**Files:**
- Create: `src/game/boss-difficulty-curve.ts`
- Modify: `src/game/enemies.ts`
- Modify: `src/game/game.ts`
- Create: `tests/boss-difficulty-curve.test.mjs`

**Interfaces:**
- Produces: `bossDifficultyCurve(ordinal, elapsedSeconds, threat)` and `auditBossDifficultyCurve()`.
- `EnemyUpdateContext` accepts optional `bossCurve` callback returning the profile for a spawned boss.

- [x] **Step 1: Write failing tests** for bosses 0/1/2 easing, boss 3+ neutrality, threat-5 non-inflation, and bounded reward/special timer values.
- [x] **Step 2: Run targeted test** and verify RED.
- [x] **Step 3: Implement** pure curve and audit.
- [x] **Step 4: Integrate** callback at normal boss spawn before Apex/Mythic post-processing.
- [x] **Step 5: Run targeted plus boss regression tests** and verify PASS.

### Task 3: Thermal Budget Director

**Files:**
- Create: `src/game/endless/thermal-budget-director.ts`
- Modify: `src/game/game.ts`
- Create: `tests/endless-thermal-budget-director.test.mjs`

**Interfaces:**
- Produces: `thermalBudgetPolicy(input)` and `auditThermalBudget()`.
- Game consumes only presentation density/caps; telegraph and logic multipliers stay exactly 1.

- [x] **Step 1: Write failing tests** for cool/warm/hot classification, cap monotonicity, telegraph preservation, and low-device audit.
- [x] **Step 2: Run targeted test** and verify RED.
- [x] **Step 3: Implement** policy and audit with bounded multipliers.
- [x] **Step 4: Compose** policy into `currentAdaptiveDirector()` and `updatePresentationQuality()` after current governor/comfort rules.
- [x] **Step 5: Run governor/long-run/performance targeted regressions** and verify PASS.

### Task 4: Long-Run Reward Density

**Files:**
- Create: `src/game/endless/long-run-reward-density.ts`
- Modify: `src/game/game.ts`
- Create: `tests/endless-long-run-reward-density.test.mjs`

**Interfaces:**
- Produces: `longRunRewardDensityPolicy(elapsedSeconds, recentGoldPerMinute)` and `auditLongRunRewardDensity()`.
- Game keeps transient rolling gold-rate fields and composes the returned XP/gold multipliers only at death pickup creation.

- [x] **Step 1: Write failing tests** for pre-120 neutrality, bounded boosts, high-rate damping, and 12-hour audit.
- [x] **Step 2: Run targeted test** and verify RED.
- [x] **Step 3: Implement** pure reward-density policy/audit.
- [x] **Step 4: Add transient rolling reward-rate bookkeeping** and death reward composition without Snapshot changes.
- [x] **Step 5: Run reward/history/snapshot targeted regressions** and verify PASS.

### Task 5: Release Candidate Audit and Manifest Gate

**Files:**
- Create: `src/game/release-candidate-audit.ts`
- Modify: `src/game/release-manifest.ts`
- Modify: `scripts/release-manifest.mjs`
- Create: `scripts/release-candidate-audit.mjs`
- Modify: `package.json`
- Create: `tests/release-candidate-audit.test.mjs`
- Create: `tests/phase319-release-candidate-integration.test.mjs`

**Interfaces:**
- Produces: `releaseCandidateAudit()` with deterministic `RCQ-XXXXXXXX` signature and issues.
- Manifest accepts optional `candidateAudit:{ok:boolean;signature:string;issues:string[]}` for compatibility; production CLI supplies it.

- [x] **Step 1: Write failing tests** for aggregate PASS, deterministic signature, and fail-closed child-audit propagation.
- [x] **Step 2: Run targeted test** and verify RED.
- [x] **Step 3: Implement** aggregate audit and CLI.
- [x] **Step 4: Extend** Release Manifest evidence/markdown/signature payload and production CLI.
- [x] **Step 5: Run** `npm run verify:candidate` and `npm run verify:manifest` and verify PASS.

### Task 6: Release Documentation and Full Verification

**Files:**
- Modify: `README.md`
- Create: `docs/PHASE303-322-HANDOFF.md`
- Modify: this plan checkbox state after execution.

- [x] **Step 1: Run** `npm run build`.
- [x] **Step 2: Run** `npm test`.
- [x] **Step 3: Run** `npm run verify:raster`.
- [x] **Step 4: Run** `npm run verify:release`.
- [x] **Step 5: Run** `npm run verify:candidate`.
- [x] **Step 6: Run** `npm run verify:manifest`.
- [x] **Step 7: Run** `git diff --check` and placeholder scan.
- [x] **Step 8: Commit, merge to main, rerun full verification, HTTP smoke, archive ZIP, and verify ZIP integrity/SHA-256.
