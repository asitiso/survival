import test from 'node:test';
import assert from 'node:assert/strict';
import { activeSynergies, synergyHudNames, synergyModifiers } from '../dist/game/synergies.js';

function legendary(id, kind) {
  return { id, kind, name: id, rank: 5, power: 0.1, legendary: true };
}
function build({ heroId = 'arkan', traitId = null, relicId = null, weapon = null, armor = null } = {}) {
  return { heroId, traitId, relicId, equipment: { coins: 0, weapon, armor, healingPotions: 0 } };
}

test('universal legendary relic and trait pairs activate six readable synergies', () => {
  const cases = [
    [build({ relicId: 'abyss-eye', weapon: legendary('arcane-staff', 'weapon') }), 'forbidden-arcana'],
    [build({ relicId: 'chrono-shard', weapon: legendary('rapid-wand', 'weapon') }), 'broken-time'],
    [build({ relicId: 'guardian-heart', armor: legendary('guardian-plate', 'armor') }), 'last-bastion'],
    [build({ traitId: 'destruction', weapon: legendary('blast-rod', 'weapon') }), 'starbreaker'],
    [build({ traitId: 'goldSense', weapon: legendary('golden-wand', 'weapon') }), 'golden-fever'],
    [build({ traitId: 'rapidCasting', weapon: legendary('rapid-wand', 'weapon') }), 'overclock'],
  ];
  for (const [input, id] of cases) assert.ok(activeSynergies(input).some((s) => s.id === id), id);
});

test('four hero dominion synergies require hero relic and matching legendary together', () => {
  assert.ok(activeSynergies(build({ heroId: 'arkan', relicId: 'ember-crown', weapon: legendary('arcane-staff', 'weapon') })).some((s) => s.id === 'ember-dominion'));
  assert.ok(activeSynergies(build({ heroId: 'seria', relicId: 'winter-heart', weapon: legendary('blast-rod', 'weapon') })).some((s) => s.id === 'winter-dominion'));
  assert.ok(activeSynergies(build({ heroId: 'kain', relicId: 'storm-core', weapon: legendary('rapid-wand', 'weapon') })).some((s) => s.id === 'storm-dominion'));
  assert.ok(activeSynergies(build({ heroId: 'edric', relicId: 'oath-seal', armor: legendary('guardian-plate', 'armor') })).some((s) => s.id === 'oath-dominion'));

  assert.equal(activeSynergies(build({ heroId: 'seria', relicId: 'ember-crown', weapon: legendary('arcane-staff', 'weapon') })).some((s) => s.id === 'ember-dominion'), false);
  assert.equal(activeSynergies(build({ heroId: 'arkan', relicId: 'ember-crown', weapon: { ...legendary('arcane-staff', 'weapon'), legendary: false } })).some((s) => s.id === 'ember-dominion'), false);
});

test('synergy modifiers compose all active effects instead of picking only one', () => {
  const input = build({ heroId: 'arkan', traitId: 'destruction', relicId: 'abyss-eye', weapon: legendary('arcane-staff', 'weapon') });
  const mods = synergyModifiers(input);
  assert.ok(mods.spellPowerMultiplier > 1.15);
  assert.ok(mods.heroDamageTakenMultiplier > 1);

  const star = synergyModifiers(build({ traitId: 'destruction', weapon: legendary('blast-rod', 'weapon') }));
  assert.equal(star.areaMultiplier, 1.18);
  assert.equal(star.spellPowerMultiplier, 1.08);

  const gold = synergyModifiers(build({ traitId: 'goldSense', weapon: legendary('golden-wand', 'weapon') }));
  assert.equal(gold.goldMultiplier, 1.30);
});

test('hero dominion modifiers strengthen existing hero passive channels', () => {
  const ember = synergyModifiers(build({ heroId: 'arkan', relicId: 'ember-crown', weapon: legendary('arcane-staff', 'weapon') }));
  assert.equal(ember.arkanExplosionChanceBonus, 0.08);
  assert.equal(ember.arkanExplosionRadiusMultiplier, 1.15);

  const storm = synergyModifiers(build({ heroId: 'kain', relicId: 'storm-core', weapon: legendary('rapid-wand', 'weapon') }));
  assert.equal(storm.kainOverloadGainMultiplier, 1.25);
  assert.equal(storm.kainOverloadMaxCooldownReductionBonus, 0.04);

  const oath = synergyModifiers(build({ heroId: 'edric', relicId: 'oath-seal', armor: legendary('guardian-plate', 'armor') }));
  assert.equal(oath.edricAuraRadiusBonus, 45);
  assert.ok(oath.edricAuraMitigationMultiplier < 1);
});

test('HUD helper returns at most two stable synergy names even when more are active', () => {
  const input = build({ heroId: 'arkan', traitId: 'rapidCasting', relicId: 'chrono-shard', weapon: legendary('rapid-wand', 'weapon') });
  const all = activeSynergies(input);
  assert.ok(all.length >= 2);
  assert.equal(synergyHudNames(input, 1).length, 1);
  assert.equal(synergyHudNames(input, 2).length, Math.min(2, all.length));
  assert.ok(synergyHudNames(input, 2).every((name) => name.length > 0));
});
