import test from 'node:test';
import assert from 'node:assert/strict';
import { enemyStats } from '../dist/game/enemies.js';
import {
  specialistTarget,
  selectSpecialistEnemyType,
  nullifierCooldownMultiplier,
  assassinBlinkPosition,
} from '../dist/game/enemy-specialists.js';

test('four specialist enemies have distinct readable stat identities', () => {
  const grunt = enemyStats('grunt', 1);
  const shield = enemyStats('shieldbearer', 1);
  const assassin = enemyStats('assassin', 1);
  const siege = enemyStats('siegeGolem', 1);
  const nullifier = enemyStats('nullifier', 1);
  assert.ok(shield.hp > grunt.hp * 1.8);
  assert.ok(assassin.speed > grunt.speed * 1.4);
  assert.ok(siege.damage > grunt.damage * 2.5 && siege.speed < grunt.speed);
  assert.ok(nullifier.preferredRange >= 200);
  assert.equal(specialistTarget('siegeGolem'), 'core');
  assert.equal(specialistTarget('assassin'), 'hero');
});

test('specialist selection unlocks gradually after five minutes and stays optional', () => {
  assert.equal(selectSpecialistEnemyType(299, 0), null);
  assert.equal(selectSpecialistEnemyType(300, 0.01), 'shieldbearer');
  assert.equal(selectSpecialistEnemyType(360, 0.05), 'assassin');
  assert.equal(selectSpecialistEnemyType(420, 0.09), 'siegeGolem');
  assert.equal(selectSpecialistEnemyType(480, 0.11), 'nullifier');
  assert.equal(selectSpecialistEnemyType(600, 0.9), null);
});

test('nullifier aura increases spell cooldown pressure but is globally capped', () => {
  const hero = { x: 500, y: 450 };
  const enemies = [
    { alive: true, type: 'nullifier', pos: { x: 510, y: 450 }, radius: 22 },
    { alive: true, type: 'nullifier', pos: { x: 540, y: 450 }, radius: 22 },
    { alive: true, type: 'nullifier', pos: { x: 580, y: 450 }, radius: 22 },
    { alive: true, type: 'nullifier', pos: { x: 900, y: 450 }, radius: 22 },
  ];
  const one = nullifierCooldownMultiplier(enemies.slice(0, 1), hero);
  const many = nullifierCooldownMultiplier(enemies, hero);
  assert.ok(one > 1);
  assert.ok(many >= one);
  assert.ok(many <= 1.24);
});

test('assassin blink position lands near but not directly on the hero', () => {
  const pos = assassinBlinkPosition({ x: 200, y: 450 }, { x: 500, y: 450 });
  const d = Math.hypot(pos.x - 500, pos.y - 450);
  assert.ok(d >= 70 && d <= 115);
  assert.ok(pos.x < 500);
});
