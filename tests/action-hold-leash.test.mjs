import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTION_HOLD_LEASH_SCALE,
  actionHoldReleaseRadius,
  shouldReleaseActionHold,
} from '../dist/core/action-hold-leash.js';

test('phase 1223 action hold leash starts at 1.20x the actual touch hit radius',()=>{
  assert.equal(ACTION_HOLD_LEASH_SCALE,1.20);
  assert.equal(actionHoldReleaseRadius(58,1.30),58*1.30*1.20);
});

test('phase 1224 action hold leash tolerates jitter inside the release radius',()=>{
  const radius=actionHoldReleaseRadius(58,1.30);
  assert.equal(shouldReleaseActionHold({x:100+radius-0.01,y:100},{x:100,y:100},radius),false);
});

test('phase 1225 action hold leash releases immediately outside the release radius',()=>{
  const radius=actionHoldReleaseRadius(58,1.30);
  assert.equal(shouldReleaseActionHold({x:100+radius+0.01,y:100},{x:100,y:100},radius),true);
});

test('phase 1226 action hold leash sanitizes invalid scale without collapsing the boundary',()=>{
  const radius=actionHoldReleaseRadius(58,Number.NaN);
  assert.ok(Number.isFinite(radius));
  assert.ok(radius>58);
});

test('phase 1235 leash tracker detaches once and does not reactivate on re-entry',async()=>{
  const { ActionHoldLeashTracker }=await import('../dist/core/action-hold-leash.js');
  const tracker=new ActionHoldLeashTracker();
  tracker.begin(7,'spell1',{x:100,y:100},50);
  assert.equal(tracker.move(7,{x:151,y:100}),'spell1');
  assert.equal(tracker.move(7,{x:100,y:100}),null);
});

test('phase 1241 leash tracker end and clear are idempotent',async()=>{
  const { ActionHoldLeashTracker }=await import('../dist/core/action-hold-leash.js');
  const tracker=new ActionHoldLeashTracker();
  tracker.begin(1,'spell1',{x:0,y:0},50);
  assert.equal(tracker.end(1),'spell1');
  assert.equal(tracker.end(1),null);
  tracker.begin(2,'spell2',{x:0,y:0},50);
  tracker.clear();
  assert.equal(tracker.end(2),null);
});
