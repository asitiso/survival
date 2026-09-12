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

test('sale floors an exact integer-stable 35 percent refund', () => {
  const state = addInventoryItem(empty(), item('w0')).state;
  const sold = sellInventoryStack(state, inventoryStackKey('w0', 1), 2800);
  assert.equal(sold.ok, true);
  assert.equal(sold.state.coins, 980);
});

test('failed transactions preserve exact original state identity and data', () => {
  let state = empty();
  for (let i = 0; i < 6; i += 1) state = addInventoryItem(state, item(`w${i}`)).state;
  const full = addInventoryItem(state, item('w6'));
  assert.equal(full.state, state);
  assert.deepEqual(full.state.inventory, state.inventory);

  const missing = sellInventoryStack(state, inventoryStackKey('missing', 1), 200);
  assert.equal(missing.state, state);
  assert.deepEqual(missing.state.inventory, state.inventory);
});

test('equip failure preserves state when displaced item has no inventory space', () => {
  let state = { ...empty(), weapon: item('old') };
  for (let i = 0; i < 6; i += 1) state = addInventoryItem(state, item(`w${i}`)).state;
  state = addInventoryItem(state, item('w0')).state;
  const out = equipInventoryStack(state, inventoryStackKey('w0', 1));
  assert.equal(out.ok, false);
  assert.equal(out.state, state);
  assert.deepEqual(out.state.inventory, state.inventory);
  assert.equal(out.state.weapon.id, 'old');
});
