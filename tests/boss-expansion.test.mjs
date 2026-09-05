import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bossArchetypeForOrdinal,
  bossArchetypeTuning,
  bossArchetypeSpecial,
  bossPhaseForRatio,
} from '../dist/game/boss-patterns.js';
import { bossPatternTelegraph } from '../dist/game/boss-presentation.js';

test('boss rotation expands deterministically from three to six archetypes', () => {
  const expected = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
  assert.deepEqual(expected.map((_, i) => bossArchetypeForOrdinal(i)), expected);
  assert.equal(bossArchetypeForOrdinal(6), 'inferno');
});

test('new boss archetypes expose distinct special channels', () => {
  const witch = bossArchetypeSpecial('abyssWitch', 2);
  const twin = bossArchetypeSpecial('twinMaw', 2);
  const time = bossArchetypeSpecial('timeEater', 2);
  assert.ok(witch.curseZones >= 2);
  assert.ok(twin.secondaryFanAngle > 0.7);
  assert.ok(time.cooldownPressureMultiplier > 1.1);
  assert.equal(witch.secondaryFanAngle, 0);
  assert.equal(twin.curseZones, 0);
});

test('new boss tuning escalates by phase without breaking existing tuning shape', () => {
  for (const archetype of ['abyssWitch', 'twinMaw', 'timeEater']) {
    const p1 = bossArchetypeTuning(archetype, 1);
    const p3 = bossArchetypeTuning(archetype, 3);
    assert.ok(p3.specialInterval < p1.specialInterval);
    assert.ok(p3.fanProjectiles >= p1.fanProjectiles);
    assert.ok(p3.speedMultiplier >= p1.speedMultiplier);
  }
  assert.equal(bossPhaseForRatio(0.2), 3);
});

test('new bosses have readable distinct telegraph styles', () => {
  assert.equal(bossPatternTelegraph('abyssWitch', 2).style, 'curse');
  assert.equal(bossPatternTelegraph('twinMaw', 2).style, 'cross');
  assert.equal(bossPatternTelegraph('timeEater', 2).style, 'time');
});
