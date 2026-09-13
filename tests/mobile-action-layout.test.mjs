import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTION_BUTTONS } from '../dist/game/config.js';

const MOBILE_VIEWPORT = { innerWidth: 844, innerHeight: 390 };

function withViewport(viewport, run) {
  const previous = globalThis.window;
  globalThis.window = viewport;
  try {
    return run();
  } finally {
    globalThis.window = previous;
  }
}

function button(id) {
  const found = ACTION_BUTTONS.find((entry) => entry.id === id);
  assert.ok(found, `expected ${id} action button`);
  return found;
}

test('phone landscape action controls leave a ten-pixel gap between every button', () => {
  const buttons = withViewport(MOBILE_VIEWPORT, () => ACTION_BUTTONS.map((entry) => ({ ...entry })));
  for (let left = 0; left < buttons.length; left += 1) {
    for (let right = left + 1; right < buttons.length; right += 1) {
      const a = buttons[left];
      const b = buttons[right];
      const gap = Math.hypot(a.x - b.x, a.y - b.y) - a.radius - b.radius;
      assert.ok(gap >= 10, `${a.id}/${b.id} gap was ${gap.toFixed(1)}px`);
    }
  }
});

test('desktop action layout retains its existing coordinates and radii', () => {
  withViewport({ innerWidth: 1600, innerHeight: 900 }, () => {
    assert.deepEqual(
      ['spell1', 'spell4', 'ultimate1', 'ultimate2'].map((id) => {
        const entry = button(id);
        return [entry.x, entry.y, entry.radius];
      }),
      [[1188, 724, 58], [1438, 724, 58], [1480, 558, 68], [1480, 828, 66]],
    );
  });
});
