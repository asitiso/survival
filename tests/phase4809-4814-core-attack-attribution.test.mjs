import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Final-gate sync: behavior is unchanged; this commit re-triggers PR verification outside Actions recursion.
const linkage = await import('../dist/game/attack-outcome-linkage.js').catch(() => null);
const attribution = await import('../dist/game/core-attack-outcome-attribution.js').catch(() => null);

function api() {
  assert.ok(linkage, 'attack-outcome-linkage module must exist');
  assert.ok(attribution, 'core-attack-outcome-attribution module must exist');
  return { ...linkage, ...attribution };
}

function coreIntent(overrides = {}) {
  return {
    key: '91:boss:core:contact',
    enemyId: 91,
    enemyType: 'boss',
    target: 'core',
    source: 'contact',
    ...overrides,
  };
}

test('phase 4809 a uniquely rendered boss core attack is attributed to the guardian core hit', () => {
  const { replaceRenderedAttackIntents, consumeCoreAttackAttribution } = api();
  replaceRenderedAttackIntents([coreIntent()]);
  const result = consumeCoreAttackAttribution('contact');
  assert.equal(result?.attackIntent.key, '91:boss:core:contact');
  assert.equal(result?.label, '보스 → 핵');
});

test('phase 4810 bomber explosion attribution keeps the attack source identity intact', () => {
  const { replaceRenderedAttackIntents, consumeCoreAttackAttribution } = api();
  replaceRenderedAttackIntents([coreIntent({
    key: '92:bomber:core:explosion',
    enemyId: 92,
    enemyType: 'bomber',
    source: 'explosion',
  })]);
  const result = consumeCoreAttackAttribution('explosion');
  assert.equal(result?.attackIntent.enemyType, 'bomber');
  assert.equal(result?.attackIntent.source, 'explosion');
  assert.equal(result?.label, '폭탄병 → 핵');
});

test('phase 4811 ambiguous same-source core warnings refuse attacker attribution instead of guessing', () => {
  const { replaceRenderedAttackIntents, consumeCoreAttackAttribution } = api();
  replaceRenderedAttackIntents([
    coreIntent({ key: '93:boss:core:contact', enemyId: 93 }),
    coreIntent({ key: '94:boss:core:contact', enemyId: 94 }),
  ]);
  assert.equal(consumeCoreAttackAttribution('contact'), null);
});

test('phase 4812 a core attribution is single-consume and cannot leak into the next hit', () => {
  const { replaceRenderedAttackIntents, consumeCoreAttackAttribution } = api();
  replaceRenderedAttackIntents([coreIntent()]);
  assert.ok(consumeCoreAttackAttribution('contact'));
  assert.equal(consumeCoreAttackAttribution('contact'), null);
});

test('phase 4813 hero-target intent cannot be consumed by guardian-core attribution', () => {
  const { replaceRenderedAttackIntents, consumeCoreAttackAttribution } = api();
  replaceRenderedAttackIntents([coreIntent({
    key: '95:boss:hero:contact',
    enemyId: 95,
    target: 'hero',
  })]);
  assert.equal(consumeCoreAttackAttribution('contact'), null);
});

test('phase 4814 guardian-core damage flow carries attribution into the existing coreHit presentation path', () => {
  const source = readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  assert.match(source, /consumeCoreAttackAttribution\(source\)/);
  assert.match(source, /queueSurvivalResponseVfx\('coreHit',[\s\S]*coreAttackAttribution/);
  assert.match(source, /attackerLabel/);
});