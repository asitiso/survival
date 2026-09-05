import test from 'node:test';
import assert from 'node:assert/strict';
import { balanceProjectionSeries, projectBalanceAt } from '../dist/game/balance-simulator.js';

test('balance simulator projects the four release checkpoints', () => {
  assert.deepEqual(balanceProjectionSeries(0).map((row) => row.seconds), [600, 1200, 1800, 2700]);
});

test('projected enemy pressure respects mobile caps while scaling into late game', () => {
  const rows = balanceProjectionSeries(0);
  for (const row of rows) {
    assert.ok(row.enemyBudget > 0 && row.enemyBudget <= 320);
    assert.ok(row.spawnInterval >= 0.10);
    assert.ok(row.heroDpsBand.min > 0 && row.heroDpsBand.max > row.heroDpsBand.min);
    assert.ok(row.heroDpsBand.max < 100000);
    assert.ok(row.goldPerMinute >= 40 && row.goldPerMinute <= 2500);
  }
  assert.ok(rows.at(-1).danger > rows[0].danger);
  assert.ok(rows.at(-1).xpToNextLevel > rows[0].xpToNextLevel);
});

test('higher threat increases projected encounter pressure and reward without lowering hero damage', () => {
  const safe = projectBalanceAt(1200, 0);
  const doom = projectBalanceAt(1200, 5);
  assert.ok(doom.spawnPressure > safe.spawnPressure);
  assert.ok(doom.elitePressure > safe.elitePressure);
  assert.ok(doom.shardRewardMultiplier > safe.shardRewardMultiplier);
  assert.equal(doom.heroDpsBand.min, safe.heroDpsBand.min);
  assert.equal(doom.heroDpsBand.max, safe.heroDpsBand.max);
});

test('late projections stay within explicit budget guardrails', () => {
  const late = projectBalanceAt(2700, 5);
  assert.ok(late.spawnPressure <= 1.6);
  assert.ok(late.enemySpeedMultiplier <= 1.25);
  assert.ok(late.bossVariantPressure <= 4);
  assert.ok(late.estimatedLevel <= 140);
});
