import test from 'node:test';
import assert from 'node:assert/strict';

const linkage = await import('../dist/game/attack-outcome-linkage.js').catch(() => null);

function api() {
  assert.ok(linkage, 'attack-outcome-linkage module must exist');
  return linkage;
}

function intent(overrides = {}) {
  return {
    enemyId: 41,
    enemyType: 'boss',
    target: 'hero',
    source: 'contact',
    now: 10,
    ttl: 0.48,
    ...overrides,
  };
}

test('phase 4803 telegraphed attacks receive a deterministic source-target identity key', () => {
  const { attackIntentKey } = api();
  assert.equal(attackIntentKey(intent()), '41:boss:hero:contact');
  assert.equal(attackIntentKey(intent()), attackIntentKey(intent()));
});

test('phase 4804 a matching attack outcome consumes the remembered intent exactly once', () => {
  const { createAttackOutcomeLinkageState, rememberAttackIntent, consumeAttackOutcome } = api();
  const remembered = rememberAttackIntent(createAttackOutcomeLinkageState(), intent());
  const first = consumeAttackOutcome(remembered, { enemyId: 41, target: 'hero', source: 'contact', now: 10.2 });
  assert.equal(first.outcome?.key, '41:boss:hero:contact');
  assert.equal(first.outcome?.enemyType, 'boss');
  const second = consumeAttackOutcome(first.state, { enemyId: 41, target: 'hero', source: 'contact', now: 10.21 });
  assert.equal(second.outcome, null);
});

test('phase 4805 mismatched source or target cannot steal another telegraphed attack intent', () => {
  const { createAttackOutcomeLinkageState, rememberAttackIntent, consumeAttackOutcome } = api();
  const remembered = rememberAttackIntent(createAttackOutcomeLinkageState(), intent());
  const wrongTarget = consumeAttackOutcome(remembered, { enemyId: 41, target: 'core', source: 'contact', now: 10.2 });
  assert.equal(wrongTarget.outcome, null);
  const wrongSource = consumeAttackOutcome(wrongTarget.state, { enemyId: 41, target: 'hero', source: 'projectile', now: 10.21 });
  assert.equal(wrongSource.outcome, null);
  const matching = consumeAttackOutcome(wrongSource.state, { enemyId: 41, target: 'hero', source: 'contact', now: 10.22 });
  assert.equal(matching.outcome?.key, '41:boss:hero:contact');
});

test('phase 4806 expired attack intents never attach stale cause identity to later damage', () => {
  const { createAttackOutcomeLinkageState, rememberAttackIntent, consumeAttackOutcome } = api();
  const remembered = rememberAttackIntent(createAttackOutcomeLinkageState(), intent({ ttl: 0.3 }));
  const expired = consumeAttackOutcome(remembered, { enemyId: 41, target: 'hero', source: 'contact', now: 10.31 });
  assert.equal(expired.outcome, null);
  assert.equal(expired.state.intents.length, 0);
});

test('phase 4807 repeated frames refresh one stable telegraph identity instead of duplicating it', () => {
  const { createAttackOutcomeLinkageState, rememberAttackIntent } = api();
  const first = rememberAttackIntent(createAttackOutcomeLinkageState(), intent());
  const refreshed = rememberAttackIntent(first, intent({ now: 10.1 }));
  assert.equal(refreshed.intents.length, 1);
  assert.equal(refreshed.intents[0].key, first.intents[0].key);
  assert.ok(refreshed.intents[0].expiresAt > first.intents[0].expiresAt);
});

test('phase 4808 linkage state stays bounded and exposes presentation-only outcome metadata', () => {
  const { createAttackOutcomeLinkageState, rememberAttackIntent, consumeAttackOutcome } = api();
  let state = createAttackOutcomeLinkageState();
  for (let enemyId = 1; enemyId <= 40; enemyId += 1) {
    state = rememberAttackIntent(state, intent({ enemyId, now: 10 + enemyId * 0.001 }));
  }
  assert.ok(state.intents.length <= 24);
  const newest = consumeAttackOutcome(state, { enemyId: 40, target: 'hero', source: 'contact', now: 10.2 });
  assert.deepEqual(Object.keys(newest.outcome ?? {}).sort(), ['enemyId', 'enemyType', 'key', 'source', 'target']);
});
