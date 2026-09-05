import test from 'node:test';
import assert from 'node:assert/strict';
import { equipmentBonuses, generateShopOffers } from '../dist/game/shop-data.js';

test('ranked arcane staff increases spell power more than rank one', () => {
  const rank1 = equipmentBonuses({ coins: 0, weapon: { id: 'arcane-staff', kind: 'weapon', name: '마력 지팡이', rank: 1, power: 0.15 }, armor: null, healingPotions: 0 });
  const rank3 = equipmentBonuses({ coins: 0, weapon: { id: 'arcane-staff', kind: 'weapon', name: '마력 지팡이', rank: 3, power: 0.15 }, armor: null, healingPotions: 0 });
  assert.ok(rank3.spellPowerMultiplier > rank1.spellPowerMultiplier);
});

test('iron robe reduces incoming damage', () => {
  const bonus = equipmentBonuses({ coins: 0, weapon: null, armor: { id: 'iron-robe', kind: 'armor', name: '철갑 로브', rank: 2, power: 0.08 }, healingPotions: 0 });
  assert.ok(bonus.damageTakenMultiplier < 1);
});

test('shop always produces six concise offers', () => {
  const offers = generateShopOffers(() => 0.31);
  assert.equal(offers.length, 6);
  assert.equal(offers.filter((o) => o.kind === 'weapon').length, 2);
  assert.equal(offers.filter((o) => o.kind === 'armor').length, 2);
  assert.equal(offers.filter((o) => o.kind === 'potion').length, 2);
});

test('blast rod and golden wand create distinct offense versus economy builds', () => {
  const blast = equipmentBonuses({ coins: 0, weapon: { id: 'blast-rod', kind: 'weapon', name: '폭발 지팡이', rank: 2, power: 0.09 }, armor: null, healingPotions: 0 });
  const gold = equipmentBonuses({ coins: 0, weapon: { id: 'golden-wand', kind: 'weapon', name: '황금 완드', rank: 2, power: 0.12 }, armor: null, healingPotions: 0 });
  assert.ok(blast.areaMultiplier > 1);
  assert.equal(blast.goldMultiplier, 1);
  assert.ok(gold.goldMultiplier > 1);
  assert.equal(gold.areaMultiplier, 1);
});

test('magnet cloak and guardian plate improve pickup comfort versus core defense', () => {
  const magnet = equipmentBonuses({ coins: 0, weapon: null, armor: { id: 'magnet-cloak', kind: 'armor', name: '자석 망토', rank: 2, power: 0.16 }, healingPotions: 0 });
  const guardian = equipmentBonuses({ coins: 0, weapon: null, armor: { id: 'guardian-plate', kind: 'armor', name: '수호 갑주', rank: 2, power: 0.07 }, healingPotions: 0 });
  assert.ok(magnet.pickupMultiplier > 1);
  assert.equal(magnet.coreDamageTakenMultiplier, 1);
  assert.ok(guardian.coreDamageTakenMultiplier < 1);
});

test('shop draw contains variety beyond the same two equipment cards every visit', () => {
  const first = generateShopOffers(() => 0.10);
  const second = generateShopOffers(() => 0.90);
  const firstIds = first.filter((offer) => offer.kind !== 'potion').map((offer) => offer.id).sort();
  const secondIds = second.filter((offer) => offer.kind !== 'potion').map((offer) => offer.id).sort();
  assert.notDeepEqual(firstIds, secondIds);
});

test('legendary equipment names cover every current weapon and armor', async () => {
  const { legendaryEquipmentName } = await import('../dist/game/shop-data.js');
  assert.equal(legendaryEquipmentName('arcane-staff'), '대마도사의 심장');
  assert.equal(legendaryEquipmentName('rapid-wand'), '크로노스 셉터');
  assert.equal(legendaryEquipmentName('blast-rod'), '성운 파괴봉');
  assert.equal(legendaryEquipmentName('golden-wand'), '미다스의 손');
  assert.equal(legendaryEquipmentName('iron-robe'), '불멸의 로브');
  assert.equal(legendaryEquipmentName('gale-cloak'), '폭풍군주의 망토');
  assert.equal(legendaryEquipmentName('magnet-cloak'), '심연의 자석망토');
  assert.equal(legendaryEquipmentName('guardian-plate'), '영원의 성벽');
});

test('legendary equipment grants stronger bonuses than a normal rank five scale', () => {
  const normal = {
    coins: 0,
    weapon: { id: 'arcane-staff', kind: 'weapon', name: '마력 지팡이', rank: 5, power: 0.15, legendary: false },
    armor: null,
    healingPotions: 0,
  };
  const legendary = {
    ...normal,
    weapon: { ...normal.weapon, name: '대마도사의 심장', legendary: true },
  };
  assert.ok(equipmentBonuses(legendary).spellPowerMultiplier > equipmentBonuses(normal).spellPowerMultiplier);
});
