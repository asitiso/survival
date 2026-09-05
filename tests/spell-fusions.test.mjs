import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FUSION_IDS,
  MAX_FUSIONS_PER_RUN,
  fusionDefinition,
  fusionEligible,
  fusionCandidates,
  fusionHeroName,
  fusionModifiers,
} from '../dist/game/spell-fusions.js';

const normalSpells = ['fireBolt', 'chainLightning', 'frostNova', 'flameField'];
const heroes = ['arkan', 'seria', 'kain', 'edric'];

test('fusion catalog covers exactly the six unordered pairs of four normal spells', () => {
  assert.equal(FUSION_IDS.length, 6);
  const pairs = FUSION_IDS.map((id) => fusionDefinition(id).components.slice().sort().join('+'));
  assert.equal(new Set(pairs).size, 6);
  for (let i = 0; i < normalSpells.length; i += 1) {
    for (let j = i + 1; j < normalSpells.length; j += 1) {
      const key = [normalSpells[i], normalSpells[j]].sort().join('+');
      assert.ok(pairs.includes(key), `missing ${key}`);
    }
  }
  assert.equal(MAX_FUSIONS_PER_RUN, 2);
});

test('fusion eligibility requires both component normal spells at level ten', () => {
  const levels = { fireBolt: 10, chainLightning: 10, frostNova: 9, flameField: 10, meteorStorm: 2, blackHole: 2 };
  assert.equal(fusionEligible('solar-detonation', levels), true);
  assert.equal(fusionEligible('frostfire-cataclysm', levels), false);
  assert.equal(fusionCandidates(levels, []).includes('frostfire-cataclysm'), false);
  levels.frostNova = 10;
  assert.equal(fusionCandidates(levels, []).length, 6);
});

test('fusion hero names remain distinct and modifiers are bounded', () => {
  for (const id of FUSION_IDS) {
    const names = heroes.map((hero) => fusionHeroName(id, hero));
    assert.equal(new Set(names).size, 4, `${id} should read differently per hero`);
    for (const hero of heroes) {
      const mod = fusionModifiers(id, hero);
      assert.ok(mod.damageMultiplier >= 1 && mod.damageMultiplier <= 1.24);
      assert.ok(mod.areaMultiplier >= 1 && mod.areaMultiplier <= 1.22);
      assert.ok(mod.cooldownMultiplier >= 0.86 && mod.cooldownMultiplier <= 1);
      assert.ok(mod.jumpBonus >= 0 && mod.jumpBonus <= 3);
      assert.ok(mod.pierceBonus >= 0 && mod.pierceBonus <= 2);
    }
  }
});
