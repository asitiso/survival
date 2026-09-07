import test from 'node:test';
import assert from 'node:assert/strict';

const mod=await import('../dist/game/combat-feedback.js');

test('Phase 4467-4472 combat feedback keeps a bounded healing response queue',()=>{
  const f=new mod.CombatFeedbackSystem();
  assert.equal(typeof f.addHealingResponse,'function');
  for(let i=0;i<40;i++)f.addHealingResponse({x:260+i,y:300},{requestedHeal:25,hpRestored:20,overheal:5},i%3===0?'shaman':'regenerating',{x:180,y:300},i,'elite');
  assert.ok(f.healingResponseCount>0);
  assert.ok(f.healingResponseCount<=18);
});

test('Phase 4467-4472 shaman owns a source-target connector while regeneration stays target-local',()=>{
  assert.equal(typeof mod.healingResponsePresentation,'function');
  const regen=mod.healingResponsePresentation({sourceKind:'regenerating',battlefieldStress:.2,priorityTarget:false,protectedWarning:false,safeLaneVisible:false,reducedFlash:false,reducedMotion:false});
  const shaman=mod.healingResponsePresentation({sourceKind:'shaman',battlefieldStress:.2,priorityTarget:false,protectedWarning:false,safeLaneVisible:false,reducedFlash:false,reducedMotion:false});
  assert.equal(regen.connectorAlpha,0);
  assert.ok(shaman.connectorAlpha>0);
  assert.ok(shaman.alpha>=regen.alpha);
});

test('Phase 4467-4472 priority targets survive dense healing while warnings suppress routine regeneration first',()=>{
  assert.equal(typeof mod.healingResponsePresentation,'function');
  const routine=mod.healingResponsePresentation({sourceKind:'regenerating',battlefieldStress:.9,priorityTarget:false,protectedWarning:false,safeLaneVisible:false,reducedFlash:false,reducedMotion:false});
  const priority=mod.healingResponsePresentation({sourceKind:'regenerating',battlefieldStress:.9,priorityTarget:true,protectedWarning:false,safeLaneVisible:false,reducedFlash:false,reducedMotion:false});
  const warned=mod.healingResponsePresentation({sourceKind:'regenerating',battlefieldStress:.9,priorityTarget:false,protectedWarning:true,safeLaneVisible:true,reducedFlash:false,reducedMotion:false});
  assert.ok(priority.alpha>routine.alpha);
  assert.ok(warned.alpha<routine.alpha);
  assert.ok(priority.alpha>=.16);
});

test('Phase 4467-4472 Reduced Motion removes healing pulse and Reduced Flash lowers intensity',()=>{
  assert.equal(typeof mod.healingResponsePresentation,'function');
  const base=mod.healingResponsePresentation({sourceKind:'shaman',battlefieldStress:.2,priorityTarget:true,protectedWarning:false,safeLaneVisible:false,reducedFlash:false,reducedMotion:false});
  const reduced=mod.healingResponsePresentation({sourceKind:'shaman',battlefieldStress:.2,priorityTarget:true,protectedWarning:false,safeLaneVisible:false,reducedFlash:true,reducedMotion:true});
  assert.ok(base.pulse>0);
  assert.equal(reduced.pulse,0);
  assert.ok(reduced.alpha<base.alpha);
});
