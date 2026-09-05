import test from 'node:test';
import assert from 'node:assert/strict';
import { RUN_TRAITS, runTrait, runTraitBonuses } from '../dist/game/run-traits.js';

test('run traits expose four distinct fast-to-read choices', () => {
  assert.equal(RUN_TRAITS.length, 4);
  assert.deepEqual(RUN_TRAITS.map((trait) => trait.id), ['destruction', 'rapidCasting', 'goldSense', 'guardianOath']);
  for (const trait of RUN_TRAITS) {
    assert.ok(trait.name.length > 0);
    assert.ok(trait.description.length > 0);
  }
});

test('destruction trades health for obvious spell damage', () => {
  assert.deepEqual(runTraitBonuses('destruction'), {
    maxHpMultiplier: 0.92,
    spellPowerMultiplier: 1.12,
    cooldownMultiplier: 1,
    moveSpeedMultiplier: 1,
    goldMultiplier: 1,
    heroDamageTakenMultiplier: 1,
    coreDamageTakenMultiplier: 1,
  });
});

test('rapid casting trades safety for cooldown speed', () => {
  const bonus = runTraitBonuses('rapidCasting');
  assert.equal(bonus.cooldownMultiplier, 0.90);
  assert.equal(bonus.heroDamageTakenMultiplier, 1.08);
});

test('gold sense trades a little damage for substantially more gold', () => {
  const bonus = runTraitBonuses('goldSense');
  assert.equal(bonus.goldMultiplier, 1.25);
  assert.equal(bonus.spellPowerMultiplier, 0.94);
});

test('guardian oath protects the core at a small movement cost', () => {
  const bonus = runTraitBonuses('guardianOath');
  assert.equal(bonus.coreDamageTakenMultiplier, 0.80);
  assert.equal(bonus.moveSpeedMultiplier, 0.95);
});

test('runTrait returns stable identity metadata', () => {
  assert.equal(runTrait('guardianOath').name, '수호 맹세');
});
