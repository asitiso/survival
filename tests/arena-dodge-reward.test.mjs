import test from 'node:test';
import assert from 'node:assert/strict';
import { createArenaDodgeTracker, advanceArenaDodgeTracker, arenaDodgeRewardForShape } from '../dist/game/endless/arena-dodge-reward.js';

const hero={x:500,y:400};
const ring=(telegraph)=>({id:7,pos:{x:500,y:400},radius:100,damage:20,telegraph,ttl:5,geometryShape:'ring',angle:0,length:300});

test('telegraph enter then safe exit before activation awards exactly one arena evade',()=>{
  let state=createArenaDodgeTracker();
  let step=advanceArenaDodgeTracker(state,[ring(.8)],{x:585,y:400},18,1000);
  assert.equal(step.reward,null);
  state=step.state;
  step=advanceArenaDodgeTracker(state,[ring(.6)],hero,18,1120);
  assert.equal(step.reward?.hazardId,7);
  assert.equal(step.reward?.label,'PERFECT EVADE');
  assert.ok(step.reward.signatureCharge>0&&step.reward.signatureCharge<=4);
  const again=advanceArenaDodgeTracker(step.state,[ring(.4)],hero,18,1200);
  assert.equal(again.reward,null);
});

test('remaining inside until hazard activates cancels the dodge reward',()=>{
  let state=createArenaDodgeTracker();
  state=advanceArenaDodgeTracker(state,[ring(.2)],{x:585,y:400},18,1000).state;
  const active=advanceArenaDodgeTracker(state,[ring(0)],{x:585,y:400},18,1120);
  assert.equal(active.reward,null);
  assert.equal(active.state.resolvedIds.includes(7),true);
});

test('arena dodge rewards are combat-only and bounded by geometry difficulty',()=>{
  const easy=arenaDodgeRewardForShape('ring',1);
  const hard=arenaDodgeRewardForShape('clock',9);
  assert.equal('gold' in hard,false);
  assert.ok(hard.flowRetentionMs>=easy.flowRetentionMs);
  assert.ok(hard.flowRetentionMs<=1200);
  assert.ok(hard.moveSpeedMultiplier<=1.06);
  assert.ok(hard.evadeBoostMs<=1200);
});
