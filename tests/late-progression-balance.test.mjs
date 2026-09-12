import test from 'node:test';
import assert from 'node:assert/strict';
import { createHero } from '../dist/game/entities.js';
import { SpellSystem, spellTuning } from '../dist/game/spells.js';
import { applyUpgrade } from '../dist/game/upgrades.js';

const closeTo = (actual, expected, epsilon = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= epsilon, `expected ${actual} to equal ${expected}`);
};

test('generic offense upgrades use the flattened late-run multipliers', () => {
  const hero = createHero();
  const spells = new SpellSystem();
  const initialPower = hero.spellPower;

  applyUpgrade('spellPower', hero, spells);
  applyUpgrade('cooldown', hero, spells);

  closeTo(hero.spellPower, initialPower * 1.096);
  closeTo(hero.cooldownMultiplier, 0.958);
});

test('fire bolt preserves rank five and flattens ranks six through ten', () => {
  assert.deepEqual(spellTuning('fireBolt', 5), { damage: 66, cooldown: 0.404, radius: 13, projectiles: 2, jumps: 0, duration: 0 });
  assert.deepEqual(spellTuning('fireBolt', 6), { damage: 70.4, cooldown: 0.392, radius: 13, projectiles: 2, jumps: 0, duration: 0 });
  const rankTen = spellTuning('fireBolt', 10);
  assert.equal(rankTen.damage, 88);
  closeTo(rankTen.cooldown, 0.344);
  assert.deepEqual({ ...rankTen, cooldown: 0.344 }, { damage: 88, cooldown: 0.344, radius: 17, projectiles: 3, jumps: 0, duration: 0 });
});

test('chain lightning preserves rank five and flattens ranks six through ten', () => {
  assert.deepEqual(spellTuning('chainLightning', 5), { damage: 88, cooldown: 1.97, radius: 0, projectiles: 1, jumps: 4, duration: 0 });
  assert.deepEqual(spellTuning('chainLightning', 6), { damage: 93.5, cooldown: 1.935, radius: 0, projectiles: 1, jumps: 4, duration: 0 });
  assert.deepEqual(spellTuning('chainLightning', 10), { damage: 115.5, cooldown: 1.795, radius: 0, projectiles: 1, jumps: 6, duration: 0 });
});
