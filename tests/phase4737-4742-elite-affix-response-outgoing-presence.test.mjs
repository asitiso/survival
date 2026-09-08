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
    progress: 0.35,
    lastOwnerTtl: 0.24,
    ...overrides,
  };
}

test('phase 4737 active handoff detects when its outgoing response cue is still present', () => {
  assert.equal(api().eliteAffixResponseCrossAffixOutgoingPresent(state(), ['swift', 'manaShield']), true);
});

test('phase 4738 source-loss or expiry reports no outgoing trace when the recorded outgoing affix is absent', () => {
  assert.equal(api().eliteAffixResponseCrossAffixOutgoingPresent(state(), ['manaShield']), false);
});

test('phase 4739 settled handoff never reports outgoing presence even if that affix has another unrelated active response', () => {
  const settled = state({ progress: 1, fromAffixId: null });
  assert.equal(api().eliteAffixResponseCrossAffixOutgoingPresent(settled, ['swift', 'manaShield']), false);
});

test('phase 4740 unrelated secondary affixes cannot masquerade as the outgoing response', () => {
  assert.equal(api().eliteAffixResponseCrossAffixOutgoingPresent(state(), ['frenzied', 'commander']), false);
});

test('phase 4741 duplicate active ids remain deterministic and still count as one outgoing presence signal', () => {
  const first = api().eliteAffixResponseCrossAffixOutgoingPresent(state(), ['swift', 'swift', 'manaShield']);
  const second = api().eliteAffixResponseCrossAffixOutgoingPresent(state(), ['swift', 'swift', 'manaShield']);
  assert.equal(first, true);
  assert.equal(second, first);
});

test('phase 4742 invalid handoff progress fails open to no outgoing-presence compensation', () => {
  assert.equal(api().eliteAffixResponseCrossAffixOutgoingPresent(state({ progress: Number.NaN }), ['swift']), false);
});
