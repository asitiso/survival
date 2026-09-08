import test from 'node:test';
import assert from 'node:assert/strict';

const responseLane = await import('../dist/game/elite-affix-response-lane.js').catch(() => null);

function api() {
  assert.ok(responseLane, 'elite-affix-response-lane module must exist');
  return responseLane;
}

function snapshot(importantEvent, overrides = {}) {
  return api().captureEliteAffixResponseLaneSnapshot({
    lane: 1,
    offsetX: 0,
    offsetY: 8,
    motionScale: 0.6,
    alphaScale: 1,
    ...overrides,
  }, importantEvent);
}

function view(importantEvent, overrides = {}) {
  return api().eliteAffixResponseLanePresentation(snapshot(importantEvent), {
    battlefieldStress: 0.9,
    higherPriorityCue: true,
    reducedMotion: false,
    reducedFlash: false,
    ...overrides,
  });
}

test('phase 4629 dense battlefield pressure lowers routine response alpha below full strength', () => {
  assert.ok(view(false).alphaScale < 0.8);
});

test('phase 4630 higher-priority battlefield ownership suppresses routine response alpha more than density alone', () => {
  const normal = view(false, { higherPriorityCue: false });
  const yielding = view(false, { higherPriorityCue: true });
  assert.ok(yielding.alphaScale < normal.alphaScale);
});

test('phase 4631 important response cues retain more alpha than routine cues under identical pressure', () => {
  const routine = view(false);
  const important = view(true);
  assert.ok(important.alphaScale > routine.alphaScale);
});

test('phase 4632 important response alpha stays readable without returning to full-strength decoration', () => {
  const important = view(true);
  assert.ok(important.alphaScale >= 0.74);
  assert.ok(important.alphaScale <= 0.95);
});

test('phase 4633 Reduced Motion removes response-owned motion without changing the frozen response offset', () => {
  const normal = view(true, { reducedMotion: false });
  const reduced = view(true, { reducedMotion: true });
  assert.equal(reduced.motionScale, 0);
  assert.equal(reduced.offsetX, normal.offsetX);
  assert.equal(reduced.offsetY, normal.offsetY);
});

test('phase 4634 Reduced Flash remains the final response alpha ceiling while leaving geometry untouched', () => {
  const normal = view(true, { reducedFlash: false });
  const reduced = view(true, { reducedFlash: true });
  assert.ok(reduced.alphaScale <= 0.72);
  assert.equal(reduced.offsetX, normal.offsetX);
  assert.equal(reduced.offsetY, normal.offsetY);
});
