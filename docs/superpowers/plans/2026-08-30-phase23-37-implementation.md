# Phase 23–37 Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Phase 23–27 into the uploaded Phase 22 source and extend the endless runtime through Phase 37 while preserving the nine-action mobile control model.

**Architecture:** Keep new logic isolated in `src/game/endless/`, bridge it once from `Game`, and persist it as one compact optional run-snapshot field. Late-game systems emit bounded modifiers and presentation directives rather than owning combat entities.

**Tech Stack:** TypeScript ES2022, browser Canvas/DOM, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-phase23-37-design.md`

## Global Constraints
- Exactly 9 combat actions.
- No enemy/projectile coordinate arrays in snapshots.
- Numeric endless scaling caps at Tier X.
- Low-device optimization reduces visuals before enemy logic.
- Existing 343 tests remain green.

---

### Task 1: Phase 23–27 core runtime
**Files:** Create `src/game/endless/{types,rng,contracts,world-evolution,nemesis,ascension,telemetry,performance-budget,balance-simulator-v2,runtime}.ts`; Test `tests/endless-core.test.mjs`.
- [ ] Write failing core tests for deterministic RNG, contracts, world evolution, nemesis, ascension and performance guard.
- [ ] Run targeted test and confirm RED.
- [ ] Implement minimal runtime modules.
- [ ] Run targeted test and confirm GREEN.
- [ ] Commit.

### Task 2: Snapshot V2 host integration
**Files:** Modify `src/domain/run-snapshot.ts`; Test `tests/endless-snapshot.test.mjs`.
- [ ] Write migration/extension/checksum tests.
- [ ] Confirm RED.
- [ ] Add optional compact `endless` field and safe migration.
- [ ] Confirm GREEN and existing snapshot tests.
- [ ] Commit.

### Task 3: Game bridge and contract selection
**Files:** Modify `src/game/game.ts`; Test `tests/endless-host-contract.test.mjs`.
- [ ] Write host adapter/effect routing tests around exported pure helpers.
- [ ] Confirm RED.
- [ ] Add legacy view adapter, event bridge, runtime state, contract modal routing and snapshot restore/save.
- [ ] Confirm GREEN.
- [ ] Commit.

### Task 4: Phase 28–32 late-game systems
**Files:** Create `src/game/endless/{boss-arena-mutations,hero-ascension,relic-resonance,adaptive-director,chronicle}.ts`; Test `tests/endless-late-game.test.mjs`.
- [ ] Write tests for boss-space mutation, hero-specific ascension, resonance, capped adaptive pressure and milestone recognition.
- [ ] Confirm RED.
- [ ] Implement modules.
- [ ] Confirm GREEN.
- [ ] Commit.

### Task 5: Phase 33–37 mythic/product systems
**Files:** Create `src/game/endless/{mythic-boss,run-fingerprint,balance-simulator-v3}.ts`; Modify runtime/snapshot/HUD/results integration as needed; Test `tests/endless-mythic-product.test.mjs`.
- [ ] Write tests for mythic bosses, run fingerprints, snapshot integrity, 120/180 minute balance and action-count invariant.
- [ ] Confirm RED.
- [ ] Implement and integrate.
- [ ] Confirm GREEN.
- [ ] Commit.

### Task 6: Full verification and package
**Files:** README/docs plus generated ZIP only.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Run `git diff --check` and verify clean tree after commit.
- [ ] Start HTTP server and verify `/`, `/dist/main.js`, endless modules and game module return 200.
- [ ] Create source ZIP excluding `.git`, `.worktrees`, and transient artifacts.
- [ ] Run `unzip -t` and SHA-256.
