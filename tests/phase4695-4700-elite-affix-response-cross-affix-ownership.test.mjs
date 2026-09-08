import test from 'node:test';
import assert from 'node:assert/strict';

const arbitration = await import('../dist/game/elite-affix-response-arbitration.js').catch(() => null);

function api() {
  assert.ok(arbitration, 'elite-affix-response-arbitration module must exist');
  return arbitration;
}

function cue(affixId, importantEvent, ttl, livePrimary = false, maxTtl = 0.42) {
  return { affixId, importantEvent, ttl, maxTtl, livePrimary };
}

test('phase 4695 important response outranks a fresher routine response', () => {
  const result = api().eliteAffixResponseCrossAffixOwnership([
    cue('swift', false, 0.42, true),
    cue('manaShield', true, 0.18, false),
  ]);
  assert.equal(result.primaryIndex, 1);
  assert.equal(result.primaryImportant, true);
});

test('phase 4696 routine live owner outranks another routine response on the same enemy', () => {
  const result = api().eliteAffixResponseCrossAffixOwnership([
    cue('swift', false, 0.35, false),
    cue('manaShield', false, 0.25, true),
  ]);
  assert.equal(result.primaryIndex, 1);
});

test('phase 4697 equal-priority responses prefer the response with the fuller remaining lifetime', () => {
  const result = api().eliteAffixResponseCrossAffixOwnership([
    cue('swift', true, 0.12),
    cue('manaShield', true, 0.31),
  ]);
  assert.equal(result.primaryIndex, 1);
});

test('phase 4698 exact priority and lifetime ties resolve to the newer response deterministically', () => {
  const result = api().eliteAffixResponseCrossAffixOwnership([
    cue('swift', true, 0.30),
    cue('manaShield', true, 0.30),
  ]);
  assert.equal(result.primaryIndex, 1);
});

test('phase 4699 invalid or expired response candidates cannot become the cross-affix owner', () => {
  const result = api().eliteAffixResponseCrossAffixOwnership([
    cue('swift', true, Number.NaN),
    cue('manaShield', false, 0),
    cue('frenzied', false, 0.20, true),
  ]);
  assert.equal(result.primaryIndex, 2);
});

test('phase 4700 no active response produces no cross-affix owner', () => {
  const result = api().eliteAffixResponseCrossAffixOwnership([
    cue('swift', false, 0),
    cue('manaShield', true, -1),
  ]);
  assert.equal(result.primaryIndex, -1);
  assert.equal(result.primaryAffixId, null);
});
