import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const identity = await import('../dist/game/elite-affix-identity-assets.js');
const affixes = await import('../dist/game/elite-affixes.js');

test('phase 4533 actual strike outranks passive multi-affix decoration', () => {
  const owner = identity.eliteAffixPrimaryPresentationOwner([
    { id: 'manaShield', reason: 'passive' },
    { id: 'swift', reason: 'actual-strike' },
  ]);
  assert.deepEqual(owner, { id: 'swift', reason: 'actual-strike', priority: 4 });
});

test('phase 4534 shield break owns presentation above simultaneous lower-priority affix events', () => {
  const owner = identity.eliteAffixPrimaryPresentationOwner([
    { id: 'frenzied', reason: 'threshold-enter' },
    { id: 'manaShield', reason: 'shield-break' },
    { id: 'swift', reason: 'actual-strike' },
  ]);
  assert.deepEqual(owner, { id: 'manaShield', reason: 'shield-break', priority: 5 });
});

test('phase 4535 threshold entry outranks response and passive cues', () => {
  const owner = identity.eliteAffixPrimaryPresentationOwner([
    { id: 'armored', reason: 'response' },
    { id: 'frenzied', reason: 'threshold-enter' },
    { id: 'regenerating', reason: 'passive' },
  ]);
  assert.deepEqual(owner, { id: 'frenzied', reason: 'threshold-enter', priority: 3 });
});

test('phase 4536 equal-priority candidates keep stable input ownership', () => {
  const owner = identity.eliteAffixPrimaryPresentationOwner([
    { id: 'armored', reason: 'response' },
    { id: 'commander', reason: 'response' },
  ]);
  assert.deepEqual(owner, { id: 'armored', reason: 'response', priority: 2 });
});

test('phase 4537 both base affix icons remain visible independent of primary presentation owner', async () => {
  const source = await readFile(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
  assert.match(source, /for \(let index = 0; index < enemy\.eliteAffixes\.length && index < 2; index \+= 1\)/);
  assert.doesNotMatch(source, /primaryPresentationOwner[^\n]{0,180}eliteAffixIdentityIcon/);
});

test('phase 4538 multi-affix arbitration does not change elite combat modifiers or affix count', () => {
  const tuning = affixes.eliteAffixModifiers(['swift', 'manaShield']);
  assert.equal(tuning.speedMultiplier, 1.28);
  assert.equal(tuning.attackIntervalMultiplier, 0.78);
  assert.equal(tuning.shieldRatio, 0.36);
  assert.equal(affixes.eliteAffixCount(7), 2);
});
