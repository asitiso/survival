import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const input = readFileSync(new URL('../src/core/input.ts', import.meta.url), 'utf8');
const mobile = readFileSync(new URL('../src/game/mobile-landscape-presentation.ts', import.meta.url), 'utf8');

test('mobile landscape level triple-tap follows the visible HUD transform', () => {
  assert.match(mobile, /export function mobileLandscapeHudLogicalPoint/);
  assert.match(mobile, /\(hudX - layout\.offsetX\) \/ layout\.scale/);
  assert.match(mobile, /hudY \/ layout\.scale/);

  assert.match(input, /mobileLandscapeHudLogicalPoint/);
  assert.match(input, /private levelPoint\(event: PointerEvent\): Vec2/);
  assert.match(input, /this\.inLevelLabel\(this\.levelPoint\(event\)\)/);
  assert.doesNotMatch(input, /this\.inLevelLabel\(this\.toLogical\(event\)\)/);
});

test('the inverse mobile HUD transform maps a visible LV point back into the base hitbox', () => {
  const viewportWidth = 800;
  const viewportHeight = 360;
  const logicalWidth = Math.max(1600, Math.round(900 * viewportWidth / viewportHeight));
  const scale = Math.max(1, Math.min(1.18, logicalWidth / 1600));
  const offsetX = Math.max(0, (logicalWidth - 1600 * scale) / 2);
  const basePoint = { x: 84.5, y: 45.5 };

  const screenX = (offsetX + basePoint.x * scale) * viewportWidth / logicalWidth;
  const screenY = basePoint.y * scale * viewportHeight / 900;
  const hudX = screenX * logicalWidth / viewportWidth;
  const hudY = screenY * 900 / viewportHeight;
  const mapped = {
    x: (hudX - offsetX) / scale,
    y: hudY / scale,
  };

  assert.ok(mapped.x >= 24 && mapped.x <= 145);
  assert.ok(mapped.y >= 26 && mapped.y <= 65);
  assert.ok(Math.abs(mapped.x - basePoint.x) < 1e-9);
  assert.ok(Math.abs(mapped.y - basePoint.y) < 1e-9);
});
