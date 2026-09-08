import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatFeedbackSystem, commanderAuraPresentation } from '../dist/game/combat-feedback.js';

test('phase 4491 dense commander routine connectors yield while priority targets stay visible',()=>{
  const routine=commanderAuraPresentation({battlefieldStress:1,priorityTarget:false,clusterIndex:5});
  const priority=commanderAuraPresentation({battlefieldStress:1,priorityTarget:true,clusterIndex:5});
  assert.equal(routine.connectorVisible,false);
  assert.equal(priority.connectorVisible,true);
  assert.ok(priority.chevronAlpha>routine.chevronAlpha);
});

test('phase 4492 results breaks critical hits and recovery cues outrank commander decoration',()=>{
  const base=commanderAuraPresentation({battlefieldStress:.3,priorityTarget:false,clusterIndex:0});
  const suppressed=commanderAuraPresentation({battlefieldStress:.3,priorityTarget:false,clusterIndex:0,resolvedResultNearby:true,defenseBreakNearby:true,criticalNearby:true,healingReturnNearby:true});
  assert.ok(suppressed.connectorAlpha<base.connectorAlpha*.5);
  assert.ok(suppressed.chevronAlpha<base.chevronAlpha);
});

test('phase 4493 commander ownership handoff retires the previous connector faster than the new owner',()=>{
  const feedback=new CombatFeedbackSystem();
  feedback.addCommanderAuraResponse({x:100,y:100},{x:180,y:100},1,20,'grunt','hero');
  feedback.addCommanderAuraResponse({x:120,y:100},{x:180,y:100},2,20,'grunt','hero');
  assert.equal(feedback.commanderAuraCount,2);
  feedback.update(.11);
  assert.equal(feedback.commanderAuraCount,1);
  assert.equal(feedback.commanderAuraCues[0].ownerId,2);
});

test('phase 4494 bounded commander queue preserves core and elite targets before routine grunts',()=>{
  const feedback=new CombatFeedbackSystem();
  feedback.addCommanderAuraResponse({x:100,y:100},{x:180,y:100},1,1,'elite','hero');
  feedback.addCommanderAuraResponse({x:100,y:100},{x:190,y:100},1,2,'grunt','core');
  for(let i=0;i<28;i++)feedback.addCommanderAuraResponse({x:100,y:100},{x:220+i,y:120},1,100+i,'grunt','hero');
  assert.ok(feedback.commanderAuraCount<=20);
  const ids=feedback.commanderAuraCues.map((cue)=>cue.targetId);
  assert.ok(ids.includes(1));
  assert.ok(ids.includes(2));
});

test('phase 4495 4 heroes x threat 0-5 x manual-auto commander presentation matrix stays finite',()=>{
  const heroes=['arcan','seria','kain','edric'];
  for(const hero of heroes)for(let threat=0;threat<=5;threat++)for(const auto of [false,true]){
    const out=commanderAuraPresentation({battlefieldStress:threat/5,priorityTarget:auto||hero==='seria',clusterIndex:threat,reducedMotion:auto&&threat===0,reducedFlash:hero==='edric'&&threat===5});
    for(const value of [out.boundaryAlpha,out.connectorAlpha,out.chevronAlpha,out.boundaryRadius,out.lineWidth,out.pulse])assert.ok(Number.isFinite(value));
  }
});
