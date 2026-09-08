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

function routine(lane = 1) {
  return lanes.advanceEliteAffixCueLane(undefined, { desiredLane: lane, dt: 0, importantEvent: false });
}

test('phase 4605 same-lane routine ownership promotes to important immediately', () => {
  const promoted = lanes.advanceEliteAffixCueLane(routine(1), { desiredLane: 1, dt: 0.01, importantEvent: true });
  assert.equal(promoted.lane, 1);
  assert.equal(promoted.importantEvent, true);
});

test('phase 4606 same-lane promotion receives the full important hold and release window', () => {
  const promoted = lanes.advanceEliteAffixCueLane(routine(-1), { desiredLane: -1, dt: 0.11, importantEvent: true });
  assert.ok(promoted.holdTtl >= 0.15);
  assert.ok(promoted.releaseTtl >= 0.09);
});

test('phase 4607 same-lane promotion clears stale release-origin metadata', () => {
  const promoted = lanes.advanceEliteAffixCueLane({ lane: 1, holdTtl: 0.02, releaseTtl: 0.04, importantEvent: false, releaseFromLane: -1 }, { desiredLane: 1, dt: 0, importantEvent: true });
  assert.equal(promoted.releaseFromLane, undefined);
  assert.equal(promoted.importantEvent, true);
});

test('phase 4608 same-lane promotion clears routine settle-floor metadata', () => {
  const promoted = lanes.advanceEliteAffixCueLane({ lane: -2, holdTtl: 0.03, releaseTtl: 0.05, importantEvent: false, settleFloor: 0.71 }, { desiredLane: -2, dt: 0, importantEvent: true });
  assert.equal(promoted.settleFloor, undefined);
  assert.equal(promoted.importantEvent, true);
});

test('phase 4609 promoted critical ownership uses full separation instead of unfinished routine settle', () => {
  const base = routine(1);
  const routineView = lanes.eliteAffixCueLanePresentation(base, viewInput);
  const promoted = lanes.advanceEliteAffixCueLane(base, { desiredLane: 1, dt: 0, importantEvent: true });
  const promotedView = lanes.eliteAffixCueLanePresentation(promoted, viewInput);
  assert.ok(Math.abs(promotedView.offsetY) > Math.abs(routineView.offsetY) * 1.5);
});

test('phase 4610 Reduced Motion keeps promoted critical separation static', () => {
  const promoted = lanes.advanceEliteAffixCueLane(routine(-2), { desiredLane: -2, dt: Number.NaN, importantEvent: true });
  const view = lanes.eliteAffixCueLanePresentation(promoted, { ...viewInput, reducedMotion: true });
  assert.equal(promoted.importantEvent, true);
  assert.equal(view.motionScale, 0);
  assert.ok(Math.hypot(view.offsetX, view.offsetY) > 0);
});
