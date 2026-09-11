import test from 'node:test';
import assert from 'node:assert/strict';
import { addInventoryItem, MAX_EQUIPMENT_STACK_COUNT } from '../dist/domain/equipment-inventory.js';
import { purchaseOffer } from '../dist/domain/economy.js';
import { combineEquipment } from '../dist/domain/equipment-forge.js';
import { equipmentDefinition } from '../dist/game/shop-data.js';
import { shopGuidanceForOffers, shopTopRecommendations, quickShopRecommendation } from '../dist/game/shop-guidance.js';
import { recipesForOwnedItems } from '../dist/game/equipment-recipes.js';
import { shopRecipeView } from '../dist/ui/shop.js';
import { loadRunSnapshot, saveRunSnapshot, sanitizeRunSnapshot } from '../dist/domain/run-snapshot.js';

const item = (id, rank = 1, count = 1) => ({ ...equipmentDefinition(id), rank, count, legendary: rank >= 5 });
const empty = () => ({ coins: 10000, weapon: null, armor: null, accessory: null, healingPotions: 1, inventory: [], discoveredRecipes: [] });

test('shared stack cap rejects a paid 100th copy before charging', () => {
  const state = { ...empty(), coins: 1000, weapon: item('arcane-staff'), inventory: [item('arcane-staff', 1, MAX_EQUIPMENT_STACK_COUNT)] };
  const result = purchaseOffer(state, equipmentDefinition('arcane-staff'));
  assert.equal(result.ok, false);
  assert.equal(result.state, state);
  assert.equal(state.coins, 1000);
  assert.match(result.message, /99/);
});

test('save and reload preserve a transaction at the shared stack cap', () => {
  const state = { ...empty(), coins: 1000, weapon: item('arcane-staff'), inventory: [item('arcane-staff', 1, 98)] };
  const purchased = purchaseOffer(state, equipmentDefinition('arcane-staff'));
  assert.equal(purchased.ok, true);
  assert.equal(purchased.state.inventory[0].count, MAX_EQUIPMENT_STACK_COUNT);
  const snapshot = {
    version: 1, savedAt: 1, heroId: 'arkan', traitId: 'glacialFocus', threatLevel: 1, elapsed: 120,
    hero: { level: 1, xp: 0, xpNext: 10, hp: 100, maxHp: 100, coins: purchased.state.coins, kills: 0 },
    coreHp: 100, spellLevels: {}, equipment: purchased.state, relic: null, fusions: [], fateChoices: [],
    map: { id: 'ruinedGate', evolutionStage: 0 }, progression: { bossesKilled: 0, goldEarned: 0, shopTokens: 0 },
  };
  const storage = new Map();
  const adapter = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) };
  saveRunSnapshot(adapter, snapshot);
  assert.equal(loadRunSnapshot(adapter).equipment.inventory[0].count, MAX_EQUIPMENT_STACK_COUNT);
});

test('retained result stack at full capacity blocks combine atomically', () => {
  const state = {
    ...empty(), weapon: item('blast-rod'), inventory: [
      item('arcane-accelerator', 3, MAX_EQUIPMENT_STACK_COUNT), item('arcane-staff', 2), item('rapid-wand', 2),
      item('blast-rod', 1), item('iron-robe', 1), item('sage-amulet', 1),
    ],
  };
  const before = structuredClone(state);
  const result = combineEquipment(state, 'arcane-accelerator');
  assert.equal(result.ok, false);
  assert.equal(result.state, state);
  assert.deepEqual(state, before);
  assert.match(result.message, /99|가득/);
});

test('retained ingredient stacks keep six slots occupied and block combine atomically', () => {
  const state = {
    ...empty(), coins: 10000, weapon: item('blast-rod'), inventory: [
      item('arcane-staff', 2, 2), item('rapid-wand', 2, 2), item('blast-rod', 1),
      item('iron-robe', 1), item('sage-amulet', 1), item('gale-cloak', 1),
    ],
  };
  const before = structuredClone(state);
  const result = combineEquipment(state, 'arcane-accelerator');
  assert.equal(result.ok, false);
  assert.equal(result.state, state);
  assert.deepEqual(state, before);
  assert.match(result.message, /가득|99/);
});

test('lower-rank stored duplicate does not outrank a useful armor purchase', () => {
  const state = { ...empty(), coins: 10000, weapon: item('arcane-staff', 3), inventory: [item('arcane-staff', 1)] };
  const armor = equipmentDefinition('iron-robe');
  const context = { heroId: 'arkan', archetype: 'burst', state, elapsedSeconds: 480, heroMaxHp: 333, permanentRecipeDiscoveries: [] };
  const guidance = shopGuidanceForOffers([armor], context);
  const top = shopTopRecommendations([armor], context, guidance);
  assert.equal(top[0]?.action, 'purchase');
  assert.equal(guidance[0]?.action, 'purchase');
  assert.equal(guidance[0]?.best, true);
  assert.equal(quickShopRecommendation([armor], guidance, state, top), armor);
});

test('top recommendations include stored crafted actions and hidden forge without leaking its result', () => {
  const state = { ...empty(), armor: item('iron-robe', 3), accessory: item('sage-amulet', 3), inventory: [item('arcane-accelerator', 3), item('alchemical-blast-staff', 3)] };
  const context = { heroId: 'arkan', archetype: 'burst', state, elapsedSeconds: 480, heroMaxHp: 333, permanentRecipeDiscoveries: [] };
  const recommendations = shopTopRecommendations([equipmentDefinition('guardian-plate')], context);
  assert.ok(recommendations.some(entry => entry.action === 'equip' && ['arcane-accelerator', 'alchemical-blast-staff'].includes(entry.offerId)));
  assert.ok(recommendations.some(entry => entry.action === 'forge' && entry.reason === '??? 조합 가능'));
  assert.equal(recommendations.some(entry => entry.reason.includes('천체 융합봉')), false);
});

test('run-only hidden discovery stays generic until permanent discovery', () => {
  const state = { ...empty(), discoveredRecipes: ['celestial-fusion-staff'], inventory: [item('arcane-accelerator', 3), item('alchemical-blast-staff', 3)] };
  const recipe = recipesForOwnedItems(state, []).find(entry => entry.id === 'celestial-fusion-staff');
  const view = shopRecipeView({ state, elapsedSeconds: 480, heroMaxHp: 333, permanentRecipeDiscoveries: [] }, recipe);
  assert.equal(view.title, '???');
  assert.equal(view.projection, '');
  assert.doesNotMatch(JSON.stringify(view), /천체 융합봉/);
  assert.deepEqual(sanitizeRunSnapshot({ version: 1, savedAt: 1, heroId: 'arkan', traitId: 'glacialFocus', threatLevel: 1, elapsed: 1, hero: { level: 1, xp: 0, xpNext: 1, hp: 1, maxHp: 1, coins: 0, kills: 0 }, coreHp: 1, spellLevels: {}, equipment: state, relic: null, fusions: [], fateChoices: [], map: { id: 'ruinedGate', evolutionStage: 0 }, progression: { bossesKilled: 0, goldEarned: 0, shopTokens: 0 } }).equipment.discoveredRecipes, ['celestial-fusion-staff']);
});
