import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTION_BUTTONS, ACTION_TOUCH_SCALE } from '../dist/game/config.js';
import { mobileLandscapeTouchScale } from '../dist/game/mobile-landscape-presentation.js';
import { hitTestActionButton } from '../dist/core/touch-controls.js';

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

for (const [width, height] of [[568,320],[667,375],[844,390],[932,430],[1024,520]]) {
  test(`mobile controls remain large, separated and tappable at ${width}x${height}`, () => {
    withViewport({innerWidth:width,innerHeight:height}, () => {
      const buttons = ACTION_BUTTONS.map(entry => ({...entry}));
      const scale = Math.min(width / 1600, height / 900);
      const touchScale = mobileLandscapeTouchScale(ACTION_TOUCH_SCALE);
      for (const button of buttons) {
        if (button.id.startsWith('spell') || button.id.startsWith('ultimate')) {
          assert.ok(button.radius * 2 * scale >= 60, `${button.id} must be at least 60 CSS px wide`);
        }
        // Include the largest assist ring and half its stroke width.
        const extent = button.radius * 1.24 + 2.5;
        assert.ok(button.x - extent >= 0 && button.x + extent <= 1600, `${button.id} horizontal clipping`);
        assert.ok(button.y - extent >= 0 && button.y + extent <= 900, `${button.id} vertical clipping`);
        assert.equal(hitTestActionButton(button, buttons, touchScale)?.id, button.id);
        for (const other of buttons) {
          if (button.id === other.id) continue;
          const distance = Math.hypot(button.x-other.x, button.y-other.y);
          assert.ok(distance >= (button.radius+other.radius)*1.24+5, `${button.id}/${other.id} highlight overlap`);
          assert.ok(distance > (button.radius+other.radius)*touchScale, `${button.id}/${other.id} touch overlap`);
        }
      }
    });
  });
}
