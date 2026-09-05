import test from 'node:test';
import assert from 'node:assert/strict';
import { BossEncounterSystem } from '../dist/game/boss-encounters.js';

const boss = { x: 800, y: 430 };

test('boss encounters create a small archetype-specific destructible node set', () => {
  const system = new BossEncounterSystem();
  system.begin(41, 'inferno', boss, 0);
  assert.equal(system.nodes.length, 2);
  assert.ok(system.modifiers.bossDamageTakenMultiplier < 1);
  system.begin(42, 'summoner', boss, 1);
  assert.equal(system.nodes.length, 2);
  assert.ok(system.modifiers.summonCountMultiplier > 1);
  system.begin(43, 'juggernaut', boss, 2);
  assert.equal(system.nodes.length, 3);
  assert.ok(system.modifiers.dashDistanceMultiplier > 1);
  assert.ok(system.nodes.length <= 4);
});

test('magic hits can destroy encounter nodes and change boss modifiers', () => {
  const system = new BossEncounterSystem();
  system.begin(7, 'inferno', boss, 0);
  const node = system.nodes[0];
  assert.ok(node);
  for (let i = 0; i < 6; i++) system.hitMagic(node.pos, 60);
  assert.equal(system.nodes[0].alive, false);
  const second = system.nodes[1];
  for (let i = 0; i < 6; i++) system.hitMagic(second.pos, 60);
  assert.equal(system.nodes.every((n) => !n.alive), true);
  assert.ok(system.modifiers.bossDamageTakenMultiplier > 1);
  assert.equal(system.destroyedNodes, 2);
});

test('inferno vulnerability is temporary and reset clears encounter state', () => {
  const system = new BossEncounterSystem();
  system.begin(9, 'inferno', boss, 0);
  for (const node of [...system.nodes]) for (let i = 0; i < 8; i++) system.hitMagic(node.pos, 70);
  assert.ok(system.modifiers.bossDamageTakenMultiplier > 1);
  system.update(6.1);
  assert.equal(system.modifiers.bossDamageTakenMultiplier, 1);
  system.reset();
  assert.equal(system.activeBossId, null);
  assert.equal(system.nodes.length, 0);
});

test('starting a new boss encounter resets per-boss destroyed node count', () => {
  const system = new BossEncounterSystem();
  system.begin(1, 'inferno', boss, 0);
  const node=system.nodes[0];
  for(let i=0;i<8;i++) system.hitMagic(node.pos,70);
  assert.ok(system.destroyedNodes>0);
  system.begin(2, 'summoner', boss, 0);
  assert.equal(system.destroyedNodes,0);
});
