import test from 'node:test';
import assert from 'node:assert/strict';

const arena = { left: 72, top: 110, right: 1528, bottom: 828 };

async function loadCamera() {
  try {
    return await import('../dist/game/mobile-follow-camera.js');
  } catch {
    return null;
  }
}

test('phone landscape camera enlarges the world at 1.70 zoom without moving inside the dead zone', async () => {
  const camera = await loadCamera();
  assert.ok(camera, 'mobile follow camera must be available');
  const start = camera.createMobileFollowCamera({ width: 844, height: 390, arena, hero: { x: 800, y: 450 } });
  const next = camera.advanceMobileFollowCamera(start, {
    width: 844, height: 390, arena, hero: { x: 850, y: 470 }, deltaSeconds: 1 / 60,
  });
  assert.equal(start.active, true);
  assert.equal(start.zoom, 1.70);
  assert.deepEqual(next.center, start.center);
});

test('phone landscape camera follows beyond the dead zone but never exposes outside the arena', async () => {
  const camera = await loadCamera();
  assert.ok(camera, 'mobile follow camera must be available');
  const start = camera.createMobileFollowCamera({ width: 844, height: 390, arena, hero: { x: 800, y: 450 } });
  const next = camera.advanceMobileFollowCamera(start, {
    width: 844, height: 390, arena, hero: { x: 1528, y: 828 }, deltaSeconds: 1,
  });
  assert.ok(next.center.x > start.center.x);
  assert.ok(next.center.y > start.center.y);
  assert.ok(next.visible.left >= arena.left);
  assert.ok(next.visible.top >= arena.top);
  assert.ok(next.visible.right <= arena.right);
  assert.ok(next.visible.bottom <= arena.bottom);
});

test('desktop keeps the established identity projection', async () => {
  const camera = await loadCamera();
  assert.ok(camera, 'mobile follow camera must be available');
  const state = camera.createMobileFollowCamera({ width: 1600, height: 900, arena, hero: { x: 200, y: 200 } });
  assert.equal(state.active, false);
  assert.equal(state.zoom, 1);
  assert.deepEqual(camera.cameraWorldToScreen({ x: 200, y: 200 }, state), { x: 200, y: 200 });
});
