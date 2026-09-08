import test from 'node:test';
import assert from 'node:assert/strict';

const arbitration = await import('../dist/game/elite-affix-response-arbitration.js').catch(() => null);

function api() {
  assert.ok(arbitration, 'elite-affix-response-arbitration module must exist');
  return arbitration;
}

function present(progress, importantEvent = true, handoffHasOutgoing = false, overrides = {}) {
  return api().eliteAffixResponseCrossAffixPresentation({
    primary: false,
    importantEvent,
    primaryImportant: true,
    baseVisible: true,
    baseAlphaScale: 1,
    battlefieldStress: 0.30,
    higherPriorityCue: false,
    reducedFlash: false,
    handoffRole: 'none',
    handoffProgress: progress,
    handoffHasOutgoing,
    ...overrides,
  });
}

test('phase 4791 orphaned important tertiary alpha starts above paired tertiary strength then recovers monotonically', () => {
  const pairedStart = present(0, true, true).alphaScale;
  const orphanedStart = present(0, true, false).alphaScale;
  const middle = present(0.5, true, false).alphaScale;
  const late = present(0.9, true, false).alphaScale;
  assert.ok(pairedStart < orphanedStart);
  assert.ok(orphanedStart < middle);
  assert.ok(middle < late);
});

test('phase 4792 orphaned routine tertiary alpha also recovers monotonically from its stronger source-loss floor', () => {
  const pairedStart = present(0, false, true).alphaScale;
  const orphanedStart = present(0, false, false).alphaScale;
  const middle = present(0.5, false, false).alphaScale;
  const late = present(0.9, false, false).alphaScale;
  assert.ok(pairedStart < orphanedStart);
  assert.ok(orphanedStart < middle);
  assert.ok(middle < late);
});

test('phase 4793 source-loss recovery advantage shrinks continuously as handoff completion approaches', () => {
  const earlyGap = present(0, true, false).alphaScale - present(0, true, true).alphaScale;
  const lateGap = present(0.9, true, false).alphaScale - present(0.9, true, true).alphaScale;
  assert.ok(earlyGap > lateGap);
  assert.ok(lateGap > 0);
  assert.ok(lateGap < 0.02);
});

test('phase 4794 the final orphaned pre-settle frame approaches settled secondary strength without a completion pop', () => {
  const almost = present(0.99, true, false).alphaScale;
  const settled = present(1, true, false).alphaScale;
  assert.ok(almost < settled);
  assert.ok(settled - almost < 0.02);
});

test('phase 4795 non-finite handoff progress still fails open to ordinary settled secondary presentation after source loss', () => {
  const invalid = present(Number.NaN, true, false);
  const settled = present(1, true, false);
  assert.deepEqual(invalid, settled);
});

test('phase 4796 negative source-loss progress clamps to the stronger orphaned start floor rather than the paired floor', () => {
  const negative = present(-4, true, false).alphaScale;
  const orphanedStart = present(0, true, false).alphaScale;
  const pairedStart = present(0, true, true).alphaScale;
  assert.equal(negative, orphanedStart);
  assert.ok(orphanedStart > pairedStart);
});
