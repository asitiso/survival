import test from 'node:test';
import assert from 'node:assert/strict';
import { createHero } from '../dist/game/entities.js';
import { SpellSystem } from '../dist/game/spells.js';
import { applyUpgrade, buildBossRewardChoices, buildUpgradeChoices } from '../dist/game/upgrades.js';
import { relicCandidates } from '../dist/game/relics.js';

test('spell power upgrade immediately improves hero magic multiplier', () => {
  const hero = createHero();
  const spells = new SpellSystem();
  applyUpgrade('spellPower', hero, spells);
  assert.ok(hero.spellPower > 1);
});

test('spell upgrade increases the chosen spell level', () => {
  const hero = createHero();
  const spells = new SpellSystem();
  applyUpgrade('fireBolt', hero, spells);
  assert.equal(spells.levels.fireBolt, 2);
});

test('level up choices are unique and do not offer maxed spells', () => {
  const hero = createHero();
  const spells = new SpellSystem();
  for (let i = 0; i < 20; i++) spells.levelUp('fireBolt');
  const choices = buildUpgradeChoices(hero, spells, () => 0.21);
  assert.equal(new Set(choices.map((c) => c.id)).size, choices.length);
  assert.equal(choices.some((c) => c.id === 'fireBolt'), false);
  assert.equal(choices.length, 3);
});

test('boss rewards prioritize ultimate growth and still provide three choices', async () => {
  const { buildBossRewardChoices } = await import('../dist/game/upgrades.js');
  const spells = new SpellSystem();
  const choices = buildBossRewardChoices(spells, () => 0.2);
  assert.equal(choices.length, 3);
  assert.equal(choices.filter((choice) => choice.kind === 'relic').length, 1);
  assert.equal(choices.filter((choice) => choice.kind === 'upgrade').length, 2);
  assert.ok(choices.some((choice) => choice.id === 'meteorStorm'));
  assert.ok(choices.some((choice) => choice.id === 'blackHole'));
});

test('maxed ultimates disappear from later boss rewards', async () => {
  const { buildBossRewardChoices } = await import('../dist/game/upgrades.js');
  const spells = new SpellSystem();
  for (let i = 0; i < 20; i++) {
    spells.levelUp('meteorStorm');
    spells.levelUp('blackHole');
  }
  const choices = buildBossRewardChoices(spells, () => 0.4);
  assert.equal(choices.some((choice) => choice.id === 'meteorStorm' || choice.id === 'blackHole'), false);
  assert.equal(choices.filter((choice) => choice.kind === 'relic').length, 1);
  assert.equal(choices.filter((choice) => choice.kind === 'upgrade').length, 2);
  assert.equal(choices.length, 3);
});

test('level up cards use the selected hero signature spell names', () => {
  const hero = createHero('seria');
  const spells = new SpellSystem();
  const choices = buildUpgradeChoices(hero, spells, () => 0);
  assert.match(choices[0].title, /빙창/);
  assert.match(choices[1].title, /서리연쇄/);
});

test('boss reward copy names the selected hero ultimate instead of a generic meteor or black hole', async () => {
  const { buildBossRewardChoices } = await import('../dist/game/upgrades.js');
  const spells = new SpellSystem();
  const choices = buildBossRewardChoices(spells, () => 0, 'edric');
  assert.match(choices[0].title, /천상심판/);
  assert.match(choices[1].title, /시간감옥/);
});


test('boss relic reward explains replacement and never offers the already equipped relic', async () => {
  const { buildBossRewardChoices } = await import('../dist/game/upgrades.js');
  const spells = new SpellSystem();
  const choices = buildBossRewardChoices(spells, () => 0, 'arkan', 'abyss-eye');
  const relic = choices.find((choice) => choice.kind === 'relic');
  assert.ok(relic);
  assert.notEqual(relic.relicId, 'abyss-eye');
  assert.match(relic.title, /유물/);
  assert.match(relic.description, /교체/);
});

test('boss reward generation can receive defeated boss archetype and offer its relic pool', () => {
  const spells = new SpellSystem();
  const choices = buildBossRewardChoices(spells, () => 0, 'arkan', null, 'inferno');
  const relic = choices.find((choice) => choice.kind === 'relic');
  assert.ok(relic);
  const valid = new Set(relicCandidates('arkan', null, () => 0, 'inferno'));
  assert.ok(valid.has(relic.relicId));
});
