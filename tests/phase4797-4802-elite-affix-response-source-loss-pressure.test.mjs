import test from 'node:test';
import assert from 'node:assert/strict';

const arbitration = await import('../dist/game/elite-affix-response-arbitration.js').catch(() => null);

function api() {
  assert.ok(arbitration, 'elite-affix-response-arbitration module must exist');
  return arbitration;
}

function present(overrides = {}) {
  return api().eliteAffixResponseCrossAffixPresentation({
    primary: false,
    importantEvent: true,
    primaryImportant: true,
    baseVisible: true,
    baseAlphaScale: 1,
    battlefieldStress: 0.30,
    higherPriorityCue: false,
    reducedFlash: false,
    handoffRole: 'none',
    handoffProgress: 0,
    handoffHasOutgoing: false,
    ...overrides,
  });
}

test('phase 4797 maximum battlefield stress preserves a bounded source-loss important recovery above paired tertiary strength', () => {
  const orphaned = present({ battlefieldStress: 1, handoffHasOutgoing: false }).alphaScale;
  const paired = present({ battlefieldStress: 1, handoffHasOutgoing: true }).alphaScale;
  assert.ok(orphaned > paired);
  assert.ok(orphaned <= 0.24);
});

test('phase 4798 higher-priority battlefield ownership keeps source-loss important recovery restrained but clearer than a paired tertiary trace', () => {
  const orphaned = present({ higherPriorityCue: true, handoffHasOutgoing: false }).alphaScale;
  const paired = present({ higherPriorityCue: true, handoffHasOutgoing: true }).alphaScale;
  assert.ok(orphaned > paired);
  assert.ok(orphaned <= 0.25);
});

test('phase 4799 higher-priority battlefield ownership still fully suppresses routine tertiary clutter after outgoing source loss', () => {
  const routine = present({ importantEvent: false, higherPriorityCue: true, handoffHasOutgoing: false });
  assert.equal(routine.visible, false);
  assert.equal(routine.alphaScale, 0);
});

test('phase 4800 Reduced Flash remains the final ceiling while preserving the source-loss recovery advantage', () => {
  const orphaned = present({ reducedFlash: true, handoffHasOutgoing: false }).alphaScale;
  const paired = present({ reducedFlash: true, handoffHasOutgoing: true }).alphaScale;
  assert.ok(orphaned > paired);
  assert.ok(orphaned <= 0.72);
});

test('phase 4801 routine source-loss recovery remains bounded even when the current primary is routine', () => {
  const orphaned = present({
    importantEvent: false,
    primaryImportant: false,
    handoffHasOutgoing: false,
  }).alphaScale;
  const paired = present({
    importantEvent: false,
    primaryImportant: false,
    handoffHasOutgoing: true,
  }).alphaScale;
  assert.ok(orphaned > paired);
  assert.ok(orphaned <= 0.16);
});

test('phase 4802 source-loss tertiary recovery stays presentation-only with a finite visibility-plus-alpha contract', () => {
  const result = present({ handoffProgress: 0.45, handoffHasOutgoing: false });
  assert.deepEqual(Object.keys(result).sort(), ['alphaScale', 'visible']);
  assert.equal(typeof result.visible, 'boolean');
  assert.equal(Number.isFinite(result.alphaScale), true);
});
