# Phase 10+11 Combat Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add high-readability combat VFX, boss/enemy telegraphs, adaptive presentation budgets, and polished landscape-mobile HUD states without changing gameplay outcomes.

**Architecture:** Pure descriptor modules derive visual intent from existing game state. A bounded presentation runtime renders ephemeral cues while enforcing caps and accessibility settings. `game.ts` integrates descriptors but remains gameplay-authoritative.

**Tech Stack:** TypeScript ES2022, HTML5 Canvas 2D, Node test runner, DOM localStorage.

**Spec:** `docs/superpowers/specs/2026-08-30-phase10-11-presentation-design.md`

## Global Constraints
- Preserve existing enemy cap of 320.
- Preserve existing enemy projectile cap of 150.
- Presentation particles hard cap: 180.
- Trails hard cap: 72.
- Telegraph shapes hard cap: 24 and must not be evicted by decorative effects.
- No new gameplay currencies, progression systems, or inventory screens.
- Danger telegraphs render above friendly decorative VFX.

---

### Task 1: Presentation budget and adaptive quality
**Files:**
- Create: `src/game/presentation-budget.ts`
- Test: `tests/presentation-budget.test.mjs`

**Interfaces:**
- Produces: `PresentationQuality`, `presentationLimits(quality)`, `adaptiveQuality(current, fps, particleLoad)`, `admitEffect(kind, counts, quality)`.

- [ ] Write failing tests proving high/medium/low caps, reserved telegraph capacity, and hysteresis.
- [ ] Run `npm test -- --test-name-pattern="presentation budget|adaptive quality"` and confirm failure because module is missing.
- [ ] Implement the pure budget functions with caps 180/72/24 and quality-dependent decorative subcaps.
- [ ] Run the targeted tests and then `npm test`.
- [ ] Commit `feat: add adaptive presentation budget`.

### Task 2: Spell-family VFX descriptors
**Files:**
- Create: `src/game/spell-vfx.ts`
- Test: `tests/spell-vfx.test.mjs`

**Interfaces:**
- Consumes: existing hero id, spell id, spell level/evolution tier.
- Produces: `spellVfxDescriptor(heroId, spellId, level)` with family, trail width, burst radius, spark count, opacity, persistence, and danger-safe alpha.

- [ ] Write failing tests for fire/frost/lightning/holy identities and Lv5/Lv10 visual escalation without unbounded spark counts.
- [ ] Verify RED.
- [ ] Implement descriptors only; no combat mutation.
- [ ] Run targeted tests and full suite.
- [ ] Commit `feat: add evolved spell vfx descriptors`.

### Task 3: Enemy status, hit, death, and danger telegraphs
**Files:**
- Create: `src/game/enemy-presentation.ts`
- Test: `tests/enemy-presentation.test.mjs`

**Interfaces:**
- Produces: `enemyStatusCue`, `enemyDeathCue`, `enemyThreatTelegraph`.
- Bomber telegraph returns pre-explosion radius; boss telegraphs are always priority; shaman support ring is visible but lower priority than imminent damage.

- [ ] Write failing tests for burn/freeze/shock distinctions, elite/boss death weight, bomber radius, and priority ordering.
- [ ] Verify RED.
- [ ] Implement bounded descriptors.
- [ ] Run targeted tests and full suite.
- [ ] Commit `feat: add enemy presentation and telegraphs`.

### Task 4: Boss phase transition presentation
**Files:**
- Create: `src/game/boss-presentation.ts`
- Test: `tests/boss-presentation.test.mjs`

**Interfaces:**
- Produces: `BossPresentationTracker.update(bossId, hpRatio, archetype)` and `bossPatternTelegraph(archetype, phase)`.
- Phase transitions fire once crossing 0.66 and 0.33 thresholds.

- [ ] Write failing edge tests for exact thresholds, no duplicate firing, and distinct inferno/summoner/juggernaut telegraphs.
- [ ] Verify RED.
- [ ] Implement tracker and descriptors.
- [ ] Run targeted tests and full suite.
- [ ] Commit `feat: add boss phase presentation`.

### Task 5: HUD readiness and ultimate pulse states
**Files:**
- Create: `src/game/hud-presentation.ts`
- Modify: `src/game/game.ts`
- Test: `tests/hud-presentation.test.mjs`

**Interfaces:**
- Produces: `spellButtonPresentation(cooldownRemaining, isUltimate, wasReady, autoEnabled)` and `compactBuildLabels`.

- [ ] Write failing tests for READY/cooldown text, one-shot ultimate ready pulse, AUTO state, and compact two-line build labels.
- [ ] Verify RED.
- [ ] Implement pure HUD state helpers.
- [ ] Integrate button rendering in `game.ts` without changing spell cooldown behavior.
- [ ] Run targeted tests and full suite.
- [ ] Commit `feat: polish mobile combat hud states`.

### Task 6: Presentation settings and accessibility
**Files:**
- Create: `src/game/presentation-settings.ts`
- Test: `tests/presentation-settings.test.mjs`

**Interfaces:**
- Produces: safe defaults, sanitizer, storage load/save helpers, and `applyPresentationSettings(cue, settings)`.

- [ ] Write failing tests for malformed storage fallback, reduced flash alpha cap, reduced shake multiplier, and haptics toggle.
- [ ] Verify RED.
- [ ] Implement settings and transforms.
- [ ] Run targeted tests and full suite.
- [ ] Commit `feat: add presentation accessibility settings`.

### Task 7: Bounded presentation runtime and effect aggregation
**Files:**
- Create: `src/game/presentation-runtime.ts`
- Test: `tests/presentation-runtime.test.mjs`

**Interfaces:**
- Produces: `PresentationRuntime` with bounded `emitParticle`, `emitTrail`, `emitTelegraph`, `recordDeath`, `update`, and readonly snapshots.

- [ ] Write failing tests proving caps, telegraph reservation, oldest-decorative eviction, death aggregation after 10 rapid local deaths, and expiry.
- [ ] Verify RED.
- [ ] Implement runtime with no allocations proportional to total historical events.
- [ ] Run targeted tests and full suite.
- [ ] Commit `feat: add bounded combat presentation runtime`.

### Task 8: Game-loop integration and final rendering order
**Files:**
- Modify: `src/game/game.ts`
- Modify: `src/styles.css`
- Modify: `README.md`
- Test: `tests/presentation-integration.test.mjs`

**Interfaces:**
- Consumes Tasks 1–7.
- Rendering order: terrain -> enemies -> friendly core spell geometry -> decorative presentation -> enemy projectiles -> danger telegraphs -> hero -> HUD.

- [ ] Write failing integration tests for rendering-layer order helper, stable load-to-quality downgrade, and critical cue preservation.
- [ ] Verify RED.
- [ ] Integrate runtime emission at spell casts/hits/deaths/boss transitions and draw bounded cues.
- [ ] Add a small in-game presentation options row on pause/results-safe UI without adding a separate settings screen.
- [ ] Run `npm test`, `npm run build`, HTTP smoke test, and ZIP integrity test.
- [ ] Commit `feat: complete phase 10 11 combat presentation pass`.
