import test from 'node:test';
import assert from 'node:assert/strict';

const mod=await import('../dist/game/combat-feedback.js');

function input(overrides={}){return {sourceKind:'regenerating',recentDamageTier:null,resolvedResultNearby:false,defenseBreakNearby:false,clusterIndex:0,battlefieldStress:.2,reducedMotion:false,reducedFlash:false,...overrides};}

test('Phase 4473-4478 recent damage creates a displaced recovery-return cue instead of overlapping damage text',()=>{
  assert.equal(typeof mod.healingDamageArbitrationPresentation,'function');
  const calm=mod.healingDamageArbitrationPresentation(input({recentDamageTier:'heavy'}));
  assert.equal(calm.numberVisible,true);
  assert.ok(calm.numberOffsetY>0);
  assert.ok(calm.returnCueAlpha>0);
  const reduced=mod.healingDamageArbitrationPresentation(input({recentDamageTier:'heavy',reducedMotion:true}));
  assert.ok(Math.abs(reduced.numberOffsetY)<Math.abs(calm.numberOffsetY));
});

test('Phase 4473-4478 resolved results defense breaks and critical hits own priority over healing decoration',()=>{
  const base=mod.healingDamageArbitrationPresentation(input());
  const critical=mod.healingDamageArbitrationPresentation(input({recentDamageTier:'critical'}));
  const result=mod.healingDamageArbitrationPresentation(input({resolvedResultNearby:true}));
  const broken=mod.healingDamageArbitrationPresentation(input({defenseBreakNearby:true}));
  assert.ok(critical.numberAlpha<base.numberAlpha);
  assert.ok(result.numberAlpha<base.numberAlpha);
  assert.ok(broken.numberAlpha<base.numberAlpha);
  assert.equal(result.numberVisible,false);
});

test('Phase 4473-4478 dense routine regeneration numbers yield before shaman burst healing',()=>{
  const routine=mod.healingDamageArbitrationPresentation(input({battlefieldStress:1,clusterIndex:4}));
  const shaman=mod.healingDamageArbitrationPresentation(input({sourceKind:'shaman',battlefieldStress:1,clusterIndex:8}));
  assert.equal(routine.numberVisible,false);
  assert.equal(shaman.numberVisible,true);
  assert.ok(shaman.numberAlpha>routine.numberAlpha);
});

test('Phase 4473-4478 CombatFeedbackSystem renders actual +N recovery separated from recent damage',()=>{
  const f=new mod.CombatFeedbackSystem();
  f.addHit({x:400,y:300},80,'heavy','elite',{x:320,y:300},77);
  f.addHealingResponse({x:400,y:300},{requestedHeal:40,hpRestored:40,overheal:0},'shaman',{x:330,y:340},77,'elite');
  const texts=[];
  const target={save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},strokeText(t,x,y){texts.push({kind:'stroke',t,x,y});},fillText(t,x,y){texts.push({kind:'fill',t,x,y});}};
  const ctx=new Proxy(target,{get(o,p){if(p in o)return o[p];return ()=>{};},set(){return true;}});
  f.render(ctx,'high',{battlefieldStress:.2});
  const fills=texts.filter((entry)=>entry.kind==='fill');
  assert.ok(fills.some((entry)=>String(entry.t)==='+40'));
  const damage=fills.find((entry)=>String(entry.t)==='80');
  const healing=fills.find((entry)=>String(entry.t)==='+40');
  assert.ok(damage&&healing);
  assert.notEqual(healing.y,damage.y);
});

test('Phase 4473-4478 hero x threat x manual/AUTO healing arbitration matrix stays finite',()=>{
  assert.equal(typeof mod.healingDamageArbitrationPresentation,'function');
  for(const hero of ['arkan','seria','kain','edric'])for(let threat=0;threat<=5;threat++)for(const control of ['manual','auto']){
    const stress=threat/5;
    const p=mod.healingDamageArbitrationPresentation(input({sourceKind:control==='auto'?'shaman':'regenerating',battlefieldStress:stress,recentDamageTier:threat>=4?'heavy':null,clusterIndex:threat}));
    for(const value of [p.numberAlpha,p.numberOffsetX,p.numberOffsetY,p.returnCueAlpha])assert.ok(Number.isFinite(value),`${hero}-${threat}-${control}`);
  }
});
