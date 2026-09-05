# First Playable Landscape Mobile Defense Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build a zero-dependency, touch-first landscape mobile defense prototype whose complete run loop is playable: move, cast four normal spells and two ultimates, kill endless enemies, collect XP/coins, level up, shop for equipment/potions, fight elites/bosses, die, and restart.

**Architecture:** Use a fixed-logical-resolution HTML5 Canvas renderer with a small TypeScript game loop. Keep deterministic game rules in pure domain modules (`progression`, `economy`, `director`) so they can be unit-tested without the browser; keep mutable entities and rendering in focused gameplay modules. DOM overlays handle level-up/shop/game-over menus while Canvas handles combat and touch controls.

**Tech Stack:** TypeScript 5.x compiler already available locally, native ES modules, HTML5 Canvas 2D, Pointer Events, CSS, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-29-landscape-mobile-defense-design.md`

## Global Constraints
- Primary target is landscape mobile with a 16:9 logical gameplay area.
- No external runtime dependency is required for the first playable.
- Normal spells use auto-aim; touch input is left joystick plus right-side action buttons.
- XP grows spells/hero; coins are run-only shop currency.
- Equipment is immediately equipped and duplicate-family purchases increase rank.
- Endless pressure uses an active-enemy budget rather than unbounded live entities.
- Hero or guardian-core death ends the run; restart must not reload the page.

---

### Task 1: Project Shell and Pure Progression Rules

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/styles.css`
- Create: `src/domain/progression.ts`
- Create: `tests/progression.test.mjs`

**Interfaces:**
- Produces: `xpNeededForLevel(level: number): number`, `enemyXpValue(danger: number, base: number): number`, `dangerTierForSeconds(seconds: number): number`.

- [x] **Step 1: Write failing progression tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { xpNeededForLevel, enemyXpValue, dangerTierForSeconds } from '../dist/domain/progression.js';

test('xp requirement increases but stays finite', () => {
  assert.ok(xpNeededForLevel(2) > xpNeededForLevel(1));
  assert.ok(xpNeededForLevel(50) > xpNeededForLevel(20));
  assert.ok(Number.isFinite(xpNeededForLevel(500)));
});

test('enemy xp rises with danger', () => {
  assert.ok(enemyXpValue(8, 10) > enemyXpValue(1, 10));
});

test('danger tier rises over survival time', () => {
  assert.equal(dangerTierForSeconds(0), 1);
  assert.ok(dangerTierForSeconds(600) > dangerTierForSeconds(120));
});
```

- [x] **Step 2: Add compile/test scripts and verify tests fail because module is absent**

Run: `npm run build && node --test tests/progression.test.mjs`
Expected: FAIL before `src/domain/progression.ts` exists or exports the functions.

- [x] **Step 3: Implement progression formulas**

```ts
export function xpNeededForLevel(level: number): number {
  const l = Math.max(1, level);
  return Math.floor(24 + 11 * Math.pow(l, 1.28) + Math.max(0, l - 25) * 3.5);
}

export function enemyXpValue(danger: number, base: number): number {
  return Math.max(1, Math.round(base * (1 + Math.max(0, danger - 1) * 0.09)));
}

export function dangerTierForSeconds(seconds: number): number {
  return 1 + Math.floor(Math.max(0, seconds) / 75);
}
```

- [x] **Step 4: Run progression tests**

Run: `npm run build && node --test tests/progression.test.mjs`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add package.json tsconfig.json index.html src/styles.css src/domain/progression.ts tests/progression.test.mjs
git commit -m "feat: add game shell and progression rules"
```

---

### Task 2: Shop Economy and Equipment Rules

**Files:**
- Create: `src/domain/economy.ts`
- Create: `src/domain/types.ts`
- Create: `tests/economy.test.mjs`

**Interfaces:**
- Produces: `EquipmentSlot`, `EquipmentState`, `ShopOffer`, `purchaseOffer(state, offer)`, `rerollCost(rerollsThisVisit)`.
- `purchaseOffer` returns a new state plus success/result copy; duplicate equipment family increments rank rather than adding inventory.

- [x] **Step 1: Write failing economy tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { purchaseOffer, rerollCost } from '../dist/domain/economy.js';

const empty = { coins: 1000, weapon: null, armor: null, healingPotions: 0 };

test('buying a weapon spends coins and equips it', () => {
  const out = purchaseOffer(empty, { id: 'arcane-staff', kind: 'weapon', name: 'Arcane Staff', price: 300, power: 0.15 });
  assert.equal(out.ok, true);
  assert.equal(out.state.coins, 700);
  assert.equal(out.state.weapon.id, 'arcane-staff');
  assert.equal(out.state.weapon.rank, 1);
});

test('buying same equipment family increases rank', () => {
  const once = purchaseOffer(empty, { id: 'arcane-staff', kind: 'weapon', name: 'Arcane Staff', price: 300, power: 0.15 }).state;
  const twice = purchaseOffer(once, { id: 'arcane-staff', kind: 'weapon', name: 'Arcane Staff', price: 300, power: 0.15 }).state;
  assert.equal(twice.weapon.rank, 2);
});

test('reroll gets more expensive within visit', () => {
  assert.deepEqual([0,1,2,3].map(rerollCost), [50,100,200,400]);
});
```

- [x] **Step 2: Compile and verify the economy tests fail**

Run: `npm run build && node --test tests/economy.test.mjs`
Expected: FAIL with missing economy module.

- [x] **Step 3: Implement immutable purchase/equipment logic**

Implement `purchaseOffer` so insufficient coins returns `{ok:false, state, message:'금화 부족'}`; potion purchases increment `healingPotions`; same equipment ID increments rank to a cap of 5; different equipment replaces the slot.

- [x] **Step 4: Run economy tests**

Run: `npm run build && node --test tests/economy.test.mjs`
Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/domain/types.ts src/domain/economy.ts tests/economy.test.mjs
git commit -m "feat: add shop and equipment economy"
```

---

### Task 3: Canvas Engine, Hero Movement, Touch Joystick, and HUD

**Files:**
- Create: `src/core/math.ts`
- Create: `src/core/input.ts`
- Create: `src/core/loop.ts`
- Create: `src/game/config.ts`
- Create: `src/game/entities.ts`
- Create: `src/game/game.ts`
- Create: `src/main.ts`
- Modify: `index.html`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: `Game.start()`, `Game.restart()`, `InputState.move`, action edge/held states for `spell1..spell4`, `ultimate1`, `ultimate2`, and `potion`.
- Logical canvas resolution: `1600x900`; CSS scales it to available viewport while preserving aspect ratio.

- [x] **Step 1: Add a pure vector clamp test to establish the core test cycle**

Create `tests/math.test.mjs` asserting normalized joystick vectors never exceed magnitude 1.

- [x] **Step 2: Implement fixed timestep loop and input**

Use `requestAnimationFrame`, clamp frame delta to 50ms, accumulate simulation updates at 60Hz, use Pointer Events for joystick/action buttons, and keyboard fallback for desktop.

- [x] **Step 3: Implement hero/core and HUD rendering**

Hero starts near center, core at `(800,450)`. Render HP bars, level, XP bar, timer, danger tier, kill count, coins, core HP, and six spell buttons. Render joystick base/thumb only while touch is active on the left half.

- [x] **Step 4: Verify desktop interaction manually**

Run: `npm run serve`
Expected: hero moves with WASD, HUD updates timer, no console errors, canvas keeps 16:9 ratio.

- [x] **Step 5: Commit**

```bash
git add src/core src/game src/main.ts index.html src/styles.css tests/math.test.mjs
git commit -m "feat: add landscape canvas game shell and controls"
```

---

### Task 4: Enemy Director, Continuous Spawning, Damage, Elites, and Boss

**Files:**
- Create: `src/domain/director.ts`
- Create: `tests/director.test.mjs`
- Create: `src/game/enemies.ts`
- Modify: `src/game/game.ts`

**Interfaces:**
- Produces: `directorSnapshot(seconds)` with `danger`, `spawnInterval`, `enemyBudget`, `hpMultiplier`, `damageMultiplier`, `eliteInterval`, `bossInterval`.
- Gameplay produces enemy archetypes `grunt`, `hound`, `brute`, `archer`, `elite`, `boss`.

- [x] **Step 1: Write failing director scaling tests**

Assert at 900 seconds: spawn interval is lower, budget is higher, HP multiplier is higher than at 60 seconds, and boss interval remains positive.

- [x] **Step 2: Implement director formulas and pass tests**

Keep spawn interval floor at 0.10s and enemy budget cap at 320 for the first playable to preserve performance.

- [x] **Step 3: Implement enemies and continuous spawn**

Spawn outside arena edges; most chase hero while approximately 25% target the core. Archers stop at range and fire simple projectiles. Hounds are fast/fragile; brutes are slow/tanky. Elites are enhanced archetypes with a colored ring. Boss spawns without stopping normal spawns.

- [x] **Step 4: Add collision/damage and death events**

Enemy death returns an event containing XP and gold values; melee contact uses per-enemy attack cooldown; projectiles damage hero/core. Hero/core reaching zero triggers game over.

- [x] **Step 5: Run all tests and smoke test 5 minutes of accelerated simulation**

Run: `npm run test`
Expected: all tests PASS.

- [x] **Step 6: Commit**

```bash
git add src/domain/director.ts tests/director.test.mjs src/game/enemies.ts src/game/game.ts
git commit -m "feat: add endless enemy director and boss pressure"
```

---

### Task 5: Four Normal Spells, Two Ultimates, Damage Effects, and Auto-Aim

**Files:**
- Create: `src/game/spells.ts`
- Modify: `src/game/game.ts`
- Modify: `src/game/entities.ts`

**Interfaces:**
- Produces: `SpellSystem.update(dt, world)`, `SpellSystem.tryCast(slot, world)`, cooldown state for HUD, spell levels, ultimate charge/cooldown state.
- Normal spells: Fire Bolt, Chain Lightning, Frost Nova, Flame Field.
- Ultimates: Meteor Storm, Black Hole.

- [x] **Step 1: Add pure cooldown/effect scaling tests**

Create `tests/spells.test.mjs` for spell level damage/cooldown/radius scaling helpers.

- [x] **Step 2: Implement auto-aim priority**

Prefer core attackers, then elite/boss in range, then nearest enemy. If no enemy exists, cast toward hero facing direction.

- [x] **Step 3: Implement normal spells**

Fire Bolt launches a projectile; Chain Lightning performs nearest-neighbor jumps; Frost Nova applies radial slow; Flame Field persists and ticks damage.

- [x] **Step 4: Implement ultimates**

Meteor Storm schedules multiple circular impacts with warning telegraphs. Black Hole creates a persistent pull field with repeated damage.

- [x] **Step 5: Connect touch/keyboard casting and cooldown rings**

Holding normal spell buttons repeatedly casts on cooldown; ultimates require a fresh press.

- [x] **Step 6: Run all tests and manual crowd-clear smoke test**

Run: `npm run test`
Expected: all tests PASS; spells visibly clear groups and cooldown UI is readable.

- [x] **Step 7: Commit**

```bash
git add src/game/spells.ts src/game/game.ts src/game/entities.ts tests/spells.test.mjs
git commit -m "feat: add magic combat and ultimates"
```

---

### Task 6: XP/Coins, Level-Up Choices, Pickups, and Spell Growth

**Files:**
- Create: `src/game/pickups.ts`
- Create: `src/ui/levelup.ts`
- Modify: `src/game/game.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: pickup manager with XP/coin drops, magnet collection, coarse pickup merging; `LevelUpOverlay.open(choices, onPick)`.
- Level-up choices include spell unlock/level, max HP, move speed, pickup radius, spell power, cooldown reduction.

- [x] **Step 1: Implement pickup drops and magnet collection**

Enemy death spawns XP and coin pickups with small outward velocity; after settling, pickups inside magnet radius accelerate toward hero. Merge nearby same-type pickups when object count becomes high.

- [x] **Step 2: Connect XP progression and multi-level handling**

When one pickup causes multiple levels, queue the required number of three-card selections rather than discarding extra levels.

- [x] **Step 3: Build three-card level-up overlay**

Simulation pauses while the overlay is open. Cards show Korean title, one-line effect, and level when relevant. Clicking/tapping a card applies the upgrade and resumes or opens the next queued selection.

- [x] **Step 4: Verify upgrades visibly change combat**

Increase spell projectiles/damage/radius at milestone levels so upgrade effects are visually obvious.

- [x] **Step 5: Commit**

```bash
git add src/game/pickups.ts src/ui/levelup.ts src/game/game.ts src/styles.css
git commit -m "feat: add pickups and level-up build choices"
```

---

### Task 7: Shop Overlay, Weapon/Armor Effects, Potion, and Shop Tokens

**Files:**
- Create: `src/ui/shop.ts`
- Create: `src/game/shop-data.ts`
- Modify: `src/game/game.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: `ShopOverlay.open(context)` with six offers and reroll; shop token becomes available periodically and after boss kills.
- Weapon and armor stats are consumed by the gameplay stat resolver.

- [x] **Step 1: Implement six-offer shop data generation**

Always produce a readable mix of weapons, armor, and potion/utility; weight item families that synergize with current spell levels but retain off-build offers.

- [x] **Step 2: Build shop overlay and purchase flow**

Opening consumes one shop token and pauses simulation. Purchase calls the tested economy module, updates coins/equipment immediately, disables unaffordable cards, and keeps the visit open until player closes it.

- [x] **Step 3: Apply equipment effects**

Arcane Staff increases spell damage; Rapid Wand reduces normal cooldowns; Iron Robe reduces incoming damage; Gale Cloak increases move speed. Duplicate purchases increase rank and scale the defining bonus.

- [x] **Step 4: Implement healing potion quick-slot**

Space or potion button consumes one potion and heals 35% max HP, capped at max HP. Shop offers can sell potions; HUD displays count.

- [x] **Step 5: Run economy tests plus manual shop smoke test**

Run: `npm run test`
Expected: all tests PASS; purchases spend coins, duplicates rank up, and gameplay stats change immediately.

- [x] **Step 6: Commit**

```bash
git add src/ui/shop.ts src/game/shop-data.ts src/game/game.ts src/styles.css
git commit -m "feat: add in-run shop equipment and potion"
```

---

### Task 8: Terrain, Catastrophe Hook, Hero Select, Results, and Mobile Polish

**Files:**
- Create: `src/game/terrain.ts`
- Create: `src/ui/hero-select.ts`
- Create: `src/ui/results.ts`
- Modify: `src/game/game.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Create: `README.md`

**Interfaces:**
- Terrain MVP: walls, slow pools, explosive crystals.
- Hero select exposes four heroes with passives; first playable shares base spell kit while passive modifiers differ.
- Results expose survival time, kills, level, earned gold, bosses defeated, and restart.

- [x] **Step 1: Add terrain interactions**

Walls resolve circle-vs-rectangle movement collision, slow pools affect enemy speed, explosive crystals accumulate hits then deal radial damage and reset after cooldown.

- [x] **Step 2: Add first catastrophe at late-game threshold**

At 20 minutes enable Golden Night or Frenzy based on deterministic rotation; display a large temporary banner and change director/economy multiplier accordingly.

- [x] **Step 3: Build four-hero selection screen**

Arkan: chain-explosion chance; Seria: stronger slow/freeze damage; Kain: movement/casting speed bonus; Edric: core-aura defense bonus. No fake locked buttons.

- [x] **Step 4: Build game-over results and in-place restart**

Restart clears entities/timers/UI state and returns to hero selection without reloading the page.

- [x] **Step 5: Add orientation and safe-area polish**

When viewport is portrait, show a non-blocking landscape-rotation cover. Use `env(safe-area-inset-*)` padding and large touch targets at least 64 logical pixels.

- [x] **Step 6: Document local run controls and architecture**

README commands: `npm run build`, `npm run test`, `npm run serve`; list touch and keyboard controls and current implemented systems.

- [x] **Step 7: Full verification**

Run: `npm run test && npm run build`
Expected: all tests PASS and TypeScript compiler exits 0.

Run server and verify in Chromium mobile landscape dimensions: hero select -> combat -> level-up -> shop -> boss -> game over -> restart, with no console errors.

- [x] **Step 8: Commit**

```bash
git add src README.md
git commit -m "feat: complete first playable endless defense loop"
```
