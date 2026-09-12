import test from 'node:test';
import assert from 'node:assert/strict';
import {
  equipmentBonuses,
  equipmentCatalog,
  equipmentDefinition,
  generateShopOffers,
} from '../dist/game/shop-data.js';

const empty = { coins: 0, weapon: null, armor: null, accessory: null, healingPotions: 0 };
const crafted = [
  ['arcane-accelerator', 'weapon', '비전 가속봉', 700, 3, .24, ['spellPowerMultiplier', 'cooldownMultiplier'], { spellPowerMultiplier: 1.54, cooldownMultiplier: .82 }],
  ['alchemical-blast-staff', 'weapon', '연금 폭발봉', 650, 3, .17, ['areaMultiplier', 'goldMultiplier'], { areaMultiplier: 1.33, goldMultiplier: 1.42 }],
  ['wind-iron-armor', 'armor', '바람 철갑', 750, 3, .13, ['damageTakenMultiplier', 'moveSpeedMultiplier'], { damageTakenMultiplier: .76, moveSpeedMultiplier: 1.24 }],
  ['gravity-guardian-armor', 'armor', '중력 수호갑', 800, 3, .16, ['pickupMultiplier', 'coreDamageTakenMultiplier'], { pickupMultiplier: 1.48, coreDamageTakenMultiplier: .79 }],
  ['thunder-wisdom-seal', 'accessory', '현뢰의 인장', 600, 3, .14, ['spellPowerMultiplier', 'cooldownMultiplier'], { spellPowerMultiplier: 1.33, cooldownMultiplier: .85 }],
  ['golden-bastion-talisman', 'accessory', '황금 성채 부적', 650, 3, .14, ['damageTakenMultiplier', 'goldMultiplier'], { damageTakenMultiplier: .805, goldMultiplier: 1.39 }],
  ['celestial-fusion-staff', 'weapon', '천체 융합봉', 2800, 5, .31, ['spellPowerMultiplier', 'areaMultiplier', 'cooldownMultiplier'], { spellPowerMultiplier: 2.215, areaMultiplier: 1.8775, cooldownMultiplier: .55 }],
  ['world-tree-armor', 'armor', '세계수 성갑', 3200, 5, .24, ['damageTakenMultiplier', 'coreDamageTakenMultiplier', 'moveSpeedMultiplier'], { damageTakenMultiplier: .5275, coreDamageTakenMultiplier: .56125, moveSpeedMultiplier: 1.4725 }],
  ['fate-core', 'accessory', '운명의 핵', 2500, 5, .22, ['spellPowerMultiplier', 'cooldownMultiplier', 'goldMultiplier', 'damageTakenMultiplier'], { spellPowerMultiplier: 1.81, cooldownMultiplier: .62875, goldMultiplier: 1.7425, damageTakenMultiplier: .62875 }],
];

test('every crafted result applies only its documented combat channels', () => {
  for (const [id, kind, name, price, rank, power, channels, expected] of crafted) {
    const definition = equipmentDefinition(id);
    assert.deepEqual(
      { id: definition?.id, kind: definition?.kind, name: definition?.name, price: definition?.price, basePrice: definition?.basePrice, power: definition?.power, effectChannels: definition?.effectChannels },
      { id, kind, name, price, basePrice: price, power, effectChannels: channels },
      id,
    );
    assert.deepEqual(definition?.atlas, { source: 'shop-items-enhanced', position: '50% 50%', textFallback: true }, id);
    const bonuses = equipmentBonuses({ ...empty, [kind]: { id, kind, name, rank, power, legendary: rank >= 5 } });
    for (const [stat, value] of Object.entries(bonuses)) {
      const want = expected[stat] ?? 1;
      assert.ok(Math.abs(value - want) < 1e-9, `${id}/${stat}: expected ${want}, got ${value}`);
    }
  }
});

test('crafted definitions are resolvable but never become random shop offers', () => {
  assert.equal(equipmentCatalog().some((offer) => crafted.some(([id]) => offer.id === id)), false);
  for (let seed = 0; seed < 20; seed += 1) {
    assert.equal(generateShopOffers(() => seed / 20).some((offer) => crafted.some(([id]) => offer.id === id)), false);
  }
});
