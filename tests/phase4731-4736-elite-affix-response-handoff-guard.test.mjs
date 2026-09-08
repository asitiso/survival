import test from 'node:test';
import assert from 'node:assert/strict';

const handoff = await import('../dist/game/elite-affix-response-handoff.js').catch(() => null);
const arbitration = await import('../dist/game/elite-affix-response-arbitration.js').catch(() => null);

function api() {
  assert.ok(handoff, 'elite-affix-response-handoff module must exist');
  return handoff;
}

function arbitrationApi() {
  assert.ok(arbitration, 'elite-affix-response-arbitration module must exist');
  return arbitration;
}

function state(overrides = {}) {
  return {
    ownerAffixId: 'manaShield',
    ownerImportant: false,
    fromAffixId: 'swift',
    progress: 0.35,
    lastOwnerTtl: 0.24,
    ...overrides,
  };
}

test('phase 4731 active cross-affix handoff exposes a short ownership guard while the current owner is still alive', () => {
  assert.equal(api().eliteAffixResponseCrossAffixHandoffHoldActive(state(), true), true);
});

test('phase 4732 completed handoff releases the temporary ownership guard', () => {
  assert.equal(api().eliteAffixResponseCrossAffixHandoffHoldActive(state({ progress: 1, fromAffixId: null }), true), false);
});

test('phase 4733 missing outgoing metadata cannot manufacture a handoff guard', () => {
  assert.equal(api().eliteAffixResponseCrossAffixHandoffHoldActive(state({ fromAffixId: null }), true), false);
});

test('phase 4734 an expired current owner never remains protected only because stale handoff state exists', () => {
  assert.equal(api().eliteAffixResponseCrossAffixHandoffHoldActive(state(), false), false);
});

test('phase 4735 active handoff guard prevents a routine challenger from replacing the current owner mid-transition', () => {
  const guard = api().eliteAffixResponseCrossAffixHandoffHoldActive(state(), true);
  const result = arbitrationApi().eliteAffixResponseCrossAffixOwnership([
    { affixId: 'manaShield', importantEvent: false, ttl: 0.24, maxTtl: 0.42, livePrimary: false },
    { affixId: 'frenzied', importantEvent: false, ttl: 0.40, maxTtl: 0.42, livePrimary: true },
  ], 'manaShield', guard);
  assert.equal(result.primaryAffixId, 'manaShield');
});

test('phase 4736 important challenger still bypasses a routine handoff guard immediately', () => {
  const guard = api().eliteAffixResponseCrossAffixHandoffHoldActive(state(), true);
  const result = arbitrationApi().eliteAffixResponseCrossAffixOwnership([
    { affixId: 'manaShield', importantEvent: false, ttl: 0.24, maxTtl: 0.42, livePrimary: false },
    { affixId: 'frenzied', importantEvent: true, ttl: 0.40, maxTtl: 0.42, livePrimary: true },
  ], 'manaShield', guard);
  assert.equal(result.primaryAffixId, 'frenzied');
});
