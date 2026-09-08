import test from 'node:test';
import assert from 'node:assert/strict';

const lanes = await import('../dist/game/elite-affix-cue-lanes.js');

function view({ importantEvent = false, higherPriorityCue = true, battlefieldStress = 0.95, reducedFlash = false } = {}) {
  return lanes.eliteAffixCueLanePresentation(
    { lane: 1, holdTtl: 0, releaseTtl: 0, importantEvent },
    {
      enemyRadius: 34,
      battlefieldStress,
      higherPriorityCue,
      reducedMotion: false,
      reducedFlash,
    },
  );
}

test('phase 4617 dense routine elite decoration yields alpha under battlefield pressure', () => {
  assert.ok(view({ importantEvent: false }).alphaScale < 0.8);
});

test('phase 4618 higher-priority battlefield ownership suppresses routine alpha more than density alone', () => {
  const normal = view({ importantEvent: false, higherPriorityCue: false });
  const yielding = view({ importantEvent: false, higherPriorityCue: true });
  assert.ok(yielding.alphaScale < normal.alphaScale);
});

test('phase 4619 important elite events retain more alpha than routine decoration under the same pressure', () => {
  const routine = view({ importantEvent: false });
  const important = view({ importantEvent: true });
  assert.ok(important.alphaScale > routine.alphaScale);
});

test('phase 4620 critical alpha floor stays readable without returning to full-strength decoration', () => {
  const important = view({ importantEvent: true, battlefieldStress: 1 });
  assert.ok(important.alphaScale >= 0.78);
  assert.ok(important.alphaScale <= 0.95);
});

test('phase 4621 Reduced Flash remains the final ceiling for important elite cue alpha', () => {
  const reduced = view({ importantEvent: true, battlefieldStress: 0.8, reducedFlash: true });
  assert.equal(reduced.alphaScale, 0.72);
});

test('phase 4622 Reduced Flash still allows routine decoration to yield below the critical ceiling', () => {
  const routine = view({ importantEvent: false, battlefieldStress: 1, reducedFlash: true });
  const important = view({ importantEvent: true, battlefieldStress: 1, reducedFlash: true });
  assert.ok(routine.alphaScale < important.alphaScale);
  assert.ok(routine.alphaScale < 0.72);
});
