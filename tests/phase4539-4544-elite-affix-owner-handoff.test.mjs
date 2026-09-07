import test from 'node:test';
import assert from 'node:assert/strict';

const identity = await import('../dist/game/elite-affix-identity-assets.js');

const response = (id) => ({ id, reason: 'response' });

test('phase 4539 new multi-affix owner starts with a bounded presentation hold', () => {
  const state = identity.advanceEliteAffixPresentationOwner(undefined, [
    { id: 'frenzied', reason: 'threshold-enter' },
    response('armored'),
  ], 0);
  assert.equal(state.ownerId, 'frenzied');
  assert.equal(state.priority, 3);
  assert.equal(state.holdTtl, 0.14);
});

test('phase 4540 equal or lower-priority candidates cannot steal ownership during hold', () => {
  const previous = { ownerId: 'swift', priority: 4, holdTtl: 0.12 };
  const state = identity.advanceEliteAffixPresentationOwner(previous, [
    { id: 'frenzied', reason: 'threshold-enter' },
    { id: 'manaShield', reason: 'actual-strike' },
  ], 0.04);
  assert.equal(state.ownerId, 'swift');
  assert.equal(state.priority, 4);
  assert.ok(state.holdTtl > 0 && state.holdTtl < previous.holdTtl);
});

test('phase 4541 strictly higher-priority event can preempt an active owner hold', () => {
  const previous = { ownerId: 'swift', priority: 4, holdTtl: 0.10 };
  const state = identity.advanceEliteAffixPresentationOwner(previous, [
    { id: 'manaShield', reason: 'shield-break' },
  ], 0.02);
  assert.equal(state.ownerId, 'manaShield');
  assert.equal(state.priority, 5);
  assert.equal(state.holdTtl, 0.14);
});

test('phase 4542 expired hold hands ownership to the current best cue instead of stale owner', () => {
  const previous = { ownerId: 'swift', priority: 4, holdTtl: 0.02 };
  const state = identity.advanceEliteAffixPresentationOwner(previous, [
    { id: 'frenzied', reason: 'threshold-enter' },
  ], 0.03);
  assert.equal(state.ownerId, 'frenzied');
  assert.equal(state.priority, 3);
  assert.equal(state.holdTtl, 0.14);
});

test('phase 4543 secondary affix extras remain visible but quieter than primary ownership', () => {
  const primary = identity.eliteAffixOwnershipRolePresentation('primary', false, false);
  const secondary = identity.eliteAffixOwnershipRolePresentation('secondary', false, false);
  assert.equal(primary.visible, true);
  assert.equal(secondary.visible, true);
  assert.ok(secondary.alphaScale > 0);
  assert.ok(secondary.alphaScale < primary.alphaScale);
  assert.ok(secondary.motionScale < primary.motionScale);
});

test('phase 4544 ownership role presentation respects Reduced Motion and Reduced Flash without hiding identity', () => {
  const base = identity.eliteAffixOwnershipRolePresentation('secondary', false, false);
  const motion = identity.eliteAffixOwnershipRolePresentation('secondary', true, false);
  const flash = identity.eliteAffixOwnershipRolePresentation('secondary', false, true);
  assert.equal(motion.visible, true);
  assert.equal(motion.motionScale, 0);
  assert.equal(flash.visible, true);
  assert.ok(flash.alphaScale < base.alphaScale);
});
