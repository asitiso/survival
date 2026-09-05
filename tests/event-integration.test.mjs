import test from 'node:test';
import assert from 'node:assert/strict';
import { EnemyManager, enemyStats } from '../dist/game/enemies.js';
import { createHero, createGuardianCore } from '../dist/game/entities.js';

function noop() {}

test('golden goblin is fast harmless and worth chasing for coins', () => {
  const golden = enemyStats('golden', 1);
  const hound = enemyStats('hound', 1);
  assert.equal(golden.damage, 0);
  assert.ok(golden.speed > hound.speed);
  assert.ok(golden.gold >= 350);
  assert.ok(golden.hp > hound.hp);
});

test('event enemy can be spawned at an explicit arena position and removed by id', () => {
  const manager = new EnemyManager();
  const id = manager.spawnEventEnemy('golden', 2, 'hero', { x: 820, y: 440 });
  const spawned = manager.enemies.find((enemy) => enemy.id === id);
  assert.ok(spawned);
  assert.deepEqual(spawned.pos, { x: 820, y: 440 });
  manager.removeEnemyById(id);
  assert.equal(manager.enemies.some((enemy) => enemy.id === id), false);
});

test('golden goblin flees away from the hero while remaining in the arena', () => {
  const manager = new EnemyManager();
  const hero = createHero('arkan');
  hero.pos = { x: 700, y: 450 };
  const core = createGuardianCore();
  const id = manager.spawnEventEnemy('golden', 1, 'hero', { x: 820, y: 450 });
  const before = manager.enemies.find((enemy) => enemy.id === id).pos.x;
  manager.update(0.2, { hero, core, elapsed: 80, onHeroDamage: noop, onCoreDamage: noop });
  const after = manager.enemies.find((enemy) => enemy.id === id).pos.x;
  assert.ok(after > before);
  assert.ok(after < 1600);
});

test('killing a golden goblin produces a normal death event with its large reward', () => {
  const manager = new EnemyManager();
  const id = manager.spawnEventEnemy('golden', 1, 'hero', { x: 800, y: 450 });
  const golden = manager.enemies.find((enemy) => enemy.id === id);
  manager.damage(golden, golden.maxHp * 2);
  const deaths = manager.drainDeaths();
  assert.equal(deaths.length, 1);
  assert.equal(deaths[0].type, 'golden');
  assert.ok(deaths[0].gold >= 350);
});

test('spawn pressure multiplier increases burst density without bypassing the enemy manager', () => {
  const hero = createHero('arkan');
  const core = createGuardianCore();
  const normal = new EnemyManager();
  const pressured = new EnemyManager();
  normal.update(0.01, { hero, core, elapsed: 100, onHeroDamage: noop, onCoreDamage: noop, spawnPressureMultiplier: 1 });
  pressured.update(0.01, { hero, core, elapsed: 100, onHeroDamage: noop, onCoreDamage: noop, spawnPressureMultiplier: 1.5 });
  assert.ok(pressured.enemies.length > normal.enemies.length);
  assert.ok(pressured.enemies.length <= 320);
});
