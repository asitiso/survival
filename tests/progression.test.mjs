import test from 'node:test';
import assert from 'node:assert/strict';
import { xpNeededForLevel, enemyXpValue, dangerTierForSeconds } from '../dist/domain/progression.js';
import * as progression from '../dist/domain/progression.js';

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

test('opening XP grants leave room for combat between reward choices', () => {
  let level = 1;
  let xp = 300;
  while (xp >= xpNeededForLevel(level)) {
    xp -= xpNeededForLevel(level++);
  }
  // Keep this opening haul to two reward choices so combat has time to develop.
  assert.equal(level, 3, `300 XP reached level ${level}`);
  assert.ok(xp >= 0 && xp < xpNeededForLevel(level));
});

test('level-up recovery rewards an injured hero without exceeding maximum health', () => {
  assert.equal(typeof progression.levelUpRecovery, 'function');
  assert.equal(progression.levelUpRecovery(100, 240), 28);
  assert.equal(progression.levelUpRecovery(235, 240), 5);
  assert.equal(progression.levelUpRecovery(240, 240), 0);
  assert.equal(progression.levelUpRecovery(250, 240), 0);
});
