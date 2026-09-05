# Phase 63-82 Endgame Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add automatic Final Form signatures, Mythic Last Law, long-run Oaths, Build Capsules, and a hysteresis mobile frame governor while preserving Phase 62 controls and save compatibility.

**Architecture:** New behavior is implemented as focused deterministic modules under `src/game/endless/`, persisted through the existing extension snapshot, and connected to `game.ts` through the existing event/modifier/result paths. No subsystem owns enemies/spells/UI directly; the host consumes bounded state and modifiers.

**Tech Stack:** TypeScript, browser Canvas game runtime, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-phase63-82-endgame-product-design.md`

## Global Constraints
- Keep exactly 9 combat actions.
- No new combat management screen.
- Phase 62 snapshots must migrate safely.
- Presentation degrades before combat simulation.
- All late-game multipliers are bounded.

---

### Task 1: Final Form Signature runtime
**Files:**
- Create: `src/game/endless/final-form-signature.ts`
- Modify: `src/game/endless/snapshot.ts`
- Modify: `src/game/endless/runtime.ts`
- Test: `tests/endless-final-form-signature.test.mjs`

**Interfaces:**
- Produces `FinalFormSignatureState`, `advanceFinalFormSignature`, `finalFormSignatureModifiers`, `finalFormSignatureProfile`.
- Snapshot field: `signature`.

- [ ] Write failing tests for 12 profile identities, event charge, auto activation, cooldown, bounded modifiers, and snapshot restore.
- [ ] Run `npm test -- --test-name-pattern="signature"` and verify RED.
- [ ] Implement minimal deterministic signature runtime and snapshot sanitizer.
- [ ] Run targeted tests and verify GREEN.
- [ ] Commit `feat: add final form signature runtime`.

### Task 2: Mythic Last Law
**Files:**
- Create: `src/game/endless/mythic-last-law.ts`
- Modify: `src/game/game.ts`
- Test: `tests/endless-mythic-last-law.test.mjs`

**Interfaces:**
- Produces `mythicLastLawProfile(profile, hpRatio, nodesAlive, nodeTotal)` and bounded combat/presentation modifiers.

- [ ] Write failing threshold/counterplay/cap/reward tests.
- [ ] Verify RED.
- [ ] Implement phase-four profile and host modifier integration.
- [ ] Verify targeted GREEN and existing Mythic tests.
- [ ] Commit `feat: add mythic last law phase`.

### Task 3: Long-Run Oaths
**Files:**
- Create: `src/game/endless/long-run-oaths.ts`
- Modify: `src/game/endless/types.ts`
- Modify: `src/game/endless/snapshot.ts`
- Modify: `src/game/endless/runtime.ts`
- Modify: `src/game/game.ts`
- Test: `tests/endless-long-run-oaths.test.mjs`

**Interfaces:**
- Produces `LongRunOathState`, `advanceLongRunOaths`, `longRunOathModifiers`, `oathHudLine`.
- Runtime emits `oath_started`, `oath_completed`, `oath_failed` effects.

- [ ] Write failing milestone/progress/one-shot/reward/snapshot tests.
- [ ] Verify RED.
- [ ] Implement deterministic Oath runtime and effects.
- [ ] Connect bounded reward/HUD handling in host.
- [ ] Verify GREEN and commit `feat: add long run oath objectives`.

### Task 4: Build Capsule
**Files:**
- Create: `src/domain/build-capsule.ts`
- Modify: `src/domain/run-records.ts`
- Modify: `src/ui/results.ts`
- Modify: `src/game/game.ts`
- Test: `tests/build-capsule.test.mjs`

**Interfaces:**
- Produces `encodeBuildCapsule`, `decodeBuildCapsule`, `BuildCapsulePayload`.
- Result optional field: `buildCapsule`.
- Run record optional field: `buildCapsule`.

- [ ] Write failing deterministic encode/decode/tamper/sanitize tests.
- [ ] Verify RED.
- [ ] Implement compact versioned capsule with checksum.
- [ ] Add result/recent-record plumbing without new screen.
- [ ] Verify GREEN and commit `feat: add portable build capsules`.

### Task 5: Mobile Frame Governor + 12-hour audit
**Files:**
- Create: `src/game/endless/mobile-frame-governor.ts`
- Create: `src/game/endless/twelve-hour-auditor.ts`
- Modify: `src/game/endless/snapshot.ts`
- Modify: `src/game/game.ts`
- Test: `tests/endless-mobile-frame-governor.test.mjs`

**Interfaces:**
- Produces `advanceMobileFrameGovernor`, `mobileFrameGovernorDensities`, `auditTwelveHourRun`.
- Snapshot field: `frameGovernor`.

- [ ] Write failing hysteresis/no-flicker/presentation-first/720-minute audit tests.
- [ ] Verify RED.
- [ ] Implement governor and snapshot sanitizer.
- [ ] Apply density override to existing adaptive presentation path only.
- [ ] Verify GREEN and commit `feat: add mobile frame governor`.

### Task 6: Product integration and release gate
**Files:**
- Modify: `src/game/game.ts`
- Modify: `README.md`
- Create: `docs/PHASE63-82-HANDOFF.md`
- Test: `tests/endless-phase63-82-integration.test.mjs`

**Interfaces:**
- Host keeps existing 9 actions and consumes all new modules through existing event/modifier/result hooks.

- [ ] Write failing integration assertions for action count, HUD compactness, result capsule, resume determinism, and final-phase host modifiers.
- [ ] Verify RED then implement minimal host wiring.
- [ ] Run `npm test` and require 0 failures.
- [ ] Run `npm run build` and `git diff --check`.
- [ ] Commit `feat: integrate phase 63-82 endgame product systems`.
