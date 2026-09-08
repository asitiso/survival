import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const identity = await import('../dist/game/elite-affix-identity-assets.js');

const baseInput = {
  affixes: ['swift', 'frenzied'],
  dt: 0,
  swiftPhase: 'ready',
  frenziedPhase: 'active',
  manaShieldActive: false,
};

test('phase 4533 two-affix elites expose one deterministic presentation owner', () => {
  assert.equal(typeof identity.advanceEliteAffixCueOwnership, 'function');
  const state = identity.advanceEliteAffixCueOwnership(undefined, baseInput);
  assert.equal(state.owner, 'swift');
  assert.ok(state.holdTtl >= 0);
  assert.ok(state.releaseTtl >= 0);
});

test('phase 4534 an actual Swift strike becomes the primary owner immediately', () => {
  const previous = identity.advanceEliteAffixCueOwnership(undefined, {
    ...baseInput,
    event: { affixId: 'frenzied', kind: 'response' },
  });
  const state = identity.advanceEliteAffixCueOwnership(previous, {
    ...baseInput,
    event: { affixId: 'swift', kind: 'strike' },
  });
  assert.equal(state.owner, 'swift');
  assert.equal(state.eventPriority, 3);
  assert.ok(state.holdTtl > 0);
});

test('phase 4535 mana shield break owns presentation over another active affix', () => {
  const state = identity.advanceEliteAffixCueOwnership(undefined, {
    affixes: ['manaShield', 'commander'],
    dt: 0,
    manaShieldActive: false,
    event: { affixId: 'manaShield', kind: 'shieldBreak' },
  });
  assert.equal(state.owner, 'manaShield');
  assert.equal(state.eventPriority, 3);
});

test('phase 4536 Frenzied threshold entry owns presentation over passive decoration', () => {
  const state = identity.advanceEliteAffixCueOwnership(undefined, {
    affixes: ['regenerating', 'frenzied'],
    dt: 0,
    frenziedPhase: 'entered',
    regeneratingActive: true,
    event: { affixId: 'frenzied', kind: 'thresholdEntry' },
  });
  assert.equal(state.owner, 'frenzied');
  assert.equal(state.eventPriority, 3);
});

test('phase 4537 normal affix responses cannot dislodge a held important event', () => {
  const strike = identity.advanceEliteAffixCueOwnership(undefined, {
    ...baseInput,
    event: { affixId: 'swift', kind: 'strike' },
  });
  const response = identity.advanceEliteAffixCueOwnership(strike, {
    ...baseInput,
    event: { affixId: 'frenzied', kind: 'response' },
  });
  assert.equal(response.owner, 'swift');
  assert.equal(response.eventPriority, 3);
});

test('phase 4538 both identity icons remain rendered while ownership only arbitrates presentation layers', async () => {
  const source = await readFile(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
  assert.match(source, /eliteAffixIdentityRowLayout\(enemy\.eliteAffixes\.length/);
  assert.match(source, /index < enemy\.eliteAffixes\.length && index < 2/);
  assert.doesNotMatch(source, /eliteAffixIdentityIcon\([^\n]*owner/);
});
