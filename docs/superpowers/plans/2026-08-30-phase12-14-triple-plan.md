# Phase 12–14 Triple Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement hero meters, battlefield evolution and enemy variants, then threat/audio/records as a single backward-compatible triple pass.

**Architecture:** New pure modules own each new rule set. EnemyManager and TerrainSystem expose small integration hooks; Game composes meters, threat, records, and audio without changing combat controls. Persistent data remains localStorage-based and bounded.

**Tech Stack:** TypeScript, HTML5 Canvas, Web Audio API, browser localStorage, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-phase12-14-triple-design.md`

## Global Constraints
- Keep enemy cap 320, projectile cap 150, feedback cap 96.
- No new combat buttons.
- Threat levels never directly reduce player damage.
- Recent run history capped at 10.
- TDD for every behavior change.

---

### Task 1: Hero meter rules
**Files:** Create `src/game/hero-meters.ts`; Test `tests/hero-meters.test.mjs`.
**Produces:** meter state/update helpers for Arkan, Seria, Kain, Edric.
- [ ] Write failing tests for charge, decay, activation thresholds, and caps.
- [ ] Run tests and verify RED.
- [ ] Implement pure meter helpers.
- [ ] Run full suite and verify GREEN.

### Task 2: Hero meter combat effects
**Files:** Modify `src/game/game.ts`, `src/game/enemies.ts`; Test `tests/hero-meter-integration.test.mjs`.
**Produces:** Inferno/shatter/surge/judgment combat modifiers and HUD data.
- [ ] Write failing integration tests for modifier composition.
- [ ] Verify RED.
- [ ] Connect meters to kills/casts/movement/prevented damage.
- [ ] Run full suite.

### Task 3: Battlefield mutations
**Files:** Create `src/game/map-evolution.ts`; Modify `src/game/terrain.ts`; Test `tests/map-evolution.test.mjs`.
**Produces:** stage 0/1/2 map mutations at 0/480/960 seconds.
- [ ] Write failing tests for all three map families and idempotent stage changes.
- [ ] Verify RED.
- [ ] Implement mutations and terrain application.
- [ ] Run full suite.

### Task 4: Elite affixes
**Files:** Create `src/game/elite-affixes.ts`; Modify `src/game/enemies.ts`; Test `tests/elite-affixes.test.mjs`.
**Produces:** six affixes, one early/two late, bounded effects.
- [ ] Write failing tests for selection and stats.
- [ ] Verify RED.
- [ ] Add affix fields/update/render behavior.
- [ ] Run full suite.

### Task 5: Boss variant tiers
**Files:** Modify `src/game/boss-patterns.ts`, `src/game/enemies.ts`; Test `tests/boss-variants.test.mjs`.
**Produces:** variant tier 0–2 from repeated archetype appearances and tuned pressure.
- [ ] Write failing tests for tiers and tuning differences.
- [ ] Verify RED.
- [ ] Implement tier helpers and apply to boss specials.
- [ ] Run full suite.

### Task 6: Phase 13 presentation integration
**Files:** Modify `src/game/enemy-presentation.ts`, `src/game/boss-presentation.ts`, `src/game/game.ts`; Test `tests/phase13-integration.test.mjs`.
**Produces:** affix labels, map mutation toast, boss variant label.
- [ ] Write failing tests for compact labels.
- [ ] Verify RED.
- [ ] Implement readable HUD/presentation hooks.
- [ ] Run full suite.

### Task 7: Threat level rules
**Files:** Create `src/domain/threat-level.ts`; Test `tests/threat-level.test.mjs`.
**Produces:** levels 0–5 with enemy/elite/boss/reward modifiers.
- [ ] Write failing tests for monotonic pressure and no player nerf.
- [ ] Verify RED.
- [ ] Implement threat definitions/modifiers.
- [ ] Run full suite.

### Task 8: Threat selection and unlock profile
**Files:** Modify `src/domain/meta-profile.ts`, `src/ui/lobby.ts`; Test `tests/threat-profile.test.mjs`.
**Produces:** unlockedThreatLevel, selectedThreatLevel with bounded persistence.
- [ ] Write failing tests for sanitize/unlock/select.
- [ ] Verify RED.
- [ ] Implement persistence and compact lobby selector.
- [ ] Run full suite.

### Task 9: Run records
**Files:** Create `src/domain/run-records.ts`; Modify `src/ui/results.ts`; Test `tests/run-records.test.mjs`.
**Produces:** per hero/map/threat bests, score, recent history max 10, new-record flag.
- [ ] Write failing tests for scoring/bests/history cap.
- [ ] Verify RED.
- [ ] Implement storage model and results display fields.
- [ ] Run full suite.

### Task 10: Web Audio engine
**Files:** Create `src/game/audio.ts`; Test `tests/audio.test.mjs`.
**Produces:** sound event policy, per-kind cooldown/concurrency, volume/mute settings.
- [ ] Write failing tests around scheduling policy without browser audio objects.
- [ ] Verify RED.
- [ ] Implement pure policy plus lazy WebAudio adapter.
- [ ] Run full suite.

### Task 11: Phase 14 runtime integration
**Files:** Modify `src/game/game.ts`, `src/game/enemies.ts`, `src/domain/meta-rewards.ts`; Test `tests/phase14-integration.test.mjs`.
**Produces:** selected threat affects spawn/elite/boss/reward; run records/unlocks save on death; audio hooks.
- [ ] Write failing composition tests.
- [ ] Verify RED.
- [ ] Integrate threat, records, audio.
- [ ] Run full suite.

### Task 12: Documentation and final verification
**Files:** Modify `README.md`.
- [ ] Document Phase 12–14 systems and controls.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Serve and verify key modules over HTTP.
- [ ] Create ZIP and run archive integrity check.
