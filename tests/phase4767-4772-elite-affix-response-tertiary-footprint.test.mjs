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

test('phase 4767 a tertiary important response yields strongly while an active cross-affix handoff owns the footprint', () => {
  const active = present({ handoffProgress: 0 });
  const settled = present({ handoffProgress: 1 });
  assert.equal(active.visible, true);
  assert.ok(active.alphaScale < settled.alphaScale * 0.5);
});

test('phase 4768 a tertiary routine response is nearly silent at handoff start', () => {
  const routine = present({ importantEvent: false, handoffProgress: 0 });
  assert.ok(routine.alphaScale < 0.08);
});

test('phase 4769 the explicit outgoing trace remains stronger than an unrelated tertiary important response', () => {
  const outgoing = present({ importantEvent: false, handoffRole: 'outgoing', handoffProgress: 0 });
  const tertiary = present({ importantEvent: true, handoffRole: 'none', handoffProgress: 0 });
  assert.ok(outgoing.alphaScale > tertiary.alphaScale * 1.4);
});

test('phase 4770 incoming primary readability is not reduced by tertiary suppression', () => {
  const incoming = present({
    primary: true,
    importantEvent: true,
    handoffRole: 'incoming',
    handoffProgress: 0,
  });
  assert.equal(incoming.visible, true);
  assert.ok(incoming.alphaScale >= 0.90);
});

test('phase 4771 tertiary important response keeps a restrained visible trace instead of disappearing completely', () => {
  const tertiary = present({ importantEvent: true, handoffProgress: 0 });
  assert.equal(tertiary.visible, true);
  assert.ok(tertiary.alphaScale >= 0.12);
  assert.ok(tertiary.alphaScale <= 0.24);
});

test('phase 4772 Reduced Flash remains authoritative after tertiary handoff suppression', () => {
  const tertiary = present({ importantEvent: true, handoffProgress: 0, reducedFlash: true });
  assert.ok(tertiary.alphaScale <= 0.24);
  assert.ok(tertiary.alphaScale <= 0.72);
});
