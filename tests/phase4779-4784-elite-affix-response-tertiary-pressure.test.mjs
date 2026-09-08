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

test('phase 4779 higher-priority battlefield ownership can still fully suppress tertiary routine clutter', () => {
  const routine = present({ importantEvent: false, higherPriorityCue: true });
  assert.equal(routine.visible, false);
  assert.equal(routine.alphaScale, 0);
});

test('phase 4780 maximum battlefield stress keeps tertiary important alpha inside a compact readability budget', () => {
  const important = present({ battlefieldStress: 1, importantEvent: true, handoffProgress: 0 });
  assert.equal(important.visible, true);
  assert.ok(important.alphaScale <= 0.16);
});

test('phase 4781 routine tertiary response remains strongly subordinate even when the current primary is routine', () => {
  const routine = present({
    importantEvent: false,
    primaryImportant: false,
    battlefieldStress: 0.30,
    handoffProgress: 0,
  });
  assert.ok(routine.alphaScale <= 0.08);
});

test('phase 4782 an explicit important outgoing trace stays visually dominant over a stale important tertiary response at handoff start', () => {
  const outgoing = present({ handoffRole: 'outgoing', handoffProgress: 0 });
  const tertiary = present({ handoffRole: 'none', handoffProgress: 0 });
  assert.ok(outgoing.alphaScale > tertiary.alphaScale * 2);
});

test('phase 4783 Reduced Flash and tertiary suppression compose without re-amplifying the stale response', () => {
  const tertiary = present({ reducedFlash: true, importantEvent: true, handoffProgress: 0 });
  assert.ok(tertiary.alphaScale <= 0.20);
});

test('phase 4784 tertiary suppression is presentation-only and keeps the response contract limited to visibility plus alpha', () => {
  const result = present({ importantEvent: true, handoffProgress: 0.5 });
  assert.deepEqual(Object.keys(result).sort(), ['alphaScale', 'visible']);
  assert.equal(typeof result.visible, 'boolean');
  assert.equal(Number.isFinite(result.alphaScale), true);
});
