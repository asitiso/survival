import test from 'node:test';
import assert from 'node:assert/strict';
import { createHero } from '../dist/game/entities.js';
import { SpellSystem } from '../dist/game/spells.js';
import { applyUpgrade, buildBossRewardChoices, buildUpgradeChoices } from '../dist/game/upgrades.js';
import { relicCandidates } from '../dist/game/relics.js';
import { armorDamageTakenMultiplier } from '../dist/game/defense.js';
import { magicCriticalDamage } from '../dist/game/magic-critical.js';

test('spell power upgrade immediately improves hero magic multiplier', () => {
  const hero = createHero();
  const spells = new SpellSystem();
  applyUpgrade('spellPower', hero, spells);
  assert.ok(hero.spellPower > 1);
});

test('armor upgrade is capped and uses diminishing damage reduction', () => {
  const hero = createHero();
  const spells = new SpellSystem();
  for (let i = 0; i < 8; i++) applyUpgrade('armor', hero, spells);
  assert.equal(hero.armor, 6);
  assert.equal(armorDamageTakenMultiplier(hero.armor), 20 / 26);
});

test('armor appears from level 10 and critical chance appears from level 15', () => {
  const spells = new SpellSystem();
  const levelTenHero = createHero();
  levelTenHero.level = 10;
  assert.ok(buildUpgradeChoices(levelTenHero, spells, () => 0.999).some((choice) => choice.id === 'armor'));

  const levelFifteenHero = createHero();
  levelFifteenHero.level = 15;
  assert.ok(buildUpgradeChoices(levelFifteenHero, spells, () => 0.999).some((choice) => choice.id === 'critChance'));
});

test('critical chance upgrade caps at 20 percent', () => {
  const hero = createHero();
  const spells = new SpellSystem();
  for (let i = 0; i < 8; i++) applyUpgrade('critChance', hero, spells);
  assert.equal(hero.critChance, 0.20);
});

test('late-level offers retain capped defensive and critical choices without a critical damage card', () => {
  const hero = createHero();
  const spells = new SpellSystem();
  hero.level = 30;
  hero.armor = 5;
  for (const id of ['fireBolt', 'chainLightning', 'frostNova', 'flameField']) {
    for (let i = 0; i < 9; i++) spells.levelUp(id);
  }
  const choices = buildUpgradeChoices(hero, spells, () => 0.999);
  assert.deepEqual(choices.map((choice) => choice.id), ['critChance', 'armor', 'pickupRadius']);
  assert.equal(choices.some((choice) => choice.id === 'critDamage'), false);
});

test('magic critical damage only multiplies a successful critical hit', () => {
  const hero = createHero();
  hero.critChance = 0.20;
  assert.equal(magicCriticalDamage(100, hero, () => 0.19), 150);
  assert.equal(magicCriticalDamage(100, hero, () => 0.20), 100);
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

test('late boss growth cards disclose their reduced post-cap gains', async () => {
  const { buildBossRewardChoices } = await import('../dist/game/upgrades.js');
  const spells = new SpellSystem();
  for (let i = 0; i < 20; i++) {
    spells.levelUp('meteorStorm');
    spells.levelUp('blackHole');
  }
  const choices = buildBossRewardChoices(spells, () => 0, 'arkan', null, null, [], 1, 6, 6);
  assert.match(choices.find((choice) => choice.id === 'spellPower')?.description ?? '', /3\.0%/);
  assert.match(choices.find((choice) => choice.id === 'cooldown')?.description ?? '', /1\.5%/);
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
