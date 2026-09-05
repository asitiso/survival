import test from 'node:test';
import assert from 'node:assert/strict';
import { landscapeSafeAreaProfile } from '../dist/game/landscape-safe-area.js';
import { resolveFoldableDeadSpace } from '../dist/game/foldable-dead-space.js';
import { ACTION_BUTTONS } from '../dist/game/config.js';

const safe=landscapeSafeAreaProfile(2208,1840);

test('hinge remains neutral and never becomes interactive',()=>{
  const h=safe.hingeExclusion;
  const out=resolveFoldableDeadSpace({x:h.x+h.width/2,y:650},safe,ACTION_BUTTONS);
  assert.equal(out.intent,'neutral');
  assert.equal(out.recovered,false);
});

test('left dead strip can recover a clamped joystick origin without crossing hinge',()=>{
  const h=safe.hingeExclusion;
  const out=resolveFoldableDeadSpace({x:h.x-12,y:650},safe,ACTION_BUTTONS);
  assert.equal(out.intent,'left');
  assert.equal(out.recovered,true);
  assert.ok(out.joystickOrigin.x<h.x);
});

test('right dead strip can recover nearest action target without changing layout',()=>{
  const h=safe.hingeExclusion;
  const out=resolveFoldableDeadSpace({x:930,y:724},safe,ACTION_BUTTONS);
  assert.equal(out.intent,'right');
  assert.equal(out.recovered,true);
  assert.ok(out.actionId);
  assert.deepEqual(ACTION_BUTTONS.map((b)=>[b.x,b.y]),[[1188,724],[1308,648],[1314,800],[1438,724],[1480,558],[1480,828],[1080,616],[1090,510],[1060,724]]);
});

test('non foldable profiles are strict no-op',()=>{
  const normal=landscapeSafeAreaProfile(1600,900);
  const out=resolveFoldableDeadSpace({x:780,y:700},normal,ACTION_BUTTONS);
  assert.equal(out.enabled,false);
  assert.equal(out.recovered,false);
});
