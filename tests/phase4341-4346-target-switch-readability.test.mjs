import test from 'node:test';
import assert from 'node:assert/strict';
import { AutoCombatBrain } from '../dist/game/auto-combat-brain.js';
import { targetIntentCuePresentation } from '../dist/game/target-intent-cue.js';

const hero={x:0,y:0},core={x:700,y:0};
const enemy=(id,x,target='hero')=>({id,type:'elite',pos:{x,y:0},target,hp:100,maxHp:100,alive:true});

function displayed(brain){
  return targetIntentCuePresentation({mode:'auto',committedTargetId:brain.currentTargetId(),targetAlive:true,targetRadius:24}).targetId;
}

test('Phase 4341-4346 cue remains on the committed AUTO target while a normal challenger is pending',()=>{
  const brain=new AutoCombatBrain();
  const one=enemy(1,240),two=enemy(2,430);
  assert.equal(brain.selectTarget([one,two],hero,core,0)?.id,1);
  assert.equal(displayed(brain),1);
  two.pos.x=100;
  assert.equal(brain.selectTarget([one,two],hero,core,0.14)?.id,1);
  assert.equal(displayed(brain),1,'candidate review must not move the cue');
  assert.equal(brain.selectTarget([one,two],hero,core,0.28)?.id,1);
  assert.equal(displayed(brain),1,'reaction hold still owns the old target');
  assert.equal(brain.selectTarget([one,two],hero,core,0.42)?.id,2);
  assert.equal(displayed(brain),2,'cue moves only after the brain commits');
});

test('urgent core threat uses the existing faster commit path without exposing the pending candidate',()=>{
  const brain=new AutoCombatBrain();
  const one=enemy(3,210),urgent=enemy(4,450);
  brain.selectTarget([one,urgent],hero,core,1);
  urgent.target='core';
  assert.equal(brain.selectTarget([one,urgent],hero,core,1.14)?.id,3);
  assert.equal(displayed(brain),3);
  assert.equal(brain.selectTarget([one,urgent],hero,core,1.28)?.id,4);
  assert.equal(displayed(brain),4);
});
