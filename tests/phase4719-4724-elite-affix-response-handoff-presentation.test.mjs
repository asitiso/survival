import test from 'node:test';
import assert from 'node:assert/strict';

const arbitration = await import('../dist/game/elite-affix-response-arbitration.js').catch(() => null);

function api() {
  assert.ok(arbitration, 'elite-affix-response-arbitration module must exist');
  return arbitration;
}

function present(overrides = {}) {
  return api().eliteAffixResponseCrossAffixPresentation({
    primary: true,
    importantEvent: false,
    primaryImportant: false,
    baseVisible: true,
    baseAlphaScale: 0.9,
    battlefieldStress: 0.2,
    higherPriorityCue: false,
    reducedFlash: false,
    handoffRole: 'none',
    handoffProgress: 1,
    ...overrides,
  });
}

test('phase 4719 incoming routine primary starts below full alpha instead of popping to 100 percent', () => {
  const result = present({ handoffRole: 'incoming', handoffProgress: 0 });
  assert.ok(result.alphaScale < 0.9);
  assert.ok(result.alphaScale > 0.5);
});

test('phase 4720 incoming routine primary recovers monotonically as handoff progress advances', () => {
  const start = present({ handoffRole: 'incoming', handoffProgress: 0 });
  const middle = present({ handoffRole: 'incoming', handoffProgress: 0.5 });
  const end = present({ handoffRole: 'incoming', handoffProgress: 1 });
  assert.ok(start.alphaScale < middle.alphaScale);
  assert.ok(middle.alphaScale < end.alphaScale);
});

test('phase 4721 incoming important primary bypasses with a high readability floor but still avoids a full-alpha pop', () => {
  const result = present({ importantEvent: true, primaryImportant: true, handoffRole: 'incoming', handoffProgress: 0 });
  assert.ok(result.alphaScale >= 0.81);
  assert.ok(result.alphaScale < 0.9);
});

test('phase 4722 outgoing routine owner keeps a restrained cross-fade trace even when normal secondary clutter would hide', () => {
  const result = present({
    primary: false,
    primaryImportant: true,
    higherPriorityCue: true,
    handoffRole: 'outgoing',
    handoffProgress: 0,
  });
  assert.equal(result.visible, true);
  assert.ok(result.alphaScale > 0);
  assert.ok(result.alphaScale < 0.4);
});

test('phase 4723 outgoing trace decays monotonically and returns to ordinary secondary suppression when handoff completes', () => {
  const start = present({ primary: false, primaryImportant: true, higherPriorityCue: true, handoffRole: 'outgoing', handoffProgress: 0 });
  const middle = present({ primary: false, primaryImportant: true, higherPriorityCue: true, handoffRole: 'outgoing', handoffProgress: 0.6 });
  const end = present({ primary: false, primaryImportant: true, higherPriorityCue: true, handoffRole: 'outgoing', handoffProgress: 1 });
  assert.ok(start.alphaScale > middle.alphaScale);
  assert.equal(end.visible, false);
  assert.equal(end.alphaScale, 0);
});

test('phase 4724 Reduced Flash remains the final ceiling during incoming handoff recovery', () => {
  const result = present({
    baseAlphaScale: 1,
    importantEvent: true,
    primaryImportant: true,
    reducedFlash: true,
    handoffRole: 'incoming',
    handoffProgress: 0,
  });
  assert.ok(result.alphaScale < 0.72);
  assert.ok(result.alphaScale >= 0.60);
});
