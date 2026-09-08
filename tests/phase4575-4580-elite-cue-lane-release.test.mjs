import test from 'node:test';
import assert from 'node:assert/strict';

const lanes = await import('../dist/game/elite-affix-cue-lanes.js');

const presentationInput = {
  enemyRadius: 34,
  battlefieldStress: 0.30,
  higherPriorityCue: false,
  reducedMotion: false,
  reducedFlash: false,
};

function fullySettledSide(lane = 1) {
  const fresh = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: lane, dt: 0, importantEvent: false });
  return lanes.advanceEliteAffixCueLane(fresh, { desiredLane: lane, dt: 0.40, importantEvent: false });
}

test('phase 4575 routine recenter begins from the previous side lane instead of snapping to zero', () => {
  const side = fullySettledSide(1);
  const centered = lanes.advanceEliteAffixCueLane(side, { desiredLane: 0, dt: 0, importantEvent: false });
  const view = lanes.eliteAffixCueLanePresentation(centered, presentationInput);
  assert.equal(centered.lane, 0);
  assert.ok(Math.abs(view.offsetY) > 0);
});

test('phase 4576 routine recenter collapses monotonically to the canonical origin', () => {
  const side = fullySettledSide(-1);
  const start = lanes.advanceEliteAffixCueLane(side, { desiredLane: 0, dt: 0, importantEvent: false });
  const middle = lanes.advanceEliteAffixCueLane(start, { desiredLane: 0, dt: 0.09, importantEvent: false });
  const end = lanes.advanceEliteAffixCueLane(middle, { desiredLane: 0, dt: 0.30, importantEvent: false });
  const a = Math.abs(lanes.eliteAffixCueLanePresentation(start, presentationInput).offsetY);
  const b = Math.abs(lanes.eliteAffixCueLanePresentation(middle, presentationInput).offsetY);
  const c = Math.abs(lanes.eliteAffixCueLanePresentation(end, presentationInput).offsetY);
  assert.ok(a > b);
  assert.ok(b > c);
  assert.equal(c, 0);
});

test('phase 4577 recenter preserves the previous lane side while residual offset remains', () => {
  const positive = lanes.advanceEliteAffixCueLane(fullySettledSide(1), { desiredLane: 0, dt: 0, importantEvent: false });
  const negative = lanes.advanceEliteAffixCueLane(fullySettledSide(-1), { desiredLane: 0, dt: 0, importantEvent: false });
  assert.ok(lanes.eliteAffixCueLanePresentation(positive, presentationInput).offsetY > 0);
  assert.ok(lanes.eliteAffixCueLanePresentation(negative, presentationInput).offsetY < 0);
});

test('phase 4578 important canonical ownership bypasses residual recenter immediately', () => {
  const side = fullySettledSide(1);
  const centered = lanes.advanceEliteAffixCueLane(side, { desiredLane: 0, dt: 0, importantEvent: true });
  const view = lanes.eliteAffixCueLanePresentation(centered, presentationInput);
  assert.equal(centered.lane, 0);
  assert.equal(view.offsetX, 0);
  assert.equal(view.offsetY, 0);
});

test('phase 4579 dense battlefield pressure only contracts residual recenter travel', () => {
  const centered = lanes.advanceEliteAffixCueLane(fullySettledSide(2), { desiredLane: 0, dt: 0, importantEvent: false });
  const normal = lanes.eliteAffixCueLanePresentation(centered, presentationInput);
  const dense = lanes.eliteAffixCueLanePresentation(centered, { ...presentationInput, battlefieldStress: 0.95, higherPriorityCue: true });
  assert.ok(Math.hypot(dense.offsetX, dense.offsetY) < Math.hypot(normal.offsetX, normal.offsetY));
  assert.ok(Math.sign(dense.offsetY) === Math.sign(normal.offsetY));
});

test('phase 4580 Reduced Motion keeps deterministic residual placement while disabling cue motion', () => {
  const centered = lanes.advanceEliteAffixCueLane(fullySettledSide(-2), { desiredLane: 0, dt: 0, importantEvent: false });
  const normal = lanes.eliteAffixCueLanePresentation(centered, presentationInput);
  const reduced = lanes.eliteAffixCueLanePresentation(centered, { ...presentationInput, reducedMotion: true, reducedFlash: true });
  assert.equal(reduced.offsetX, normal.offsetX);
  assert.equal(reduced.offsetY, normal.offsetY);
  assert.equal(reduced.motionScale, 0);
  assert.ok(reduced.alphaScale < normal.alphaScale);
});
