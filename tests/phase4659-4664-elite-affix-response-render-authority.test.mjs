import test from 'node:test';
import assert from 'node:assert/strict';

const responseLane = await import('../dist/game/elite-affix-response-lane.js').catch(() => null);

function api() {
  assert.ok(responseLane, 'elite-affix-response-lane module must exist');
  return responseLane;
}

function snapshot(importantEvent = false) {
  return api().captureEliteAffixResponseLaneSnapshot({
    lane: -1,
    offsetX: 4,
    offsetY: -7,
    motionScale: 0.6,
    alphaScale: 0.92,
  }, importantEvent);
}

function render(snapshotValue, liveVisible) {
  return api().eliteAffixResponseRenderPresentation(snapshotValue, {
    liveVisible,
    liveResponseAlphaScale: 0.84,
    battlefieldStress: 0.4,
    higherPriorityCue: false,
    reducedMotion: false,
    reducedFlash: false,
  });
}

test('phase 4659 important frozen response remains visible when live ownership becomes hidden', () => {
  assert.equal(render(snapshot(true), false).visible, true);
});

test('phase 4660 routine frozen response still yields to live ownership visibility', () => {
  assert.equal(render(snapshot(false), false).visible, false);
});

test('phase 4661 important orphan response keeps snapshot render authority after source loss', () => {
  const presentation = render(snapshot(true), false);
  assert.equal(presentation.visible, true);
  assert.equal(presentation.importantEvent, true);
});

test('phase 4662 routine response remains visible when its live layer is visible', () => {
  assert.equal(render(snapshot(false), true).visible, true);
});

test('phase 4663 missing snapshot never invents important visibility authority', () => {
  const presentation = render(undefined, false);
  assert.equal(presentation.visible, false);
  assert.equal(presentation.importantEvent, false);
});

test('phase 4664 important render authority changes visibility without moving frozen geometry', () => {
  const frozen = snapshot(true);
  const visible = render(frozen, true);
  const hiddenLive = render(frozen, false);
  assert.equal(hiddenLive.offsetX, visible.offsetX);
  assert.equal(hiddenLive.offsetY, visible.offsetY);
});
