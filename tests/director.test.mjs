import test from 'node:test';
import assert from 'node:assert/strict';
import { directorSnapshot } from '../dist/domain/director.js';

test('endless director increases pressure over time', () => {
  const early = directorSnapshot(60);
  const late = directorSnapshot(900);
  assert.ok(late.spawnInterval < early.spawnInterval);
  assert.ok(late.enemyBudget > early.enemyBudget);
  assert.ok(late.hpMultiplier > early.hpMultiplier);
  assert.ok(late.damageMultiplier > early.damageMultiplier);
});

test('director preserves mobile performance caps', () => {
  const apocalypse = directorSnapshot(100000);
  assert.ok(apocalypse.spawnInterval >= 0.10);
  assert.ok(apocalypse.enemyBudget <= 320);
  assert.ok(apocalypse.bossInterval > 0);
});
