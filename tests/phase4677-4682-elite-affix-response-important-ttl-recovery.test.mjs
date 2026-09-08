import test from 'node:test';
import assert from 'node:assert/strict';

const responseLane = await import('../dist/game/elite-affix-response-lane.js').catch(() => null);

function api() {
  assert.ok(responseLane, 'elite-affix-response-lane module must exist');
  return responseLane;
}

test('phase 4677 important response promotion restores a fading tail to the full response lifetime', () => {
  const refreshed = api().refreshEliteAffixResponseLifetime({ ttl: 0.14, maxTtl: 0.42 }, true);
  assert.equal(refreshed.ttl, 0.42);
  assert.equal(refreshed.maxTtl, 0.42);
});

test('phase 4678 routine duplicate response does not extend an existing response lifetime', () => {
  const refreshed = api().refreshEliteAffixResponseLifetime({ ttl: 0.14, maxTtl: 0.42 }, false);
  assert.equal(refreshed.ttl, 0.14);
  assert.equal(refreshed.maxTtl, 0.42);
});

test('phase 4679 repeated important refresh is capped at max lifetime instead of accumulating time', () => {
  const first = api().refreshEliteAffixResponseLifetime({ ttl: 0.2, maxTtl: 0.42 }, true);
  const second = api().refreshEliteAffixResponseLifetime(first, true);
  assert.equal(second.ttl, 0.42);
  assert.equal(second.maxTtl, 0.42);
});

test('phase 4680 invalid max lifetime falls back to the canonical response lifetime', () => {
  const refreshed = api().refreshEliteAffixResponseLifetime({ ttl: 0.1, maxTtl: Number.NaN }, true);
  assert.equal(refreshed.maxTtl, 0.42);
  assert.equal(refreshed.ttl, 0.42);
});

test('phase 4681 routine lifetime normalization clamps negative remaining time without reviving it', () => {
  const refreshed = api().refreshEliteAffixResponseLifetime({ ttl: -2, maxTtl: 0.42 }, false);
  assert.equal(refreshed.ttl, 0);
  assert.equal(refreshed.maxTtl, 0.42);
});

test('phase 4682 lifetime refresh is presentation-only and does not mutate lane snapshot geometry', () => {
  const snapshot = api().captureEliteAffixResponseLaneSnapshot({
    lane: 2,
    offsetX: 4,
    offsetY: 11,
    motionScale: 0.7,
    alphaScale: 0.9,
  }, false);
  const before = { ...snapshot };
  api().refreshEliteAffixResponseLifetime({ ttl: 0.12, maxTtl: 0.42 }, true);
  assert.deepEqual(snapshot, before);
});
