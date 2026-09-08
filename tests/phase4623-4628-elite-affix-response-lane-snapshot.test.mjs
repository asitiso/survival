import test from 'node:test';
import assert from 'node:assert/strict';

const responseLane = await import('../dist/game/elite-affix-response-lane.js').catch(() => null);

function api() {
  assert.ok(responseLane, 'elite-affix-response-lane module must exist');
  return responseLane;
}

function lane(overrides = {}) {
  return {
    lane: 2,
    offsetX: 4.2,
    offsetY: 9.8,
    motionScale: 0.55,
    alphaScale: 0.83,
    ...overrides,
  };
}

test('phase 4623 response cues snapshot the exact lane offset shown when the response begins', () => {
  const snapshot = api().captureEliteAffixResponseLaneSnapshot(lane(), false);
  assert.equal(snapshot.offsetX, 4.2);
  assert.equal(snapshot.offsetY, 9.8);
});

test('phase 4624 a retained response snapshot ignores later lane movement from the live enemy', () => {
  const first = api().captureEliteAffixResponseLaneSnapshot(lane({ offsetX: -3, offsetY: -7 }), false);
  const later = api().captureEliteAffixResponseLaneSnapshot(lane({ offsetX: 6, offsetY: 12 }), false);
  const retained = api().retainEliteAffixResponseLaneSnapshot(first, later);
  assert.deepEqual(retained, first);
});

test('phase 4625 response snapshots preserve whether the originating event was important', () => {
  const routine = api().captureEliteAffixResponseLaneSnapshot(lane(), false);
  const important = api().captureEliteAffixResponseLaneSnapshot(lane(), true);
  assert.equal(routine.importantEvent, false);
  assert.equal(important.importantEvent, true);
});

test('phase 4626 snapshot capture preserves the source lane alpha as an upper visual ceiling', () => {
  const snapshot = api().captureEliteAffixResponseLaneSnapshot(lane({ alphaScale: 0.61 }), false);
  assert.equal(snapshot.sourceAlphaScale, 0.61);
});

test('phase 4627 snapshot capture preserves bounded source motion ownership without changing geometry', () => {
  const snapshot = api().captureEliteAffixResponseLaneSnapshot(lane({ motionScale: 0.44 }), false);
  assert.equal(snapshot.motionScale, 0.44);
  assert.equal(snapshot.offsetX, 4.2);
  assert.equal(snapshot.offsetY, 9.8);
});

test('phase 4628 centered lane responses remain centered without manufacturing decorative displacement', () => {
  const snapshot = api().captureEliteAffixResponseLaneSnapshot(lane({ lane: 0, offsetX: 0, offsetY: 0 }), false);
  assert.equal(snapshot.offsetX, 0);
  assert.equal(snapshot.offsetY, 0);
});
