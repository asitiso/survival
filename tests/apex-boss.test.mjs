import test from 'node:test';
import assert from 'node:assert/strict';
import { apexBossProfile, apexPatternPair, apexPressureModifiers } from '../dist/game/apex-boss.js';

test('apex boss eligibility begins after twenty minutes on high threat and is not constant', () => {
  assert.equal(apexBossProfile(1199, 5, 2).active, false);
  assert.equal(apexBossProfile(1200, 2, 2).active, false);
  assert.equal(apexBossProfile(1200, 3, 2).active, true);
  assert.equal(apexBossProfile(1200, 3, 3).active, false);
  assert.equal(apexBossProfile(1800, 5, 5).active, true);
});

test('apex pattern pair contains exactly two distinct boss channels', () => {
  for (let i = 0; i < 12; i += 1) {
    const pair = apexPatternPair('inferno', i);
    assert.equal(pair.length, 2);
    assert.equal(pair[0], 'inferno');
    assert.notEqual(pair[0], pair[1]);
  }
});

test('apex pressure increases complexity without doubling enemy or projectile pressure', () => {
  const mod = apexPressureModifiers(true);
  assert.ok(mod.specialCadenceMultiplier < 1);
  assert.ok(mod.projectileDensityMultiplier > 1 && mod.projectileDensityMultiplier <= 1.35);
  assert.ok(mod.summonCountMultiplier <= 1.2);
  assert.equal(apexPressureModifiers(false).projectileDensityMultiplier, 1);
});
