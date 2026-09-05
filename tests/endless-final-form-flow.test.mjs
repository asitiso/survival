import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultFinalFormFlowState, recordFinalFormFlowCast, advanceFinalFormFlow, finalFormFlowModifiers } from '../dist/game/endless/final-form-flow.js';

test('phase 127 moving casts build a capped transient Final Form flow streak',()=>{
  let state=createDefaultFinalFormFlowState();
  for(let i=0;i<9;i++) state=recordFinalFormFlowCast(state,'thunder-tyrant',true,1000+i*300);
  assert.equal(state.streak,5);
  assert.ok(state.expiresAtMs>3000);
  const mod=finalFormFlowModifiers(state,'thunder-tyrant',3500);
  assert.ok(mod.damageMultiplier>1);
  assert.ok(mod.cooldownMultiplier<1);
  assert.ok(mod.damageMultiplier<=1.18);
});

test('flow does not charge without a final form or movement and expires cleanly',()=>{
  let state=createDefaultFinalFormFlowState();
  state=recordFinalFormFlowCast(state,null,true,1000);
  state=recordFinalFormFlowCast(state,'solar-sovereign',false,1200);
  assert.equal(state.streak,0);
  state=recordFinalFormFlowCast(state,'solar-sovereign',true,1500);
  state=advanceFinalFormFlow(state,7000);
  assert.equal(state.streak,0);
  assert.deepEqual(finalFormFlowModifiers(state,'solar-sovereign',7000),{damageMultiplier:1,cooldownMultiplier:1,moveSpeedMultiplier:1});
});

test('mobility families produce different flow emphasis',()=>{
  let a=createDefaultFinalFormFlowState(); let b=createDefaultFinalFormFlowState();
  for(let i=0;i<3;i++){a=recordFinalFormFlowCast(a,'tempest-runner',true,1000+i*250);b=recordFinalFormFlowCast(b,'oath-guardian',true,1000+i*250);}
  const flow=finalFormFlowModifiers(a,'tempest-runner',1800);
  const anchor=finalFormFlowModifiers(b,'oath-guardian',1800);
  assert.ok(flow.cooldownMultiplier<anchor.cooldownMultiplier);
  assert.ok(anchor.damageMultiplier>1);
});
