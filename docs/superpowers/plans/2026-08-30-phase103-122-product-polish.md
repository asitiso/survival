# Phase 103-122 Product Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make replay guidance, Mythic arenas, Final Form movement, long-run recaps, and landscape controls materially clearer without adding combat actions or blocking UI.

**Architecture:** Add five small pure modules and connect them through existing Game/endless snapshot/input owners. Existing systems remain authoritative; new modules derive modifiers/presentation only.

**Tech Stack:** TypeScript, browser Canvas 2D, Node test runner, localStorage snapshot persistence.

**Spec:** `docs/superpowers/specs/2026-08-30-phase103-122-product-polish-design.md`

## Global Constraints
- Exactly 9 combat Action IDs remain.
- No new modal for replay guidance, recap, or mobility.
- Existing hazard cap remains <= 8 and danger telegraph capacity remains protected.
- RunSnapshot stays schema version 1; endless extension is migration-safe.
- TDD: test must fail for missing behavior before implementation.

---

### Task 1: Replay Guidance (Phase 103-106)
**Files:**
- Create: `src/domain/build-replay-guidance.ts`
- Modify: `src/game/game.ts`
- Test: `tests/build-replay-guidance.test.mjs`

**Interfaces:**
- Consumes: `BuildReplayPlan`, current `BuildCapsulePayload`.
- Produces: `replayGuidance(plan, current): { progress:number; label:string; category:string }`.

- [ ] Write failing tests for deterministic priority, spell-level labels, completion, and bounded one-line copy.
- [ ] Run targeted test and confirm missing-module failure.
- [ ] Implement pure guidance ranking and label formatting.
- [ ] Run targeted test to green.
- [ ] Connect HUD replay line to guidance while preserving four-line cap.
- [ ] Run replay and integration tests.

### Task 2: Mythic Arena Identity (Phase 107-110)
**Files:**
- Create: `src/game/endless/mythic-arena-identity.ts`
- Modify: `src/game/game.ts`
- Test: `tests/endless-mythic-arena-identity.test.mjs`

**Interfaces:**
- Consumes: `BossArchetype`, base `BossArenaMutationModifiers`, weakpoint ratio.
- Produces: bounded `MythicArenaIdentityProfile` modifiers and label.

- [ ] Write failing tests for six distinct archetypes, safety floors, max hazard cap, and weakpoint relief.
- [ ] Run targeted RED.
- [ ] Implement bounded profiles.
- [ ] Run targeted GREEN.
- [ ] Compose with existing arena modifiers in Game.
- [ ] Run boss arena/Mythic regression tests.

### Task 3: Final Form Mobility (Phase 111-114)
**Files:**
- Create: `src/game/endless/final-form-mobility.ts`
- Modify: `src/game/game.ts`
- Test: `tests/endless-final-form-mobility.test.mjs`

**Interfaces:**
- Consumes: `HeroFinalFormId`, signature active edge.
- Produces: move/turn/displacement multipliers and one bounded signature impulse.

- [ ] Write failing tests for 12 forms, bounded speed, distinct mobility families, and one-shot impulse.
- [ ] Run targeted RED.
- [ ] Implement stateless profiles plus edge helper.
- [ ] Run targeted GREEN.
- [ ] Compose move speed and signature activation impulse in Game.
- [ ] Run movement/final-form regression tests.

### Task 4: Run Milestone Recap (Phase 115-118)
**Files:**
- Create: `src/game/endless/run-milestone-recap.ts`
- Modify: `src/game/endless/types.ts`, `src/game/endless/snapshot.ts`, `src/game/endless/runtime.ts`, `src/game/game.ts`
- Test: `tests/endless-run-milestone-recap.test.mjs`

**Interfaces:**
- Consumes: elapsed, kills, bosses, fingerprint/build summary.
- Produces: migration-safe recap state and at most one new receipt per update.

- [ ] Write failing tests for 120/240/360/480/720 milestones, catch-up collapse, and snapshot migration.
- [ ] Run targeted RED.
- [ ] Implement recap state/advance helper.
- [ ] Run targeted GREEN.
- [ ] Add state to extension snapshot and runtime effect.
- [ ] Render one non-blocking toast/compact HUD recap in Game.
- [ ] Run snapshot/runtime regression tests.

### Task 5: Landscape HUD & Touch Ergonomics (Phase 119-122)
**Files:**
- Create: `src/game/landscape-hud.ts`
- Modify: `src/core/input.ts`, `src/game/game.ts`
- Test: `tests/landscape-hud-touch.test.mjs`

**Interfaces:**
- Produces: `compactStatusLine`, `safeJoystickOrigin`, `hudNoTouchRects`.

- [ ] Write failing tests for width-bounded status copy, joystick clamping, unchanged action count, and no-touch safety.
- [ ] Run targeted RED.
- [ ] Implement pure layout helpers.
- [ ] Run targeted GREEN.
- [ ] Integrate status compaction and joystick origin clamping.
- [ ] Run mobile/input regression tests.

### Task 6: Integration and Release
**Files:**
- Modify: `README.md`
- Create: `docs/PHASE103-122-HANDOFF.md`, `tests/phase103-122-integration.test.mjs`

- [ ] Add integration tests proving nine actions unchanged and all new modules are wired into owners.
- [ ] Run full `npm test`.
- [ ] Run `npm run build` and `git diff --check`.
- [ ] Commit feature branch.
- [ ] Re-run full verification on committed branch.
- [ ] Fast-forward `main` from the verified branch, as explicitly requested by the continuing workflow.
- [ ] Re-run full verification on merged `main`.
- [ ] HTTP smoke core/new compiled modules.
- [ ] Create Git HEAD ZIP, `unzip -t`, and SHA-256.
