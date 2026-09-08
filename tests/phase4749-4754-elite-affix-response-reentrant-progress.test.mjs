import test from 'node:test';
import assert from 'node:assert/strict';

const handoff = await import('../dist/game/elite-affix-response-handoff.js').catch(() => null);

function api() {
  assert.ok(handoff, 'elite-affix-response-handoff module must exist');
  return handoff;
}

function state(overrides = {}) {
  return {
    ownerAffixId: 'manaShield',
    ownerImportant: false,
    fromAffixId: 'swift',
    progress: 0.5,
    lastOwnerTtl: 0.30,
    ...overrides,
  };
}

test('phase 4749 active reentrant handoff carries its existing progress instead of restarting from zero', () => {
  assert.equal(api().eliteAffixResponseCrossAffixRetargetProgress(state()), 0.5);
});

test('phase 4750 important-to-important retarget preserves the same bounded progress floor', () => {
  const previous = state({ ownerImportant: true, progress: 0.72 });
  assert.equal(api().eliteAffixResponseCrossAffixRetargetProgress(previous), 0.72);
});

test('phase 4751 early handoff progress remains finite and non-negative when retargeted', () => {
  const result = api().eliteAffixResponseCrossAffixRetargetProgress(state({ progress: 0.08 }));
  assert.ok(Number.isFinite(result));
  assert.ok(result >= 0.08);
});

test('phase 4752 a settled previous owner starts a genuinely new handoff from zero', () => {
  assert.equal(api().eliteAffixResponseCrossAffixRetargetProgress(state({ fromAffixId: null, progress: 1 })), 0);
});

test('phase 4753 invalid prior progress cannot contaminate a reentrant handoff', () => {
  assert.equal(api().eliteAffixResponseCrossAffixRetargetProgress(state({ progress: Number.NaN })), 0);
});

test('phase 4754 retarget progress is clamped to the legal presentation interval', () => {
  assert.equal(api().eliteAffixResponseCrossAffixRetargetProgress(state({ progress: 1.4 })), 0);
  assert.equal(api().eliteAffixResponseCrossAffixRetargetProgress(state({ progress: -0.2 })), 0);
});
