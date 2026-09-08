import test from 'node:test';
import assert from 'node:assert/strict';

const lanes = await import('../dist/game/elite-affix-cue-lanes.js');

function view(importantEvent, lane = 1, stress = 0.75, overrides = {}) {
  return lanes.eliteAffixCueLanePresentation({ lane, holdTtl: 0, releaseTtl: 0, importantEvent }, {
    enemyRadius: 34,
    battlefieldStress: stress,
    higherPriorityCue: true,
    reducedMotion: false,
    reducedFlash: false,
    ...overrides,
  });
}

test('phase 4599 important elite events retain more spatial separation under higher-priority battlefield cues', () => {
  assert.ok(Math.abs(view(true).offsetY) > Math.abs(view(false).offsetY));
});

test('phase 4600 routine elite decoration continues to yield more aggressively', () => {
  const routine = view(false);
  const normalPriority = lanes.eliteAffixCueLanePresentation({ lane: 1, holdTtl: 0, releaseTtl: 0, importantEvent: false }, {
    enemyRadius: 34,
    battlefieldStress: 0.75,
    higherPriorityCue: false,
    reducedMotion: false,
    reducedFlash: false,
  });
  assert.ok(Math.abs(routine.offsetY) < Math.abs(normalPriority.offsetY));
});

test('phase 4601 critical visibility floor applies equally to positive and negative lanes', () => {
  const positive = view(true, 1);
  const negative = view(true, -1);
  assert.equal(positive.offsetY, -negative.offsetY);
});

test('phase 4602 important wide lanes remain compact even at maximum battlefield stress', () => {
  const severe = view(true, 2, 1);
  assert.ok(Math.hypot(severe.offsetX, severe.offsetY) <= 12);
});

test('phase 4603 Reduced Motion keeps important cue separation static while removing motion', () => {
  const reduced = view(true, -2, 0.8, { reducedMotion: true });
  assert.equal(reduced.motionScale, 0);
  assert.ok(Math.hypot(reduced.offsetX, reduced.offsetY) > 0);
});

test('phase 4604 Reduced Flash remains authoritative for critical lane presentation', () => {
  const reduced = view(true, 1, 0.8, { reducedFlash: true });
  assert.equal(reduced.alphaScale, 0.72);
});
