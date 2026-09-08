import test from 'node:test';
import assert from 'node:assert/strict';

const responseLane = await import('../dist/game/elite-affix-response-lane.js').catch(() => null);

function api() {
  assert.ok(responseLane, 'elite-affix-response-lane module must exist');
  return responseLane;
}

function snapshot({ offsetX = 3, offsetY = -8, motionScale = 0.52, sourceAlphaScale = 0.36, importantEvent = false } = {}) {
  return { offsetX, offsetY, motionScale, sourceAlphaScale, importantEvent };
}

function present(snap, overrides = {}) {
  return api().eliteAffixResponseLanePresentation(snap, {
    battlefieldStress: 0.78,
    higherPriorityCue: false,
    reducedMotion: false,
    reducedFlash: false,
    ...overrides,
  });
}

test('phase 4647 promoted important response recovers more alpha than its prior routine snapshot', () => {
  const routine = snapshot({ sourceAlphaScale: 0.36 });
  const promoted = api().promoteEliteAffixResponseLaneSnapshot(routine, snapshot({ sourceAlphaScale: 0.9, importantEvent: true }), true);
  assert.ok(present(promoted).alphaScale > present(routine).alphaScale);
});

test('phase 4648 dense battlefield stress preserves an important response visibility floor', () => {
  const promoted = api().promoteEliteAffixResponseLaneSnapshot(snapshot(), snapshot({ sourceAlphaScale: 0.95, importantEvent: true }), true);
  const p = present(promoted, { battlefieldStress: 1 });
  assert.ok(p.alphaScale >= 0.82);
});

test('phase 4649 higher-priority battlefield cues still leave promoted important responses clearer than routine responses', () => {
  const routine = snapshot({ sourceAlphaScale: 0.94 });
  const important = api().promoteEliteAffixResponseLaneSnapshot(routine, snapshot({ sourceAlphaScale: 0.94, importantEvent: true }), true);
  const input = { battlefieldStress: 0.9, higherPriorityCue: true };
  assert.ok(present(important, input).alphaScale > present(routine, input).alphaScale);
});

test('phase 4650 Reduced Flash remains the final alpha ceiling after importance promotion', () => {
  const promoted = api().promoteEliteAffixResponseLaneSnapshot(snapshot(), snapshot({ sourceAlphaScale: 1, importantEvent: true }), true);
  const p = present(promoted, { battlefieldStress: 0, reducedFlash: true });
  assert.ok(p.alphaScale <= 0.72);
});

test('phase 4651 Reduced Motion removes motion without moving promoted frozen geometry', () => {
  const existing = snapshot({ offsetX: -7, offsetY: 12, motionScale: 0.58 });
  const promoted = api().promoteEliteAffixResponseLaneSnapshot(existing, snapshot({ offsetX: 20, offsetY: -21, sourceAlphaScale: 0.9, importantEvent: true }), true);
  const p = present(promoted, { reducedMotion: true });
  assert.equal(p.motionScale, 0);
  assert.equal(p.offsetX, -7);
  assert.equal(p.offsetY, 12);
});

test('phase 4652 alpha recovery does not adopt geometry from the important candidate', () => {
  const existing = snapshot({ offsetX: -2, offsetY: 6, sourceAlphaScale: 0.31 });
  const promoted = api().promoteEliteAffixResponseLaneSnapshot(existing, snapshot({ offsetX: 14, offsetY: -18, sourceAlphaScale: 0.91, importantEvent: true }), true);
  assert.equal(promoted.sourceAlphaScale, 0.91);
  assert.equal(promoted.offsetX, -2);
  assert.equal(promoted.offsetY, 6);
});
