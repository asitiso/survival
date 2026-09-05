import test from 'node:test';
import assert from 'node:assert/strict';
import {
  StrategicActionReleaseTracker,
  strategicActionReleaseRadius,
} from '../dist/core/strategic-action-release.js';

test('phase 1304 strategic release radius reuses the actual touch radius with the proven leash scale',()=>{
  assert.equal(strategicActionReleaseRadius(46,1.30),46*1.30*1.20);
});

test('phase 1306 pointerup commits an armed strategic action exactly once',()=>{
  const tracker=new StrategicActionReleaseTracker();
  assert.equal(tracker.arm(1,'shop',{x:100,y:100},72),true);
  assert.equal(tracker.commit(1),'shop');
  assert.equal(tracker.commit(1),null);
});

test('phase 1312 moving beyond the release boundary cancels commit permanently for that pointer',()=>{
  const tracker=new StrategicActionReleaseTracker();
  tracker.arm(2,'auto',{x:100,y:100},60);
  assert.equal(tracker.move(2,{x:161,y:100}),'auto');
  assert.equal(tracker.commit(2),null);
  assert.equal(tracker.move(2,{x:100,y:100}),null);
});

test('phase 1320 one strategic action accepts only one owner pointer at a time',()=>{
  const tracker=new StrategicActionReleaseTracker();
  assert.equal(tracker.arm(3,'auto',{x:100,y:100},60),true);
  assert.equal(tracker.arm(4,'auto',{x:100,y:100},60),false);
  assert.equal(tracker.commit(4),null);
  assert.equal(tracker.commit(3),'auto');
});

test('phase 1322 shop and auto can have independent owner pointers',()=>{
  const tracker=new StrategicActionReleaseTracker();
  assert.equal(tracker.arm(5,'shop',{x:100,y:100},60),true);
  assert.equal(tracker.arm(6,'auto',{x:200,y:100},60),true);
  assert.equal(tracker.commit(5),'shop');
  assert.equal(tracker.commit(6),'auto');
});

test('phase 1328 cancel and clear discard armed strategic actions without committing',()=>{
  const tracker=new StrategicActionReleaseTracker();
  tracker.arm(7,'shop',{x:100,y:100},60);
  assert.equal(tracker.cancel(7),'shop');
  assert.equal(tracker.commit(7),null);
  tracker.arm(8,'auto',{x:200,y:100},60);
  tracker.clear();
  assert.equal(tracker.commit(8),null);
});
