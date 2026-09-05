# Hero, Map, and Boss Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make repeat runs feel materially different by giving all four heroes distinct spell behavior, rotating among three tactical terrain layouts, and adding readable multi-phase boss patterns.

**Architecture:** Preserve the existing six spell slots and upgrade IDs so the current UI, progression, and boss-reward systems remain stable. Add pure hero-spell identity data that the spell runtime consumes, move terrain geometry into selectable map-layout data, and extend only the boss branch of `EnemyManager` with phase/pattern state while leaving regular enemies unchanged.

**Tech Stack:** TypeScript 5.x, native ES modules, HTML5 Canvas 2D, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-29-landscape-mobile-defense-design.md`

## Global Constraints
- Landscape mobile controls and six action buttons remain unchanged.
- Hero differences must alter combat behavior, not only labels or base stats.
- Map variety must not add a pre-run menu; one of three readable layouts is selected automatically per run.
- Boss patterns must be telegraphed and must not stop normal enemy spawning.
- Active enemy budget remains capped at 320.
- Existing XP, coin, shop, equipment, catastrophe, and auto-cast loops must remain compatible.

---

### Task 1: Hero-Specific Spell Identity

**Files:**
- Create: `src/game/hero-spells.ts`
- Create: `tests/hero-spells.test.mjs`
- Modify: `src/game/spells.ts`
- Modify: `src/game/game.ts`

**Interfaces:**
- Produces: `heroSpellIdentity(heroId, spellId)` and `heroActionLabel(heroId, actionId)`.
- Spell runtime consumes modifiers for splash/slow/jumps/projectile speed/field tick/knockback/ultimate timing without changing `SpellId` or level storage.

- [x] Write failing tests proving the four heroes expose distinct labels and mechanics for the same spell slots.
- [x] Run the focused test and verify failure is caused by the missing module.
- [x] Implement hero spell identity data and apply it to projectile, chain, nova, field, meteor, and black-hole behavior.
- [x] Render hero-specific spell colors and labels while preserving cooldown HUD behavior.
- [x] Run focused and full tests, then commit.

### Task 2: Three Tactical Map Layouts

**Files:**
- Create: `src/game/map-layouts.ts`
- Create: `tests/map-layouts.test.mjs`
- Modify: `src/game/terrain.ts`
- Modify: `src/game/game.ts`

**Interfaces:**
- Produces: `MAP_LAYOUTS`, `selectMapLayout(random)`, and `TerrainSystem.currentLayout`.
- Layouts define walls, slow pools, explosive crystals, arena palette, and a concise map name.

- [x] Write failing tests proving three unique layouts exist and deterministic random selection chooses different layouts.
- [x] Implement Ruined Gate, Frozen Fen, and Crystal Quarry geometry with distinct tactical emphasis.
- [x] Make `TerrainSystem.reset()` select/copy a layout and reset crystal state.
- [x] Use the layout palette/name in arena rendering and HUD without adding a new menu.
- [x] Run focused and full tests, then commit.

### Task 3: Readable Multi-Phase Boss Patterns

**Files:**
- Create: `src/game/boss-patterns.ts`
- Create: `tests/boss-patterns.test.mjs`
- Modify: `src/game/enemies.ts`

**Interfaces:**
- Produces: `bossPhaseForRatio(hpRatio)` and per-phase pattern tuning.
- Boss instance stores `specialTimer`; phase 1 fires a telegraphed projectile fan, phase 2 alternates fan pressure with summoned adds, phase 3 enrages and cycles patterns faster.

- [x] Write failing pure phase tests and integration tests for boss fan/summon behavior.
- [x] Implement special timers, fan projectiles, add summons, and low-HP enrage speed.
- [x] Render a warning ring during the final second before the next boss special.
- [x] Run focused and full tests, then commit.

### Task 4: Regression, Build, Packaging

**Files:**
- Modify: `README.md`
- Modify: this plan to mark completed tasks.

**Interfaces:**
- Produces: a clean `feature/first-playable` branch and updated source ZIP.

- [x] Run `npm test` and confirm zero failures.
- [x] Run `npm run build` and confirm exit 0.
- [x] Serve locally and verify `index.html` plus compiled `dist/main.js` return HTTP 200.
- [x] Update README with Phase 3 features, commit documentation, and create `/mnt/data/arcane-last-stand-phase3.zip` excluding `.git`, `.worktrees`, and generated `dist`.
