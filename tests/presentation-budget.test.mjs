import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptiveQuality, presentationLimits, admitEffect } from '../dist/game/presentation-budget.js';

test('presentation budget exposes hard caps while reducing decorative capacity by quality', () => {
  const high = presentationLimits('high');
  const medium = presentationLimits('medium');
  const low = presentationLimits('low');
  assert.equal(high.particlesHardCap, 180);
  assert.equal(high.trailsHardCap, 72);
  assert.equal(high.telegraphsHardCap, 24);
  assert.ok(high.decorativeParticles > medium.decorativeParticles);
  assert.ok(medium.decorativeParticles > low.decorativeParticles);
  assert.equal(low.telegraphsHardCap, 24);
});

test('adaptive quality downgrades on sustained stress and uses hysteresis before recovery', () => {
  assert.equal(adaptiveQuality('high', 45, 0.92), 'medium');
  assert.equal(adaptiveQuality('medium', 37, 0.96), 'low');
  assert.equal(adaptiveQuality('low', 58, 0.20), 'low');
  assert.equal(adaptiveQuality('low', 60, 0.10), 'medium');
  assert.equal(adaptiveQuality('medium', 60, 0.10), 'high');
});

test('telegraphs keep reserved admission even when decorative particles are saturated', () => {
  const counts = { particles: 180, trails: 72, telegraphs: 10 };
  assert.equal(admitEffect('particle', counts, 'high'), false);
  assert.equal(admitEffect('trail', counts, 'high'), false);
  assert.equal(admitEffect('telegraph', counts, 'high'), true);
  assert.equal(admitEffect('telegraph', { ...counts, telegraphs: 24 }, 'high'), false);
});
