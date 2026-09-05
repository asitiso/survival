import test from 'node:test';
import assert from 'node:assert/strict';
import { composeThreatPressure } from '../dist/game/phase14-runtime.js';
import { threatLevelModifiers } from '../dist/domain/threat-level.js';
import { calculateArcaneShards } from '../dist/domain/meta-rewards.js';

const base = { enemySpeedMultiplier: 1.1, spawnPressureMultiplier: 1.2, eliteIntervalMultiplier: 0.9, regularWeights: undefined };

test('threat pressure composes with existing event catastrophe and directive pressure once', () => {
  const t = threatLevelModifiers(4);
  const out = composeThreatPressure(base, t);
  assert.equal(out.enemySpeedMultiplier, base.enemySpeedMultiplier * t.enemySpeedMultiplier);
  assert.equal(out.spawnPressureMultiplier, base.spawnPressureMultiplier * t.spawnPressureMultiplier);
  assert.equal(out.eliteIntervalMultiplier, base.eliteIntervalMultiplier * t.eliteIntervalMultiplier);
  assert.equal(out.bossVariantBonus, t.bossVariantBonus);
});

test('threat level increases arcane shard reward without changing threat zero legacy payout', () => {
  const input = { seconds: 900, bosses: 4, danger: 7, kills: 1800 };
  const legacy = calculateArcaneShards(input);
  const zero = calculateArcaneShards({ ...input, threatLevel: 0 });
  const five = calculateArcaneShards({ ...input, threatLevel: 5 });
  assert.equal(zero, legacy);
  assert.ok(five >= Math.floor(legacy * 1.8));
});
