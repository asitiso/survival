import test from 'node:test';
import assert from 'node:assert/strict';

const lanes = await import('../dist/game/elite-affix-cue-lanes.js');

test('phase 4557 a fresh lane state acquires the requested lane with a short stability hold', () => {
  const state = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: -1, dt: 0, importantEvent: false });
  assert.equal(state.lane, -1);
  assert.ok(state.holdTtl >= 0.09);
  assert.ok(state.releaseTtl > 0);
});

test('phase 4558 routine priority reorder does not flip lane ownership while the current hold is alive', () => {
  const first = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: -1, dt: 0, importantEvent: false });
  const held = lanes.advanceEliteAffixCueLane(first, { desiredLane: 1, dt: 0.04, importantEvent: false });
  assert.equal(held.lane, -1);
  assert.ok(held.holdTtl < first.holdTtl);
});

test('phase 4559 routine lane handoff becomes legal after hold and release fully expire', () => {
  const first = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: -1, dt: 0, importantEvent: false });
  const switched = lanes.advanceEliteAffixCueLane(first, { desiredLane: 1, dt: 0.30, importantEvent: false });
  assert.equal(switched.lane, 1);
  assert.ok(switched.holdTtl > 0);
});

test('phase 4560 important strike or break ownership can bypass a routine lane hold immediately', () => {
  const first = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: -1, dt: 0, importantEvent: false });
  const switched = lanes.advanceEliteAffixCueLane(first, { desiredLane: 1, dt: 0.01, importantEvent: true });
  assert.equal(switched.lane, 1);
  assert.ok(switched.holdTtl >= first.holdTtl);
});

test('phase 4561 stable desired ownership only decays timers and never refreshes them every frame', () => {
  const first = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: 1, dt: 0, importantEvent: false });
  const second = lanes.advanceEliteAffixCueLane(first, { desiredLane: 1, dt: 0.05, importantEvent: false });
  assert.equal(second.lane, 1);
  assert.ok(second.holdTtl < first.holdTtl);
  const third = lanes.advanceEliteAffixCueLane(second, { desiredLane: 1, dt: 0.30, importantEvent: false });
  assert.equal(third.holdTtl, 0);
  assert.equal(third.releaseTtl, 0);
});

test('phase 4562 invalid or non-finite delta time cannot destabilize lane timers', () => {
  const first = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: -1, dt: 0, importantEvent: false });
  const second = lanes.advanceEliteAffixCueLane(first, { desiredLane: -1, dt: Number.NaN, importantEvent: false });
  assert.deepEqual(second, first);
});
