import test from 'node:test';
import assert from 'node:assert/strict';
import { PresentationRuntime } from '../dist/game/presentation-runtime.js';

test('presentation runtime caps decorative particles and trails but reserves telegraphs', () => {
  const runtime = new PresentationRuntime('high');
  for (let i = 0; i < 260; i++) runtime.emitParticle({ x: i, y: 0, color: '#fff', ttl: 1 });
  for (let i = 0; i < 120; i++) runtime.emitTrail({ x1: i, y1: 0, x2: i + 1, y2: 1, color: '#fff', ttl: 1 });
  for (let i = 0; i < 24; i++) assert.equal(runtime.emitTelegraph({ x: i, y: 0, radius: 20, color: '#f00', ttl: 1 }), true);
  assert.equal(runtime.emitTelegraph({ x: 99, y: 0, radius: 20, color: '#f00', ttl: 1 }), false);
  assert.ok(runtime.counts.particles <= 180);
  assert.ok(runtime.counts.trails <= 72);
  assert.equal(runtime.counts.telegraphs, 24);
});

test('presentation runtime aggregates dense local death bursts after ten rapid deaths', () => {
  const runtime = new PresentationRuntime('high');
  for (let i = 0; i < 12; i++) runtime.recordDeath({ x: 100 + i, y: 100, color: '#fff', radius: 30 }, i * 0.005);
  assert.ok(runtime.deathBurstCount <= 10);
  assert.ok(runtime.aggregatedDeathCount >= 1);
});

test('presentation runtime expires transient effects without historical growth', () => {
  const runtime = new PresentationRuntime('medium');
  runtime.emitParticle({ x: 1, y: 2, color: '#fff', ttl: 0.2 });
  runtime.emitTrail({ x1: 0, y1: 0, x2: 1, y2: 1, color: '#fff', ttl: 0.2 });
  runtime.emitTelegraph({ x: 0, y: 0, radius: 20, color: '#f00', ttl: 0.2 });
  runtime.update(0.3);
  assert.deepEqual(runtime.counts, { particles: 0, trails: 0, telegraphs: 0 });
});
