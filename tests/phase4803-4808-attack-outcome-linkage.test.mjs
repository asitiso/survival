import test from 'node:test';
import assert from 'node:assert/strict';

const linkage = await import('../dist/game/attack-outcome-linkage.js').catch(() => null);
const presentation = await import('../dist/game/enemy-presentation.js').catch(() => null);
const damageFeedback = await import('../dist/game/damage-reason-feedback.js').catch(() => null);

function api() {
  assert.ok(linkage, 'attack-outcome-linkage module must exist');
  return linkage;
}

function integrationApi() {
  assert.ok(presentation, 'enemy-presentation module must exist');
  assert.ok(damageFeedback, 'damage-reason-feedback module must exist');
  return { ...presentation, ...damageFeedback };
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

function enemy(overrides = {}) {
  return {
    id: 71,
    type: 'boss',
    radius: 24,
    target: 'hero',
    specialTimer: 0.3,
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

test('phase 4803-4808 boss telegraph links one visible contact result then falls back to legacy feedback', () => {
  const { enemyThreatTelegraph, sortTelegraphsByPriority, recordDamageReason } = integrationApi();
  const cue = enemyThreatTelegraph(enemy());
  const sorted = sortTelegraphsByPriority([cue]);
  assert.equal(sorted[0]?.attackIntent?.key, '71:boss:hero:contact');

  const linked = recordDamageReason(null, 'contact', 20, 100, 5);
  assert.equal(linked.label, '보스 · 근접 공격');
  assert.equal(linked.attackIntent?.enemyId, 71);

  const generic = recordDamageReason(null, 'contact', 20, 100, 5.1);
  assert.equal(generic.label, '근접 공격');
  assert.equal('attackIntent' in generic, false);
});

test('phase 4803-4808 bomber warning links explosion identity while support cues never arm attack outcomes', () => {
  const { enemyThreatTelegraph, sortTelegraphsByPriority, recordDamageReason } = integrationApi();
  const bomber = enemyThreatTelegraph(enemy({ id: 72, type: 'bomber', target: 'hero', specialTimer: 0.2 }));
  const support = enemyThreatTelegraph(enemy({ id: 73, type: 'shaman', target: 'hero' }));
  sortTelegraphsByPriority([support, bomber]);

  const linked = recordDamageReason(null, 'explosion', 14, 100, 7);
  assert.equal(linked.label, '폭탄병 · 폭발 피격');
  assert.equal(linked.attackIntent?.enemyId, 72);

  sortTelegraphsByPriority([support]);
  const generic = recordDamageReason(null, 'contact', 8, 100, 7.1);
  assert.equal(generic.label, '근접 공격');
  assert.equal('attackIntent' in generic, false);
});

test('phase 4803-4808 ambiguous same-source warnings refuse attribution instead of guessing', () => {
  const { enemyThreatTelegraph, sortTelegraphsByPriority, recordDamageReason } = integrationApi();
  sortTelegraphsByPriority([
    enemyThreatTelegraph(enemy({ id: 81 })),
    enemyThreatTelegraph(enemy({ id: 82 })),
  ]);
  const generic = recordDamageReason(null, 'contact', 18, 100, 9);
  assert.equal(generic.label, '근접 공격');
  assert.equal('attackIntent' in generic, false);
  sortTelegraphsByPriority([]);
});
