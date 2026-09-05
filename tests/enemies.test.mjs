import test from 'node:test';
import assert from 'node:assert/strict';
import { EnemyManager, enemyStats } from '../dist/game/enemies.js';

test('enemy archetypes have distinct combat identities', () => {
  const grunt = enemyStats('grunt', 1);
  const hound = enemyStats('hound', 1);
  const brute = enemyStats('brute', 1);
  assert.ok(hound.speed > grunt.speed);
  assert.ok(hound.hp < brute.hp);
  assert.ok(brute.radius > grunt.radius);
});

test('boss is tougher than elite at same danger', () => {
  const elite = enemyStats('elite', 6);
  const boss = enemyStats('boss', 6);
  assert.ok(boss.hp > elite.hp);
  assert.ok(boss.gold > elite.gold);
});

test('boss countdown is exposed so the HUD can warn before the first boss', () => {
  const manager = new EnemyManager();
  assert.equal(manager.bossCountdown, 120);
});

test('bomber and shaman add special pressure rather than more hp-only variants', () => {
  const bomber = enemyStats('bomber', 1);
  const shaman = enemyStats('shaman', 1);
  const grunt = enemyStats('grunt', 1);
  assert.ok(bomber.damage > grunt.damage);
  assert.ok(bomber.speed > grunt.speed);
  assert.ok(shaman.preferredRange >= 220);
  assert.ok(shaman.attackInterval >= 2);
});

test('bomber detonates on contact and damages nearby hero without granting a fake kill', () => {
  const manager = new EnemyManager();
  const stats = enemyStats('bomber', 1);
  const bomber = {
    ...stats, id: 10, type: 'bomber', pos: { x: 420, y: 450 }, maxHp: stats.hp,
    target: 'hero', attackTimer: 0, slowFactor: 1, slowTimer: 0, alive: true, hitFlash: 0,
  };
  manager.enemies = [bomber];
  let heroDamage = 0;
  manager.update(0.05, {
    hero: { pos: { x: 430, y: 450 }, radius: 23 },
    core: { pos: { x: 800, y: 450 }, radius: 48 },
    elapsed: 100,
    onHeroDamage: (amount) => { heroDamage += amount; },
    onCoreDamage: () => {},
  });
  assert.ok(heroDamage >= stats.damage);
  assert.equal(bomber.alive, false);
  assert.equal(manager.drainDeaths().length, 0);
});

test('shaman periodically restores nearby damaged enemies', () => {
  const manager = new EnemyManager();
  const shamanStats = enemyStats('shaman', 1);
  const gruntStats = enemyStats('grunt', 1);
  const shaman = {
    ...shamanStats, id: 20, type: 'shaman', pos: { x: 500, y: 450 }, maxHp: shamanStats.hp,
    target: 'hero', attackTimer: 0, slowFactor: 1, slowTimer: 0, alive: true, hitFlash: 0,
  };
  const ally = {
    ...gruntStats, id: 21, type: 'grunt', pos: { x: 540, y: 450 }, maxHp: gruntStats.hp,
    hp: gruntStats.hp / 2, target: 'hero', attackTimer: 5, slowFactor: 1, slowTimer: 0, alive: true, hitFlash: 0,
  };
  manager.enemies = [shaman, ally];
  const before = ally.hp;
  manager.update(0.05, {
    hero: { pos: { x: 690, y: 450 }, radius: 23 },
    core: { pos: { x: 800, y: 450 }, radius: 48 },
    elapsed: 240,
    onHeroDamage: () => {},
    onCoreDamage: () => {},
  });
  assert.ok(ally.hp > before);
});

test('boss death event preserves archetype so reward generation can match the defeated boss', () => {
  const manager = new EnemyManager();
  const id = manager.spawnEventEnemy('boss', 1, 'hero', { x: 400, y: 400 });
  const boss = manager.enemies.find((enemy) => enemy.id === id);
  assert.ok(boss);
  assert.equal(boss.bossArchetype, 'inferno');
  manager.damage(boss, boss.hp + 1);
  const [death] = manager.drainDeaths();
  assert.equal(death.type, 'boss');
  assert.equal(death.bossArchetype, 'inferno');
});
