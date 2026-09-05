import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS, ACTION_TOUCH_SCALE } from '../dist/game/config.js';
import { landscapeSafeAreaProfile } from '../dist/game/landscape-safe-area.js';
import { foldableTouchScaleMap } from '../dist/game/foldable-touch-density.js';
import { hitTestActionButton } from '../dist/core/touch-controls.js';

const standard=landscapeSafeAreaProfile(1600,900);
const foldable=landscapeSafeAreaProfile(2208,1840);

test('foldable touch density changes hit radii only and preserves all nine visual buttons',()=>{
  const profile=foldableTouchScaleMap(foldable,ACTION_BUTTONS,ACTION_TOUCH_SCALE);
  assert.equal(ACTION_BUTTONS.length,9);
  assert.deepEqual(ACTION_BUTTONS.map((b)=>b.id),['spell1','spell2','spell3','spell4','ultimate1','ultimate2','potion','shop','auto']);
  assert.equal(Object.keys(profile).length,9);
  for(const button of ACTION_BUTTONS){
    const scale=profile[button.id];
    assert.ok(scale>=.88&&scale<=ACTION_TOUCH_SCALE,`${button.id}: ${scale}`);
  }
  assert.ok(profile.auto<ACTION_TOUCH_SCALE);
  assert.ok(profile.potion<ACTION_TOUCH_SCALE);
});

test('non-foldable touch density is identical to the existing global touch scale',()=>{
  const profile=foldableTouchScaleMap(standard,ACTION_BUTTONS,ACTION_TOUCH_SCALE);
  for(const button of ACTION_BUTTONS)assert.equal(profile[button.id],ACTION_TOUCH_SCALE);
});

test('per-action scales keep nearest normalized button resolution deterministic',()=>{
  const profile=foldableTouchScaleMap(foldable,ACTION_BUTTONS,ACTION_TOUCH_SCALE);
  const auto=ACTION_BUTTONS.find((b)=>b.id==='auto');
  const spell1=ACTION_BUTTONS.find((b)=>b.id==='spell1');
  assert.ok(auto&&spell1);
  const p={x:(auto.x+spell1.x)/2,y:(auto.y+spell1.y)/2};
  const first=hitTestActionButton(p,ACTION_BUTTONS,ACTION_TOUCH_SCALE,profile);
  const second=hitTestActionButton(p,ACTION_BUTTONS,ACTION_TOUCH_SCALE,profile);
  assert.deepEqual(first,second);
  assert.ok(first?.id==='auto'||first?.id==='spell1');
});

test('input derives adaptive touch density from the same landscape safe area profile',()=>{
  const input=fs.readFileSync(new URL('../src/core/input.ts',import.meta.url),'utf8');
  assert.ok(input.includes('foldableTouchScaleMap'));
  assert.ok(input.includes('hitTestActionButton(p, ACTION_BUTTONS, ACTION_TOUCH_SCALE, touchProfile)'));
});
