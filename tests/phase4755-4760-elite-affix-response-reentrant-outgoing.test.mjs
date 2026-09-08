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
    progress: 0.45,
    lastOwnerTtl: 0.30,
    ...overrides,
  };
}

test('phase 4755 reentrant handoff falls back to the prior outgoing affix when the current owner cue vanished', () => {
  assert.equal(api().eliteAffixResponseCrossAffixReentrantFrom(state(), ['swift', 'frenzied']), 'swift');
});

test('phase 4756 a still-active current owner is the preferred outgoing anchor for the next handoff', () => {
  assert.equal(api().eliteAffixResponseCrossAffixReentrantFrom(state(), ['swift', 'manaShield', 'frenzied']), 'manaShield');
});

test('phase 4757 no active outgoing candidate keeps deterministic current-owner metadata without inventing another affix', () => {
  assert.equal(api().eliteAffixResponseCrossAffixReentrantFrom(state(), ['frenzied']), 'manaShield');
});

test('phase 4758 unrelated active affixes cannot replace the recorded outgoing anchor', () => {
  assert.equal(api().eliteAffixResponseCrossAffixReentrantFrom(state(), ['commander', 'swift', 'frenzied']), 'swift');
});

test('phase 4759 duplicate active affix ids resolve the same outgoing anchor deterministically', () => {
  assert.equal(api().eliteAffixResponseCrossAffixReentrantFrom(state(), ['swift', 'swift', 'frenzied']), 'swift');
});

test('phase 4760 settled state never reuses a stale prior outgoing affix as a reentrant anchor', () => {
  const settled = state({ fromAffixId: null, progress: 1 });
  assert.equal(api().eliteAffixResponseCrossAffixReentrantFrom(settled, ['swift', 'frenzied']), 'manaShield');
});
