import test from 'node:test';
import assert from 'node:assert/strict';

const lanes = await import('../dist/game/elite-affix-cue-lanes.js');

const viewInput = {
  enemyRadius: 34,
  battlefieldStress: 0.36,
  higherPriorityCue: false,
  reducedMotion: false,
  reducedFlash: false,
};

function settled(lane) {
  const fresh = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: lane, dt: 0, importantEvent: false });
  return lanes.advanceEliteAffixCueLane(fresh, { desiredLane: lane, dt: 0.30, importantEvent: false });
}

test('phase 4611 opposite-side routine handoff enters canonical center before claiming the new side', () => {
  const handoff = lanes.advanceEliteAffixCueLane(settled(-1), { desiredLane: 1, dt: 0, importantEvent: false });
  assert.equal(handoff.lane, 0);
  assert.equal(handoff.releaseFromLane, -1);
});

test('phase 4612 center handoff keeps the old side sign while collapsing inward', () => {
  const handoff = lanes.advanceEliteAffixCueLane(settled(-1), { desiredLane: 1, dt: 0, importantEvent: false });
  const view = lanes.eliteAffixCueLanePresentation(handoff, viewInput);
  assert.ok(view.offsetY < 0);
});

test('phase 4613 repeated opposite-side routine requests stay centered until old-side release finishes', () => {
  const handoff = lanes.advanceEliteAffixCueLane(settled(-2), { desiredLane: 2, dt: 0, importantEvent: false });
  const mid = lanes.advanceEliteAffixCueLane(handoff, { desiredLane: 2, dt: 0.08, importantEvent: false });
  assert.equal(mid.lane, 0);
  assert.equal(mid.releaseFromLane, -2);
});

test('phase 4614 new-side expansion begins from center after old-side release completes', () => {
  const handoff = lanes.advanceEliteAffixCueLane(settled(-1), { desiredLane: 1, dt: 0, importantEvent: false });
  const entered = lanes.advanceEliteAffixCueLane(handoff, { desiredLane: 1, dt: 0.25, importantEvent: false });
  const view = lanes.eliteAffixCueLanePresentation(entered, viewInput);
  assert.equal(entered.lane, 1);
  assert.ok(Math.abs(view.offsetY) < 0.001);
});

test('phase 4615 new-side displacement grows monotonically after the centered handoff', () => {
  const handoff = lanes.advanceEliteAffixCueLane(settled(-1), { desiredLane: 1, dt: 0, importantEvent: false });
  const entered = lanes.advanceEliteAffixCueLane(handoff, { desiredLane: 1, dt: 0.25, importantEvent: false });
  const expanded = lanes.advanceEliteAffixCueLane(entered, { desiredLane: 1, dt: 0.10, importantEvent: false });
  const a = Math.abs(lanes.eliteAffixCueLanePresentation(entered, viewInput).offsetY);
  const b = Math.abs(lanes.eliteAffixCueLanePresentation(expanded, viewInput).offsetY);
  assert.ok(b > a);
});

test('phase 4616 important opposite-side ownership bypasses the center handoff immediately', () => {
  const important = lanes.advanceEliteAffixCueLane(settled(-1), { desiredLane: 1, dt: 0, importantEvent: true });
  assert.equal(important.lane, 1);
  assert.equal(important.importantEvent, true);
  assert.equal(important.releaseFromLane, undefined);
});
