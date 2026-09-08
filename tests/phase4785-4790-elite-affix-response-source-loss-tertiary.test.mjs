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
    handoffHasOutgoing: true,
    ...overrides,
  });
}

test('phase 4785 source-loss recovery strengthens a tertiary important response when the explicit outgoing trace is gone', () => {
  const paired = present({ handoffHasOutgoing: true }).alphaScale;
  const orphaned = present({ handoffHasOutgoing: false }).alphaScale;
  assert.ok(orphaned > paired * 1.25);
});

test('phase 4786 source-loss recovery also restores a bounded amount of routine tertiary visibility', () => {
  const paired = present({ importantEvent: false, handoffHasOutgoing: true }).alphaScale;
  const orphaned = present({ importantEvent: false, handoffHasOutgoing: false }).alphaScale;
  assert.ok(orphaned > paired * 1.6);
});

test('phase 4787 orphaned important tertiary recovery stays below ordinary settled secondary strength', () => {
  const orphaned = present({ handoffHasOutgoing: false }).alphaScale;
  const settled = present({ handoffHasOutgoing: false, handoffProgress: 1 }).alphaScale;
  assert.ok(orphaned < settled * 0.65);
});

test('phase 4788 orphaned routine tertiary recovery remains strongly subordinate to settled routine secondary strength', () => {
  const orphaned = present({ importantEvent: false, handoffHasOutgoing: false }).alphaScale;
  const settled = present({ importantEvent: false, handoffHasOutgoing: false, handoffProgress: 1 }).alphaScale;
  assert.ok(orphaned < settled * 0.36);
});

test('phase 4789 source-loss tertiary recovery cannot overtake the incoming primary that now owns the response footprint', () => {
  const tertiary = present({ handoffHasOutgoing: false }).alphaScale;
  const incoming = present({
    primary: true,
    importantEvent: true,
    handoffRole: 'incoming',
    handoffProgress: 0,
    handoffHasOutgoing: false,
  }).alphaScale;
  assert.ok(tertiary < incoming * 0.4);
});

test('phase 4790 omitting outgoing-presence metadata preserves the established paired-handoff tertiary contract', () => {
  const implicit = present({ handoffHasOutgoing: undefined });
  const explicit = present({ handoffHasOutgoing: true });
  assert.deepEqual(implicit, explicit);
});
