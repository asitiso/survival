import test from 'node:test';
import assert from 'node:assert/strict';
import { EnemyManager, enemyStats } from '../dist/game/enemies.js';

function makeEnemy(overrides={}){
  const stats=enemyStats('elite',1);
  return {
    ...stats,id:7001,type:'elite',pos:{x:420,y:320},maxHp:100,hp:100,target:'hero',attackTimer:0,
    slowFactor:1,slowTimer:0,alive:true,hitFlash:0,damageTakenMultiplier:1,regenPerSecondRatio:0,
    lowHpDamageMultiplier:1,commandAuraMultiplier:1,manaShield:0,maxManaShield:0,...overrides,
  };
}

function feedbackProbe(){
  const hits=[];const defenses=[];
  return {
    sink:{
      addHit:(pos,amount,tier,enemyType,source)=>hits.push({pos,amount,tier,enemyType,source}),
      tagLatestHitTarget:()=>{},addKill:()=>{},addImpact:()=>{},addActionResult:()=>{},
      addDefenseResponse:(pos,response,source)=>defenses.push({pos,response,source}),
    },hits,defenses,
  };
}

test('Phase 4443-4448 reports guard block shield absorption mitigation and applied HP without changing state math',()=>{
  const manager=new EnemyManager();
  const enemy=makeEnemy({guardHp:36,maxGuardHp:36,manaShield:20,maxManaShield:20,damageTakenMultiplier:.68,eliteAffixes:['armored','manaShield']});
  manager.enemies=[enemy];
  const probe=feedbackProbe();manager.feedback=probe.sink;
  manager.damage(enemy,100,{x:300,y:320});
  assert.equal(enemy.guardHp,0);
  assert.equal(enemy.manaShield,0);
  assert.equal(enemy.hp,70.08);
  assert.equal(probe.defenses.length,1);
  const r=probe.defenses[0].response;
  assert.deepEqual({incoming:r.incoming,guardBlocked:r.guardBlocked,shieldAbsorbed:r.shieldAbsorbed,hpApplied:r.hpApplied},
    {incoming:100,guardBlocked:36,shieldAbsorbed:20,hpApplied:29.92});
  assert.ok(Math.abs(r.mitigation-14.08)<1e-9);
});

test('Phase 4443-4448 boss vulnerability accounting reports amplified applied HP while preserving boss damage math',()=>{
  const manager=new EnemyManager();
  manager.setBossEncounterModifiers({bossDamageTakenMultiplier:1.28,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1});
  const enemy=makeEnemy({type:'boss',maxHp:500,hp:500});manager.enemies=[enemy];
  const probe=feedbackProbe();manager.feedback=probe.sink;
  manager.damage(enemy,100);
  assert.equal(enemy.hp,372);
  assert.equal(probe.defenses.length,1);
  assert.equal(probe.defenses[0].response.hpApplied,128);
  assert.equal(probe.defenses[0].response.mitigation,-28);
});
