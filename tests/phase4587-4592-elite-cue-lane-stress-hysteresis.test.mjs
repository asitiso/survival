import test from 'node:test';
import assert from 'node:assert/strict';

const lanes = await import('../dist/game/elite-affix-cue-lanes.js');

const baseState = {
  lane: 1,
  holdTtl: 0,
  releaseTtl: 0,
  importantEvent: false,
};

function view(stress, overrides = {}) {
  return lanes.eliteAffixCueLanePresentation(baseState, {
    enemyRadius: 34,
    battlefieldStress: stress,
    higherPriorityCue: false,
    reducedMotion: false,
    reducedFlash: false,
    ...overrides,
  });
}

test('phase 4587 low battlefield stress fluctuations stay in one stable presentation band', () => {
  assert.equal(lanes.eliteAffixCueStableStress(0.05), lanes.eliteAffixCueStableStress(0.20));
  assert.equal(view(0.05).offsetY, view(0.20).offsetY);
});

test('phase 4588 moderate stress jitter no longer pumps elite cue offset frame to frame', () => {
  assert.equal(lanes.eliteAffixCueStableStress(0.30), lanes.eliteAffixCueStableStress(0.46));
  assert.equal(view(0.30).offsetY, view(0.46).offsetY);
});

test('phase 4589 crossing a stress band still contracts cue separation meaningfully', () => {
  const calm = Math.abs(view(0.46).offsetY);
  const pressured = Math.abs(view(0.50).offsetY);
  assert.ok(pressured < calm);
});

test('phase 4590 severe battlefield stress keeps the existing compact cue ceiling', () => {
  const severe = view(1);
  assert.ok(Math.abs(severe.offsetY) <= 10);
});

test('phase 4591 non-finite battlefield stress resolves to a finite stable presentation', () => {
  const invalid = view(Number.NaN);
  assert.ok(Number.isFinite(invalid.offsetX));
  assert.ok(Number.isFinite(invalid.offsetY));
  assert.ok(Number.isFinite(invalid.motionScale));
});

test('phase 4592 accessibility scaling remains authoritative after stress stabilization', () => {
  const accessible = view(0.55, { reducedMotion: true, reducedFlash: true });
  assert.equal(accessible.motionScale, 0);
  assert.equal(accessible.alphaScale, 0.72);
  assert.ok(Math.abs(accessible.offsetY) > 0);
});
