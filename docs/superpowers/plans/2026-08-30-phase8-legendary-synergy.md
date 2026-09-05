# Phase 8 Legendary Effects and Synergy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add eight dynamic legendary effects, ten automatic synergies, and three boss-archetype relics without adding a new inventory UI.

**Architecture:** Pure synergy/relic selection logic is separated from a small run-state legendary controller. Game integration only forwards existing run events and composes returned multipliers.

**Tech Stack:** TypeScript ES2022, HTML5 Canvas, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-phase8-legendary-synergy-design.md`

## Global Constraints

- Keep one weapon, one armor, and one relic slot.
- Keep enemy cap at 320.
- Use existing boss reward overlay and HUD.
- Every production behavior begins with a failing test.

---

### Task 1: Legendary Runtime Controller

**Files:**
- Create: `src/game/legendary-effects.ts`
- Test: `tests/legendary-effects.test.mjs`

**Interfaces:**
- Produces `LegendaryEffectController`, `legendaryRuntimeModifiers()`, event methods for kill, movement, health/core state, and pickup magnet pulse.

- [ ] Write failing tests for all eight trigger identities, cooldowns, bounded buffs, and reset behavior.
- [ ] Run `npm test` and verify the new module tests fail because the module is absent.
- [ ] Implement the controller with no enemy-owned state.
- [ ] Run `npm test` and verify all tests pass.
- [ ] Commit `feat: add legendary runtime effects`.

### Task 2: Synergy Detection and Modifiers

**Files:**
- Create: `src/game/synergies.ts`
- Test: `tests/synergies.test.mjs`

**Interfaces:**
- Consumes hero id, run trait, relic id, weapon, armor.
- Produces `activeSynergies()` and one combined `SynergyModifiers` object.

- [ ] Write failing tests covering all ten synergies, inactive near-misses, and max two HUD names helper.
- [ ] Run tests and confirm RED.
- [ ] Implement pure detection and modifier composition.
- [ ] Run tests and confirm GREEN.
- [ ] Commit `feat: add automatic build synergies`.

### Task 3: Boss-Archetype Relics

**Files:**
- Modify: `src/game/relics.ts`
- Modify: `src/game/enemies.ts`
- Modify: `src/game/upgrades.ts`
- Test: `tests/relics.test.mjs`
- Test: `tests/upgrades.test.mjs`
- Test: `tests/enemies.test.mjs`

**Interfaces:**
- `EnemyDeathEvent.bossArchetype?: BossArchetype`.
- `buildBossRewardChoices(..., bossArchetype?)` includes the matching boss relic.

- [ ] Add failing tests for three relic modifiers, archetype filtering, and boss death metadata.
- [ ] Run tests and confirm RED.
- [ ] Implement definitions, death metadata, and reward selection.
- [ ] Run full tests and confirm GREEN.
- [ ] Commit `feat: add boss archetype relics`.

### Task 4: Phase 8 Game Integration

**Files:**
- Modify: `src/game/game.ts`
- Modify: `src/game/pickups.ts`
- Test: `tests/legendary-integration.test.mjs`

**Interfaces:**
- `PickupManager.setGlobalMagnet(seconds)` or equivalent bounded API.
- Game composes equipment + relic + synergy + legendary runtime modifiers.

- [ ] Add failing integration tests for proc composition, bonus gold, boss relic context, and magnet pulse.
- [ ] Run tests and confirm RED.
- [ ] Wire controller events and synergy modifiers into the run loop.
- [ ] Render at most two synergy names in the existing HUD.
- [ ] Run full tests and build.
- [ ] Commit `feat: connect legendary effects and synergies`.
