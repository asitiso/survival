import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCircleVsRect } from '../dist/game/terrain.js';
import { HERO_PROFILES } from '../dist/game/hero-profiles.js';
import { catastropheAt, catastropheModifiers } from '../dist/domain/catastrophe.js';

test('wall collision pushes a circle out of a blocking rectangle', () => {
  const rect = { x: 100, y: 100, w: 120, h: 80 };
  const out = resolveCircleVsRect({ x: 130, y: 130 }, 20, rect);
  const closestX = Math.max(rect.x, Math.min(out.x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(out.y, rect.y + rect.h));
  assert.ok(Math.hypot(out.x - closestX, out.y - closestY) >= 19.999);
});

test('four hero profiles expose materially different starting identities', () => {
  assert.equal(HERO_PROFILES.length, 4);
  assert.equal(new Set(HERO_PROFILES.map((p) => p.id)).size, 4);
  assert.ok(new Set(HERO_PROFILES.map((p) => `${p.baseHp}:${p.baseSpeed}:${p.cooldownMultiplier}:${p.spellPower}`)).size >= 3);
});

test('catastrophes begin after twenty minutes and rotate indefinitely', () => {
  assert.equal(catastropheAt(1199), null);
  const first = catastropheAt(1200);
  const next = catastropheAt(1380);
  assert.notEqual(first, null);
  assert.notEqual(next, null);
  assert.notEqual(first.id, next.id);
  assert.equal(catastropheAt(1200 + 180 * 100)?.id !== undefined, true);
});


test('catastrophe rotation mixes helpful harmful and mixed long-run modifiers', () => {
  const seen = Array.from({ length: 6 }, (_, i) => catastropheAt(1200 + 180 * i)).filter(Boolean);
  assert.ok(new Set(seen.map((entry) => entry.id)).size >= 4);
  const modifiers = seen.map((entry) => catastropheModifiers(entry));
  assert.ok(modifiers.some((entry) => entry.goldMultiplier > 1 || entry.cooldownMultiplier < 1 || entry.coreDamageMultiplier < 1));
  assert.ok(modifiers.some((entry) => entry.enemySpeedMultiplier > 1 || entry.spawnPressureMultiplier > 1 || entry.eliteIntervalMultiplier < 1));
  assert.ok(modifiers.some((entry) => entry.cooldownMultiplier < 1 && entry.enemySpeedMultiplier > 1));
});

test('catastrophe modifier defaults are neutral before catastrophe phase', () => {
  assert.deepEqual(catastropheModifiers(null), {
    goldMultiplier: 1,
    enemySpeedMultiplier: 1,
    cooldownMultiplier: 1,
    spawnPressureMultiplier: 1,
    eliteIntervalMultiplier: 1,
    coreDamageMultiplier: 1,
  });
});
