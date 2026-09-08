import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const responseLane = await import('../dist/game/elite-affix-response-lane.js').catch(() => null);

function api() {
  assert.ok(responseLane, 'elite-affix-response-lane module must exist');
  return responseLane;
}

test('phase 4689 a fully refreshed important response starts at full normalized life', () => {
  const refreshed = api().refreshEliteAffixResponseLifetime({ ttl: 0.08, maxTtl: 0.42 }, true);
  assert.equal(api().eliteAffixResponseLifeRatio(refreshed.ttl, refreshed.maxTtl), 1);
});

test('phase 4690 response life ratio is shared deterministically by sprite and connector consumers', () => {
  const spriteLife = api().eliteAffixResponseLifeRatio(0.21, 0.42);
  const connectorLife = api().eliteAffixResponseLifeRatio(0.21, 0.42);
  assert.equal(spriteLife, 0.5);
  assert.equal(connectorLife, spriteLife);
});

test('phase 4691 response life ratio clamps negative remaining time to zero', () => {
  assert.equal(api().eliteAffixResponseLifeRatio(-1, 0.42), 0);
});

test('phase 4692 response life ratio clamps overshoot to one after repeated important refresh', () => {
  assert.equal(api().eliteAffixResponseLifeRatio(9, 0.42), 1);
});

test('phase 4693 invalid lifetime inputs produce a finite safe ratio', () => {
  const ratio = api().eliteAffixResponseLifeRatio(Number.NaN, Number.POSITIVE_INFINITY);
  assert.equal(Number.isFinite(ratio), true);
  assert.ok(ratio >= 0 && ratio <= 1);
});

test('phase 4694 runtime applies dedup, lifetime refresh, and one shared life-ratio helper before snapshot rendering', async () => {
  const runtimeSource = await readFile(new URL('../src/game/elite-affix-response-lane-runtime.ts', import.meta.url), 'utf8');
  assert.match(runtimeSource, /eliteAffixResponseDuplicateResolution/);
  assert.match(runtimeSource, /refreshEliteAffixResponseLifetime/);
  assert.match(runtimeSource, /eliteAffixResponseLifeRatio/);
  assert.match(runtimeSource, /dropIndexes/);
});
