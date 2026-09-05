import test from 'node:test';
import assert from 'node:assert/strict';
import { composeCombatBuild } from '../dist/game/build-modifiers.js';
import { PickupManager } from '../dist/game/pickups.js';

function legendary(id, kind) {
  return { id, kind, name: id, rank: 5, power: 0.1, legendary: true };
}

const runtime = {
  spellPowerMultiplier: 1.30,
  cooldownMultiplier: 0.78,
  moveSpeedMultiplier: 1,
  heroDamageTakenMultiplier: 1,
  coreDamageTakenMultiplier: 1,
};

test('combat build composition multiplies equipment relic synergy and runtime channels once', () => {
  const result = composeCombatBuild({
    heroId: 'arkan',
    traitId: null,
    relicId: 'abyss-eye',
    equipment: { coins: 0, weapon: legendary('arcane-staff', 'weapon'), armor: null, healingPotions: 0 },
    legendaryRuntime: runtime,
  });
  assert.ok(result.spellPowerMultiplier > 2.7);
  assert.ok(result.heroDamageTakenMultiplier > 1.17);
  assert.equal(result.cooldownMultiplier, 0.78);
});

test('combat build composition carries starbreaker area and gold fever economy synergies', () => {
  const star = composeCombatBuild({
    heroId: 'seria', traitId: 'destruction', relicId: null,
    equipment: { coins: 0, weapon: legendary('blast-rod', 'weapon'), armor: null, healingPotions: 0 },
    legendaryRuntime: { ...runtime, spellPowerMultiplier: 1, cooldownMultiplier: 1 },
  });
  assert.ok(star.areaMultiplier > 1.7);
  assert.ok(star.spellPowerMultiplier > 1.07);

  const gold = composeCombatBuild({
    heroId: 'arkan', traitId: 'goldSense', relicId: null,
    equipment: { coins: 0, weapon: legendary('golden-wand', 'weapon'), armor: null, healingPotions: 0 },
    legendaryRuntime: { ...runtime, spellPowerMultiplier: 1, cooldownMultiplier: 1 },
  });
  assert.ok(gold.goldMultiplier > 2);
});

test('global magnet pulse is explicit bounded pickup manager state', () => {
  const pickups = new PickupManager();
  assert.equal(pickups.globalMagnetRemaining, 0);
  pickups.setGlobalMagnet(3);
  assert.equal(pickups.globalMagnetRemaining, 3);
  const hero = {
    profileId: 'arkan', pos: { x: 100, y: 100 }, facing: { x: 1, y: 0 }, radius: 20, speed: 100,
    maxHp: 100, hp: 100, shield: 0, maxShield: 0, level: 1, xp: 0, xpNext: 10, coins: 0, kills: 0,
    spellPower: 1, cooldownMultiplier: 1, pickupRadius: 100, healingPotions: 0,
    equipmentSpellPower: 1, equipmentCooldownMultiplier: 1, equipmentMoveSpeed: 1, equipmentDamageTakenMultiplier: 1,
    equipmentAreaMultiplier: 1, equipmentGoldMultiplier: 1, equipmentPickupMultiplier: 1, equipmentCoreDamageTakenMultiplier: 1,
    temporaryCooldownMultiplier: 1,
  };
  pickups.update(1.2, hero, { onXp() {}, onCoin() {} });
  assert.ok(pickups.globalMagnetRemaining < 2);
  pickups.update(2, hero, { onXp() {}, onCoin() {} });
  assert.equal(pickups.globalMagnetRemaining, 0);
});
