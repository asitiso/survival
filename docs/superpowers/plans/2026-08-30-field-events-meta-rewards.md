# Phase 5 Field Events & Meta Rewards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add non-overlapping field events, richer catastrophe modifiers, and persistent Arcane Shard run rewards to the existing landscape mobile endless-defense loop.

**Architecture:** A pure `FieldEventDirector` owns event schedule/state and returns modifiers/transitions. `Game` applies those transitions through existing systems, while `EnemyManager` exposes narrowly scoped event-spawn helpers. Meta reward calculation and persistence live in a separate domain module.

**Tech Stack:** TypeScript, HTML5 Canvas, DOM overlays, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-field-events-meta-rewards-design.md`

## Global Constraints
- Keep the existing 16:9 landscape mobile control layout.
- At most one field event may be active.
- Never start an event within 12 seconds of an approaching boss.
- Preserve the existing enemy budget cap and avoid per-frame DOM work.
- Run gold remains run-local; Arcane Shards persist separately.

---

### Task 1: Field Event Director

**Files:**
- Create: `src/game/field-events.ts`
- Test: `tests/field-events.test.mjs`

**Interfaces:**
- Produces `FieldEventDirector`, `ActiveFieldEvent`, `fieldEventModifiers()` and event start/end transitions.

- [ ] **Step 1: Write failing tests** for first eligibility, boss-window suppression, no overlap, non-repeating selection, duration expiry, and modifier values.
- [ ] **Step 2: Run** `npm test -- --test-name-pattern="field event"` and confirm missing-module failure.
- [ ] **Step 3: Implement** deterministic scheduling with injectable RNG and data-driven event specs.
- [ ] **Step 4: Run** `npm test` and confirm all tests pass.
- [ ] **Step 5: Commit** `feat: add rotating field event director`.

### Task 2: Event Enemies and Arena Rewards

**Files:**
- Modify: `src/game/enemies.ts`
- Modify: `src/game/game.ts`
- Test: `tests/event-integration.test.mjs`

**Interfaces:**
- `EnemyManager.spawnEventEnemy(type, danger, target, pos?) -> number`
- `EnemyManager.removeEnemyById(id) -> void`
- Golden enemy death remains a standard `EnemyDeathEvent` with type `golden`.

- [ ] **Step 1: Write failing tests** for golden stats, fleeing behavior, explicit event spawning/removal, and elite-rush spawn helpers.
- [ ] **Step 2: Run targeted tests** and verify RED.
- [ ] **Step 3: Implement** golden enemy and public event-spawn helpers without exposing general internals.
- [ ] **Step 4: Wire Game** to spawn/expire golden goblins, crates, elite rushes, and apply event modifiers.
- [ ] **Step 5: Run full tests** and commit `feat: connect field events to endless combat`.

### Task 3: Catastrophe Modifier Model

**Files:**
- Modify: `src/domain/catastrophe.ts`
- Modify: `src/game/game.ts`
- Modify: `src/game/enemies.ts`
- Test: `tests/final-systems.test.mjs`

**Interfaces:**
- `catastropheModifiers(catastrophe)` returns neutral defaults plus gold, speed, cooldown, spawn, elite-rate, and core-damage multipliers.

- [ ] **Step 1: Extend failing catastrophe tests** to require at least four rotating identities and both helpful and harmful modifiers.
- [ ] **Step 2: Run targeted test** and verify RED.
- [ ] **Step 3: Implement** data-driven catastrophe modifiers and consume them in Game/EnemyManager.
- [ ] **Step 4: Run full tests** and commit `feat: diversify endless catastrophe modifiers`.

### Task 4: Persistent Arcane Shards and Results

**Files:**
- Create: `src/domain/meta-rewards.ts`
- Modify: `src/ui/results.ts`
- Modify: `src/game/game.ts`
- Modify: `src/styles.css`
- Test: `tests/meta-rewards.test.mjs`

**Interfaces:**
- `calculateArcaneShards(input) -> number`
- `loadArcaneShards(storage) -> number`
- `saveArcaneShards(storage, amount) -> void`
- `RunResult` gains `shardsEarned` and `shardsTotal`.

- [ ] **Step 1: Write failing tests** for deterministic reward calculation, malformed storage fallback, and save/load persistence.
- [ ] **Step 2: Run targeted tests** and verify RED.
- [ ] **Step 3: Implement** meta reward functions and game-over accumulation.
- [ ] **Step 4: Update results UI** with earned and total shard values.
- [ ] **Step 5: Run full tests** and commit `feat: award persistent arcane shards`.

### Task 5: Final Verification and Package

**Files:**
- Modify: `README.md`
- Create artifact: `/mnt/data/arcane-last-stand-phase5.zip`

- [ ] **Step 1: Run** `npm test` and require zero failures.
- [ ] **Step 2: Run** `npm run build` and require exit code 0.
- [ ] **Step 3: Serve current worktree** and require HTTP 200 for `index.html`, `dist/main.js`, `dist/game/field-events.js`, and `dist/domain/meta-rewards.js`.
- [ ] **Step 4: Update README** with Phase 5 systems and controls.
- [ ] **Step 5: Package source** excluding `.git`, `.worktrees`, and build caches; test ZIP integrity.
- [ ] **Step 6: Commit** documentation/package metadata changes and re-run full tests.
