import test from 'node:test';
import assert from 'node:assert/strict';
import { threatLevelModifiers, clampThreatLevel, threatLevelName, threatUnlockAfterRun } from '../dist/domain/threat-level.js';

test('threat levels clamp to zero through five and have readable names', () => {
  assert.equal(clampThreatLevel(-4), 0);
  assert.equal(clampThreatLevel(99), 5);
  for (let level = 0; level <= 5; level++) assert.ok(threatLevelName(level).length > 0);
});

test('higher threat increases simultaneous pressure and rewards without player damage nerfs', () => {
  const zero = threatLevelModifiers(0);
  const five = threatLevelModifiers(5);
  assert.equal(zero.spawnPressureMultiplier, 1);
  assert.ok(five.spawnPressureMultiplier >= 1.45);
  assert.ok(five.eliteIntervalMultiplier < zero.eliteIntervalMultiplier);
  assert.ok(five.enemySpeedMultiplier > zero.enemySpeedMultiplier);
  assert.ok(five.shardMultiplier >= 1.8);
  assert.ok(five.bossVariantBonus >= 1);
  assert.equal('playerDamageMultiplier' in five, false);
});

test('threat unlock advances at most one tier after a qualifying run', () => {
  assert.equal(threatUnlockAfterRun(0, { seconds: 300, bosses: 0 }), 0);
  assert.equal(threatUnlockAfterRun(0, { seconds: 600, bosses: 1 }), 1);
  assert.equal(threatUnlockAfterRun(3, { seconds: 1100, bosses: 4 }), 4);
  assert.equal(threatUnlockAfterRun(5, { seconds: 9999, bosses: 99 }), 5);
});
