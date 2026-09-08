import test from 'node:test';
import assert from 'node:assert/strict';

const responseLane = await import('../dist/game/elite-affix-response-lane.js').catch(() => null);

function api() {
  assert.ok(responseLane, 'elite-affix-response-lane module must exist');
  return responseLane;
}

test('phase 4683 duplicate response resolution keeps the newest active response as the render owner', () => {
  const resolution = api().eliteAffixResponseDuplicateResolution([
    { ttl: 0.08, importantEvent: false },
    { ttl: 0.42, importantEvent: false },
  ]);
  assert.equal(resolution.ownerIndex, 1);
});

test('phase 4684 rollover resolution drops older active duplicates so only one response owner remains', () => {
  const resolution = api().eliteAffixResponseDuplicateResolution([
    { ttl: 0.08, importantEvent: false },
    { ttl: 0.42, importantEvent: false },
  ]);
  assert.deepEqual(resolution.dropIndexes, [0]);
});

test('phase 4685 important ownership survives when a routine replacement is newer than an important tail', () => {
  const resolution = api().eliteAffixResponseDuplicateResolution([
    { ttl: 0.08, importantEvent: true },
    { ttl: 0.42, importantEvent: false },
  ]);
  assert.equal(resolution.importantEvent, true);
});

test('phase 4686 a single active response is already canonical and needs no drops', () => {
  const resolution = api().eliteAffixResponseDuplicateResolution([
    { ttl: 0.24, importantEvent: true },
  ]);
  assert.equal(resolution.ownerIndex, 0);
  assert.deepEqual(resolution.dropIndexes, []);
  assert.equal(resolution.importantEvent, true);
});

test('phase 4687 invalid or expired duplicate candidates cannot displace the newest finite active response', () => {
  const resolution = api().eliteAffixResponseDuplicateResolution([
    { ttl: Number.NaN, importantEvent: true },
    { ttl: 0, importantEvent: true },
    { ttl: 0.31, importantEvent: false },
  ]);
  assert.equal(resolution.ownerIndex, 2);
  assert.deepEqual(resolution.dropIndexes, []);
  assert.equal(resolution.importantEvent, false);
});

test('phase 4688 three-way rollover resolution is deterministic and drops every older active duplicate', () => {
  const candidates = [
    { ttl: 0.06, importantEvent: false },
    { ttl: 0.09, importantEvent: true },
    { ttl: 0.42, importantEvent: false },
  ];
  const first = api().eliteAffixResponseDuplicateResolution(candidates);
  const second = api().eliteAffixResponseDuplicateResolution(candidates);
  assert.deepEqual(first, second);
  assert.equal(first.ownerIndex, 2);
  assert.deepEqual(first.dropIndexes, [0, 1]);
  assert.equal(first.importantEvent, true);
});
