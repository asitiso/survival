# Phase 1103~1142 Decision Continuity Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep queued player decisions inside one paused decision session, reject duplicate/stale picks, preserve decision priority and lifecycle safety, and fail release closed if decision-continuity evidence regresses.

**Architecture:** Add one pure transient decision-continuity module that owns priority resolution and a generation-based 160ms pick barrier. Existing `LevelUpOverlay` and `FateSelectOverlay` receive reusable guarded rendering rather than new UI. `Game` owns a single `continueDecisionSession()` orchestration path that renders Fate → Hero Ascension → Run Contract → Boss Reward → Level Up and only unpauses when no pending decision remains. A deterministic audit replays the pure model and is composed into Release Freeze and Candidate evidence.

**Tech Stack:** TypeScript ES2022, DOM, Node.js built-in test runner, existing release audit scripts.

**Spec:** `docs/superpowers/specs/2026-08-31-phase1103-1142-decision-continuity-port-design.md`

## Global Constraints

- combat actions remain exactly 9
- `ACTION_BUTTONS` ids / x / y / radius remain unchanged
- no auto-selection
- no new gameplay button or input mode
- `RunSnapshot` schema unchanged
- reward probabilities unchanged
- combat values unchanged
- shop/economy values unchanged
- decision priority remains Fate → Hero Ascension → Run Contract → Boss Reward → Level Up
- stale-input barrier is exactly 160ms and transient only

---

### Task 1: Pure decision priority and pick-generation guard (Phase 1103~1118)

**Files:**
- Create: `src/game/decision-continuity.ts`
- Test: `tests/decision-continuity.test.mjs`

**Interfaces:**
- Produces `DecisionKind`, `DecisionPendingState`, `nextDecisionKind(state)`, `DecisionPickGuard`, and `DECISION_TRANSITION_BARRIER_MS`.
- `DecisionPickGuard.render(nowMs)` returns a monotonically increasing generation number.
- `DecisionPickGuard.accept(generation, nowMs)` returns true exactly once for the active generation and only when `nowMs >= blockedUntilMs`.
- `DecisionPickGuard.resetTransient(nowMs)` invalidates the current generation and applies the same 160ms stale-input barrier without touching game pending state.

- [ ] **Step 1: Write failing tests for priority, duplicate rejection, barrier, and transient reset**
- [ ] **Step 2: Run `npm run build && node --test tests/decision-continuity.test.mjs` and verify RED because the module does not exist**
- [ ] **Step 3: Implement the smallest pure module satisfying the tests**
- [ ] **Step 4: Re-run the focused test and verify GREEN**
- [ ] **Step 5: Commit `feat: add transient decision continuity guard`**

### Task 2: Reusable in-place overlay generations (Phase 1111~1118)

**Files:**
- Modify: `src/ui/levelup.ts`
- Modify: `src/ui/fate-select.ts`
- Test: `tests/decision-overlay-continuity.test.mjs`

**Interfaces:**
- `open(...)` on both overlays must render without hiding between consecutive generations.
- Add `advance(...)` aliases/entry points if needed, but preserve existing callers.
- Card callbacks must not call `close()`/`hide()` before the owner decides the queue is empty.
- Owner-supplied callback remains the only state mutation point.

- [ ] **Step 1: Add static/DOM-contract tests proving pick callbacks no longer auto-close and re-render uses the existing root**
- [ ] **Step 2: Run focused test and verify RED against current close-before-callback behavior**
- [ ] **Step 3: Change overlays minimally so owner controls closing while repeated `open()` replaces card content in-place**
- [ ] **Step 4: Run overlay and existing UI-adjacent tests**
- [ ] **Step 5: Commit `feat: keep queued decision cards in place`**

### Task 3: Single Game decision continuation path (Phase 1119~1126)

**Files:**
- Modify: `src/game/game.ts`
- Test: `tests/decision-session-game-integration.test.mjs`

**Interfaces:**
- Add one private `continueDecisionSession(nowMs?: number): boolean` method.
- Add one private `finishDecisionPick(generation:number, apply:()=>void): void` or equivalent that uses the guard, applies exactly one selection, then immediately re-enters `continueDecisionSession`.
- Pending-state resolver reads `fateRuntime.pending`, `endlessState.heroAscension.pendingOffer`, `endlessState.contracts.pendingOffer`, `queuedBossRewards`, `queuedLevelUps`.
- `paused` stays true for the entire non-empty queue.
- Only the empty state closes both decision overlays and sets `paused=false`.
- Replace close/`queueMicrotask()` reopen paths for boss and level-up rewards.

- [ ] **Step 1: Add integration-source tests for preserved priority, no `queueMicrotask` reopen, and no `paused=false` inside individual reward callbacks**
- [ ] **Step 2: Run focused tests and verify RED**
- [ ] **Step 3: Implement the single continuation path and route Fate, Ascension, Contract, Boss Reward, Level Up through it**
- [ ] **Step 4: Run build plus fate/endless/upgrades/game integration focused tests**
- [ ] **Step 5: Commit `feat: serialize queued player decisions`**

### Task 4: Lifecycle stale-input invalidation without persistence mutation (Phase 1127~1134)

**Files:**
- Modify: `src/game/game.ts`
- Modify: `src/main.ts`
- Test: `tests/decision-lifecycle-safety.test.mjs`

**Interfaces:**
- Add public `resetTransientDecisionInput()` on `Game` that calls the decision guard transient reset and `input.resetTransient()`.
- `pageshow`, `resize`, and `orientationchange` use this method.
- `checkpointForLifecycle()` invalidates decision input after saving/checkpointing.
- Pending decision state remains untouched; no snapshot fields are added.
- Visibility resume does not unpause an active decision session.

- [ ] **Step 1: Add lifecycle tests proving stale generation invalidation, pending preservation, and no `RunSnapshot` shape change**
- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Wire lifecycle reset to the transient guard without changing persistence schema**
- [ ] **Step 4: Run lifecycle, snapshot, BFCache, viewport-storm tests**
- [ ] **Step 5: Commit `fix: invalidate stale decision input on lifecycle changes`**

### Task 5: Deterministic decision continuity audit (Phase 1135~1140)

**Files:**
- Create: `src/game/decision-continuity-audit.ts`
- Test: `tests/decision-continuity-audit.test.mjs`

**Interfaces:**
- Export `DecisionContinuityAudit` and `auditDecisionContinuity()`.
- Audit covers stacked level-ups 1..6, repeated boss rewards, five priority levels + empty, exactly-once, 160ms new-generation barrier, transient reset, pending preservation, no auto-selection, action count 9, snapshot mutation false, economy mutation false.
- Return deterministic `samples`, issue list, and `passed`.

- [ ] **Step 1: Add failing audit tests for all invariant fields**
- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Implement audit from the pure decision-continuity module and frozen constants**
- [ ] **Step 4: Re-run audit test twice and prove deterministic equality**
- [ ] **Step 5: Commit `test: add deterministic decision continuity audit`**

### Task 6: Release Freeze and Candidate fail-closed evidence (Phase 1141~1142)

**Files:**
- Modify: `src/game/release-freeze-audit.ts`
- Modify: `src/game/release-candidate-audit.ts`
- Test: `tests/phase1139-1142-decision-continuity-release-gate.test.mjs`

**Interfaces:**
- `ReleaseFreezeAudit` adds `decisionContinuityPassed:boolean` and `decisionContinuitySamples:number`.
- `auditReleaseFreeze()` includes `auditDecisionContinuity()` and cannot pass if it fails.
- Candidate `releaseFreezeConsistent` independently requires `decisionContinuityPassed` even when child `passed` is forged true.
- Candidate signature payload includes both decision continuity fields.
- Candidate markdown/summary expose compact decision evidence.

- [ ] **Step 1: Add failing tests for Freeze evidence, forged-child fail-closed behavior, and signature mutation**
- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Add decision audit composition to Freeze and Candidate**
- [ ] **Step 4: Run release-candidate and release-freeze focused tests**
- [ ] **Step 5: Commit `release: gate candidate on decision continuity`**

### Task 7: Handoff, full regression, release verification, merge, deterministic archive

**Files:**
- Create: `PHASE1103-1142-HANDOFF.md`
- Generated final manifest: `phase1142-main-release-manifest.json`

**Interfaces:**
- Handoff records authoritative source provenance `bdf956114b09414999b3f2c23a0376983c58193b`, local reconstructed baseline SHA separately, feature/main SHA, tests, release signatures, archive parity, and deterministic archive SHA.

- [ ] **Step 1: Run `npm test` and `npm run build` in feature worktree**
- [ ] **Step 2: Run `npm run verify:candidate`, `npm run verify:raster`, `npm run verify:release`, and manifest generation**
- [ ] **Step 3: Commit handoff and generated manifest only if repository policy tracks equivalent artifacts**
- [ ] **Step 4: Merge feature branch to local reconstructed `main`, rerun full regression and release verification on merged main**
- [ ] **Step 5: Remove feature worktree/branch after verification**
- [ ] **Step 6: Generate two source ZIPs from exact clean local main using sorted tracked files, fixed timestamps, and source revision comment; compare SHA-256 byte-for-byte**
- [ ] **Step 7: Verify tracked parity, ZIP integrity, archive provenance, packaged runtime, and new/checkpoint/resume cycle; write final manifest/handoff values**
