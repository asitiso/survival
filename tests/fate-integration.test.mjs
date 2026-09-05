import test from 'node:test';
import assert from 'node:assert/strict';
import { composeFatePressure, fateRewardMultipliers, fateHudSummary } from '../dist/game/fate-integration.js';
import { composeFateModifiers } from '../dist/game/fate-paths.js';

test('fate pressure composes once on top of existing pressure', () => {
  const base = { enemySpeedMultiplier: 1.1, spawnPressureMultiplier: 1.2, eliteIntervalMultiplier: 0.9, bossVariantBonus: 1 };
  const fate = composeFateModifiers(['frenzy', 'golden']);
  const out = composeFatePressure(base, fate);
  assert.ok(out.spawnPressureMultiplier > base.spawnPressureMultiplier);
  assert.ok(out.enemySpeedMultiplier > base.enemySpeedMultiplier);
  assert.ok(out.eliteIntervalMultiplier < base.eliteIntervalMultiplier);
  assert.ok(out.bossVariantBonus <= 2);
  assert.ok(out.spawnPressureMultiplier < 2);
});

test('fate reward multipliers expose xp gold shop and core channels without hidden damage nerf', () => {
  const fate = composeFateModifiers(['golden', 'guardian']);
  const rewards = fateRewardMultipliers(fate);
  assert.ok(rewards.goldMultiplier > 1);
  assert.ok(rewards.shopTokenMultiplier > 1);
  assert.ok(rewards.coreDamageTakenMultiplier < 1);
  assert.equal('playerDamageMultiplier' in rewards, false);
});

test('fate HUD summary stays compact', () => {
  assert.equal(fateHudSummary([]), '운명 미선택');
  assert.match(fateHudSummary(['frenzy', 'golden', 'guardian']), /광란.*황금.*수호/);
  assert.ok(fateHudSummary(['frenzy', 'golden', 'guardian']).length < 32);
});
