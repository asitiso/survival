# Phase 1143-1182 Combat Input Leniency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Preserve a manual spell/ultimate tap made at most 0.20 seconds before cooldown readiness and cast it exactly once when ready, without changing cooldowns, damage, AUTO throughput, action count, or snapshot schema.

**Architecture:** Add a small pure `CastIntentBuffer` between `InputState` and `SpellSystem`. `InputState` remains the raw input source; the game consumes discrete pressed events, queues only near-ready manual cast intents, flushes queued manual intents before AUTO/hold casting, and clears transient intents on decision/pause/lifecycle transitions. HUD reads queue state only to replace the existing secondary spell label with `QUEUED`.

**Tech Stack:** TypeScript, DOM/Canvas input loop, Node test runner.

**Spec:** Approved in chat for Phase 1143-1182.

## Global Constraints

- Early tap window is at most 0.20 seconds.
- Six combat cast actions only: spell1-4 and ultimate1-2.
- Maximum one queued intent per action.
- Manual queued intent resolves before AUTO on readiness.
- No cooldown, damage, economy, action-count, or snapshot-schema changes.
- Pause, decision, visibility/background, BFCache/lifecycle reset, shop transition, and run reset clear queued cast intents.
- No new button, popup, or screen effect.

---

### Task 1: Pure Cast Intent Buffer

**Files:**
- Create: `src/game/cast-intent-buffer.ts`
- Create: `tests/cast-intent-buffer.test.mjs`

**Interfaces:**
- Produces: `CAST_INTENT_BUFFER_WINDOW_SECONDS`, `COMBAT_CAST_ACTIONS`, `CastIntentBuffer`.

- [x] Write failing tests for 0.20s boundary, rejection outside window, duplicate coalescing, readiness consumption, and clear.
- [x] Run focused test and confirm RED because module does not exist.
- [x] Implement minimal pure buffer.
- [x] Run focused test and confirm GREEN.
- [x] Commit.

### Task 2: Game Input Integration and Manual Priority

**Files:**
- Modify: `src/game/game.ts`
- Create: `tests/phase1143-1158-cast-buffer-integration.test.mjs`

**Interfaces:**
- Consumes: `CastIntentBuffer`.
- Produces: pressed tap -> immediate manual cast if ready, queue if cooldown <=0.20, queued manual flush before AUTO/hold.

- [x] Write failing static/integration-boundary tests for pressed consumption, queue-before-AUTO ordering, and six-action scope.
- [x] Verify RED.
- [x] Add buffer property and focused helper methods without moving `SpellSystem.update()` ordering.
- [x] Verify focused tests and existing opening AUTO/hold tests GREEN.
- [x] Commit.

### Task 3: QUEUED HUD Feedback

**Files:**
- Modify: `src/game/game.ts`
- Create: `tests/phase1159-1166-buffered-readiness-feedback.test.mjs`

**Interfaces:**
- Consumes: `castIntentBuffer.isQueued(action)`.
- Produces: spell/ultimate secondary label `QUEUED` only while that action has a buffered manual intent.

- [x] Write failing test that queue feedback replaces only the secondary spell label and adds no action surface.
- [x] Verify RED.
- [x] Implement minimal HUD label override.
- [x] Verify GREEN.
- [x] Commit.

### Task 4: Pause / Decision / Lifecycle Safety

**Files:**
- Modify: `src/game/game.ts`
- Create: `tests/phase1167-1174-cast-buffer-lifecycle.test.mjs`

**Interfaces:**
- Produces: `clearBufferedCastIntents()` called from lifecycle checkpoint transient reset, manual pause entry, decision session start, shop open, and run reset.

- [x] Write failing boundary tests for every required transient clear site.
- [x] Verify RED.
- [x] Implement one clear helper and call it only on transition into non-combat/transient-reset states.
- [x] Verify focused lifecycle + decision continuity regressions GREEN.
- [x] Commit.

### Task 5: Combat Input Reliability Audit

**Files:**
- Create: `src/game/combat-input-reliability-audit.ts`
- Create: `tests/combat-input-reliability-audit.test.mjs`

**Interfaces:**
- Produces: `auditCombatInputReliability()` with timing, exactly-once, manual-priority, lifecycle-clear, six-cast-action, nine-action, snapshot/economy/damage/cooldown mutation evidence.

- [x] Write failing audit test with exact sample expectations.
- [x] Verify RED.
- [x] Implement deterministic audit from pure buffer behavior and invariants.
- [x] Verify GREEN.
- [x] Commit.

### Task 6: Release Fail-Closed Evidence

**Files:**
- Modify: `src/game/release-freeze-audit.ts`
- Modify: `src/game/release-candidate-audit.ts`
- Create: `tests/phase1181-1182-combat-input-release-gate.test.mjs`

**Interfaces:**
- Release freeze adds `combatInputReliabilityPassed` and `combatInputReliabilitySamples`.
- Candidate consistency requires the pass boolean and hashes sample count into signature.

- [x] Write failing tests for freeze evidence, false-pass fail-closed, and sample-signature mutation.
- [x] Verify RED.
- [x] Wire audit into freeze and candidate signature/consistency.
- [x] Verify GREEN.
- [x] Commit.

### Task 7: Full Verification and Release Packaging

**Files:**
- Create: `PHASE1143-1182-HANDOFF.md`
- Generated outside repo: Phase 1182 release manifest and deterministic ZIP.

- [ ] Run build.
- [ ] Run every test file in bounded shards and confirm zero failures.
- [ ] Run candidate, raster, release, archive provenance, archive reproducibility, packaged runtime, and run-cycle checks.
- [ ] Write handoff with fresh evidence and commit.
- [ ] Fast-forward main, repeat merged-main verification, create two independent archives, compare SHA-256, and clean feature worktree/branch.
