import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatFeedbackSystem } from '../dist/game/combat-feedback.js';

test('Phase 4455-4460 combat feedback exposes bounded defense-response handoff cues',()=>{
  const f=new CombatFeedbackSystem();
  assert.equal(typeof f.addDefenseResponse,'function');
  for(let i=0;i<40;i++)f.addDefenseResponse({x:200+i,y:300},{incoming:100,guardBlocked:i%2?20:0,shieldAbsorbed:i%2?0:30,hpIncoming:70,hpApplied:55,mitigation:15,multiplier:.78,guardBroken:i%7===0,shieldBroken:i%9===0,armored:true,bossMultiplier:1});
  assert.ok(f.defenseResponseCount<=16);
  assert.ok(f.defenseResponseCount>0);
});

test('Phase 4455-4460 warning and safe-lane context suppress routine defense decoration before break handoff',async()=>{
  const {defenseResponsePresentation}=await import('../dist/game/defense-response-readability.js');
  const routine=defenseResponsePresentation({kind:'armor',battlefieldStress:.8,protectedWarning:true,safeLaneVisible:true,reducedFlash:false,reducedMotion:false});
  const broken=defenseResponsePresentation({kind:'guardBreak',battlefieldStress:.8,protectedWarning:true,safeLaneVisible:true,reducedFlash:false,reducedMotion:false});
  assert.ok(routine.alpha<broken.alpha);
  assert.ok(routine.alpha<=.12);
  assert.ok(broken.alpha>=.16);
});

test('Phase 4455-4460 Reduced Motion removes pulse and Reduced Flash lowers response intensity',async()=>{
  const {defenseResponsePresentation}=await import('../dist/game/defense-response-readability.js');
  const base=defenseResponsePresentation({kind:'shieldBreak',battlefieldStress:.2,reducedFlash:false,reducedMotion:false});
  const reduced=defenseResponsePresentation({kind:'shieldBreak',battlefieldStress:.2,reducedFlash:true,reducedMotion:true});
  assert.ok(reduced.alpha<base.alpha);
  assert.equal(reduced.pulse,0);
  assert.ok(base.pulse>0);
});
