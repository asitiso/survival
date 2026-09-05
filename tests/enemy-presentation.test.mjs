import test from 'node:test';
import assert from 'node:assert/strict';
import { enemyStatusCue, enemyDeathCue, enemyThreatTelegraph, sortTelegraphsByPriority } from '../dist/game/enemy-presentation.js';

test('enemy status cues visually distinguish burn freeze and shock', () => {
  const burn = enemyStatusCue('burn');
  const freeze = enemyStatusCue('freeze');
  const shock = enemyStatusCue('shock');
  assert.notEqual(burn.color, freeze.color);
  assert.notEqual(freeze.style, shock.style);
  assert.equal(freeze.style, 'ring');
});

test('enemy death weight escalates normal elite and boss without unbounded particles', () => {
  const normal = enemyDeathCue('grunt');
  const elite = enemyDeathCue('elite');
  const boss = enemyDeathCue('boss');
  assert.ok(elite.radius > normal.radius);
  assert.ok(boss.radius > elite.radius);
  assert.ok(boss.particles <= 24);
});

test('bomber telegraph exposes imminent explosion radius and boss telegraphs outrank support rings', () => {
  const bomber = enemyThreatTelegraph({ id: 2, type: 'bomber', radius: 17, specialTimer: 0.45 });
  const boss = enemyThreatTelegraph({ id: 3, type: 'boss', radius: 58, specialTimer: 0.8 });
  const shaman = enemyThreatTelegraph({ id: 4, type: 'shaman', radius: 21, specialTimer: 0.4 });
  assert.ok(bomber && bomber.radius >= 80);
  assert.ok(boss && shaman);
  assert.ok(boss.priority > shaman.priority);
  const sorted = sortTelegraphsByPriority([shaman, bomber, boss]);
  assert.equal(sorted[0].enemyId, 3);
});
