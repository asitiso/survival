import test from 'node:test';
import assert from 'node:assert/strict';

const responseLane = await import('../dist/game/elite-affix-response-lane.js').catch(() => null);

function api() {
  assert.ok(responseLane, 'elite-affix-response-lane module must exist');
  return responseLane;
}

function snapshot(importantEvent = false, alphaScale = 0.95) {
  return api().captureEliteAffixResponseLaneSnapshot({
    lane: 1,
    offsetX: 0,
    offsetY: 8,
    motionScale: 0.7,
    alphaScale,
  }, importantEvent);
}

function render(snapshotValue, overrides = {}) {
  return api().eliteAffixResponseRenderPresentation(snapshotValue, {
    liveVisible: true,
    liveResponseAlphaScale: 0.9,
    battlefieldStress: 0,
    higherPriorityCue: false,
    reducedMotion: false,
    reducedFlash: false,
    ...overrides,
  });
}

test('phase 4665 important response final alpha is snapshot-authoritative instead of being dimmed by stale live ownership', () => {
  const presentation = render(snapshot(true), { liveResponseAlphaScale: 0.2 });
  assert.ok(presentation.alphaScale > 0.8);
});

test('phase 4666 routine response uses the more conservative live-or-snapshot alpha', () => {
  const presentation = render(snapshot(false), { liveResponseAlphaScale: 0.4 });
  assert.equal(presentation.alphaScale, 0.4);
});

test('phase 4667 important response preserves a readability floor under maximum battlefield stress and higher-priority pressure', () => {
  const presentation = render(snapshot(true), {
    battlefieldStress: 1,
    higherPriorityCue: true,
  });
  assert.ok(presentation.alphaScale >= 0.8);
});

test('phase 4668 routine response yields strongly under maximum battlefield stress and higher-priority pressure', () => {
  const presentation = render(snapshot(false), {
    battlefieldStress: 1,
    higherPriorityCue: true,
  });
  assert.ok(presentation.alphaScale < 0.5);
});

test('phase 4669 Reduced Flash remains the final alpha ceiling for important response presentation', () => {
  const presentation = render(snapshot(true), { reducedFlash: true });
  assert.ok(presentation.alphaScale <= 0.72);
});

test('phase 4670 invalid live alpha cannot produce a non-finite final response alpha', () => {
  const presentation = render(snapshot(false), { liveResponseAlphaScale: Number.NaN });
  assert.ok(Number.isFinite(presentation.alphaScale));
  assert.ok(presentation.alphaScale >= 0 && presentation.alphaScale <= 1);
});
