import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameSource = readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

test('mobile follow camera transforms only the world before the HUD render boundary', () => {
  const transform = gameSource.indexOf('const worldCamera = cameraTransform');
  const worldRestore = gameSource.indexOf('ctx.restore();', transform);
  const hud = gameSource.indexOf('this.drawHud(ctx);', worldRestore);

  assert.ok(transform >= 0, 'Game must calculate a mobile world camera before rendering the battlefield');
  assert.ok(worldRestore > transform, 'Game must restore the canvas after rendering the battlefield');
  assert.ok(hud > worldRestore, 'HUD must stay outside the mobile world camera transform');
});

test('edge threat indicators project projectile positions through the mobile camera', () => {
  assert.match(
    gameSource,
    /cameraWorldToScreen\(projectile\.visualPos\?\?projectile\.pos,\s*this\.mobileFollowCamera\)/,
    'edge threat indicators must use camera-relative positions',
  );
});
