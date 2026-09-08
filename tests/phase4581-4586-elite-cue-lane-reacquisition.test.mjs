import test from 'node:test';
import assert from 'node:assert/strict';

const lanes = await import('../dist/game/elite-affix-cue-lanes.js');

const viewInput = {
  enemyRadius: 34,
  battlefieldStress: 0.30,
  higherPriorityCue: false,
  reducedMotion: false,
  reducedFlash: false,
};

function beginCenterRelease(sideLane = -1) {
  const side = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: sideLane, dt: 0, importantEvent: false });
  const settledSide = lanes.advanceEliteAffixCueLane(side, { desiredLane: sideLane, dt: 0.30, importantEvent: false });
  return lanes.advanceEliteAffixCueLane(settledSide, { desiredLane: 0, dt: 0, importantEvent: false });
}

test('phase 4581 routine same-side reacquisition cancels an in-flight center release immediately', () => {
  const releasing = beginCenterRelease(-1);
  const reacquired = lanes.advanceEliteAffixCueLane(releasing, { desiredLane: -1, dt: 0.03, importantEvent: false });
  assert.equal(releasing.lane, 0);
  assert.equal(releasing.releaseFromLane, -1);
  assert.equal(reacquired.lane, -1);
});

test('phase 4582 same-side reacquisition preserves presentation continuity instead of collapsing inward again', () => {
  const releasing = beginCenterRelease(1);
  const progressedRelease = lanes.advanceEliteAffixCueLane(releasing, { desiredLane: 0, dt: 0.04, importantEvent: false });
  const before = lanes.eliteAffixCueLanePresentation(progressedRelease, viewInput);
  const reacquired = lanes.advanceEliteAffixCueLane(progressedRelease, { desiredLane: 1, dt: 0, importantEvent: false });
  const after = lanes.eliteAffixCueLanePresentation(reacquired, viewInput);
  assert.ok(Math.abs(after.offsetY) >= Math.abs(before.offsetY) * 0.95);
});

test('phase 4583 same-side reacquisition clears stale release origin metadata', () => {
  const releasing = beginCenterRelease(-2);
  const reacquired = lanes.advanceEliteAffixCueLane(releasing, { desiredLane: -2, dt: 0.02, importantEvent: false });
  assert.equal(reacquired.releaseFromLane, undefined);
});

test('phase 4584 routine opposite-side requests do not flip direction while center release is active', () => {
  const releasing = beginCenterRelease(-1);
  const blocked = lanes.advanceEliteAffixCueLane(releasing, { desiredLane: 1, dt: 0.03, importantEvent: false });
  assert.equal(blocked.lane, 0);
  assert.equal(blocked.releaseFromLane, -1);
});

test('phase 4585 important opposite-side ownership still bypasses release immediately', () => {
  const releasing = beginCenterRelease(-1);
  const important = lanes.advanceEliteAffixCueLane(releasing, { desiredLane: 1, dt: 0.01, importantEvent: true });
  assert.equal(important.lane, 1);
  assert.equal(important.importantEvent, true);
  assert.equal(important.releaseFromLane, undefined);
});

test('phase 4586 Reduced Motion keeps reacquired separation static and finite', () => {
  const releasing = beginCenterRelease(2);
  const reacquired = lanes.advanceEliteAffixCueLane(releasing, { desiredLane: 2, dt: Number.NaN, importantEvent: false });
  const view = lanes.eliteAffixCueLanePresentation(reacquired, { ...viewInput, reducedMotion: true });
  assert.equal(view.motionScale, 0);
  assert.ok(Number.isFinite(view.offsetX));
  assert.ok(Number.isFinite(view.offsetY));
  assert.ok(Math.hypot(view.offsetX, view.offsetY) > 0);
});
