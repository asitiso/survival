import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const responseLane = await import('../dist/game/elite-affix-response-lane.js').catch(() => null);

function api() {
  assert.ok(responseLane, 'elite-affix-response-lane module must exist');
  return responseLane;
}

function snapshot({ offsetX = -5, offsetY = 9, motionScale = 0.44, sourceAlphaScale = 0.87, importantEvent = true } = {}) {
  return { offsetX, offsetY, motionScale, sourceAlphaScale, importantEvent };
}

test('phase 4653 promoted important response state survives source loss without a replacement candidate', () => {
  const existing = snapshot();
  const retained = api().promoteEliteAffixResponseLaneSnapshot(existing, undefined, true);
  assert.deepEqual(retained, existing);
});

test('phase 4654 invalid candidate values cannot contaminate a valid promoted snapshot', () => {
  const existing = snapshot({ offsetX: -3, offsetY: 8, sourceAlphaScale: 0.88 });
  const invalid = snapshot({ offsetX: Number.NaN, offsetY: Number.POSITIVE_INFINITY, motionScale: Number.NaN, sourceAlphaScale: Number.NaN, importantEvent: true });
  const promoted = api().promoteEliteAffixResponseLaneSnapshot(existing, invalid, true);
  assert.deepEqual(promoted, existing);
});

test('phase 4655 an orphan routine snapshot can still be marked important without changing its frozen origin', () => {
  const existing = snapshot({ offsetX: 4, offsetY: -10, sourceAlphaScale: 0.42, importantEvent: false });
  const promoted = api().promoteEliteAffixResponseLaneSnapshot(existing, undefined, true);
  assert.equal(promoted.importantEvent, true);
  assert.equal(promoted.offsetX, 4);
  assert.equal(promoted.offsetY, -10);
});

test('phase 4656 post-promotion routine updates cannot flip the frozen response side', () => {
  const existing = snapshot({ offsetX: -6, offsetY: 10 });
  const routineOpposite = snapshot({ offsetX: 7, offsetY: -11, sourceAlphaScale: 0.25, importantEvent: false });
  const updated = api().promoteEliteAffixResponseLaneSnapshot(existing, routineOpposite, false);
  const origin = api().eliteAffixResponseCueOrigin({ x: 100, y: 100 }, updated);
  assert.equal(Math.sign(origin.x - 100), -1);
  assert.equal(Math.sign(origin.y - 100), 1);
});

test('phase 4657 repeated important candidates from opposite lanes keep one canonical frozen origin', () => {
  const first = snapshot({ offsetX: -4, offsetY: 7, sourceAlphaScale: 0.82 });
  const second = api().promoteEliteAffixResponseLaneSnapshot(first, snapshot({ offsetX: 8, offsetY: -12, sourceAlphaScale: 0.93, importantEvent: true }), true);
  const third = api().promoteEliteAffixResponseLaneSnapshot(second, snapshot({ offsetX: 11, offsetY: -16, sourceAlphaScale: 0.91, importantEvent: true }), true);
  assert.deepEqual(api().eliteAffixResponseCueOrigin({ x: 200, y: 140 }, third), { x: 196, y: 147 });
});

test('phase 4658 runtime integration promotes existing response snapshots instead of replacing their frozen geometry', async () => {
  const runtimeSource = await readFile(new URL('../src/game/elite-affix-response-lane-runtime.ts', import.meta.url), 'utf8');
  assert.match(runtimeSource, /promoteEliteAffixResponseLaneSnapshot/);
  assert.doesNotMatch(runtimeSource, /laneSnapshot\s*=\s*retainEliteAffixResponseLaneSnapshot/);
});
