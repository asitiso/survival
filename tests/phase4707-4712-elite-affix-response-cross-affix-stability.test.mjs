import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const arbitration = await import('../dist/game/elite-affix-response-arbitration.js').catch(() => null);

function api() {
  assert.ok(arbitration, 'elite-affix-response-arbitration module must exist');
  return arbitration;
}

function cue(affixId, importantEvent, ttl, livePrimary = false, maxTtl = 0.42) {
  return { affixId, importantEvent, ttl, maxTtl, livePrimary };
}

test('phase 4707 active routine owner holds against a new routine challenger during the short presentation hold', () => {
  const result = api().eliteAffixResponseCrossAffixOwnership([
    cue('swift', false, 0.35, false),
    cue('manaShield', false, 0.42, true),
  ], 'swift', true);
  assert.equal(result.primaryAffixId, 'swift');
});

test('phase 4708 important challenger bypasses a held routine owner immediately', () => {
  const result = api().eliteAffixResponseCrossAffixOwnership([
    cue('swift', false, 0.35, true),
    cue('manaShield', true, 0.20, false),
  ], 'swift', true);
  assert.equal(result.primaryAffixId, 'manaShield');
});

test('phase 4709 held important owner does not flip to another important response every frame', () => {
  const result = api().eliteAffixResponseCrossAffixOwnership([
    cue('swift', true, 0.34),
    cue('manaShield', true, 0.40),
  ], 'swift', true);
  assert.equal(result.primaryAffixId, 'swift');
});

test('phase 4710 expired previous owner falls through to the current preferred active response', () => {
  const result = api().eliteAffixResponseCrossAffixOwnership([
    cue('swift', false, 0),
    cue('manaShield', false, 0.25, true),
  ], 'swift', true);
  assert.equal(result.primaryAffixId, 'manaShield');
});

test('phase 4711 unknown previous ownership and invalid candidates still resolve deterministically', () => {
  const first = api().eliteAffixResponseCrossAffixOwnership([
    cue('swift', false, Number.NaN),
    cue('manaShield', false, 0.21),
    cue('frenzied', false, 0.21),
  ], 'armored', true);
  const second = api().eliteAffixResponseCrossAffixOwnership([
    cue('swift', false, Number.NaN),
    cue('manaShield', false, 0.21),
    cue('frenzied', false, 0.21),
  ], 'armored', true);
  assert.deepEqual(first, second);
  assert.equal(first.primaryIndex, 2);
});

test('phase 4712 response runtime applies cross-affix ownership and final alpha before frozen response drawing', async () => {
  const runtimeSource = await readFile(new URL('../src/game/elite-affix-response-lane-runtime.ts', import.meta.url), 'utf8');
  assert.match(runtimeSource, /eliteAffixResponseCrossAffixOwnership/);
  assert.match(runtimeSource, /eliteAffixResponseCrossAffixPresentation/);
  assert.match(runtimeSource, /crossAffixOwner/);
  assert.match(runtimeSource, /crossPresentation\.alphaScale/);
});
