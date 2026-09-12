import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryStackKey } from '../dist/domain/equipment-inventory.js';
import {
  combineEquipment,
  strengthenEquipment,
  strengthenRequirement,
} from '../dist/domain/equipment-forge.js';

const item = (id, kind = 'weapon', rank = 1) => ({
  id, kind, name: id, rank, power: 0.1, legendary: rank >= 5,
});
const stack = (id, kind = 'weapon', rank = 1, count = 1) => ({ ...item(id, kind, rank), count });
const empty = () => ({
  coins: 10000, weapon: null, armor: null, accessory: null,
  healingPotions: 1, inventory: [], discoveredRecipes: [],
});

test('rank one strengthening consumes one stored duplicate and 150 gold', () => {
  const state = { ...empty(), coins: 1000, weapon: item('arcane-staff'), inventory: [stack('arcane-staff')] };
  const out = strengthenEquipment(state, { place: 'equipped', kind: 'weapon' }, 90);
  assert.equal(out.ok, true);
  assert.equal(out.state.weapon.rank, 2);
  assert.equal(out.state.coins, 850);
  assert.equal(out.state.inventory.length, 0);
});

test('rank three strengthening uses two eligible duplicates and 800 gold', () => {
  const state = {
    ...empty(), coins: 2000, weapon: item('arcane-staff', 'weapon', 3),
    inventory: [stack('arcane-staff', 'weapon', 3), stack('arcane-staff', 'weapon', 2)],
  };
  const out = strengthenEquipment(state, { place: 'equipped', kind: 'weapon' }, 480);
  assert.equal(out.ok, true);
  assert.equal(out.state.weapon.rank, 4);
  assert.equal(out.state.coins, 1200);
  assert.equal(out.state.inventory.length, 0);
});

test('strengthening reserves an inventory target and consumes lower-rank materials first', () => {
  const state = {
    ...empty(), coins: 1000,
    inventory: [stack('arcane-staff', 'weapon', 2, 2), stack('arcane-staff', 'weapon', 1, 1)],
  };
  const out = strengthenEquipment(state, {
    place: 'inventory', stackKey: inventoryStackKey('arcane-staff', 2),
  }, 240);
  assert.equal(out.ok, true);
  assert.equal(out.state.inventory.some((entry) => entry.rank === 1), false);
  assert.equal(out.state.inventory.find((entry) => entry.rank === 2).count, 1);
  assert.equal(out.state.inventory.find((entry) => entry.rank === 3).count, 1);
});

test('time lock, missing gold, or missing material returns the same state object', () => {
  const locked = { ...empty(), weapon: item('arcane-staff'), inventory: [stack('arcane-staff')] };
  assert.equal(strengthenEquipment(locked, { place: 'equipped', kind: 'weapon' }, 89).state, locked);

  const poor = { ...locked, coins: 149 };
  assert.equal(strengthenEquipment(poor, { place: 'equipped', kind: 'weapon' }, 90).state, poor);

  const bare = { ...empty(), weapon: item('arcane-staff') };
  assert.equal(strengthenEquipment(bare, { place: 'equipped', kind: 'weapon' }, 90).state, bare);
});

test('strengthening requirements retain the approved costs and legendary cap', () => {
  assert.deepEqual(strengthenRequirement(4), { materialCount: 2, goldCost: 1800, unlockAtSeconds: 720 });
  assert.equal(strengthenRequirement(100).goldCost, 25000);
});

test('visible recipe consumes two rank-two inventory items and makes a rank-three result', () => {
  const state = {
    ...empty(), coins: 1000,
    inventory: [stack('arcane-staff', 'weapon', 2), stack('rapid-wand', 'weapon', 2)],
  };
  const out = combineEquipment(state, 'arcane-accelerator');
  assert.equal(out.ok, true);
  assert.equal(out.state.weapon.id, 'arcane-accelerator');
  assert.equal(out.state.weapon.rank, 3);
  assert.equal(out.state.coins, 300);
  assert.equal(out.state.inventory.length, 0);
});

test('hidden recipe produces a rank-five result and records discovery in the same state', () => {
  const state = {
    ...empty(), coins: 5000,
    inventory: [stack('arcane-accelerator', 'weapon', 3), stack('alchemical-blast-staff', 'weapon', 3)],
  };
  const out = combineEquipment(state, 'celestial-fusion-staff');
  assert.equal(out.ok, true);
  assert.equal(out.state.weapon.id, 'celestial-fusion-staff');
  assert.equal(out.state.weapon.rank, 5);
  assert.deepEqual(out.state.discoveredRecipes, ['celestial-fusion-staff']);
  assert.equal(out.newlyDiscoveredRecipeId, 'celestial-fusion-staff');
});

test('failed hidden combine is atomic and does not reveal the recipe', () => {
  const state = {
    ...empty(), coins: 2799,
    inventory: [stack('arcane-accelerator', 'weapon', 3), stack('alchemical-blast-staff', 'weapon', 3)],
  };
  const before = structuredClone(state);
  const out = combineEquipment(state, 'celestial-fusion-staff');
  assert.equal(out.ok, false);
  assert.equal(out.state, state);
  assert.deepEqual(state, before);
  assert.deepEqual(out.state.discoveredRecipes, []);
  assert.equal(out.newlyDiscoveredRecipeId, undefined);
});

test('equipped items are never counted as crafting material', () => {
  const state = {
    ...empty(), coins: 1000, weapon: item('arcane-staff', 'weapon', 2),
    inventory: [stack('rapid-wand', 'weapon', 2)],
  };
  const out = combineEquipment(state, 'arcane-accelerator');
  assert.equal(out.ok, false);
  assert.equal(out.state, state);
});

test('craft preflight accounts for ingredient stacks freed by the result', () => {
  const state = {
    ...empty(), coins: 1000, weapon: item('rapid-wand'),
    inventory: [
      stack('arcane-staff', 'weapon', 2), stack('rapid-wand', 'weapon', 2),
      stack('other-1'), stack('other-2'), stack('other-3'), stack('other-4'),
    ],
  };
  const out = combineEquipment(state, 'arcane-accelerator');
  assert.equal(out.ok, true);
  assert.equal(out.state.inventory.length, 5);
  assert.equal(out.state.inventory.some((entry) => entry.id === 'arcane-accelerator'), true);
});
