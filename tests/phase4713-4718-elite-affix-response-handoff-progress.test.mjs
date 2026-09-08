import test from 'node:test';
import assert from 'node:assert/strict';

const handoff = await import('../dist/game/elite-affix-response-handoff.js').catch(() => null);

function api() {
  assert.ok(handoff, 'elite-affix-response-handoff module must exist');
  return handoff;
}

function state(overrides = {}) {
  return {
    ownerAffixId: 'swift',
    ownerImportant: false,
    fromAffixId: null,
    progress: 1,
    lastOwnerTtl: 0.34,
    ...overrides,
  };
}

test('phase 4713 the first cross-affix owner starts settled without manufacturing a handoff', () => {
  const result = api().advanceEliteAffixResponseCrossAffixHandoff(undefined, 'swift', false, 0.42);
  assert.equal(result.ownerAffixId, 'swift');
  assert.equal(result.fromAffixId, null);
  assert.equal(result.progress, 1);
});

test('phase 4714 owner change records the outgoing affix and starts a bounded handoff at zero progress', () => {
  const result = api().advanceEliteAffixResponseCrossAffixHandoff(state(), 'manaShield', false, 0.36);
  assert.equal(result.ownerAffixId, 'manaShield');
  assert.equal(result.fromAffixId, 'swift');
  assert.equal(result.progress, 0);
});

test('phase 4715 owner ttl decay advances the handoff using presentation lifetime rather than render-frame count', () => {
  const started = state({ ownerAffixId: 'manaShield', fromAffixId: 'swift', progress: 0, lastOwnerTtl: 0.36 });
  const result = api().advanceEliteAffixResponseCrossAffixHandoff(started, 'manaShield', false, 0.32);
  assert.ok(result.progress > 0.45 && result.progress < 0.55);
});

test('phase 4716 important ttl refresh cannot rewind an in-flight cross-affix handoff', () => {
  const started = state({ ownerAffixId: 'manaShield', ownerImportant: true, fromAffixId: 'swift', progress: 0.5, lastOwnerTtl: 0.28 });
  const refreshed = api().advanceEliteAffixResponseCrossAffixHandoff(started, 'manaShield', true, 0.42);
  assert.ok(refreshed.progress >= 0.5);
});

test('phase 4717 enough owner lifetime decay completes the handoff and clears stale outgoing ownership', () => {
  const started = state({ ownerAffixId: 'manaShield', fromAffixId: 'swift', progress: 0.25, lastOwnerTtl: 0.32 });
  const result = api().advanceEliteAffixResponseCrossAffixHandoff(started, 'manaShield', false, 0.24);
  assert.equal(result.progress, 1);
  assert.equal(result.fromAffixId, null);
});

test('phase 4718 invalid ttl input stays finite and never reverses existing handoff progress', () => {
  const started = state({ ownerAffixId: 'manaShield', fromAffixId: 'swift', progress: 0.4, lastOwnerTtl: 0.30 });
  const result = api().advanceEliteAffixResponseCrossAffixHandoff(started, 'manaShield', false, Number.NaN);
  assert.ok(Number.isFinite(result.progress));
  assert.ok(result.progress >= 0.4);
});
