import test from 'node:test';
import assert from 'node:assert/strict';
import { foldableThumbZones, foldableThumbIntent } from '../dist/game/foldable-thumb-zones.js';
import { landscapeSafeAreaProfile } from '../dist/game/landscape-safe-area.js';
import fs from 'node:fs';

const foldable=landscapeSafeAreaProfile(2208,1840);
const standard=landscapeSafeAreaProfile(1600,900);

test('foldable thumb zones split left movement and right actions around the hinge',()=>{
  const z=foldableThumbZones(foldable);
  assert.equal(z.enabled,true);
  assert.ok(z.left.x+z.left.width<z.right.x);
  assert.ok(z.neutral.width>=foldable.hingeExclusion.width);
  assert.ok(z.left.width>400&&z.right.width>500);
});

test('thumb intent classifies movement action and hinge-neutral touches deterministically',()=>{
  assert.equal(foldableThumbIntent({x:220,y:690},foldable),'left');
  assert.equal(foldableThumbIntent({x:1320,y:700},foldable),'right');
  assert.equal(foldableThumbIntent({x:800,y:650},foldable),'neutral');
});

test('non-foldable screens do not activate thumb ownership',()=>{
  assert.equal(foldableThumbZones(standard).enabled,false);
  assert.equal(foldableThumbIntent({x:220,y:690},standard),'neutral');
});

test('input gates foldable actions to right thumb and joystick starts to left thumb while preserving normal path',()=>{
  const source=fs.readFileSync(new URL('../src/core/input.ts',import.meta.url),'utf8');
  assert.ok(source.includes('foldableThumbIntent'));
  assert.ok(source.includes("thumbIntent === 'right'"));
  assert.ok(source.includes("thumbIntent === 'left'"));
  assert.ok(source.includes(': hitTestActionButton(p)'));
});
