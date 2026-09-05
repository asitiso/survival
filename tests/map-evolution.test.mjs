import test from 'node:test';
import assert from 'node:assert/strict';
import { mapEvolutionStage, evolveMapLayout, mapEvolutionLabel } from '../dist/game/map-evolution.js';
import { MAP_LAYOUTS } from '../dist/game/map-layouts.js';

test('map evolution stages occur only at start eight and sixteen minutes', () => {
  assert.equal(mapEvolutionStage(0), 0);
  assert.equal(mapEvolutionStage(479.9), 0);
  assert.equal(mapEvolutionStage(480), 1);
  assert.equal(mapEvolutionStage(959.9), 1);
  assert.equal(mapEvolutionStage(960), 2);
});

for (const layout of MAP_LAYOUTS) {
  test(`${layout.id} materially changes at both evolution stages`, () => {
    const one = evolveMapLayout(layout, 1);
    const two = evolveMapLayout(layout, 2);
    assert.notDeepEqual({ walls: one.walls, pools: one.pools, crystals: one.crystals }, { walls: layout.walls, pools: layout.pools, crystals: layout.crystals });
    assert.notDeepEqual({ walls: two.walls, pools: two.pools, crystals: two.crystals }, { walls: one.walls, pools: one.pools, crystals: one.crystals });
    assert.ok(mapEvolutionLabel(layout.id, 1).length > 0);
    assert.ok(mapEvolutionLabel(layout.id, 2).length > 0);
  });
}

test('evolving the same stage is deterministic and does not mutate the source layout', () => {
  const source = MAP_LAYOUTS[0];
  const before = JSON.stringify(source);
  assert.deepEqual(evolveMapLayout(source, 2), evolveMapLayout(source, 2));
  assert.equal(JSON.stringify(source), before);
});
