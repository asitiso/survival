import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatFeedbackSystem, combatImpactVisual } from '../dist/game/combat-feedback.js';
import { EnemyManager, enemyStats } from '../dist/game/enemies.js';

test('phase 839-842 normal heavy critical hit visuals form a strict hierarchy',()=>{
  const normal=combatImpactVisual('normal');
  const heavy=combatImpactVisual('heavy');
  const critical=combatImpactVisual('critical');
  assert.ok(heavy.fontSize>normal.fontSize);
  assert.ok(critical.fontSize>heavy.fontSize);
  assert.ok(heavy.rayCount>normal.rayCount);
  assert.ok(critical.rayCount>heavy.rayCount);
  assert.ok(critical.ringRadius>heavy.ringRadius);
});

test('phase 843-844 enemy damage preserves heavy tier instead of collapsing it into normal',()=>{
  const feedback=new CombatFeedbackSystem();
  const manager=new EnemyManager();
  manager.feedback=feedback;
  const stats=enemyStats('grunt',1);
  const enemy={...stats,id:801,type:'grunt',pos:{x:200,y:200},maxHp:100,hp:100,target:'hero',attackTimer:0,slowFactor:1,slowTimer:0,alive:true,hitFlash:0};
  manager.enemies=[enemy];
  manager.damage(enemy,15);
  assert.equal(feedback.hitTierCounts.heavy,1);
  assert.equal(feedback.hitTierCounts.critical,0);
});

test('phase 845-846 boss and ultimate impact specs remain stronger but under shake cap',()=>{
  const feedback=new CombatFeedbackSystem();
  feedback.addImpact({x:0,y:0},'ultimate');
  const ultimate=feedback.shakeIntensity;
  feedback.addImpact({x:0,y:0},'bossHit');
  assert.ok(ultimate>=7);
  assert.ok(feedback.shakeIntensity>=ultimate);
  assert.ok(feedback.shakeIntensity<=16);
});
