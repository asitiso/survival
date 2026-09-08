import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const lanes = await import('../dist/game/elite-affix-cue-lanes.js');

function presentation(overrides = {}) {
  return lanes.eliteAffixCueLanePresentation(
    { lane: 1, holdTtl: 0.08, releaseTtl: 0.06 },
    {
      enemyRadius: 24,
      battlefieldStress: 0.2,
      higherPriorityCue: false,
      reducedMotion: false,
      reducedFlash: false,
      ...overrides,
    },
  );
}

test('phase 4563 dense battlefields reduce lane count before they increase displacement', () => {
  assert.equal(lanes.eliteAffixCueLaneSlotCount(4, 0.2), 5);
  assert.equal(lanes.eliteAffixCueLaneSlotCount(8, 0.9), 3);
});

test('phase 4564 dense stress reduces the physical cue offset compared with a calm battlefield', () => {
  const calm = presentation({ battlefieldStress: 0.1 });
  const dense = presentation({ battlefieldStress: 0.95 });
  assert.ok(Math.abs(dense.offsetY) < Math.abs(calm.offsetY));
});

test('phase 4565 a higher-priority battlefield cue further contracts elite lane displacement instead of competing with it', () => {
  const normal = presentation({ battlefieldStress: 0.5, higherPriorityCue: false });
  const yielding = presentation({ battlefieldStress: 0.5, higherPriorityCue: true });
  assert.ok(Math.abs(yielding.offsetY) < Math.abs(normal.offsetY));
  assert.ok(yielding.alphaScale <= normal.alphaScale);
});

test('phase 4566 Reduced Motion keeps a static separation offset but removes animated lane motion', () => {
  const reduced = presentation({ reducedMotion: true });
  assert.notEqual(reduced.offsetY, 0);
  assert.equal(reduced.motionScale, 0);
});

test('phase 4567 Reduced Flash lowers lane-owned decoration strength without deleting its spatial ownership', () => {
  const normal = presentation({ reducedFlash: false });
  const reduced = presentation({ reducedFlash: true });
  assert.equal(reduced.lane, normal.lane);
  assert.equal(reduced.offsetY, normal.offsetY);
  assert.ok(reduced.alphaScale < normal.alphaScale);
});

test('phase 4568 EnemyManager wires cue lanes only into elite cue rendering and preserves identity-row ownership', async () => {
  const source = await readFile(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
  assert.match(source, /elite-affix-cue-lanes\.js/);
  assert.match(source, /eliteAffixCueLane\?:\s*EliteAffixCueLaneState/);
  assert.match(source, /advanceEliteAffixCueLane/);
  assert.match(source, /eliteAffixCueDesiredLane/);
  assert.match(source, /eliteAffixCueLanePresentation/);
  assert.match(source, /eliteAffixCueLaneFor/);
  assert.match(source, /ctx\.translate\(eliteCueLane\.offsetX,\s*eliteCueLane\.offsetY\)/);
  assert.match(source, /eliteAffixIdentityRowLayout\(enemy\.eliteAffixes\.length, enemy\.radius, enemy\.pos\)/);
});
