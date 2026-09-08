import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const responseLane = await import('../dist/game/elite-affix-response-lane.js').catch(() => null);

function api() {
  assert.ok(responseLane, 'elite-affix-response-lane module must exist');
  return responseLane;
}

function targetState(targetPos, targetKind) {
  return { targetPos, targetKind };
}

test('phase 4671 important duplicate response refreshes the existing target position', () => {
  const refreshed = api().refreshEliteAffixResponseTarget(
    targetState({ x: 100, y: 120 }, 'hero'),
    targetState({ x: 220, y: 160 }, 'hero'),
    true,
  );
  assert.deepEqual(refreshed.targetPos, { x: 220, y: 160 });
});

test('phase 4672 refreshing an important target does not mutate frozen response origin ownership', () => {
  const snapshot = api().captureEliteAffixResponseLaneSnapshot({
    lane: -1,
    offsetX: 5,
    offsetY: -9,
    motionScale: 0.6,
    alphaScale: 0.9,
  }, true);
  const before = api().eliteAffixResponseCueOrigin({ x: 80, y: 70 }, snapshot);
  api().refreshEliteAffixResponseTarget(
    targetState({ x: 100, y: 120 }, 'hero'),
    targetState({ x: 240, y: 180 }, 'hero'),
    true,
  );
  const after = api().eliteAffixResponseCueOrigin({ x: 80, y: 70 }, snapshot);
  assert.deepEqual(after, before);
});

test('phase 4673 routine duplicate response cannot overwrite an existing important target', () => {
  const refreshed = api().refreshEliteAffixResponseTarget(
    targetState({ x: 100, y: 120 }, 'hero'),
    targetState({ x: 220, y: 160 }, 'core'),
    false,
  );
  assert.deepEqual(refreshed, targetState({ x: 100, y: 120 }, 'hero'));
});

test('phase 4674 important target refresh updates hero-core target ownership together with position', () => {
  const refreshed = api().refreshEliteAffixResponseTarget(
    targetState({ x: 100, y: 120 }, 'hero'),
    targetState({ x: 300, y: 200 }, 'core'),
    true,
  );
  assert.equal(refreshed.targetKind, 'core');
  assert.deepEqual(refreshed.targetPos, { x: 300, y: 200 });
});

test('phase 4675 invalid important target coordinates are ignored in favor of the last finite target', () => {
  const existing = targetState({ x: 100, y: 120 }, 'hero');
  const refreshed = api().refreshEliteAffixResponseTarget(
    existing,
    targetState({ x: Number.NaN, y: Number.POSITIVE_INFINITY }, 'core'),
    true,
  );
  assert.deepEqual(refreshed, existing);
});

test('phase 4676 runtime suppresses legacy response drawing and renders snapshot-authoritative responses itself', async () => {
  const runtimeSource = await readFile(new URL('../src/game/elite-affix-response-lane-runtime.ts', import.meta.url), 'utf8');
  assert.match(runtimeSource, /refreshEliteAffixResponseTarget/);
  assert.match(runtimeSource, /eliteAffixResponseRenderPresentation/);
  assert.match(runtimeSource, /renderFrozenEliteAffixResponses/);
  assert.match(runtimeSource, /state\.eliteAffixResponseVfx\s*=\s*\[\]/);
  assert.match(runtimeSource, /responsePresentation\.alphaScale/);
});
