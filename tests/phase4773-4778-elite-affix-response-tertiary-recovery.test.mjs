import test from 'node:test';
import assert from 'node:assert/strict';

const arbitration = await import('../dist/game/elite-affix-response-arbitration.js').catch(() => null);

function api() {
  assert.ok(arbitration, 'elite-affix-response-arbitration module must exist');
  return arbitration;
}

function present(progress, importantEvent = true, overrides = {}) {
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
    handoffHasOutgoing: true,
    ...overrides,
  });
}

test('phase 4773 tertiary important alpha recovers monotonically as the active handoff settles', () => {
  const early = present(0).alphaScale;
  const middle = present(0.5).alphaScale;
  const late = present(0.9).alphaScale;
  assert.ok(early < middle);
  assert.ok(middle < late);
});

test('phase 4774 tertiary routine alpha also recovers monotonically instead of popping at completion', () => {
  const early = present(0, false).alphaScale;
  const middle = present(0.5, false).alphaScale;
  const late = present(0.9, false).alphaScale;
  assert.ok(early < middle);
  assert.ok(middle < late);
});

test('phase 4775 the final pre-settle frame approaches but does not equal ordinary secondary strength', () => {
  const almost = present(0.99).alphaScale;
  const settled = present(1).alphaScale;
  assert.ok(almost < settled);
  assert.ok(settled - almost < 0.02);
});

test('phase 4776 non-finite handoff progress fails open to ordinary settled secondary presentation', () => {
  const invalid = present(Number.NaN);
  const settled = present(1);
  assert.deepEqual(invalid, settled);
});

test('phase 4777 negative handoff progress clamps to the strongest tertiary suppression point', () => {
  const negative = present(-2).alphaScale;
  const start = present(0).alphaScale;
  const settled = present(1).alphaScale;
  assert.equal(negative, start);
  assert.ok(start <= settled * 0.36);
});

test('phase 4778 overshoot handoff progress clamps to settled secondary presentation', () => {
  const overshoot = present(4);
  const settled = present(1);
  assert.deepEqual(overshoot, settled);
});
