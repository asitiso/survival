import test from 'node:test';
import assert from 'node:assert/strict';
import { purchaseOffer, rerollCost } from '../dist/domain/economy.js';

const empty = { coins: 1000, weapon: null, armor: null, accessory: null, healingPotions: 0, inventory: [], discoveredRecipes: [] };

test('buying a weapon spends coins and equips it', () => {
  const out = purchaseOffer(empty, { id: 'arcane-staff', kind: 'weapon', name: 'Arcane Staff', price: 300, power: 0.15 });
  assert.equal(out.ok, true);
  assert.equal(out.state.coins, 700);
  assert.equal(out.state.weapon.id, 'arcane-staff');
  assert.equal(out.state.weapon.rank, 1);
  assert.match(out.message, /즉시 장착/);
});

test('later purchase stores a rank one duplicate in inventory', () => {
  const once = purchaseOffer(empty, { id: 'arcane-staff', kind: 'weapon', name: 'Arcane Staff', price: 300, power: 0.15 }).state;
  const twice = purchaseOffer(once, { id: 'arcane-staff', kind: 'weapon', name: 'Arcane Staff', price: 300, power: 0.15 }).state;
  assert.equal(twice.weapon.rank, 1);
  assert.deepEqual(twice.inventory.map(({id,rank,count})=>({id,rank,count})), [{id:'arcane-staff',rank:1,count:1}]);
  assert.match(purchaseOffer(once, { id: 'arcane-staff', kind: 'weapon', name: 'Arcane Staff', price: 300, power: 0.15 }).message, /보관함 저장/);
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

test('duplicate purchase does not upgrade equipped rank', () => {
  const rankFour = {
    coins: 1000,
    weapon: { id: 'arcane-staff', kind: 'weapon', name: '마력 지팡이', rank: 4, power: 0.15, legendary: false },
    armor: null,
    healingPotions: 0,
    inventory: [],
    discoveredRecipes: [],
  };
  const out = purchaseOffer(rankFour, { id: 'arcane-staff', kind: 'weapon', name: '마력 지팡이', price: 200, power: 0.15 });
  assert.equal(out.ok, true);
  assert.equal(out.state.weapon.rank, 4);
  assert.equal(out.state.inventory[0].rank, 1);
});

test('legendary equipment remains equipped while duplicate is stored', () => {
  const legendary = {
    coins: 1000,
    weapon: { id: 'arcane-staff', kind: 'weapon', name: '대마도사의 심장', rank: 5, power: 0.15, legendary: true },
    armor: null,
    healingPotions: 0,
    inventory: [],
    discoveredRecipes: [],
  };
  const out = purchaseOffer(legendary, { id: 'arcane-staff', kind: 'weapon', name: '마력 지팡이', price: 200, power: 0.15 });
  assert.equal(out.state.weapon.rank, 5);
  assert.equal(out.state.weapon.legendary, true);
  assert.equal(out.state.weapon.name, '대마도사의 심장');
});

test('full inventory blocks a distinct purchase without charging gold', () => {
  const state = {...empty, weapon:{id:'arcane-staff',kind:'weapon',name:'x',rank:1,power:0,legendary:false}, inventory: Array.from({length:6}, (_,i)=>({id:`item-${i}`,kind:'weapon',name:'x',rank:1,power:0,legendary:false,count:1}))};
  const out = purchaseOffer(state, {id:'rapid-wand',kind:'weapon',name:'Rapid Wand',price:300,power:.1});
  assert.equal(out.ok,false); assert.equal(out.state,state); assert.match(out.message,/보관함/);
});
