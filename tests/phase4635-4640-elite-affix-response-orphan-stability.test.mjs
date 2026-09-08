import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const responseLane = await import('../dist/game/elite-affix-response-lane.js').catch(() => null);

function api() {
  assert.ok(responseLane, 'elite-affix-response-lane module must exist');
  return responseLane;
}

function captured(offsetX = 3, offsetY = -6, importantEvent = false) {
  return api().captureEliteAffixResponseLaneSnapshot({
    lane: -1,
    offsetX,
    offsetY,
    motionScale: 0.5,
    alphaScale: 0.8,
  }, importantEvent);
}

test('phase 4635 a retained response snapshot survives loss of its source enemy', () => {
  const first = captured();
  const retained = api().retainEliteAffixResponseLaneSnapshot(first, undefined);
  assert.deepEqual(retained, first);
});

test('phase 4636 response sprite world origin is derived from the frozen cue position plus the frozen lane offset', () => {
  const origin = api().eliteAffixResponseCueOrigin({ x: 120, y: 80 }, captured(4, -7));
  assert.deepEqual(origin, { x: 124, y: 73 });
});

test('phase 4637 the same frozen origin can anchor both response sprite and Swift connector without live-enemy drift', () => {
  const snapshot = captured(-5, 9, true);
  const spriteOrigin = api().eliteAffixResponseCueOrigin({ x: 220, y: 140 }, snapshot);
  const connectorOrigin = api().eliteAffixResponseCueOrigin({ x: 220, y: 140 }, snapshot);
  assert.deepEqual(connectorOrigin, spriteOrigin);
});

test('phase 4638 an orphan response with no captured lane falls back to the canonical center instead of inheriting unrelated live state', () => {
  const fallback = api().captureEliteAffixResponseLaneSnapshot(undefined, false);
  const origin = api().eliteAffixResponseCueOrigin({ x: 64, y: 48 }, fallback);
  assert.deepEqual(origin, { x: 64, y: 48 });
  assert.equal(fallback.offsetX, 0);
  assert.equal(fallback.offsetY, 0);
});

test('phase 4639 invalid response-lane values collapse to a finite center-safe snapshot', () => {
  const fallback = api().captureEliteAffixResponseLaneSnapshot({
    lane: 2,
    offsetX: Number.NaN,
    offsetY: Number.POSITIVE_INFINITY,
    motionScale: Number.NaN,
    alphaScale: Number.NEGATIVE_INFINITY,
  }, false);
  for (const value of [fallback.offsetX, fallback.offsetY, fallback.motionScale, fallback.sourceAlphaScale]) assert.ok(Number.isFinite(value));
  assert.equal(fallback.offsetX, 0);
  assert.equal(fallback.offsetY, 0);
});

test('phase 4640 EnemyManager stores one response snapshot and reuses it for sprite and Swift connector rendering', async () => {
  const source = await readFile(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
  assert.match(source, /elite-affix-response-lane\.js/);
  assert.match(source, /laneSnapshot\?:\s*EliteAffixResponseLaneSnapshot/);
  assert.match(source, /captureEliteAffixResponseLaneSnapshot/);
  assert.match(source, /retainEliteAffixResponseLaneSnapshot/);
  assert.match(source, /eliteAffixResponseCueOrigin/);
  assert.match(source, /responseLane\.alphaScale/);
});
