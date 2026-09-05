import test from 'node:test';
import assert from 'node:assert/strict';
import * as combat from '../dist/game/combat-cue-priority.js';

test('phase 1503 hero critical owns the single primary combat-attention slot over core and boss response',()=>{
  assert.equal(typeof combat.combatAttentionPolicy,'function');
  const p=combat.combatAttentionPolicy({heroCritical:true,coreCritical:true,damageSeverity:null,bossSpecialTimer:.4,reducedFlash:false});
  assert.equal(p.primary,'hero-critical');
  assert.equal(p.heroWarningAnimated,true);
  assert.equal(p.coreWarningAnimated,false);
  assert.equal(p.bossAssistCompact,true);
  assert.equal(p.showBossAssistLabel,false);
  assert.ok(p.maxProjectileCues>=1&&p.maxProjectileCues<=2);
  assert.equal(p.showAutoLabel,false);
  assert.equal(p.showWeakpointLabel,false);
});

test('phase 1511 core warning becomes primary when hero is safe without hiding the hero/core warning model',()=>{
  assert.equal(typeof combat.combatAttentionPolicy,'function');
  const p=combat.combatAttentionPolicy({heroCritical:false,coreCritical:true,damageSeverity:null,bossSpecialTimer:.3,reducedFlash:false});
  assert.equal(p.primary,'core-critical');
  assert.equal(p.heroWarningAnimated,false);
  assert.equal(p.coreWarningAnimated,true);
  assert.equal(p.bossAssistCompact,true);
});

test('phase 1519 normal combat preserves existing damage and boss-response ordering when no hp critical state exists',()=>{
  assert.equal(typeof combat.combatAttentionPolicy,'function');
  const critical=combat.combatAttentionPolicy({heroCritical:false,coreCritical:false,damageSeverity:'critical',bossSpecialTimer:.4,reducedFlash:false});
  const boss=combat.combatAttentionPolicy({heroCritical:false,coreCritical:false,damageSeverity:null,bossSpecialTimer:.4,reducedFlash:false});
  const heavy=combat.combatAttentionPolicy({heroCritical:false,coreCritical:false,damageSeverity:'heavy',bossSpecialTimer:9,reducedFlash:false});
  assert.equal(critical.primary,'damage-critical');
  assert.equal(boss.primary,'boss-response');
  assert.equal(boss.bossAssistCompact,false);
  assert.equal(boss.showBossAssistLabel,true);
  assert.equal(heavy.primary,'damage-heavy');
});

test('phase 1527 reduced flash preserves critical warning information with zero critical motion amplitude',()=>{
  assert.equal(typeof combat.combatAttentionPolicy,'function');
  const p=combat.combatAttentionPolicy({heroCritical:true,coreCritical:true,damageSeverity:'critical',bossSpecialTimer:.2,reducedFlash:true});
  assert.equal(p.primary,'hero-critical');
  assert.equal(p.heroWarningAnimated,false);
  assert.equal(p.coreWarningAnimated,false);
  assert.equal(p.criticalMotionAmplitude,0);
  assert.equal(p.bossAssistCompact,true);
});
