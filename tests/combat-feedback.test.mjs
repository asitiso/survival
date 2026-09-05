import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatFeedbackSystem } from '../dist/game/combat-feedback.js';
import { EnemyManager, enemyStats } from '../dist/game/enemies.js';

test('combat feedback keeps short-lived hit and kill cues', () => {
  const feedback = new CombatFeedbackSystem();
  feedback.addHit({ x: 100, y: 120 }, 55, false);
  feedback.addKill({ x: 100, y: 120 }, false);
  assert.equal(feedback.activeCount, 2);
  feedback.update(1.2);
  assert.equal(feedback.activeCount, 0);
});

test('enemy damage feeds the shared combat feedback sink', () => {
  const feedback = new CombatFeedbackSystem();
  const manager = new EnemyManager();
  manager.feedback = feedback;
  const stats = enemyStats('grunt', 1);
  const enemy = {
    ...stats,
    id: 1,
    type: 'grunt',
    pos: { x: 240, y: 300 },
    maxHp: stats.hp,
    target: 'hero',
    attackTimer: 0,
    slowFactor: 1,
    slowTimer: 0,
    alive: true,
    hitFlash: 0,
  };
  manager.enemies = [enemy];
  manager.damage(enemy, 12);
  assert.equal(feedback.activeCount, 1);
});

test('combat feedback classifies damage by meaningful health chunks', async () => {
  const { impactTierForDamage } = await import('../dist/game/combat-feedback.js');
  assert.equal(impactTierForDamage(5, 100), 'normal');
  assert.equal(impactTierForDamage(15, 100), 'heavy');
  assert.equal(impactTierForDamage(35, 100), 'critical');
});

test('combat feedback keeps the visual queue bounded under spell spam', () => {
  const feedback = new CombatFeedbackSystem();
  for (let i = 0; i < 180; i++) feedback.addHit({ x: i, y: i }, 8, false);
  assert.ok(feedback.activeCount <= 96);
});

test('boss kill creates strong screen shake that fully decays', () => {
  const feedback = new CombatFeedbackSystem();
  feedback.addKill({ x: 500, y: 400 }, true);
  assert.ok(feedback.shakeIntensity >= 12);
  const first = feedback.cameraOffset;
  assert.ok(Math.abs(first.x) + Math.abs(first.y) > 0);
  feedback.update(2);
  assert.equal(feedback.shakeIntensity, 0);
  assert.deepEqual(feedback.cameraOffset, { x: 0, y: 0 });
});

test('final spell and elite impacts are stronger than ordinary hits without exceeding the shake cap', () => {
  const feedback = new CombatFeedbackSystem();
  feedback.addHit({ x: 20, y: 30 }, 8, false);
  assert.equal(feedback.shakeIntensity, 0);
  feedback.addImpact({ x: 20, y: 30 }, 'eliteKill');
  const eliteShake = feedback.shakeIntensity;
  assert.ok(eliteShake >= 4);
  feedback.addImpact({ x: 20, y: 30 }, 'final');
  assert.ok(feedback.shakeIntensity >= eliteShake);
  feedback.addImpact({ x: 20, y: 30 }, 'bossHit');
  assert.ok(feedback.shakeIntensity <= 16);
});
