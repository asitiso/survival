import test from 'node:test';
import assert from 'node:assert/strict';
import { spellEvolution, spellEvolutionTier } from '../dist/game/spell-evolutions.js';
import { buildUpgradeChoices } from '../dist/game/upgrades.js';

const heroes = ['arkan', 'seria', 'kain', 'edric'];
const spells = ['fireBolt', 'chainLightning', 'frostNova', 'flameField', 'meteorStorm', 'blackHole'];

test('spell evolution tiers change exactly at levels five and ten', () => {
  assert.equal(spellEvolutionTier(1), 0);
  assert.equal(spellEvolutionTier(4), 0);
  assert.equal(spellEvolutionTier(5), 1);
  assert.equal(spellEvolutionTier(9), 1);
  assert.equal(spellEvolutionTier(10), 2);
  assert.equal(spellEvolutionTier(99), 2);
});

test('spell evolution gives every hero a distinct final-form name for the same slot', () => {
  for (const spell of spells) {
    const names = heroes.map((hero) => spellEvolution(hero, spell, 10).name);
    assert.equal(new Set(names).size, heroes.length, `${spell} final names should be hero-specific`);
  }
});

test('spell evolution materially changes spell shape at final tier', () => {
  const baseBolt = spellEvolution('arkan', 'fireBolt', 4);
  const finalBolt = spellEvolution('arkan', 'fireBolt', 10);
  assert.ok(finalBolt.damageMultiplier > baseBolt.damageMultiplier);
  assert.ok(finalBolt.projectileBonus >= baseBolt.projectileBonus + 2);
  assert.ok(finalBolt.splashRadiusBonus >= 24);

  const baseChain = spellEvolution('kain', 'chainLightning', 4);
  const finalChain = spellEvolution('kain', 'chainLightning', 10);
  assert.ok(finalChain.jumpBonus >= baseChain.jumpBonus + 3);
  assert.ok(finalChain.cooldownMultiplier < baseChain.cooldownMultiplier);

  const baseField = spellEvolution('seria', 'flameField', 4);
  const finalField = spellEvolution('seria', 'flameField', 10);
  assert.ok(finalField.areaMultiplier >= baseField.areaMultiplier * 1.15);
  assert.ok(finalField.tickMultiplier >= baseField.tickMultiplier * 1.25);

  const baseNova = spellEvolution('edric', 'frostNova', 4);
  const finalNova = spellEvolution('edric', 'frostNova', 10);
  assert.ok(finalNova.knockbackMultiplier >= baseNova.knockbackMultiplier * 1.35);
});

test('level-up choice copy announces the level five and level ten evolution milestones', () => {
  const hero = { profileId: 'arkan', maxHp: 100, hp: 100, speed: 200, spellPower: 1, cooldownMultiplier: 1, pickupRadius: 100 };
  const levels = { fireBolt: 4, chainLightning: 10, frostNova: 10, flameField: 10, meteorStorm: 1, blackHole: 1 };
  const spellsState = { levels, levelUp(id) { this.levels[id] += 1; } };
  const first = buildUpgradeChoices(hero, spellsState, () => 0)[0];
  assert.equal(first.id, 'fireBolt');
  assert.match(first.description, /1차 진화/);

  levels.fireBolt = 9;
  const final = buildUpgradeChoices(hero, spellsState, () => 0)[0];
  assert.equal(final.id, 'fireBolt');
  assert.match(final.description, /최종 진화/);
});
