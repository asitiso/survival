import test from 'node:test';
import assert from 'node:assert/strict';
import { FATE_CHECKPOINTS, fatePathDefinition, composeFateModifiers, fateCheckpointIndex } from '../dist/game/fate-paths.js';

test('fate checkpoints occur exactly at six twelve and eighteen minutes', () => {
  assert.deepEqual(FATE_CHECKPOINTS, [360, 720, 1080]);
  assert.equal(fateCheckpointIndex(359, 0), -1);
  assert.equal(fateCheckpointIndex(360, 0), 0);
  assert.equal(fateCheckpointIndex(720, 1), 1);
  assert.equal(fateCheckpointIndex(1080, 2), 2);
  assert.equal(fateCheckpointIndex(2000, 3), -1);
});

test('three fate paths create materially different tradeoffs', () => {
  const frenzy = fatePathDefinition('frenzy');
  const golden = fatePathDefinition('golden');
  const guardian = fatePathDefinition('guardian');
  assert.ok(frenzy.modifiers.spawnPressureMultiplier > 1 && frenzy.modifiers.xpMultiplier > 1);
  assert.ok(golden.modifiers.goldMultiplier > 1 && golden.modifiers.enemySpeedMultiplier > 1);
  assert.ok(guardian.modifiers.coreDamageTakenMultiplier < 1 && guardian.modifiers.xpMultiplier < 1.01);
});

test('accumulated fate modifiers are bounded across three choices', () => {
  const mod = composeFateModifiers(['frenzy', 'golden', 'guardian']);
  assert.ok(mod.spawnPressureMultiplier <= 1.45);
  assert.ok(mod.enemySpeedMultiplier <= 1.25);
  assert.ok(mod.xpMultiplier <= 1.4);
  assert.ok(mod.goldMultiplier <= 1.55);
  assert.ok(mod.coreDamageTakenMultiplier >= 0.65);
  assert.ok(mod.bossVariantBonus <= 1);
});
