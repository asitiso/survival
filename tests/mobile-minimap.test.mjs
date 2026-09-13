import test from 'node:test';
import assert from 'node:assert/strict';

async function loadMinimap() {
  try {
    return await import('../dist/game/mobile-minimap.js');
  } catch {
    return null;
  }
}

test('the mobile minimap stays collapsed by default and is disabled on desktop', async () => {
  const minimap = await loadMinimap();
  assert.ok(minimap, 'mobile minimap must be available');
  const phone = minimap.mobileMinimapLayout(844, 390, false);
  const desktop = minimap.mobileMinimapLayout(1600, 900, false);
  assert.equal(phone.active, true);
  assert.equal(phone.expanded, false);
  assert.equal(phone.panel, null);
  assert.equal(desktop.active, false);
});

test('the expanded mobile minimap projects arena positions and has a dedicated toggle hit area', async () => {
  const minimap = await loadMinimap();
  assert.ok(minimap, 'mobile minimap must be available');
  const layout = minimap.mobileMinimapLayout(844, 390, true);
  const arena = { left: 72, top: 110, right: 1528, bottom: 828 };
  const topLeft = minimap.projectMobileMinimapPoint({ x: 72, y: 110 }, arena, layout);
  const bottomRight = minimap.projectMobileMinimapPoint({ x: 1528, y: 828 }, arena, layout);

  assert.equal(layout.expanded, true);
  assert.ok(layout.panel);
  assert.ok(topLeft.x < bottomRight.x);
  assert.ok(topLeft.y < bottomRight.y);
  assert.equal(minimap.mobileMinimapToggleHit(layout.toggle, layout), true);
});
