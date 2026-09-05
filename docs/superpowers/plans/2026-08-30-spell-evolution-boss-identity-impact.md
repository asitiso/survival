# Spell Evolution, Boss Identity, and Combat Impact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make level milestones visibly transform spells, make bosses feel like distinct encounters, and strengthen combat feedback without adding new player-facing menus.

**Architecture:** Keep the existing six-slot spell API and `SpellSystem.levels` persistence. Add milestone evolution metadata that augments existing hero identities at Lv.5 and Lv.10, add boss archetype metadata consumed by the existing boss special scheduler, and extend the lightweight combat feedback queue with critical/impact events and bounded screen shake. All changes remain deterministic pure helpers where possible so behavior can be TDD-tested outside Canvas rendering.

**Tech Stack:** TypeScript, HTML5 Canvas 2D, Node built-in test runner, zero runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-08-29-landscape-mobile-defense-design.md`

## Global Constraints

- Landscape mobile-first 16:9 gameplay.
- Existing 4 normal spell + 2 ultimate input layout remains unchanged.
- No new inventory or skill-tree menu for evolutions.
- Level 5 is a meaningful first-form mutation; level 10 is a visually and mechanically stronger final evolution.
- Combat readability and mobile performance take priority over unlimited particles; feedback queues stay bounded.
- Existing run economy, shop, hero identities, three map layouts, boss reward flow, and endless progression must keep working.

---

### Task 1: Spell Milestone Evolution Data

**Files:**
- Create: `src/game/spell-evolutions.ts`
- Modify: `src/game/spells.ts`
- Modify: `src/game/upgrades.ts`
- Test: `tests/spell-evolutions.test.mjs`

**Interfaces:**
- Consumes: `SpellId`, `HeroId`, spell level 1..10.
- Produces: `spellEvolutionTier(level): 0 | 1 | 2`, `spellEvolution(heroId, spellId, level)` with projectile/area/jump/tick/impact multipliers and a milestone display name.

- [x] Write failing tests proving levels 1/5/10 map to base/awakened/final tiers, every hero gets different final spell names, and Lv.10 modifiers materially exceed Lv.4.
- [x] Run `npm test -- --test-name-pattern="spell evolution"` and verify failure due to missing module/behavior.
- [x] Implement the pure evolution helper and apply it inside projectile, chain, nova, field, meteor, and black-hole casts.
- [x] Update upgrade card copy so choosing a level 5 or 10 spell clearly says `1차 진화` or `최종 진화`.
- [x] Run full `npm test` and commit `feat: evolve spells at level milestones`.

### Task 2: Distinct Boss Archetypes

**Files:**
- Modify: `src/game/boss-patterns.ts`
- Modify: `src/game/enemies.ts`
- Test: `tests/boss-patterns.test.mjs`

**Interfaces:**
- Consumes: boss ordinal/id, phase, hero position, current enemy budget.
- Produces: `bossArchetypeForOrdinal(ordinal)` and archetype-specific fan/summon/dash/ring parameters while preserving the existing three health phases.

- [x] Write failing tests proving three rotating archetypes have distinct tuning and that later bosses rotate predictably.
- [x] Run targeted boss tests and verify RED.
- [x] Implement `inferno`, `summoner`, and `juggernaut` archetypes; integrate them into existing boss special execution without introducing a separate boss scene.
- [x] Add readable pre-cast telegraphs for archetype specials and cap summoned adds/projectiles using existing budgets.
- [x] Run full `npm test` and commit `feat: give bosses rotating identities`.

### Task 3: Stronger Bounded Combat Feedback

**Files:**
- Modify: `src/game/combat-feedback.ts`
- Modify: `src/game/game.ts`
- Modify: `src/game/spells.ts`
- Test: `tests/combat-feedback.test.mjs`

**Interfaces:**
- Consumes: damage amount, kill tier, spell evolution tier, boss hit/kill events.
- Produces: bounded floating-text/impact-ring events plus `screenShake` intensity/decay values used by the game renderer.

- [x] Write failing tests for feedback queue caps, critical impact classification, boss-kill shake strength, and decay to zero.
- [x] Run targeted feedback tests and verify RED.
- [x] Implement impact tiers and screen-shake state; trigger stronger feedback on evolved spell impacts, elite kills, and boss hits without shaking on every tiny hit.
- [x] Apply camera translation only to the battlefield layer so HUD remains stable and readable.
- [x] Run full `npm test` and commit `feat: strengthen combat impact feedback`.

### Task 4: Phase 4 Regression and Handoff

**Files:**
- Modify: `README.md`
- Create: `/mnt/data/arcane-last-stand-phase4.zip`

**Interfaces:**
- Consumes: all Phase 4 changes.
- Produces: green test/build evidence and a clean downloadable source bundle.

- [x] Run `npm test` and require zero failures.
- [x] Run `npm run build` and require exit code 0.
- [x] Start/inspect the local HTTP server and verify `index.html`, `dist/main.js`, `dist/game/spell-evolutions.js`, and boss modules return HTTP 200.
- [x] Update README with spell evolution, boss archetypes, and impact-feedback behavior.
- [x] Commit docs, create `arcane-last-stand-phase4.zip`, run `unzip -t`, and verify `git status --short` is clean.
