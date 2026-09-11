# Equipment Inventory, Crafting, and Survival Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make gold-funded equipment purchases, strengthening, and crafting produce clear survival choices through a six-slot inventory, readable recipes, permanent hidden-recipe discovery, and time-based readiness feedback.

**Architecture:** Keep every economy operation as a pure, atomic `EquipmentState` transition. Put inventory mechanics in the domain layer, recipe data and equipment effects in the game layer, and presentation-only projections/readiness in focused game modules. The existing `Game` remains the integration owner: it supplies current combat context to the shop, applies successful transactions, persists snapshots and recipe knowledge, and refreshes one shop overlay with `구매`/`대장간` tabs.

**Tech Stack:** TypeScript, browser DOM/CSS, Node.js built-in test runner, existing canvas game runtime and local-storage adapters.

**Spec:** `docs/superpowers/specs/2026-09-10-equipment-inventory-crafting-design.md`

## Global Constraints

- Preserve all existing uncommitted gameplay and art work. Stage only the files named in each task; never use `git add .`, `git reset`, or cleanup commands.
- Keep `EquipmentState` immutable at transaction boundaries. A failed purchase, sale, strengthen, or craft must return the original state object and consume nothing.
- Never consume equipped items as forge materials. Inventory material selection is deterministic: same ID, eligible rank, then lowest rank first.
- Keep enemy pressure time-based. Readiness may explain the gap but must not scale enemies from the player's equipment.
- Build on Windows with `.\node_modules\.bin\tsc.cmd`; do not use the package `build` script because it starts with a Unix `rm` command.
- Tests import compiled files from `dist`. After adding a source API, compile before running its green test.
- Keep cards and controls keyboard accessible. Every action remains a native `button`, `select`, or tab button with visible focus and a disabled reason in text.
- Reuse the existing item atlas. Crafted items may use a two-source composite treatment in CSS; do not add new images unless the atlas cannot keep the result readable at actual card size.

---

### Task 1: Add the six-slot inventory domain

**Files:**
- Modify: `src/domain/types.ts`
- Create: `src/domain/equipment-inventory.ts`
- Create: `tests/equipment-inventory.test.mjs`

- [ ] **Step 1: Write failing inventory tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addInventoryItem,
  equipInventoryStack,
  inventoryStackKey,
  sellInventoryStack,
} from '../dist/domain/equipment-inventory.js';

const item = (id, kind = 'weapon', rank = 1) => ({
  id, kind, name: id, rank, power: 0.1, legendary: rank >= 5,
});
const empty = () => ({
  coins: 0, weapon: null, armor: null, accessory: null,
  healingPotions: 1, inventory: [], discoveredRecipes: [],
});

test('same id and rank stacks while six distinct stacks fill the inventory', () => {
  let state = empty();
  for (let i = 0; i < 6; i += 1) state = addInventoryItem(state, item(`w${i}`)).state;
  assert.equal(addInventoryItem(state, item('w6')).ok, false);
  const stacked = addInventoryItem(state, item('w0'));
  assert.equal(stacked.ok, true);
  assert.equal(stacked.state.inventory[0].count, 2);
  assert.equal(stacked.state.inventory.length, 6);
});

test('equipping swaps the previous item into inventory atomically', () => {
  const state = addInventoryItem({ ...empty(), weapon: item('old') }, item('new')).state;
  const out = equipInventoryStack(state, inventoryStackKey('new', 1));
  assert.equal(out.state.weapon.id, 'new');
  assert.equal(out.state.inventory.some((stack) => stack.id === 'old'), true);
});

test('sale refunds 35 percent of base price and removes one unit', () => {
  const state = addInventoryItem(empty(), item('arcane-staff')).state;
  const out = sellInventoryStack(state, inventoryStackKey('arcane-staff', 1), 200);
  assert.equal(out.state.coins, 70);
  assert.equal(out.state.inventory.length, 0);
});
```

- [ ] **Step 2: Run the test to verify the module is missing**

Run: `node --test tests/equipment-inventory.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `dist/domain/equipment-inventory.js`.

- [ ] **Step 3: Extend the types and implement immutable helpers**

Add these contracts to `src/domain/types.ts`:

```ts
export interface EquipmentStack extends EquippedItem {
  count: number;
}

export interface EquipmentState {
  coins: number;
  weapon: EquippedItem | null;
  armor: EquippedItem | null;
  accessory?: EquippedItem | null;
  healingPotions: number;
  inventory: EquipmentStack[];
  discoveredRecipes: string[];
}

export interface EquipmentTransactionResult {
  ok: boolean;
  state: EquipmentState;
  message: string;
  newlyDiscoveredRecipeId?: string;
}
```

Implement in `src/domain/equipment-inventory.ts`:

```ts
export const EQUIPMENT_INVENTORY_CAPACITY = 6;

export function inventoryStackKey(id: string, rank: number): string {
  return `${id}@${Math.max(1, Math.floor(rank))}`;
}

export function addInventoryItem(
  state: EquipmentState,
  item: EquippedItem,
  count = 1,
): EquipmentTransactionResult;

export function canStoreInventoryItem(
  state: EquipmentState,
  item: Pick<EquippedItem, 'id' | 'rank'>,
): boolean;

export function equipInventoryStack(
  state: EquipmentState,
  stackKey: string,
): EquipmentTransactionResult;

export function sellInventoryStack(
  state: EquipmentState,
  stackKey: string,
  basePrice: number,
): EquipmentTransactionResult;
```

Clone the inventory and equipped items before mutation. `equipInventoryStack` must preflight space for the displaced item, decrement one selected stack, and add the previous equipped item back using the normal stack rule. `sellInventoryStack` removes one and calculates `Math.floor(basePrice * 0.35)`.

- [ ] **Step 4: Compile and run the focused test**

Run: `.\node_modules\.bin\tsc.cmd`

Run: `node --test tests/equipment-inventory.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit only the inventory files**

```powershell
git add src/domain/types.ts src/domain/equipment-inventory.ts tests/equipment-inventory.test.mjs
git commit -m "feat: add equipment inventory domain"
```

---

### Task 2: Route shop purchases into equipment slots or inventory

**Files:**
- Modify: `src/domain/economy.ts`
- Modify: `src/game/shop-purchase-projection.ts`
- Modify: `src/game/shop-guidance.ts`
- Modify: `tests/economy.test.mjs`
- Modify: `tests/three-slot-equipment.test.mjs`
- Modify: `tests/shop-purchase-projection.test.mjs`
- Modify: `tests/shop-guidance.test.mjs`

- [ ] **Step 1: Replace the old duplicate-auto-upgrade expectations with the approved purchase flow**

Add coverage equivalent to:

```js
test('first purchase auto-equips and later purchases enter inventory', () => {
  const first = purchaseOffer(empty(), staff).state;
  assert.equal(first.weapon.id, 'arcane-staff');
  const second = purchaseOffer(first, staff).state;
  assert.equal(second.weapon.rank, 1);
  assert.deepEqual(second.inventory.map(({ id, rank, count }) => ({ id, rank, count })), [
    { id: 'arcane-staff', rank: 1, count: 1 },
  ]);
});

test('a full inventory blocks a distinct purchase without charging gold', () => {
  const before = fullInventoryState();
  const out = purchaseOffer(before, rapidWand);
  assert.equal(out.ok, false);
  assert.equal(out.state, before);
  assert.match(out.message, /보관함/);
});
```

Also assert that `projectShopPurchase` reports `즉시 장착`, `보관함 저장`, or `보관함 가득` and that quick-buy guidance rejects a purchase which cannot fit.

- [ ] **Step 2: Run the affected tests and observe the old behavior**

Run: `node --test tests/economy.test.mjs tests/three-slot-equipment.test.mjs tests/shop-purchase-projection.test.mjs tests/shop-guidance.test.mjs`

Expected: FAIL because duplicate purchases still raise the equipped rank and full inventory is unknown.

- [ ] **Step 3: Refactor `purchaseOffer` without changing potion behavior**

Use one preflight path:

```ts
const purchased: EquippedItem = {
  id: offer.id,
  kind: offer.kind,
  name: offer.name,
  rank: 1,
  power: offer.power,
  legendary: false,
};

if (state[offer.kind] === null || state[offer.kind] === undefined) {
  return successWithAutoEquip(state, purchased, price);
}
if (!canStoreInventoryItem(state, purchased)) {
  return { ok: false, state, message: '보관함이 가득 찼습니다 · 장비 판매 또는 조합 필요' };
}
return successWithInventoryItem(state, purchased, price);
```

Retain `shopOfferPrice` for shop cards, but base it on the offered base price rather than the rank of the currently equipped item. Strengthening costs move to the forge in Task 3. Update purchase projection and fast recommendation checks to call `canStoreInventoryItem` before describing a purchase as safe.

- [ ] **Step 4: Compile and run the affected tests**

Run: `.\node_modules\.bin\tsc.cmd`

Run: `node --test tests/economy.test.mjs tests/three-slot-equipment.test.mjs tests/shop-purchase-projection.test.mjs tests/shop-guidance.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the purchase routing**

```powershell
git add src/domain/economy.ts src/game/shop-purchase-projection.ts src/game/shop-guidance.ts tests/economy.test.mjs tests/three-slot-equipment.test.mjs tests/shop-purchase-projection.test.mjs tests/shop-guidance.test.mjs
git commit -m "feat: route equipment purchases into inventory"
```

---

### Task 3: Define recipes and atomic strengthen/combine transactions

**Files:**
- Create: `src/game/equipment-recipes.ts`
- Create: `src/domain/equipment-forge.ts`
- Create: `tests/equipment-recipes.test.mjs`
- Create: `tests/equipment-forge.test.mjs`

- [ ] **Step 1: Write recipe-catalog tests**

```js
import {
  equipmentRecipes,
  hiddenRecipePresentation,
} from '../dist/game/equipment-recipes.js';

test('catalog contains six visible and three hidden recipes', () => {
  const recipes = equipmentRecipes();
  assert.equal(recipes.filter((recipe) => !recipe.hidden).length, 6);
  assert.equal(recipes.filter((recipe) => recipe.hidden).length, 3);
  assert.deepEqual(recipes.find((recipe) => recipe.id === 'celestial-fusion-staff').ingredientIds,
    ['arcane-accelerator', 'alchemical-blast-staff']);
});

test('hidden recipe reveals hint, craft readiness, then permanent details', () => {
  assert.equal(hiddenRecipePresentation(hiddenRecipe, [], [], []).visibility, 'hidden');
  assert.equal(hiddenRecipePresentation(hiddenRecipe, [oneIngredient], [], []).visibility, 'hint');
  assert.equal(hiddenRecipePresentation(hiddenRecipe, [oneIngredient, otherIngredient], [], []).name, '???');
  assert.equal(hiddenRecipePresentation(hiddenRecipe, [], [], [hiddenRecipe.id]).visibility, 'revealed');
});
```

- [ ] **Step 2: Write forge transaction tests**

Cover all of these cases:

```js
test('rank one strengthening consumes one stored duplicate and 150 gold', () => {
  const out = strengthenEquipment(stateWithEquippedStaffAndDuplicate, { place: 'equipped', kind: 'weapon' }, 90);
  assert.equal(out.ok, true);
  assert.equal(out.state.weapon.rank, 2);
  assert.equal(out.state.coins, beforeCoins - 150);
  assert.equal(out.state.inventory.length, 0);
});

test('rank three strengthening needs two duplicates and 800 gold', () => { /* exact assertions */ });
test('time lock, missing gold, or missing material returns the same state object', () => { /* each reason */ });
test('visible recipe consumes two rank-two inventory items and makes a rank-three result', () => { /* exact assertions */ });
test('hidden recipe produces rank-five result and records discovery in the same state', () => { /* exact assertions */ });
test('equipped items are never counted as crafting material', () => { /* same object on failure */ });
test('craft preflight accounts for ingredient stacks freed by the result', () => { /* succeeds from six stacks */ });
```

- [ ] **Step 3: Run both tests to verify the APIs are absent**

Run: `node --test tests/equipment-recipes.test.mjs tests/equipment-forge.test.mjs`

Expected: FAIL with missing compiled modules.

- [ ] **Step 4: Implement the recipe catalog**

Use explicit definitions so UI copy, transaction validation, and balance calculations share one source:

```ts
export interface EquipmentRecipe {
  id: string;
  hidden: boolean;
  ingredientIds: readonly [string, string];
  minimumIngredientRank: number;
  goldCost: number;
  result: EquippedItem;
  description: string;
  hint: string;
}

export function equipmentRecipes(): readonly EquipmentRecipe[];
export function equipmentRecipe(id: string): EquipmentRecipe | null;
export function recipesForOwnedItems(state: EquipmentState, permanentDiscoveries: readonly string[]): EquipmentRecipePresentation[];
```

Encode the approved six visible recipes at rank 3 and the three hidden recipes at rank 5. Hidden presentation states are `hidden`, `hint`, `ready-secret`, and `revealed`; only permanent discoveries expose exact hidden stats without current ingredients.

- [ ] **Step 5: Implement deterministic forge rules**

```ts
export type EquipmentTarget =
  | { place: 'equipped'; kind: EquipmentKind }
  | { place: 'inventory'; stackKey: string };

export interface StrengthenRequirement {
  materialCount: number;
  goldCost: number;
  unlockAtSeconds: number;
}

export function strengthenRequirement(rank: number): StrengthenRequirement {
  if (rank === 1) return { materialCount: 1, goldCost: 150, unlockAtSeconds: 90 };
  if (rank === 2) return { materialCount: 1, goldCost: 350, unlockAtSeconds: 240 };
  if (rank === 3) return { materialCount: 2, goldCost: 800, unlockAtSeconds: 480 };
  if (rank === 4) return { materialCount: 2, goldCost: 1800, unlockAtSeconds: 720 };
  const goldCost = Math.min(25000, Math.round(1800 * 1.32 ** (rank - 4) / 10) * 10);
  return { materialCount: 1, goldCost, unlockAtSeconds: 720 + (rank - 4) * 120 };
}

export function strengthenEquipment(
  state: EquipmentState,
  target: EquipmentTarget,
  elapsedSeconds: number,
): EquipmentTransactionResult;

export function combineEquipment(
  state: EquipmentState,
  recipeId: string,
): EquipmentTransactionResult;
```

Strengthening may use inventory units with the same ID and rank at most the target rank, lowest rank first. If the target itself is in an inventory stack, reserve one unit as the target before counting materials. Combining uses inventory only, consumes one eligible item for each ingredient, then auto-equips the result only when that equipment slot is empty; otherwise it stores the result. Validate the result destination after simulating ingredient removal and before charging gold.

- [ ] **Step 6: Compile and run forge tests**

Run: `.\node_modules\.bin\tsc.cmd`

Run: `node --test tests/equipment-recipes.test.mjs tests/equipment-forge.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit forge domain and recipe data**

```powershell
git add src/game/equipment-recipes.ts src/domain/equipment-forge.ts tests/equipment-recipes.test.mjs tests/equipment-forge.test.mjs
git commit -m "feat: add equipment strengthening and crafting"
```

---

### Task 4: Apply crafted equipment bonuses and the hidden set once

**Files:**
- Modify: `src/game/shop-data.ts`
- Modify: `src/game/equipment-sets.ts`
- Modify: `tests/equipment-bonuses.test.mjs`
- Modify: `tests/three-slot-equipment.test.mjs`
- Create: `tests/equipment-hidden-set.test.mjs`

- [ ] **Step 1: Write failing effect tests for every crafted result**

Create table-driven assertions that every visible and hidden result changes its documented channels. Include exact hidden-set assertions:

```js
test('three hidden results activate Genesis Legacy exactly once', () => {
  const states = equipmentSetStates(genesisState);
  const genesis = states.find((set) => set.id === 'genesis-legacy');
  assert.equal(genesis?.threeActive, true);
  const once = equipmentBonuses(genesisState);
  assert.equal(once.spellPowerMultiplier, baseHiddenItems.spellPowerMultiplier * 1.35);
  assert.equal(once.cooldownMultiplier, baseHiddenItems.cooldownMultiplier * 0.88);
  assert.equal(once.heroDamageTakenMultiplier, baseHiddenItems.heroDamageTakenMultiplier * 0.78);
  assert.equal(once.coreDamageTakenMultiplier, baseHiddenItems.coreDamageTakenMultiplier * 0.78);
});
```

- [ ] **Step 2: Run focused tests and observe missing crafted IDs**

Run: `node --test tests/equipment-bonuses.test.mjs tests/three-slot-equipment.test.mjs tests/equipment-hidden-set.test.mjs`

Expected: FAIL because crafted IDs have no effect mapping or hidden set.

- [ ] **Step 3: Add crafted definitions to the shared equipment catalog**

Expose one `equipmentDefinition(id)` lookup containing base price, slot, display name, effect channels, and atlas presentation. Keep shop offer generation limited to the twelve base items and potion; crafted items must never appear as ordinary random offers.

Use the recipe descriptions as the balance contract:

- `arcane-accelerator`: spell power + cooldown.
- `alchemical-blast-staff`: area + gold.
- `wind-iron-armor`: hero damage reduction + movement.
- `gravity-guardian-armor`: pickup radius + core damage reduction.
- `thunder-wisdom-seal`: spell power + cooldown.
- `golden-bastion-talisman`: hero damage reduction + gold.
- Hidden results combine their two parent roles with a restrained upgrade over wearing either parent.

- [ ] **Step 4: Add `genesis-legacy` through the existing single bonus pipeline**

`equipmentSetStates` should return the hidden set only when all three result IDs are equipped. `applyEquipmentSets` remains the only place that multiplies set effects, using `1.35`, `0.88`, `0.78`, and `0.78` exactly once. Do not also bake those values into item definitions.

- [ ] **Step 5: Compile and rerun focused tests**

Run: `.\node_modules\.bin\tsc.cmd`

Run: `node --test tests/equipment-bonuses.test.mjs tests/three-slot-equipment.test.mjs tests/equipment-hidden-set.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit effect integration**

```powershell
git add src/game/shop-data.ts src/game/equipment-sets.ts tests/equipment-bonuses.test.mjs tests/three-slot-equipment.test.mjs tests/equipment-hidden-set.test.mjs
git commit -m "feat: apply crafted equipment and hidden set bonuses"
```

---

### Task 5: Persist inventory and permanent hidden-recipe discovery

**Files:**
- Modify: `src/domain/run-snapshot.ts`
- Modify: `src/domain/meta-profile.ts`
- Modify: `src/game/game.ts`
- Modify: `tests/run-snapshot.test.mjs`
- Modify: `tests/meta-profile.test.mjs`

- [ ] **Step 1: Add failing migration and sanitization tests**

Cover:

```js
test('old snapshot gains empty inventory and discovery arrays', () => {
  const restored = sanitizeRunSnapshot(legacySnapshotWithoutInventory);
  assert.deepEqual(restored.equipment.inventory, []);
  assert.deepEqual(restored.equipment.discoveredRecipes, []);
});

test('snapshot merges valid stacks, drops unknown items, clamps counts, and keeps six stack keys', () => {
  const restored = sanitizeRunSnapshot(snapshotWithMalformedInventory);
  assert.equal(restored.equipment.inventory.length, 6);
  assert.equal(restored.equipment.inventory.every((stack) => stack.count >= 1), true);
});

test('meta profile permanently sanitizes known hidden recipe ids', () => {
  const profile = sanitizeMetaProfile({ ...defaultMetaProfile(), discoveredEquipmentRecipes: ['celestial-fusion-staff', 'bad-id'] });
  assert.deepEqual(profile.discoveredEquipmentRecipes, ['celestial-fusion-staff']);
});
```

Also verify the serialized snapshot stays below the current 6,000-byte target with six stacks and three discoveries.

- [ ] **Step 2: Run persistence tests and see absent fields**

Run: `node --test tests/run-snapshot.test.mjs tests/meta-profile.test.mjs`

Expected: FAIL on missing normalized inventory/discovery data.

- [ ] **Step 3: Sanitize inventory against the catalog**

Export or reuse `sanitizeEquipmentInventory(raw)` from `equipment-inventory.ts`. Accept only IDs known by `equipmentDefinition`, require the item's declared kind, clamp rank to `1..10000`, clamp count to `1..99`, merge duplicate `id@rank` keys, and stop at six distinct keys. Set missing `inventory` and `discoveredRecipes` to empty arrays when restoring older saves.

- [ ] **Step 4: Add permanent recipe knowledge to the existing meta profile**

```ts
export interface MetaProfile {
  version: 1;
  shards: number;
  upgrades: MetaUpgradeLevels;
  discoveredEquipmentRecipes: string[];
}

export function discoverEquipmentRecipe(profile: MetaProfile, recipeId: string): MetaProfile;
```

Keep the additive version-1 schema to avoid a separate migration key. `defaultMetaProfile` supplies `[]`; the sanitizer keeps only the three known hidden recipe IDs and de-duplicates them. Export `sanitizeMetaProfile` so migration behavior can be tested directly.

- [ ] **Step 5: Wire transaction discovery to both persistence layers**

After a successful `combineEquipment`, assign `result.state` first. If `newlyDiscoveredRecipeId` exists, call `discoverEquipmentRecipe`, then `saveStoredMetaProfile`. Snapshot creation/restoration already transports the full `EquipmentState`; make sure new-run initialization creates both arrays.

- [ ] **Step 6: Compile and run persistence tests**

Run: `.\node_modules\.bin\tsc.cmd`

Run: `node --test tests/run-snapshot.test.mjs tests/meta-profile.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit persistence changes**

```powershell
git add src/domain/run-snapshot.ts src/domain/meta-profile.ts src/game/game.ts tests/run-snapshot.test.mjs tests/meta-profile.test.mjs
git commit -m "feat: persist equipment inventory and recipe discovery"
```

---

### Task 6: Tune gold progression and calculate survival readiness

**Files:**
- Create: `src/game/equipment-survival-readiness.ts`
- Modify: `src/game/shop-guidance.ts`
- Modify: `src/game/shop-purchase-projection.ts`
- Modify: `scripts/equipment-balance-report.mjs`
- Create: `tests/equipment-survival-readiness.test.mjs`
- Modify: `tests/shop-guidance.test.mjs`

- [ ] **Step 1: Write failing readiness tests at the approved milestones**

```js
import {
  equipmentReadiness,
  projectEquipmentSurvival,
} from '../dist/game/equipment-survival-readiness.js';

test('unarmed player becomes clearly underprepared after eight minutes', () => {
  const out = equipmentReadiness({ elapsedSeconds: 480, heroMaxHp: 333, state: emptyState });
  assert.equal(out.label, '준비 부족');
  assert.ok(out.heroSurvivalHits < out.recommended.heroSurvivalHits * 0.8);
});

test('recommended defensive rare build reaches survivable range at eight minutes', () => {
  const out = equipmentReadiness({ elapsedSeconds: 480, heroMaxHp: 333, state: defensiveRareState });
  assert.equal(out.label, '생존 가능');
});

test('projection exposes hero hits, core multiplier, and firepower separately', () => {
  const out = projectEquipmentSurvival(context, candidateState);
  assert.match(out.summary, /생존 .*타/);
  assert.match(out.summary, /수호핵/);
  assert.match(out.summary, /화력/);
});
```

Add budget assertions for 5, 8, 12, 15, and 20 minutes: the conservative 25% gold route can afford one defensive priority at each required checkpoint; the 45% route can add attack/economy or hidden progress. Assert milestone labels instead of one opaque score.

- [ ] **Step 2: Run the new test and verify the readiness API is absent**

Run: `node --test tests/equipment-survival-readiness.test.mjs tests/shop-guidance.test.mjs`

Expected: FAIL with missing readiness module.

- [ ] **Step 3: Implement transparent readiness metrics**

```ts
export interface EquipmentReadinessContext {
  elapsedSeconds: number;
  heroMaxHp: number;
  state: EquipmentState;
}

export interface EquipmentReadinessResult {
  label: '준비 부족' | '생존 가능' | '안정';
  heroSurvivalHits: number;
  coreDamageMultiplier: number;
  firepowerIndex: number;
  recommended: {
    heroSurvivalHits: number;
    coreDamageMultiplier: number;
    firepowerIndex: number;
  };
  weakestMetric: 'hero' | 'core' | 'firepower';
}

export function equipmentReadiness(context: EquipmentReadinessContext): EquipmentReadinessResult;
export function equipmentSurvivalDelta(before: EquipmentReadinessResult, after: EquipmentReadinessResult): string;
```

Derive current contact damage from the same elapsed-time danger curve used by combat, then divide effective hero HP by that damage. Compute firepower from spell-power, cooldown, and area multipliers while leaving each component available to tests. Encode recommendation anchors as a small table for 300/480/720/900/1200 seconds and interpolate between them. Apply the approved `<80%`, `80–120%`, and `>=120% plus core` label rules.

- [ ] **Step 4: Rank guidance by the weakest survival metric and storage pressure**

Before normal offer scoring, emit `보관함 정리 필요` when six distinct stacks prevent the recommended buy. Otherwise compare projected state readiness and produce one concrete line such as `영웅 생존 부족 · 장착 시 약 4타 증가`. Keep quick buy disabled for forge actions; no recipe may craft automatically.

- [ ] **Step 5: Expand the deterministic balance report**

Have `scripts/equipment-balance-report.mjs` print, for each milestone and 25%/45% income route: earned gold, spend, equipped ranks, inventory usage, hero hits, core multiplier, firepower, and readiness label. Exit nonzero when any conservative route cannot reach its defensive target or when an unarmed 8-minute route is not at least 20% behind the recommended build.

- [ ] **Step 6: Compile, test, and run the report**

Run: `.\node_modules\.bin\tsc.cmd`

Run: `node --test tests/equipment-survival-readiness.test.mjs tests/shop-guidance.test.mjs`

Run: `node scripts/equipment-balance-report.mjs`

Expected: tests PASS and report exits 0 with all milestone rows marked PASS.

- [ ] **Step 7: Commit balance and readiness work**

```powershell
git add src/game/equipment-survival-readiness.ts src/game/shop-guidance.ts src/game/shop-purchase-projection.ts scripts/equipment-balance-report.mjs tests/equipment-survival-readiness.test.mjs tests/shop-guidance.test.mjs
git commit -m "feat: balance equipment around survival readiness"
```

---

### Task 7: Build the purchase/forge shop UI and connect transactions

**Files:**
- Modify: `src/ui/shop.ts`
- Modify: `src/styles.css`
- Modify: `src/game/game.ts`
- Create: `tests/equipment-crafting-ui.test.mjs`
- Modify: `tests/shop-guidance.test.mjs`
- Modify: `tests/accessibility-release-audit.test.mjs`

- [ ] **Step 1: Write source-contract and DOM behavior tests**

Use the repository's existing DOM test pattern if available; otherwise keep the test to exported view-model helpers plus source contracts. Cover:

```js
test('shop exposes purchase and forge tabs without drag interactions', () => {
  assert.match(shopSource, /role="tablist"/);
  assert.match(shopSource, /구매/);
  assert.match(shopSource, /대장간/);
  assert.doesNotMatch(shopSource, /dragstart|drop|draggable/);
});

test('forge shows three equipped slots, six inventory slots, recipe costs, and survival metrics', () => {
  assert.match(shopSource, /shop-equipped-slot/);
  assert.match(shopSource, /Array\.from\(\{ length: 6 \}/);
  assert.match(shopSource, /강화 재료/);
  assert.match(shopSource, /영웅 생존/);
  assert.match(shopSource, /수호핵/);
  assert.match(shopSource, /화력/);
});
```

Also test that hidden recipes render no card, hint/`???`, or exact details according to the presentation state, and that disabled actions include the reason as visible text.

- [ ] **Step 2: Run the UI tests and verify the one-page shop fails them**

Run: `node --test tests/equipment-crafting-ui.test.mjs tests/shop-guidance.test.mjs tests/accessibility-release-audit.test.mjs`

Expected: FAIL because tabs, inventory, forge actions, and recipe presentations are absent.

- [ ] **Step 3: Expand the shop view model and handlers**

```ts
export type ShopTab = 'purchase' | 'forge';

export interface ShopViewModel {
  activeTab: ShopTab;
  selectedStackKey?: string | null;
  elapsedSeconds: number;
  heroMaxHp: number;
  permanentRecipeDiscoveries: readonly string[];
  state: EquipmentState;
  offers: ShopDisplayOffer[];
  recipes: EquipmentRecipePresentation[];
  readiness: EquipmentReadinessResult;
  rerollPrice: number;
  // retain current guidance, impact, quick-offer, and fast-path fields
}

export interface ShopHandlers {
  onTabChange: (tab: ShopTab) => void;
  onSelectStack: (stackKey: string) => void;
  onEquip: (stackKey: string) => void;
  onStrengthen: (target: EquipmentTarget) => void;
  onCombine: (recipeId: string) => void;
  onSell: (stackKey: string) => void;
  // retain current purchase/reroll/close handlers
}
```

Store `activeTab` and selected stack in `Game`, not inside disposable DOM nodes, so refreshes preserve player context.

- [ ] **Step 4: Render the compact purchase tab**

Keep the current offer grid, accessibility, recommendation, reroll, and quick-buy behavior. Change rank copy from direct upgrade to `빈 슬롯 · 즉시 장착` or `보관함 · 현재 N개`. Show a visible full-inventory explanation. Add a top readiness strip with the three raw metrics and weakest-metric recommendation.

- [ ] **Step 5: Render the forge tab**

Render in this order:

1. Three equipped buttons with grade and primary effect.
2. Exactly six inventory buttons, including empty slots and stack counts.
3. Selected-item action panel with `장착`, `강화`, and `판매` buttons plus requirements and disabled reason.
4. Recipe list: six always-visible recipes followed by eligible hidden presentations.

Use click selection only. Recipe cards always state ingredient names/grades, gold cost, result effects, and projected `영웅 생존 · 수호핵 · 화력` deltas. A hidden hint card must not place the secret name or numeric stats in DOM text or accessibility labels before permanent discovery.

- [ ] **Step 6: Add responsive styles without covering combat HUD alerts**

Constrain `.shop-panel` to the viewport, scroll only its content body, keep header/tabs/footer sticky inside the modal, and switch inventory/recipe grids to fewer columns at existing mobile breakpoints. Ensure the earlier upper-left alert fix remains untouched because the modal owns its own stacking context.

- [ ] **Step 7: Wire every handler through one transaction applier**

In `Game.refreshShopOverlay`, add:

```ts
const applyEquipmentTransaction = (result: EquipmentTransactionResult): boolean => {
  if (!result.ok) {
    this.shopImpactMessage = result.message;
    this.refreshShopOverlay();
    return false;
  }
  this.equipmentState = result.state;
  if (result.newlyDiscoveredRecipeId) {
    this.metaProfile = discoverEquipmentRecipe(this.metaProfile, result.newlyDiscoveredRecipeId);
    this.saveStoredMetaProfile();
  }
  this.shopImpactMessage = result.message;
  this.syncEquipmentState();
  this.refreshShopOverlay();
  return true;
};
```

Call this helper from purchase, equip, strengthen, combine, and sale handlers. Resolve sale base prices through `equipmentDefinition`; reject unknown IDs. Reset tab and selection on a fresh shop visit, but preserve them across refreshes. Supply drops use the same purchase placement rules and show a storage-full message instead of silently deleting an item.

- [ ] **Step 8: Compile and run UI tests**

Run: `.\node_modules\.bin\tsc.cmd`

Run: `node --test tests/equipment-crafting-ui.test.mjs tests/shop-guidance.test.mjs tests/accessibility-release-audit.test.mjs`

Expected: PASS.

- [ ] **Step 9: Commit the shop integration**

```powershell
git add src/ui/shop.ts src/styles.css src/game/game.ts tests/equipment-crafting-ui.test.mjs tests/shop-guidance.test.mjs tests/accessibility-release-audit.test.mjs
git commit -m "feat: add shop forge and crafting interface"
```

---

### Task 8: Complete regression, balance, and browser verification

**Files:**
- Modify if required by findings: only files already named above
- Update if behavior changed: `docs/superpowers/specs/2026-09-10-equipment-inventory-crafting-design.md`

- [ ] **Step 1: Audit implementation against the approved spec**

Check every visible recipe name/cost/result, every hidden recipe name/cost/result, strengthening costs, unlock times, six-stack capacity, 35% sale value, three hidden-set multipliers, and permanent discovery. Search for stale UI copy suggesting that buying a duplicate directly strengthens it.

Run: `rg -n "즉시 강화|구매.*강화|전설 완성|dragstart|draggable" src tests`

Expected: no stale purchase-to-strengthen claim and no drag interaction.

- [ ] **Step 2: Run type checking and all equipment-focused tests**

Run: `.\node_modules\.bin\tsc.cmd`

Run: `node --test tests/equipment-*.test.mjs tests/economy.test.mjs tests/three-slot-equipment.test.mjs tests/shop-*.test.mjs tests/run-snapshot.test.mjs tests/meta-profile.test.mjs`

Expected: PASS.

- [ ] **Step 3: Run the full parallel test suite**

Run: `node scripts/verify-tests-parallel.mjs`

Expected: all tests pass with zero failures. Record the exact pass count in the final report.

- [ ] **Step 4: Run the deterministic balance report**

Run: `node scripts/equipment-balance-report.mjs`

Expected: 5/8/12/15/20-minute conservative and generous routes pass; unarmed 8-minute state is clearly below recommended survival/firepower.

- [ ] **Step 5: Verify the real UI in a browser**

Start the repository's existing local development server and use the browser verification skill. At desktop and mobile viewport sizes, verify:

- purchase tab opens with readiness and correct first-buy/storage labels;
- first weapon auto-equips and the next distinct weapon enters inventory;
- six distinct stacks display, stack counts increment, and the seventh distinct purchase is blocked with visible reason;
- forge selection supports equip, strengthen, sell, and ordinary recipe crafting;
- hidden recipe is absent with no component, shows a vague `???` hint with one component, enables with both components, and remains fully revealed after reload once crafted;
- three hidden results activate `창세의 유산` and its summary once;
- tab switching and all buttons work with keyboard focus;
- no upper-left HUD alert overlaps, console errors, missing images, or horizontal viewport overflow occur.

- [ ] **Step 6: Fix only evidence-backed issues and repeat the narrow failed check**

For each issue, add or tighten one meaningful test first, make the smallest correction, compile, and rerun that test. Repeat the full suite only if production code changed after Step 3.

- [ ] **Step 7: Review the final diff for scope and placeholders**

Run: `git diff --check`

Run: `rg -n "TODO|FIXME|placeholder|coming soon" src/domain/equipment-* src/game/equipment-* src/ui/shop.ts`

Run: `git status --short`

Expected: no whitespace errors, no unfinished copy/code, and only intended pre-existing plus feature files appear.

- [ ] **Step 8: Commit any final verified corrections with exact paths**

```powershell
git add <only-the-corrected-files>
git commit -m "fix: finalize equipment crafting balance"
```

Skip this commit when verification required no correction. Do not push; report the local commits and verification evidence to the user.
