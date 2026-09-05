import test from 'node:test';
import assert from 'node:assert/strict';
import { landscapeSafeAreaProfile } from '../dist/game/landscape-safe-area.js';

test('foldable exposes hero and status panels on opposite sides of hinge',()=>{
  const p=landscapeSafeAreaProfile(2208,1840);
  assert.equal(p.aspectClass,'foldable');
  assert.ok(p.hingeExclusion);
  assert.ok(p.heroPanel);
  assert.ok(p.statusPanel);
  assert.ok(p.heroPanel.x+p.heroPanel.width<=p.hingeExclusion.x);
  assert.ok(p.statusPanel.x>=p.hingeExclusion.x+p.hingeExclusion.width);
});

test('standard layouts keep status panel centered and no hinge split',()=>{
  const p=landscapeSafeAreaProfile(1600,900);
  assert.equal(p.hingeExclusion,undefined);
  assert.ok(p.statusPanel);
  assert.equal(p.statusPanel.x,p.headerX);
});
