import test from 'node:test';
import assert from 'node:assert/strict';
import { EnemyManager, enemyStats } from '../dist/game/enemies.js';

function makeEnemy(id,type='grunt',overrides={}){
  const stats=enemyStats(type,1);
  return {...stats,id,type,pos:{x:400+id*10,y:300},maxHp:stats.hp,hp:stats.hp,target:'hero',attackTimer:0,slowFactor:1,slowTimer:0,alive:true,hitFlash:0,damageTakenMultiplier:1,regenPerSecondRatio:0,lowHpDamageMultiplier:1,commandAuraMultiplier:1,manaShield:0,maxManaShield:0,...overrides};
}
function commander(id,x=400){return makeEnemy(id,'elite',{pos:{x,y:300},eliteAffixes:['commander'],commandAuraMultiplier:1.18});}

test('phase 4479 records the gameplay-selected commander as presentation owner',()=>{
  const manager=new EnemyManager();
  const source=commander(1,400), target=makeEnemy(2,'grunt',{pos:{x:500,y:300}});
  manager.enemies=[source,target];
  assert.equal(manager.commandAuraBoost(target),1.18);
  assert.equal(target.commandAuraOwnerId,source.id);
  assert.deepEqual(target.commandAuraOwnerPos,source.pos);
  assert.ok(target.commandAuraPresentationTtl>0);
});

test('phase 4480 preserves existing first-valid-commander gameplay ownership',()=>{
  const manager=new EnemyManager();
  const first=commander(1,410), second=commander(2,430), target=makeEnemy(3,'grunt',{pos:{x:500,y:300}});
  manager.enemies=[first,second,target];
  assert.equal(manager.commandAuraBoost(target),1.18);
  assert.equal(target.commandAuraOwnerId,first.id);
});

test('phase 4481 boss and golden exclusions do not create presentation ownership',()=>{
  const manager=new EnemyManager();
  const source=commander(1,400), boss=makeEnemy(2,'boss',{pos:{x:500,y:300}}), golden=makeEnemy(3,'golden',{pos:{x:510,y:300}});
  manager.enemies=[source,boss,golden];
  assert.equal(manager.commandAuraBoost(boss),1);
  assert.equal(manager.commandAuraBoost(golden),1);
  assert.equal(boss.commandAuraOwnerId,undefined);
  assert.equal(golden.commandAuraOwnerId,undefined);
});

test('phase 4482 commander ownership handoff remembers the previous source without changing boost',()=>{
  const manager=new EnemyManager();
  const first=commander(1,400), second=commander(2,420), target=makeEnemy(3,'grunt',{pos:{x:500,y:300}});
  manager.enemies=[first,second,target];
  assert.equal(manager.commandAuraBoost(target),1.18);
  first.alive=false;
  assert.equal(manager.commandAuraBoost(target),1.18);
  assert.equal(target.commandAuraOwnerId,second.id);
  assert.equal(target.commandAuraPreviousOwnerId,first.id);
  assert.ok(target.commandAuraHandoffTtl>0);
});
