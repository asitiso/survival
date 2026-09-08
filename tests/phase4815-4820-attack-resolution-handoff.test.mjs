import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const handoff = await import('../dist/game/attack-resolution-handoff.js').catch(() => null);

function api() {
  assert.ok(handoff, 'attack-resolution-handoff module must exist');
  return handoff;
}

function outcome(overrides = {}) {
  return {
    key: '91:boss:hero:contact',
    enemyId: 91,
    enemyType: 'boss',
    target: 'hero',
    source: 'contact',
    ...overrides,
  };
}

test('phase 4815 a linked hit records one bounded telegraph resolution handoff', () => {
  const { createAttackResolutionHandoffState, recordAttackResolutionHandoff } = api();
  const next = recordAttackResolutionHandoff(createAttackResolutionHandoffState(), outcome(), 10);
  assert.equal(next.entries.length, 1);
  assert.equal(next.entries[0]?.key, '91:boss:hero:contact');
  assert.equal(next.entries[0]?.expiresAt, 10.18);
});

test('phase 4816 a freshly resolved telegraph is smaller and quieter than an unresolved warning', () => {
  const { createAttackResolutionHandoffState, recordAttackResolutionHandoff, attackResolutionHandoffPresentation } = api();
  const state = recordAttackResolutionHandoff(createAttackResolutionHandoffState(), outcome(), 10);
  const presentation = attackResolutionHandoffPresentation(state, '91:boss:hero:contact', 10.09, false, false);
  const reduced = attackResolutionHandoffPresentation(state, '91:boss:hero:contact', 10.09, true, true);
  assert.equal(presentation.resolved, true);
  assert.ok(presentation.alphaScale < 0.7);
  assert.ok(presentation.sizeScale < 0.9);
  assert.ok(presentation.alphaScale > 0);
  assert.ok(presentation.sizeScale > 0.6);
  assert.ok(reduced.alphaScale <= presentation.alphaScale);
  assert.ok(reduced.sizeScale >= presentation.sizeScale);
});

test('phase 4817 handoff expires after 180ms so a later attack can present normally again', () => {
  const { createAttackResolutionHandoffState, recordAttackResolutionHandoff, attackResolutionHandoffPresentation } = api();
  const state = recordAttackResolutionHandoff(createAttackResolutionHandoffState(), outcome(), 10);
  const expired = attackResolutionHandoffPresentation(state, '91:boss:hero:contact', 10.181, false, false);
  assert.deepEqual(expired, { resolved: false, alphaScale: 1, sizeScale: 1 });
});

test('phase 4818 ambiguous or unlinked hits cannot create a telegraph resolution handoff', () => {
  const { createAttackResolutionHandoffState, recordAttackResolutionHandoff } = api();
  const state = recordAttackResolutionHandoff(createAttackResolutionHandoffState(), null, 10);
  assert.equal(state.entries.length, 0);
});

test('phase 4819 hero and guardian-core attack identities cannot resolve each other', () => {
  const { createAttackResolutionHandoffState, recordAttackResolutionHandoff, attackResolutionHandoffPresentation } = api();
  const state = recordAttackResolutionHandoff(createAttackResolutionHandoffState(), outcome(), 10);
  const core = attackResolutionHandoffPresentation(state, '91:boss:core:contact', 10.05, false, false);
  const hero = attackResolutionHandoffPresentation(state, '91:boss:hero:contact', 10.05, false, false);
  assert.equal(core.resolved, false);
  assert.equal(hero.resolved, true);
});

test('phase 4820 game routes linked hero and core outcomes into existing danger telegraph rendering without new UI', () => {
  const source = readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  assert.match(source, /recordAttackResolutionHandoff/);
  assert.match(source, /attackResolutionHandoffPresentation/);
  assert.match(source, /handoff\.alphaScale/);
  assert.match(source, /handoff\.sizeScale/);
  assert.doesNotMatch(source, /attack-resolution-panel|resolution-overlay/);
});
