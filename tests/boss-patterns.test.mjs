import test from 'node:test';
import assert from 'node:assert/strict';
import { bossPhaseForRatio, bossPatternTuning } from '../dist/game/boss-patterns.js';
import { EnemyManager, enemyStats } from '../dist/game/enemies.js';

function makeBoss(hpRatio, specialTimer = 0, bossCycle = 0) {
  const stats = enemyStats('boss', 3);
  return {
    ...stats,
    id: 900,
    type: 'boss',
    pos: { x: 700, y: 430 },
    maxHp: stats.hp,
    hp: stats.hp * hpRatio,
    target: 'hero',
    attackTimer: 4,
    slowFactor: 1,
    slowTimer: 0,
    alive: true,
    hitFlash: 0,
    specialTimer,
    bossCycle,
  };
}

const world = {
  hero: { pos: { x: 900, y: 430 }, radius: 23 },
  core: { pos: { x: 800, y: 450 }, radius: 48 },
  elapsed: 240,
  onHeroDamage: () => {},
  onCoreDamage: () => {},
};

test('boss phase changes at readable health thresholds', () => {
  assert.equal(bossPhaseForRatio(1), 1);
  assert.equal(bossPhaseForRatio(0.66), 2);
  assert.equal(bossPhaseForRatio(0.34), 2);
  assert.equal(bossPhaseForRatio(0.33), 3);
});

test('later boss phases escalate pattern frequency and mobility', () => {
  const p1 = bossPatternTuning(1);
  const p2 = bossPatternTuning(2);
  const p3 = bossPatternTuning(3);
  assert.equal(p1.summonCount, 0);
  assert.ok(p2.summonCount >= 3);
  assert.ok(p3.specialInterval < p1.specialInterval);
  assert.ok(p3.speedMultiplier >= 1.30);
  assert.ok(p3.fanProjectiles > p1.fanProjectiles);
});

test('phase one boss special fires a projectile fan instead of only walking forward', () => {
  const manager = new EnemyManager();
  manager.enemies = [makeBoss(0.9, 0, 0)];
  manager.update(0.05, world);
  assert.ok(manager.activeProjectileCount >= bossPatternTuning(1).fanProjectiles);
});

test('phase two boss can summon adds next to itself', () => {
  const manager = new EnemyManager();
  const boss = makeBoss(0.5, 0, 1);
  manager.enemies = [boss];
  manager.update(0.05, world);
  const nearbyAdds = manager.enemies.filter((enemy) => enemy.id !== boss.id && Math.hypot(enemy.pos.x - boss.pos.x, enemy.pos.y - boss.pos.y) < 150);
  assert.ok(nearbyAdds.length >= 3);
});

import { bossArchetypeForOrdinal, bossArchetypeTuning } from '../dist/game/boss-patterns.js';

test('boss archetypes rotate predictably across endless boss spawns', () => {
  assert.equal(bossArchetypeForOrdinal(0), 'inferno');
  assert.equal(bossArchetypeForOrdinal(1), 'summoner');
  assert.equal(bossArchetypeForOrdinal(2), 'juggernaut');
  assert.equal(bossArchetypeForOrdinal(3), 'abyssWitch');
  assert.equal(bossArchetypeForOrdinal(4), 'twinMaw');
  assert.equal(bossArchetypeForOrdinal(5), 'timeEater');
  assert.equal(bossArchetypeForOrdinal(6), 'inferno');
  assert.equal(bossArchetypeForOrdinal(8), 'juggernaut');
});

test('boss archetypes create distinct combat priorities instead of color-only variants', () => {
  const inferno = bossArchetypeTuning('inferno', 3);
  const summoner = bossArchetypeTuning('summoner', 3);
  const juggernaut = bossArchetypeTuning('juggernaut', 3);

  assert.ok(inferno.fanProjectiles > summoner.fanProjectiles);
  assert.ok(inferno.ringProjectiles >= 8);
  assert.ok(summoner.summonCount > inferno.summonCount);
  assert.ok(juggernaut.dashDistance >= 150);
  assert.ok(juggernaut.speedMultiplier > summoner.speedMultiplier);
  assert.equal(new Set([inferno.telegraphColor, summoner.telegraphColor, juggernaut.telegraphColor]).size, 3);
});

test('summoner boss special adds a larger escort pack than the default inferno boss', () => {
  const manager = new EnemyManager();
  const boss = { ...makeBoss(0.5, 0, 1), bossArchetype: 'summoner', bossOrdinal: 1 };
  manager.enemies = [boss];
  manager.update(0.05, world);
  const adds = manager.enemies.filter((enemy) => enemy.id !== boss.id);
  assert.ok(adds.length >= bossArchetypeTuning('summoner', 2).summonCount);
});

test('juggernaut boss special lunges a meaningful distance toward the hero', () => {
  const manager = new EnemyManager();
  const boss = { ...makeBoss(0.25, 0, 0), bossArchetype: 'juggernaut', bossOrdinal: 2 };
  const before = Math.hypot(world.hero.pos.x - boss.pos.x, world.hero.pos.y - boss.pos.y);
  manager.enemies = [boss];
  manager.update(0.05, world);
  const after = Math.hypot(world.hero.pos.x - boss.pos.x, world.hero.pos.y - boss.pos.y);
  assert.ok(before - after >= 100);
});

test('enemy manager stores the threat-adjusted boss variant tier for presentation', () => {
  const manager = new EnemyManager();
  const boss = makeBoss(0.9, 0, 0);
  manager.enemies = [boss];
  manager.update(0.01, { ...world, bossVariantBonus: 2 });
  assert.equal(manager.enemies[0]?.bossVariantTier, 2);
});
