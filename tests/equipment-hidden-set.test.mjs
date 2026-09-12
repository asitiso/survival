import test from 'node:test';
import assert from 'node:assert/strict';
import { equipmentBonuses } from '../dist/game/shop-data.js';
import { equipmentSetStates } from '../dist/game/equipment-sets.js';

const empty = { coins: 0, weapon: null, armor: null, accessory: null, healingPotions: 0 };
const hidden = {
  weapon: { id: 'celestial-fusion-staff', kind: 'weapon', name: '천체 융합봉', rank: 5, power: .31, legendary: true },
  armor: { id: 'world-tree-armor', kind: 'armor', name: '세계수 성갑', rank: 5, power: .24, legendary: true },
  accessory: { id: 'fate-core', kind: 'accessory', name: '운명의 핵', rank: 5, power: .22, legendary: true },
};

test('Genesis Legacy is absent until all three hidden results are equipped', () => {
  const incomplete = equipmentSetStates({ ...empty, weapon: hidden.weapon, armor: hidden.armor });
  assert.equal(incomplete.some((set) => set.id === 'genesis-legacy'), false);
});

test('three hidden results activate Genesis Legacy exactly once', () => {
  const genesisState = { ...empty, ...hidden };
  const states = equipmentSetStates(genesisState);
  const genesis = states.find((set) => set.id === 'genesis-legacy');
  assert.equal(genesis?.threeActive, true);
  const baseHiddenItems = Object.values(hidden)
    .map((item) => equipmentBonuses({ ...empty, [item.kind]: item }))
    .reduce((total, bonus) => Object.fromEntries(Object.entries(total).map(([stat, value]) => [stat, value * bonus[stat]])));
  const once = equipmentBonuses(genesisState);
  assert.equal(once.spellPowerMultiplier, baseHiddenItems.spellPowerMultiplier * 1.35);
  assert.equal(once.cooldownMultiplier, baseHiddenItems.cooldownMultiplier * .88);
  assert.equal(once.damageTakenMultiplier, baseHiddenItems.damageTakenMultiplier * .78);
  assert.equal(once.coreDamageTakenMultiplier, baseHiddenItems.coreDamageTakenMultiplier * .78);
});
