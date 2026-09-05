import test from 'node:test';
import assert from 'node:assert/strict';

import { deriveHeroFinalForm, finalFormModifiers } from '../dist/game/endless/final-form.js';
import { createDefaultOverdriveState, resolveBuildArchetype, advanceBuildOverdrive, overdriveModifiers } from '../dist/game/endless/build-overdrive.js';

const MIN = 60_000;

const ascensionMods = {
  spellPowerMultiplier: 1.2,
  cooldownMultiplier: .88,
  areaMultiplier: 1.08,
  moveSpeedMultiplier: 1.04,
  heroDamageTakenMultiplier: .95,
  coreDamageTakenMultiplier: .94,
  fusionPowerMultiplier: 1.16,
  bossDamageMultiplier: 1.18,
};

test('phase 43 final form is locked before eighty minutes and deterministic from prior ascension choices', () => {
  assert.equal(deriveHeroFinalForm('arkan', ['wildfire-doctrine','solar-collapse','ash-step'], 79.9 * MIN), null);
  const first = deriveHeroFinalForm('arkan', ['wildfire-doctrine','solar-collapse','ash-step'], 80 * MIN);
  const again = deriveHeroFinalForm('arkan', ['wildfire-doctrine','solar-collapse','ash-step'], 180 * MIN);
  assert.equal(first?.id, 'solar-sovereign');
  assert.deepEqual(first, again);
  assert.match(first?.name ?? '', /태양/);
});

test('phase 44 every hero exposes one of three bounded final-form modifier packages', () => {
  const cases = [
    ['arkan', ['ash-step','phoenix-cycle','cinder-heart']],
    ['seria', ['frozen-time','winter-covenant','glacier-step']],
    ['kain', ['thunder-step','tempest-loop','storm-circuit']],
    ['edric', ['holy-bastion','vow-of-light','radiant-wall']],
  ];
  for (const [heroId, selected] of cases) {
    const form = deriveHeroFinalForm(heroId, selected, 90 * MIN);
    assert.ok(form);
    const mods = finalFormModifiers(form);
    assert.ok(mods.spellPowerMultiplier >= 1 && mods.spellPowerMultiplier <= 1.22);
    assert.ok(mods.cooldownMultiplier >= .84 && mods.cooldownMultiplier <= 1);
    assert.ok(mods.areaMultiplier >= 1 && mods.areaMultiplier <= 1.2);
    assert.ok(mods.heroDamageTakenMultiplier >= .82 && mods.heroDamageTakenMultiplier <= 1);
    assert.ok(mods.coreDamageTakenMultiplier >= .8 && mods.coreDamageTakenMultiplier <= 1);
    assert.ok(mods.bossDamageMultiplier >= 1 && mods.bossDamageMultiplier <= 1.2);
  }
});

test('phase 46 build archetype resolves to one of four existing-build identities without new inventory state', () => {
  assert.equal(resolveBuildArchetype({ ...ascensionMods, spellPowerMultiplier:1.36, bossDamageMultiplier:1.3 }), 'burst');
  assert.equal(resolveBuildArchetype({ ...ascensionMods, cooldownMultiplier:.72, spellPowerMultiplier:1.05, bossDamageMultiplier:1.02, areaMultiplier:1.02 }), 'cycle');
  assert.equal(resolveBuildArchetype({ ...ascensionMods, areaMultiplier:1.35, spellPowerMultiplier:1.05, bossDamageMultiplier:1.01, cooldownMultiplier:.98 }), 'domain');
  assert.equal(resolveBuildArchetype({ ...ascensionMods, heroDamageTakenMultiplier:.78, coreDamageTakenMultiplier:.72, spellPowerMultiplier:1.02, bossDamageMultiplier:1.01, cooldownMultiplier:.98, areaMultiplier:1.01 }), 'fortress');
});

test('phase 47 overdrive charges from combat events and automatically activates for twelve seconds', () => {
  let state = createDefaultOverdriveState();
  const events = [
    ...Array.from({length:20}, () => ({type:'spell_cast', spellId:'fireBolt'})),
    ...Array.from({length:8}, () => ({type:'spell_cast', spellId:'chainLightning', fusion:true})),
    {type:'boss_defeated', bossId:'inferno', durationMs:30000, coreDamage:0},
  ];
  state = advanceBuildOverdrive(state, events, 100_000);
  assert.equal(state.charge, 0);
  assert.equal(state.activations, 1);
  assert.equal(state.activeUntilMs, 112_000);
  const active = overdriveModifiers(state, 'burst', 105_000);
  assert.ok(active.spellPowerMultiplier > 1);
  assert.ok(active.bossDamageMultiplier > 1);
  assert.equal(overdriveModifiers(state, 'burst', 112_001).active, false);
});

test('overdrive state and modifiers remain bounded under event spam', () => {
  let state = createDefaultOverdriveState();
  const spam = Array.from({length:1000}, () => ({type:'spell_cast', spellId:'fireBolt', fusion:true}));
  state = advanceBuildOverdrive(state, spam, 1_000);
  assert.ok(state.charge >= 0 && state.charge <= 100);
  assert.equal(state.activations, 1);
  const mods = overdriveModifiers(state, 'domain', 2_000);
  assert.ok(mods.areaMultiplier <= 1.25);
  assert.ok(mods.cooldownMultiplier >= .78);
});
