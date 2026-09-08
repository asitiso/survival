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
    importantEvent: false,
    primaryImportant: false,
    baseVisible: true,
    baseAlphaScale: 0.9,
    battlefieldStress: 0.2,
    higherPriorityCue: false,
    reducedFlash: false,
    ...overrides,
  });
}

test('phase 4701 primary response keeps its base visibility and alpha budget', () => {
  const result = present({ primary: true, baseAlphaScale: 0.63 });
  assert.equal(result.visible, true);
  assert.equal(result.alphaScale, 0.63);
});

test('phase 4702 routine secondary yields strongly when an important primary owns the enemy response footprint', () => {
  const result = present({ primaryImportant: true, battlefieldStress: 0.3 });
  assert.equal(result.visible, true);
  assert.ok(result.alphaScale < 0.30);
});

test('phase 4703 dense or higher-priority pressure hides routine secondary response clutter', () => {
  const dense = present({ battlefieldStress: 0.92 });
  const priority = present({ higherPriorityCue: true });
  assert.equal(dense.visible, false);
  assert.equal(priority.visible, false);
});

test('phase 4704 important secondary response remains visible with a bounded readability floor', () => {
  const result = present({ importantEvent: true, primaryImportant: true, battlefieldStress: 1, higherPriorityCue: true });
  assert.equal(result.visible, true);
  assert.ok(result.alphaScale >= 0.30);
  assert.ok(result.alphaScale < 0.9);
});

test('phase 4705 routine secondary between routine owners remains visible but below the primary alpha', () => {
  const secondary = present({ baseAlphaScale: 0.8, battlefieldStress: 0.25 });
  const primary = present({ primary: true, baseAlphaScale: 0.8, battlefieldStress: 0.25 });
  assert.equal(secondary.visible, true);
  assert.ok(secondary.alphaScale < primary.alphaScale);
});

test('phase 4706 Reduced Flash remains the final alpha ceiling for cross-affix response presentation', () => {
  const result = present({ primary: true, importantEvent: true, baseAlphaScale: 1, reducedFlash: true });
  assert.ok(result.alphaScale <= 0.72);
});
