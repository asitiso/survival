import test from 'node:test';
import assert from 'node:assert/strict';
import { xpNeededForLevel, enemyXpValue, dangerTierForSeconds } from '../dist/domain/progression.js';

test('xp requirement increases but stays finite', () => {
  assert.ok(xpNeededForLevel(2) > xpNeededForLevel(1));
  assert.ok(xpNeededForLevel(50) > xpNeededForLevel(20));
  assert.ok(Number.isFinite(xpNeededForLevel(500)));
});

test('enemy xp rises with danger', () => {
  assert.ok(enemyXpValue(8, 10) > enemyXpValue(1, 10));
});

test('danger tier rises over survival time', () => {
  assert.equal(dangerTierForSeconds(0), 1);
  assert.ok(dangerTierForSeconds(600) > dangerTierForSeconds(120));
});
