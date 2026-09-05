import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP_LAYOUTS, selectMapLayout } from '../dist/game/map-layouts.js';

test('three tactical maps expose distinct geometry and identities', () => {
  assert.equal(MAP_LAYOUTS.length, 3);
  assert.equal(new Set(MAP_LAYOUTS.map((layout) => layout.id)).size, 3);
  assert.equal(new Set(MAP_LAYOUTS.map((layout) => `${layout.walls.length}:${layout.pools.length}:${layout.crystals.length}`)).size, 3);
});

test('map selection is deterministic from the injected random value', () => {
  assert.equal(selectMapLayout(() => 0).id, 'ruinedGate');
  assert.equal(selectMapLayout(() => 0.40).id, 'frozenFen');
  assert.equal(selectMapLayout(() => 0.99).id, 'crystalQuarry');
});

test('frozen fen emphasizes slowing while crystal quarry emphasizes environmental explosions', () => {
  const frozen = MAP_LAYOUTS.find((layout) => layout.id === 'frozenFen');
  const quarry = MAP_LAYOUTS.find((layout) => layout.id === 'crystalQuarry');
  assert.ok(frozen.pools.length >= 3);
  assert.ok(frozen.pools.some((pool) => pool.slowFactor <= 0.60));
  assert.ok(quarry.crystals.length >= 4);
  assert.ok(quarry.crystals.some((crystal) => crystal.threshold <= 5));
});
