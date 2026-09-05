# Phase 15-17 Triple Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three tactical battlefield objectives, boss-specific destructible encounter mechanics, and automatic ARCANE COMBO/run recap while preserving all existing controls and performance caps.

**Architecture:** New pure modules own scheduling, placement, encounter state, combo analysis, and recap calculations. `Game` coordinates them; `SpellSystem` receives one optional magic-target sink; `EnemyManager` accepts neutral-by-default boss encounter modifiers. All runtime lists are hard-capped.

**Tech Stack:** TypeScript ES modules, HTML5 Canvas, Web Audio, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-phase15-17-triple-design.md`

## Global Constraints

- No new combat buttons.
- Enemy cap stays 320; enemy projectile cap stays 150; feedback cap stays 96; presentation particle cap stays 180.
- One battlefield objective maximum, four encounter nodes maximum, six boss hazards maximum.
- No new persistent run currency.
- All new modules must be deterministic under injected RNG where randomness is used.
- Every production change starts with a failing test.

---

### Task 1: Battlefield objective director

**Files:**
- Create: `src/game/battlefield-objectives.ts`
- Test: `tests/battlefield-objectives.test.mjs`

**Interfaces:**
- Produces `BattlefieldObjectiveDirector`, `BattlefieldObjectiveId`, `ObjectiveTransition`, `objectiveDefinition()`.

- [ ] **Step 1: Write failing scheduling tests**

```js
const director = new BattlefieldObjectiveDirector(() => 0);
director.reset();
assert.equal(director.update(1, 149, 30).started, null);
assert.equal(director.update(1, 151, 30).started?.id, 'riftSeal');
assert.equal(director.active?.id, 'riftSeal');
assert.equal(director.update(1, 160, 8).started, null);
```

Also assert one-active-only, boss countdown <=12 suppresses starts, and consecutive types do not repeat.

- [ ] **Step 2:** Run `npm test` and verify the new test fails because the module does not exist.
- [ ] **Step 3: Implement minimal director** with first start at 150 seconds, 85–115 second reschedule gap, one active objective, and no immediate repeat.
- [ ] **Step 4:** Run `npm test`; expect all tests pass.
- [ ] **Step 5:** Commit `feat: add battlefield objective director`.

### Task 2: Objective placement and progress rules

**Files:**
- Create: `src/game/objective-rules.ts`
- Test: `tests/objective-rules.test.mjs`

**Interfaces:**
- Produces `objectiveAnchors(mapId, stage)`, `chooseObjectiveAnchor(...)`, `advanceRiftSeal(...)`, `advanceBeaconDefense(...)`, `advanceCursedAltar(...)`.

- [ ] **Step 1: Write failing rule tests**

```js
const anchor = chooseObjectiveAnchor('ruinedGate', 1, {x:300,y:300});
assert.ok(Math.hypot(anchor.x-800, anchor.y-450) > 180);
assert.equal(advanceRiftSeal({progress:0}, 1, true, 0).progress, 18);
assert.equal(advanceBeaconDefense({hp:100,timeLeft:28}, 1, 3).hp, 91);
assert.equal(advanceCursedAltar({activated:true,timeLeft:22}, 1).complete, false);
```

- [ ] **Step 2:** Run full tests; verify RED.
- [ ] **Step 3:** Implement map/stage anchor tables and bounded progress functions; clamp all progress/HP/timers.
- [ ] **Step 4:** Run full tests; expect green.
- [ ] **Step 5:** Commit `feat: add objective placement and progress rules`.

### Task 3: Objective rewards and tactical runtime

**Files:**
- Create: `src/game/objective-runtime.ts`
- Test: `tests/objective-runtime.test.mjs`

**Interfaces:**
- Consumes Task 1/2 definitions.
- Produces `ObjectiveRuntime`, `ObjectiveReward`, `ObjectiveRunStats`, `objectiveRewardFor(...)`.

- [ ] **Step 1: Write failing runtime tests**

```js
const runtime = new ObjectiveRuntime();
runtime.begin('cursedAltar', {x:500,y:500});
runtime.activateAltar();
const transition = runtime.update(22, {hero:{x:500,y:500}, nearbyEnemies:4});
assert.equal(transition.completed, true);
assert.equal(runtime.stats.completed, 1);
assert.equal(runtime.stats.bestStreak, 1);
```

Assert failure resets streak, reward kinds are existing resources/temporary power, and no reward exceeds configured caps.

- [ ] **Step 2:** Run full tests; verify RED.
- [ ] **Step 3:** Implement runtime/state/rewards with one active objective and bounded 20-second cursed spell-power buff.
- [ ] **Step 4:** Run full tests; expect green.
- [ ] **Step 5:** Commit `feat: add tactical objective runtime`.

### Task 4: Integrate Phase 15 into Game and HUD

**Files:**
- Modify: `src/game/game.ts`
- Modify: `src/game/build-modifiers.ts`
- Test: `tests/phase15-integration.test.mjs`

**Interfaces:**
- Produces `composeObjectiveCombatModifiers(activeBuffSeconds)` and Game lifecycle integration.

- [ ] **Step 1: Write failing integration tests**

```js
assert.deepEqual(composeObjectiveCombatModifiers(0), {spellPowerMultiplier:1, spawnPressureMultiplier:1});
assert.equal(composeObjectiveCombatModifiers(10).spellPowerMultiplier, 1.18);
```

Also static-source assert Game owns objective director/runtime, resets them, applies reward types, and renders objective HUD.

- [ ] **Step 2:** Run full tests; verify RED.
- [ ] **Step 3:** Integrate start/progress/end, map-based placement, reward application, pressure/buff composition, and compact center HUD bar.
- [ ] **Step 4:** Run full tests; expect green.
- [ ] **Step 5:** Commit `feat: integrate battlefield objectives`.

### Task 5: Boss encounter node model

**Files:**
- Create: `src/game/boss-encounters.ts`
- Test: `tests/boss-encounters.test.mjs`

**Interfaces:**
- Produces `BossEncounterSystem`, `BossEncounterNode`, `BossEncounterModifiers`, `MagicTargetSink`.

- [ ] **Step 1: Write failing node tests**

```js
const system = new BossEncounterSystem();
system.begin(7,'inferno',{x:800,y:300},2);
assert.equal(system.nodes.length,2);
system.hitMagic(system.nodes[0].pos, 500);
assert.ok(system.nodes[0].hp < system.nodes[0].maxHp);
assert.equal(system.modifiers().bossDamageTakenMultiplier < 1, true);
```

Test summoner core cadence and juggernaut plate dash modifiers, four-node cap, reset on boss death.

- [ ] **Step 2:** Run full tests; verify RED.
- [ ] **Step 3:** Implement archetype-specific node creation, magic hit damage, vulnerability timers, and neutral defaults.
- [ ] **Step 4:** Run full tests; expect green.
- [ ] **Step 5:** Commit `feat: add boss encounter nodes`.

### Task 6: Spell magic-target sink

**Files:**
- Modify: `src/game/spells.ts`
- Test: `tests/spell-target-sink.test.mjs`

**Interfaces:**
- `SpellWorld.magicTargets?: { hitMagic(pos: Vec2, strength: number): void }`.

- [ ] **Step 1: Write failing spell sink tests** using a tiny sink counter and a real SpellSystem cast/update cycle; assert projectile, nova/field, meteor, and black-hole impacts report bounded strength.
- [ ] **Step 2:** Run full tests; verify RED.
- [ ] **Step 3:** Add the optional sink beside existing `terrain.hitByMagic()` calls; never require it for existing tests/callers.
- [ ] **Step 4:** Run full tests; expect green.
- [ ] **Step 5:** Commit `feat: let spells damage encounter targets`.

### Task 7: Boss arena hazard rules

**Files:**
- Create: `src/game/boss-arena.ts`
- Test: `tests/boss-arena.test.mjs`

**Interfaces:**
- Produces `BossArenaSystem`, `BossHazard`, `bossArenaDamageAt(...)`.

- [ ] **Step 1: Write failing hazard tests** for archetype-specific styles, six-hazard cap, expiry, telegraph-before-damage, and phase/variant scaling without unbounded damage.
- [ ] **Step 2:** Run full tests; verify RED.
- [ ] **Step 3:** Implement hazard scheduling/state with deterministic cadence and hard caps.
- [ ] **Step 4:** Run full tests; expect green.
- [ ] **Step 5:** Commit `feat: add boss arena hazards`.

### Task 8: Integrate Phase 16 into EnemyManager/Game

**Files:**
- Modify: `src/game/enemies.ts`
- Modify: `src/game/game.ts`
- Modify: `src/game/danger-ui.ts`
- Test: `tests/phase16-integration.test.mjs`

**Interfaces:**
- Enemy update context gains optional neutral boss modifier object.
- Game owns boss encounter + arena lifecycle and renders nodes/hazards below enemy projectiles but above friendly decoration.

- [ ] **Step 1: Write failing integration tests** asserting neutral modifiers preserve legacy boss tuning and encounter modifiers change damage/cadence/summon/dash only when provided.
- [ ] **Step 2:** Run full tests; verify RED.
- [ ] **Step 3:** Wire boss spawn detection, magic sink, node/hazard updates, player/core hazard damage, boss-death cleanup, and telegraphs.
- [ ] **Step 4:** Run full tests; expect green.
- [ ] **Step 5:** Commit `feat: integrate boss encounter arenas`.

### Task 9: ARCANE COMBO analyzer

**Files:**
- Create: `src/game/arcane-combos.ts`
- Test: `tests/arcane-combos.test.mjs`

**Interfaces:**
- Produces `analyzeArcaneCombo(input)`, `ArcaneComboState`, `ArcaneComboFamily`, `ArcaneComboModifiers`.

- [ ] **Step 1: Write failing family/tier tests**

```js
const combo = analyzeArcaneCombo({heroId:'arkan', evolvedSpells:['fireBolt'], legendaryIds:['arcane-staff'], relicId:'ember-crown', traitId:'destruction', synergyIds:['ember-dominion'], meterActive:true, coreHpRatio:1, objectiveStreak:2});
assert.equal(combo.family,'inferno-chain');
assert.equal(combo.tier,3);
assert.ok(combo.spellPowerMultiplier <= 1.12);
```

Test frozen-control, storm-velocity, guardian-fortress, and neutral tier 0.

- [ ] **Step 2:** Run full tests; verify RED.
- [ ] **Step 3:** Implement weighted condition counting, tier cap 3, family labels/colors, and bounded modifiers.
- [ ] **Step 4:** Run full tests; expect green.
- [ ] **Step 5:** Commit `feat: add arcane combo analyzer`.

### Task 10: Combo runtime and combat composition

**Files:**
- Create: `src/game/combo-runtime.ts`
- Modify: `src/game/build-modifiers.ts`
- Test: `tests/combo-runtime.test.mjs`

**Interfaces:**
- Produces `ComboRuntime` tracking highest tier/family and `composeComboCombatModifiers(...)`.

- [ ] **Step 1: Write failing tests** asserting highest tier never decreases, current tier can change, max spell power bonus is 12%, and family utility remains bounded.
- [ ] **Step 2:** Run full tests; verify RED.
- [ ] **Step 3:** Implement runtime and one-time build composition point.
- [ ] **Step 4:** Run full tests; expect green.
- [ ] **Step 5:** Commit `feat: integrate arcane combo combat modifiers`.

### Task 11: Tactical run recap and score bonus

**Files:**
- Create: `src/domain/tactical-recap.ts`
- Modify: `src/domain/run-records.ts`
- Modify: `src/ui/results.ts`
- Test: `tests/tactical-recap.test.mjs`

**Interfaces:**
- Produces `TacticalRecap`, `tacticalScoreBonus(...)`, `buildTacticalRecap(...)`.

- [ ] **Step 1: Write failing recap tests**

```js
const recap = buildTacticalRecap({objectivesCompleted:4,objectivesFailed:1,bestStreak:3,bossNodesDestroyed:5,highestComboTier:3,comboName:'ARCANE ASCENDANCY'});
assert.equal(recap.objectives,'4 성공 / 1 실패');
assert.ok(tacticalScoreBonus(recap) <= 12000);
```

- [ ] **Step 2:** Run full tests; verify RED.
- [ ] **Step 3:** Add bounded tactical score bonus and result fields for combo/objectives/nodes without changing recent-history cap 10.
- [ ] **Step 4:** Run full tests; expect green.
- [ ] **Step 5:** Commit `feat: add tactical run recap`.

### Task 12: Integrate Phase 17, docs, and final verification

**Files:**
- Modify: `src/game/game.ts`
- Modify: `README.md`
- Test: `tests/phase17-integration.test.mjs`

**Interfaces:**
- Game analyzes combo from existing build state, applies modifiers once, displays compact HUD, tracks highest combo, and passes tactical recap to run completion/results.

- [ ] **Step 1: Write failing integration tests** asserting Game owns ComboRuntime, resets it, includes objective streak and boss-node stats in recap, and existing control ids remain unchanged.
- [ ] **Step 2:** Run full tests; verify RED.
- [ ] **Step 3:** Integrate combo analysis/update/HUD/results and document Phase 15–17. Do not add action ids or buttons.
- [ ] **Step 4:** Run `npm test`, `npm run build`, `git diff --check`, and HTTP smoke tests for `/`, `main.js`, `battlefield-objectives.js`, `boss-encounters.js`, `boss-arena.js`, `arcane-combos.js`, `game.js`.
- [ ] **Step 5:** Commit `chore: finalize phase15-17 triple depth pass` and package a source ZIP after fresh verification.
