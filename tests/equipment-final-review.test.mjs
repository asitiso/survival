import test from 'node:test';
import assert from 'node:assert/strict';
import * as inventory from '../dist/domain/equipment-inventory.js';
import { purchaseOffer } from '../dist/domain/economy.js';
import { combineEquipment, strengthenEquipment } from '../dist/domain/equipment-forge.js';
import { loadRunSnapshot, saveRunSnapshot } from '../dist/domain/run-snapshot.js';
import { equipmentDefinition } from '../dist/game/shop-data.js';
import { shopGuidanceForOffers, quickShopRecommendation } from '../dist/game/shop-guidance.js';
import { recipesForOwnedItems } from '../dist/game/equipment-recipes.js';
import * as shop from '../dist/ui/shop.js';

const item = (id, rank = 1, count = 1) => ({ ...equipmentDefinition(id), rank, count, legendary: rank >= 5 });
const empty = () => ({ coins: 10000, weapon: null, armor: null, accessory: null, inventory: [], discoveredRecipes: [], healingPotions: 1 });
const context = state => ({ state, elapsedSeconds: 900, heroMaxHp: 10000, heroId: 'arkan', archetype: 'burst', permanentRecipeDiscoveries: [] });
const offers = [equipmentDefinition('healing-potion')];

test('paid 100th stored copy is rejected visibly and survives save/reload without charge or loss', () => {
  const state = { ...empty(), weapon: item('arcane-staff'), inventory: [item('arcane-staff', 1, 99)] };
  const before = structuredClone(state), offer = equipmentDefinition('arcane-staff');
  const result = purchaseOffer(state, offer);
  assert.equal(result.ok, false);
  assert.equal(result.state, state);
  assert.deepEqual(state, before);
  assert.match(result.message, /99/);
  const view = shop.shopPurchaseView(context(state), offer);
  assert.equal(view.disabled, true); assert.match(view.reason, /99/);
  const data = new Map(), storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  saveRunSnapshot(storage, { version: 1, savedAt: 123456, heroId: 'arkan', traitId: 'glacialFocus', threatLevel: 0, elapsed: 900,
    hero: { level: 1, xp: 0, xpNext: 100, hp: 100, maxHp: 100, coins: state.coins, kills: 0 }, coreHp: 100,
    spellLevels: {}, equipment: result.state, relic: null, fusions: [], fateChoices: [], map: { id: 'frozenFen', evolutionStage: 0 },
    progression: { bossesKilled: 0, goldEarned: 0, shopTokens: 0 } });
  const loaded = loadRunSnapshot(storage);
  assert.equal(loaded.equipment.coins, before.coins);
  assert.equal(loaded.equipment.inventory[0].count, 99);
});

test('domain stack maximum rejects overflow additions, swaps and forge output atomically', () => {
  assert.equal(inventory.EQUIPMENT_MAX_STACK_COUNT, 99);
  const state = { ...empty(), weapon: item('arcane-staff'), inventory: [item('arcane-staff', 1, 99), item('rapid-wand')] };
  const before = structuredClone(state);
  for (const result of [inventory.addInventoryItem(state, item('arcane-staff')), inventory.equipInventoryStack(state, 'rapid-wand@1')]) {
    assert.equal(result.ok, false); assert.equal(result.state, state); assert.match(result.message, /99/);
  }
  assert.equal(inventory.canStoreInventoryItem(state, item('arcane-staff')), false);
  assert.equal(inventory.addInventoryItem(empty(), item('arcane-staff'), 100).ok, false);
  assert.deepEqual(state, before);
  const forge = { ...empty(), weapon: item('rapid-wand'), inventory: [item('arcane-staff', 2, 3), item('rapid-wand', 2, 2), item('arcane-accelerator', 3, 99), item('arcane-staff', 3, 99)] };
  const frozen = structuredClone(forge);
  for (const result of [combineEquipment(forge, 'arcane-accelerator'), strengthenEquipment(forge, { place: 'inventory', stackKey: 'arcane-staff@2' }, 900)]) {
    assert.equal(result.ok, false); assert.equal(result.state, forge); assert.match(result.message, /99/);
  }
  assert.deepEqual(forge, frozen);
});

test('combine cannot fit output when both consumed ingredient stacks retain copies in six slots', () => {
  const state = { ...empty(), weapon: item('rapid-wand'), inventory: [item('arcane-staff', 2, 2), item('rapid-wand', 2, 2), item('blast-rod'), item('golden-wand'), item('iron-robe'), item('gale-cloak')] };
  const before = structuredClone(state), result = combineEquipment(state, 'arcane-accelerator');
  assert.equal(result.ok, false); assert.equal(result.state, state); assert.deepEqual(state, before);
});

test('stored crafted equipment leads a justified equip recommendation without offer cards', () => {
  for (const count of [1, 3]) {
    const state = { ...empty(), weapon: item('golden-wand'), armor: item('iron-robe', 5), inventory: [item('arcane-accelerator', 3, count)] };
    const before = structuredClone(state), guidance = shopGuidanceForOffers(offers, context(state));
    const best = guidance.find(entry => entry.best);
    assert.ok(best); assert.equal(best.action, 'equip');
    assert.match(best.reason, /비전 가속봉 장착/);
    assert.equal(quickShopRecommendation(offers, guidance, state), null); assert.deepEqual(state, before);
  }
});

test('equipped crafted strengthening is recommended without its ordinary offer', () => {
  const state = { ...empty(), weapon: item('arcane-accelerator', 3), armor: item('iron-robe', 5), inventory: [item('arcane-accelerator', 3, 2)] };
  const guidance = shopGuidanceForOffers(offers, context(state));
  assert.equal(guidance.find(entry => entry.best)?.action, 'forge');
  assert.match(guidance.find(entry => entry.best)?.reason ?? '', /비전 가속봉 강화/);
  assert.equal(quickShopRecommendation(offers, guidance, state), null);
});

test('hidden forge recommendation discloses only generic readiness until permanent discovery', () => {
  const state = { ...empty(), armor: item('iron-robe', 5), inventory: [item('arcane-accelerator', 3), item('alchemical-blast-staff', 3)], discoveredRecipes: ['celestial-fusion-staff'] };
  const guidance = shopGuidanceForOffers(offers, context(state)), best = guidance.find(entry => entry.best);
  assert.ok(best); assert.equal(best.action, 'forge'); assert.equal(best.reason, '??? 조합 가능');
  assert.doesNotMatch(best.label + best.reason, /천체|비전|연금|\d|타|지수|배율/);
  assert.equal(quickShopRecommendation(offers, guidance, state), null);
  const revealed = shopGuidanceForOffers(offers, { ...context(state), permanentRecipeDiscoveries: ['celestial-fusion-staff'] }).find(entry => entry.best);
  assert.match(revealed.reason, /천체 융합봉.*조합/);
  assert.match(revealed.reason, /지수/);
  const recipe = recipesForOwnedItems(state, []).find(entry => entry.id === 'celestial-fusion-staff');
  assert.equal(recipe.result, undefined); assert.equal(recipe.ingredientIds, undefined);
  const view = shop.shopRecipeView(context(state), recipe);
  assert.equal(view.title, '???'); assert.equal(view.projection, '');
  assert.doesNotMatch(JSON.stringify(view), /천체 융합봉|비전 가속봉|연금 폭발봉/);
});

test('Genesis summary contains its one three-piece effect and no empty two-piece tier', () => {
  assert.equal(typeof shop.shopSetSummary, 'function');
  const state = { ...empty(), weapon: item('celestial-fusion-staff', 5), armor: item('world-tree-armor', 5), accessory: item('fate-core', 5) };
  const lines = shop.shopSetSummary(state);
  assert.equal(lines.length, 1); assert.match(lines[0], /창세의 유산.*3부위/);
  assert.doesNotMatch(lines[0], /2부위/); assert.equal((lines[0].match(/마법 피해/g) ?? []).length, 1);
});
