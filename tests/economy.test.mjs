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

test('potion purchase increments quick slot stock', () => {
  const out = purchaseOffer(empty, { id: 'healing-potion', kind: 'potion', name: 'Healing Potion', price: 80, power: 0.35 });
  assert.equal(out.state.healingPotions, 1);
  assert.equal(out.state.coins, 920);
});

test('insufficient coins leaves state unchanged', () => {
  const state = { ...empty, coins: 10 };
  const out = purchaseOffer(state, { id: 'arcane-staff', kind: 'weapon', name: 'Arcane Staff', price: 300, power: 0.15 });
  assert.equal(out.ok, false);
  assert.deepEqual(out.state, state);
});

test('reroll gets more expensive within visit', () => {
  assert.deepEqual([0,1,2,3].map(rerollCost), [50,100,200,400]);
});

test('rank four duplicate purchase evolves equipment into legendary rank five', () => {
  const rankFour = {
    coins: 1000,
    weapon: { id: 'arcane-staff', kind: 'weapon', name: '마력 지팡이', rank: 4, power: 0.15, legendary: false },
    armor: null,
    healingPotions: 0,
  };
  const out = purchaseOffer(rankFour, { id: 'arcane-staff', kind: 'weapon', name: '마력 지팡이', price: 200, power: 0.15 });
  assert.equal(out.ok, true);
  assert.equal(out.state.weapon.rank, 5);
  assert.equal(out.state.weapon.legendary, true);
  assert.equal(out.state.weapon.name, '대마도사의 심장');
  assert.match(out.message, /전설/);
});

test('legendary equipment remains stable at max rank on further duplicates', () => {
  const legendary = {
    coins: 1000,
    weapon: { id: 'arcane-staff', kind: 'weapon', name: '대마도사의 심장', rank: 5, power: 0.15, legendary: true },
    armor: null,
    healingPotions: 0,
  };
  const out = purchaseOffer(legendary, { id: 'arcane-staff', kind: 'weapon', name: '마력 지팡이', price: 200, power: 0.15 });
  assert.equal(out.state.weapon.rank, 5);
  assert.equal(out.state.weapon.legendary, true);
  assert.equal(out.state.weapon.name, '대마도사의 심장');
});
