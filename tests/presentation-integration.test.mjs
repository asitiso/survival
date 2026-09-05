import test from 'node:test';
import assert from 'node:assert/strict';
import { PRESENTATION_LAYER_ORDER, nextPresentationQuality, criticalCuePolicy } from '../dist/game/presentation-integration.js';

test('presentation layer order keeps decorative friendly vfx below enemy danger telegraphs and hud', () => {
  const decoration = PRESENTATION_LAYER_ORDER.indexOf('friendly-decoration');
  const enemyProjectiles = PRESENTATION_LAYER_ORDER.indexOf('enemy-projectiles');
  const telegraphs = PRESENTATION_LAYER_ORDER.indexOf('danger-telegraphs');
  const hud = PRESENTATION_LAYER_ORDER.indexOf('hud');
  assert.ok(decoration < enemyProjectiles);
  assert.ok(enemyProjectiles < telegraphs);
  assert.ok(telegraphs < hud);
});

test('presentation quality controller downgrades under heavy load without oscillating on borderline frames', () => {
  assert.equal(nextPresentationQuality('high', 46, 0.90), 'medium');
  assert.equal(nextPresentationQuality('medium', 52, 0.70), 'medium');
  assert.equal(nextPresentationQuality('medium', 39, 0.96), 'low');
});

test('critical cue policy preserves telegraphs and hud even at low quality', () => {
  assert.deepEqual(criticalCuePolicy('low'), { telegraphs: true, bossWarnings: true, hud: true, decorativeDensity: 0.38 });
});
