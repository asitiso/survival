import test from 'node:test';
import assert from 'node:assert/strict';

const responseLane = await import('../dist/game/elite-affix-response-lane.js').catch(() => null);

function api() {
  assert.ok(responseLane, 'elite-affix-response-lane module must exist');
  return responseLane;
}

function snapshot({ offsetX = -4, offsetY = 7, motionScale = 0.46, sourceAlphaScale = 0.38, importantEvent = false } = {}) {
  return { offsetX, offsetY, motionScale, sourceAlphaScale, importantEvent };
}

test('phase 4641 routine response snapshot can promote in place to important ownership', () => {
  const promoted = api().promoteEliteAffixResponseLaneSnapshot(snapshot(), snapshot({ importantEvent: true, sourceAlphaScale: 0.86 }), true);
  assert.equal(promoted.importantEvent, true);
});

test('phase 4642 importance promotion preserves the frozen response X and Y offsets exactly', () => {
  const existing = snapshot({ offsetX: -6, offsetY: 11 });
  const promoted = api().promoteEliteAffixResponseLaneSnapshot(existing, snapshot({ offsetX: 9, offsetY: -13, importantEvent: true }), true);
  assert.equal(promoted.offsetX, -6);
  assert.equal(promoted.offsetY, 11);
});

test('phase 4643 importance promotion preserves frozen response motion ownership', () => {
  const existing = snapshot({ motionScale: 0.41 });
  const promoted = api().promoteEliteAffixResponseLaneSnapshot(existing, snapshot({ motionScale: 0.92, importantEvent: true }), true);
  assert.equal(promoted.motionScale, 0.41);
});

test('phase 4644 importance promotion may recover source alpha from the stronger important candidate', () => {
  const promoted = api().promoteEliteAffixResponseLaneSnapshot(snapshot({ sourceAlphaScale: 0.34 }), snapshot({ sourceAlphaScale: 0.88, importantEvent: true }), true);
  assert.equal(promoted.sourceAlphaScale, 0.88);
});

test('phase 4645 repeating the same important promotion is idempotent', () => {
  const first = api().promoteEliteAffixResponseLaneSnapshot(snapshot(), snapshot({ sourceAlphaScale: 0.84, importantEvent: true }), true);
  const second = api().promoteEliteAffixResponseLaneSnapshot(first, snapshot({ offsetX: 22, offsetY: 25, sourceAlphaScale: 0.84, importantEvent: true }), true);
  assert.deepEqual(second, first);
});

test('phase 4646 later routine response candidates cannot demote or dim an important frozen snapshot', () => {
  const important = snapshot({ sourceAlphaScale: 0.89, importantEvent: true });
  const afterRoutine = api().promoteEliteAffixResponseLaneSnapshot(important, snapshot({ sourceAlphaScale: 0.28, importantEvent: false }), false);
  assert.equal(afterRoutine.importantEvent, true);
  assert.equal(afterRoutine.sourceAlphaScale, 0.89);
});
