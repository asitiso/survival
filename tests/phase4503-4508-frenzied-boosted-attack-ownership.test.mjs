import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const feedbackModule=await import('../dist/game/combat-feedback.js');
const {EnemyManager,enemyStats}=await import('../dist/game/enemies.js');

function elite(overrides={}){const s=enemyStats('elite',1);return {...s,id:9101,type:'elite',pos:{x:500,y:400},maxHp:100,hp:40,target:'hero',attackTimer:0,slowFactor:1,slowTimer:0,alive:true,hitFlash:0,damageTakenMultiplier:1,regenPerSecondRatio:0,lowHpDamageMultiplier:1.55,commandAuraMultiplier:1,manaShield:0,maxManaShield:0,eliteAffixes:['frenzied'],...overrides};}
function updateCtx(onHeroDamage=()=>{}){return {hero:{pos:{x:530,y:400},radius:18},core:{pos:{x:1350,y:400},radius:28},elapsed:10,onHeroDamage,onCoreDamage:()=>{},enemySpeedMultiplier:1};}

test('phase 4503 exposes boosted frenzied attack presentation with compact directional ownership',()=>{
  assert.equal(typeof feedbackModule.frenziedAttackPresentation,'function');
  const full=feedbackModule.frenziedAttackPresentation({targetChannel:'hero'});
  const reduced=feedbackModule.frenziedAttackPresentation({targetChannel:'hero',reducedMotion:true,reducedFlash:true});
  assert.ok(full.alpha>0.25);
  assert.ok(full.length>=18&&full.length<=64);
  assert.ok(full.pulse>0);
  assert.equal(reduced.pulse,0);
  assert.ok(reduced.alpha<full.alpha);
});

test('phase 4504 combat feedback owns a bounded frenzied attack cue queue',()=>{
  const feedback=new feedbackModule.CombatFeedbackSystem();
  assert.equal(typeof feedback.addFrenziedAttackResponse,'function');
  for(let i=0;i<30;i++)feedback.addFrenziedAttackResponse({x:100+i,y:100},{x:160+i,y:100},i,'hero','elite');
  assert.ok(feedback.frenziedAttackCount>0);
  assert.ok(feedback.frenziedAttackCount<=20);
});

test('phase 4505 actual 1.55x frenzied contact hit emits source-to-target ownership once',()=>{
  const manager=new EnemyManager();
  const enemy=elite();
  const calls=[];
  manager.enemies=[enemy];
  manager.feedback={addHit(){},addKill(){},addImpact(){},addFrenziedAttackResponse(...args){calls.push(args);}};
  let applied=0;
  manager.update(0.016,updateCtx((amount)=>{applied=amount;}));
  assert.equal(applied,enemy.damage*1.55);
  assert.equal(calls.length,1);
  assert.deepEqual(calls[0][0],enemy.pos);
  assert.equal(calls[0][2],enemy.id);
  assert.equal(calls[0][3],'hero');
});

test('phase 4506 normal contact hit above threshold does not emit frenzied attack cue',()=>{
  const manager=new EnemyManager();
  const enemy=elite({hp:60});
  const calls=[];
  manager.enemies=[enemy];
  manager.feedback={addHit(){},addKill(){},addImpact(){},addFrenziedAttackResponse(...args){calls.push(args);}};
  let applied=0;
  manager.update(0.016,updateCtx((amount)=>{applied=amount;}));
  assert.equal(applied,enemy.damage);
  assert.equal(calls.length,0);
});

test('phase 4507 boosted attack readability reuses canvas and existing affix assets without a new atlas',async()=>{
  const feedbackSource=await readFile(new URL('../src/game/combat-feedback.ts',import.meta.url),'utf8');
  const enemySource=await readFile(new URL('../src/game/enemies.ts',import.meta.url),'utf8');
  assert.doesNotMatch(feedbackSource,/frenzied[^\n]*atlas/i);
  assert.match(enemySource,/addFrenziedAttackResponse/);
});
