import test from 'node:test';
import assert from 'node:assert/strict';

const lanes = await import('../dist/game/elite-affix-cue-lanes.js');

const presentationInput = {
  enemyRadius: 34,
  battlefieldStress: 0.35,
  higherPriorityCue: false,
  reducedMotion: false,
  reducedFlash: false,
};

test('phase 4569 a newly assigned routine lane eases outward instead of popping to full displacement', () => {
  const fresh = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: 1, dt: 0, importantEvent: false });
  const settled = lanes.advanceEliteAffixCueLane(fresh, { desiredLane: 1, dt: 0.40, importantEvent: false });
  const freshView = lanes.eliteAffixCueLanePresentation(fresh, presentationInput);
  const settledView = lanes.eliteAffixCueLanePresentation(settled, presentationInput);
  assert.ok(Math.abs(freshView.offsetY) < Math.abs(settledView.offsetY));
  assert.ok(Math.abs(freshView.offsetY) > 0);
});

test('phase 4570 routine lane settle progresses monotonically as hold and release timers decay', () => {
  const first = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: -1, dt: 0, importantEvent: false });
  const second = lanes.advanceEliteAffixCueLane(first, { desiredLane: -1, dt: 0.07, importantEvent: false });
  const third = lanes.advanceEliteAffixCueLane(second, { desiredLane: -1, dt: 0.11, importantEvent: false });
  const a = Math.abs(lanes.eliteAffixCueLanePresentation(first, presentationInput).offsetY);
  const b = Math.abs(lanes.eliteAffixCueLanePresentation(second, presentationInput).offsetY);
  const c = Math.abs(lanes.eliteAffixCueLanePresentation(third, presentationInput).offsetY);
  assert.ok(a <= b);
  assert.ok(b <= c);
  assert.ok(c > a);
});

test('phase 4571 important event handoff reaches its requested lane immediately for warning readability', () => {
  const routine = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: -1, dt: 0, importantEvent: false });
  const important = lanes.advanceEliteAffixCueLane(routine, { desiredLane: 1, dt: 0.01, importantEvent: true });
  const importantView = lanes.eliteAffixCueLanePresentation(important, presentationInput);
  const settledImportant = lanes.eliteAffixCueLanePresentation(
    lanes.advanceEliteAffixCueLane(important, { desiredLane: 1, dt: 0.40, importantEvent: true }),
    presentationInput,
  );
  assert.equal(important.lane, 1);
  assert.ok(Math.abs(importantView.offsetY) >= Math.abs(settledImportant.offsetY) * 0.95);
});

test('phase 4572 canonical lane zero never drifts during settle or release', () => {
  const fresh = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: 0, dt: 0, importantEvent: false });
  const mid = lanes.advanceEliteAffixCueLane(fresh, { desiredLane: 0, dt: 0.09, importantEvent: false });
  const settled = lanes.advanceEliteAffixCueLane(mid, { desiredLane: 0, dt: 0.30, importantEvent: false });
  for (const state of [fresh, mid, settled]) {
    const view = lanes.eliteAffixCueLanePresentation(state, presentationInput);
    assert.equal(view.offsetX, 0);
    assert.equal(view.offsetY, 0);
  }
});

test('phase 4573 dense or higher-priority battlefield pressure caps lane travel instead of expanding clutter', () => {
  const state = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: 2, dt: 0.40, importantEvent: false });
  const normal = lanes.eliteAffixCueLanePresentation(state, presentationInput);
  const dense = lanes.eliteAffixCueLanePresentation(state, {
    ...presentationInput,
    battlefieldStress: 0.95,
    higherPriorityCue: true,
  });
  assert.ok(Math.hypot(dense.offsetX, dense.offsetY) < Math.hypot(normal.offsetX, normal.offsetY));
  assert.ok(dense.motionScale < normal.motionScale);
});

test('phase 4574 Reduced Motion keeps a stable static lane while Reduced Flash only lowers visual strength', () => {
  const fresh = lanes.advanceEliteAffixCueLane(undefined, { desiredLane: -2, dt: 0, importantEvent: false });
  const normal = lanes.eliteAffixCueLanePresentation(fresh, presentationInput);
  const reduced = lanes.eliteAffixCueLanePresentation(fresh, {
    ...presentationInput,
    reducedMotion: true,
    reducedFlash: true,
  });
  assert.equal(reduced.motionScale, 0);
  assert.ok(Math.hypot(reduced.offsetX, reduced.offsetY) > 0);
  assert.ok(reduced.alphaScale < normal.alphaScale);
});
