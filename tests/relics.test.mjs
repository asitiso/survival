import test from 'node:test';
import assert from 'node:assert/strict';
import { relicCandidates, relicDefinition, relicDisplayName, relicModifiers } from '../dist/game/relics.js';

test('relic pool exposes three universal relics plus only the selected hero relic', () => {
  const arkan = relicCandidates('arkan', null, () => 0);
  const seria = relicCandidates('seria', null, () => 0);
  assert.equal(arkan.length, 4);
  assert.equal(seria.length, 4);
  assert.ok(arkan.includes('ember-crown'));
  assert.ok(!arkan.includes('winter-heart'));
  assert.ok(seria.includes('winter-heart'));
  assert.ok(!seria.includes('ember-crown'));
  for (const id of ['abyss-eye', 'chrono-shard', 'guardian-heart']) {
    assert.ok(arkan.includes(id));
    assert.ok(seria.includes(id));
  }
});

test('current relic is excluded when replacement alternatives exist', () => {
  const candidates = relicCandidates('kain', 'abyss-eye', () => 0.3);
  assert.equal(candidates.includes('abyss-eye'), false);
  assert.ok(candidates.length >= 3);
});

test('universal relics expose obvious upside and downside tradeoffs', () => {
  const abyss = relicModifiers('abyss-eye', 'arkan');
  const chrono = relicModifiers('chrono-shard', 'arkan');
  const guardian = relicModifiers('guardian-heart', 'arkan');
  assert.ok(abyss.spellPowerMultiplier > 1.2);
  assert.ok(abyss.heroDamageTakenMultiplier > 1);
  assert.ok(chrono.cooldownMultiplier < 0.9);
  assert.ok(chrono.moveSpeedMultiplier < 1);
  assert.ok(guardian.coreDamageTakenMultiplier < 0.7);
  assert.ok(guardian.goldMultiplier < 1);
});

test('hero relic modifiers only activate for their matching hero', () => {
  const matching = relicModifiers('ember-crown', 'arkan');
  const mismatch = relicModifiers('ember-crown', 'seria');
  assert.ok(matching.arkanExplosionChanceBonus > 0);
  assert.ok(matching.arkanExplosionRadiusMultiplier > 1);
  assert.equal(mismatch.arkanExplosionChanceBonus, 0);
  assert.equal(mismatch.arkanExplosionRadiusMultiplier, 1);
});

test('relic definitions have stable readable identity', () => {
  assert.equal(relicDefinition('storm-core').heroId, 'kain');
  assert.match(relicDefinition('storm-core').name, /폭풍/);
  assert.match(relicDefinition('oath-seal').description, /수호/);
});


test('relic display name is concise for HUD and results including an empty slot', () => {
  assert.equal(relicDisplayName(null), '없음');
  assert.equal(relicDisplayName('guardian-heart'), '수호자의 심장');
});

test('boss archetype relic pool adds only the matching boss relic', () => {
  const inferno = relicCandidates('arkan', null, () => 0.5, 'inferno');
  const summoner = relicCandidates('arkan', null, () => 0.5, 'summoner');
  const juggernaut = relicCandidates('arkan', null, () => 0.5, 'juggernaut');
  assert.ok(inferno.includes('inferno-heart'));
  assert.ok(!inferno.includes('summoner-sigil'));
  assert.ok(!inferno.includes('juggernaut-core'));
  assert.ok(summoner.includes('summoner-sigil'));
  assert.ok(juggernaut.includes('juggernaut-core'));
});

test('boss relics expose strong readable tradeoffs through existing modifier channels', () => {
  const inferno = relicModifiers('inferno-heart', 'arkan');
  assert.equal(inferno.spellPowerMultiplier, 1.16);
  assert.equal(inferno.areaMultiplier, 1.12);
  assert.equal(inferno.heroDamageTakenMultiplier, 1.06);

  const summoner = relicModifiers('summoner-sigil', 'arkan');
  assert.equal(summoner.cooldownMultiplier, 0.90);
  assert.equal(summoner.pickupMultiplier, 1.20);
  assert.equal(summoner.coreDamageTakenMultiplier, 1.08);

  const juggernaut = relicModifiers('juggernaut-core', 'arkan');
  assert.equal(juggernaut.moveSpeedMultiplier, 1.12);
  assert.equal(juggernaut.heroDamageTakenMultiplier, 0.88);
  assert.equal(juggernaut.cooldownMultiplier, 1.06);
});
