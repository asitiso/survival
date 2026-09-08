import test from 'node:test';
import assert from 'node:assert/strict';

const lanes = await import('../dist/game/elite-affix-cue-lanes.js');

function vector(lane, stress = 0.2, overrides = {}) {
  return lanes.eliteAffixCueLanePresentation({ lane, holdTtl: 0, releaseTtl: 0, importantEvent: false }, {
    enemyRadius: 34,
    battlefieldStress: stress,
    higherPriorityCue: false,
    reducedMotion: false,
    reducedFlash: false,
    ...overrides,
  });
}

test('phase 4593 wide lanes no longer travel roughly twice as far as standard side lanes', () => {
  const near = vector(1);
  const wide = vector(2);
  assert.ok(Math.hypot(wide.offsetX, wide.offsetY) < Math.hypot(near.offsetX, near.offsetY) * 1.60);
});

test('phase 4594 wide lanes remain visually distinct from standard side lanes', () => {
  const near = vector(1);
  const wide = vector(2);
  assert.ok(Math.hypot(wide.offsetX, wide.offsetY) > Math.hypot(near.offsetX, near.offsetY) * 1.30);
});

test('phase 4595 wide lanes use a small diagonal component instead of pure vertical stacking', () => {
  assert.notEqual(vector(2).offsetX, 0);
  assert.equal(vector(1).offsetX, 0);
});

test('phase 4596 positive and negative wide lanes stay geometrically symmetric', () => {
  const positive = vector(2);
  const negative = vector(-2);
  assert.equal(positive.offsetX, -negative.offsetX);
  assert.equal(positive.offsetY, -negative.offsetY);
});

test('phase 4597 severe density keeps wide lane displacement inside a compact presentation radius', () => {
  const severe = vector(2, 1);
  assert.ok(Math.hypot(severe.offsetX, severe.offsetY) <= 12);
});

test('phase 4598 accessibility controls keep static wide-lane separation while suppressing motion and flash', () => {
  const accessible = vector(-2, 0.5, { reducedMotion: true, reducedFlash: true });
  assert.equal(accessible.motionScale, 0);
  assert.equal(accessible.alphaScale, 0.72);
  assert.ok(Math.hypot(accessible.offsetX, accessible.offsetY) > 0);
});
