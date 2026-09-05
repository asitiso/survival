import test from 'node:test';
import assert from 'node:assert/strict';
import { clampMagnitude, distance } from '../dist/core/math.js';

test('joystick vector is clamped to magnitude one', () => {
  const v = clampMagnitude({ x: 3, y: 4 }, 1);
  const mag = Math.hypot(v.x, v.y);
  assert.ok(Math.abs(mag - 1) < 1e-9);
});

test('vector below max magnitude is unchanged', () => {
  assert.deepEqual(clampMagnitude({ x: 0.2, y: -0.3 }, 1), { x: 0.2, y: -0.3 });
});

test('distance uses euclidean metric', () => {
  assert.equal(distance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
});
