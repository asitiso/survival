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
