import test from 'node:test';
import assert from 'node:assert/strict';
import { freezeCrowdBudget } from '../dist/game/freeze-status-readability.js';
import { CombatFeedbackSystem } from '../dist/game/combat-feedback.js';

test('Phase 4413-4418 dense frozen crowd preserves boss elite specialist and committed target ownership first',()=>{
  const entries=[
    {id:1,enemyClass:'regular',distanceToHero:60},
    {id:2,enemyClass:'regular',distanceToHero:40,currentTarget:true},
    {id:3,enemyClass:'specialist',distanceToHero:100},
    {id:4,enemyClass:'elite',distanceToHero:140},
    {id:5,enemyClass:'boss',distanceToHero:260},
    {id:6,enemyClass:'regular',distanceToHero:20},
  ];
  const budget=freezeCrowdBudget(entries,{battlefieldStress:1});
  const byId=new Map(budget.entries.map(entry=>[entry.id,entry]));
  for(const id of [2,3,4,5])assert.equal(byId.get(id)?.protectedIdentity,true,`id ${id} should retain identity priority`);
  assert.ok((byId.get(5)?.alphaScale??0)>(byId.get(1)?.alphaScale??1));
  assert.ok((byId.get(2)?.alphaScale??0)>(byId.get(6)?.alphaScale??1));
  assert.ok(budget.fullCueCapacity<=4);
});

test('Phase 4413-4418 routine frozen enemies collapse to low-intensity cues as battlefield stress rises',()=>{
  const entries=Array.from({length:10},(_,index)=>({id:index+1,enemyClass:'regular',distanceToHero:30+index*12}));
  const calm=freezeCrowdBudget(entries,{battlefieldStress:0});
  const dense=freezeCrowdBudget(entries,{battlefieldStress:1});
  assert.ok(dense.fullCueCapacity<calm.fullCueCapacity);
  assert.ok(dense.entries.filter(entry=>entry.fullDetail).length<=dense.fullCueCapacity);
  assert.ok(dense.entries.some(entry=>!entry.fullDetail&&entry.alphaScale<.6));
});

test('Phase 4413-4418 protected warning safe lane and nearby result cue lower decorative freeze ownership',()=>{
  const entry={id:1,enemyClass:'regular',distanceToHero:40,resultCueNearby:true};
  const calm=freezeCrowdBudget([entry],{}).entries[0];
  const yielded=freezeCrowdBudget([entry],{protectedWarning:true,safeLaneVisible:true,battlefieldStress:.7}).entries[0];
  assert.ok(yielded.alphaScale<calm.alphaScale);
  assert.ok(yielded.pulseScale<calm.pulseScale);
});

test('Phase 4413-4418 CombatFeedbackSystem exposes resolved result proximity without exposing cue internals',()=>{
  const feedback=new CombatFeedbackSystem();
  feedback.addActionResult({x:100,y:100},'guardBreak',{x:40,y:100});
  assert.equal(feedback.hasActionResultNear({x:112,y:105},28),true);
  assert.equal(feedback.hasActionResultNear({x:180,y:180},28),false);
});
