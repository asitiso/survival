# Phase 7 Relics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one-slot boss-exclusive relics that alter universal combat stats or hero-specific passives while reusing the existing boss reward UI.

**Architecture:** A pure `relics.ts` module defines relic identity and modifiers. Boss reward generation returns a discriminated reward union, the generic card overlay renders either reward type, and `Game` owns the single active relic and composes its modifiers at existing stat/passive integration points.

**Tech Stack:** TypeScript, HTML5 Canvas, DOM overlays, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-phase7-relics-design.md`

## Global Constraints
- Landscape mobile UI remains 1600x900 logical resolution.
- Exactly one relic slot exists per run.
- Relics are boss-exclusive and run-local.
- Every boss reward contains exactly one relic card and two normal growth cards.
- No new inventory screen, currency, crafting system, or permanent relic progression.
- Existing 320 enemy mobile cap remains unchanged.

---

### Task 1: Pure relic definitions and modifiers

**Files:**
- Create: `src/game/relics.ts`
- Create: `tests/relics.test.mjs`

**Interfaces:**
- Produces: `RelicId`, `RelicDefinition`, `RelicModifiers`, `relicDefinition(id)`, `relicCandidates(heroId, activeRelic, rng)`, `relicModifiers(id, heroId)`.

- [ ] **Step 1: Write failing tests** for universal/hero-specific pools, active-rellic exclusion, and modifier tradeoffs.
- [ ] **Step 2: Run `npm test`** and confirm failure because `dist/game/relics.js` does not exist.
- [ ] **Step 3: Implement `src/game/relics.ts`** with the seven fixed definitions and neutral-safe modifiers.
- [ ] **Step 4: Run `npm test`** and confirm the relic tests and all prior tests pass.

### Task 2: Boss reward union

**Files:**
- Modify: `src/game/upgrades.ts`
- Modify: `tests/upgrades.test.mjs`

**Interfaces:**
- Produces: `BossRewardChoice = UpgradeRewardChoice | RelicRewardChoice` and `buildBossRewardChoices(spells, rng, heroId, activeRelic)`.

- [ ] **Step 1: Add failing tests** asserting exactly one relic and two upgrade rewards, matching-hero relic eligibility, and replacement copy.
- [ ] **Step 2: Run `npm test`** and verify failure against the current upgrade-only boss reward implementation.
- [ ] **Step 3: Implement the discriminated reward union** while keeping level-up choices unchanged.
- [ ] **Step 4: Run `npm test`** and confirm all tests pass.

### Task 3: Generic reward-card overlay

**Files:**
- Modify: `src/ui/levelup.ts`

**Interfaces:**
- Consumes: any `{ title: string; description: string; accent: string }` card type.
- Produces: generic `open<T extends ChoiceCard>(choices: T[], onPick: (choice: T) => void, copy?)`.

- [ ] **Step 1: Use the Task 2 compile failure as the red signal** if `BossRewardChoice` cannot be passed safely to the overlay.
- [ ] **Step 2: Generalize the overlay typing without changing rendered markup or behavior.**
- [ ] **Step 3: Run `npm test`** and confirm compile plus regressions pass.

### Task 4: Relic integration in the run

**Files:**
- Modify: `src/game/game.ts`
- Modify: `src/game/hero-passives.ts`
- Create: `tests/relic-integration.test.mjs`

**Interfaces:**
- Game state: `activeRelic: RelicId | null` reset to null on every run.
- Passive helpers: Kain overload helpers accept relic-derived rate/maximum cooldown strength.

- [ ] **Step 1: Add failing tests** for Kain overload rate/strength and pure relic modifier composition used by Game.
- [ ] **Step 2: Run `npm test`** and confirm the passive signatures/behavior fail as expected.
- [ ] **Step 3: Implement active relic state and compose universal modifiers** into spell power, cooldown, movement, damage taken, area, gold, and core damage at existing integration points.
- [ ] **Step 4: Implement hero-specific hooks** for Arkan explosion chance/radius, Kain overload, and Edric aura radius/mitigation; Seria uses area/cooldown modifiers.
- [ ] **Step 5: Update boss reward handling** so selecting a relic equips/replaces it and selecting an upgrade still calls `applyUpgrade`.
- [ ] **Step 6: Run `npm test`** and confirm all tests pass.

### Task 5: HUD and results visibility

**Files:**
- Modify: `src/game/game.ts`
- Modify: `src/ui/results.ts`
- Modify: `tests/final-systems.test.mjs`

**Interfaces:**
- `RunResult` gains `relic: string`.

- [ ] **Step 1: Add a failing result-model assertion** that a run result exposes the relic display string.
- [ ] **Step 2: Render one compact relic chip in the existing HUD** and pass the final relic name into results.
- [ ] **Step 3: Run `npm test`** and confirm all tests pass.

### Task 6: Final verification and artifact

**Files:**
- Modify: `README.md`

**Interfaces:** None.

- [ ] **Step 1: Document Phase 7 relic behavior and controls.**
- [ ] **Step 2: Run `npm test`** and require zero failures.
- [ ] **Step 3: Run `npm run build`** and require exit code 0.
- [ ] **Step 4: Serve `dist` on a fresh local port and verify `/`, `main.js`, `game/relics.js`, and `game/game.js` return HTTP 200.**
- [ ] **Step 5: Create `/mnt/data/arcane-last-stand-phase7.zip` from the verified tree and run `unzip -t` with no errors.**
