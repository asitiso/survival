import test from 'node:test';
import assert from 'node:assert/strict';
import { autoWeakpointAimPoint } from '../dist/game/auto-weakpoint-aim.js';

const hero={x:0,y:0},core={x:700,y:0};
const enemy=(id,x,target='hero',type='elite')=>({id,type,pos:{x,y:0},target,hp:100,maxHp:100,alive:true});

async function brainModule(){
  return import('../dist/game/auto-combat-brain.js').catch(()=>({}));
}

test('Phase 4317-4322 exposes a runtime-only humanized AUTO brain contract', async()=>{
  const mod=await brainModule();
  assert.equal(typeof mod.AutoCombatBrain,'function');
  assert.equal(mod.AUTO_TARGET_REVIEW_SECONDS,0.14);
  assert.equal(mod.AUTO_NORMAL_SWITCH_SECONDS,0.18);
  assert.equal(mod.AUTO_CORE_SWITCH_SECONDS,0.10);
  assert.equal(mod.AUTO_CAST_GAP_SECONDS,0.14);
  assert.equal(mod.AUTO_WEAKPOINT_SWITCH_SECONDS,0.22);
});

test('AUTO target review is cadence-limited and commits normal/core switches after human reaction delay',async()=>{
  const {AutoCombatBrain}=await brainModule();
  assert.equal(typeof AutoCombatBrain,'function');
  const brain=new AutoCombatBrain();
  const one=enemy(1,250),two=enemy(2,420);
  assert.equal(brain.selectTarget([one,two],hero,core,0)?.id,1);
  two.pos.x=100;
  assert.equal(brain.selectTarget([one,two],hero,core,0.05)?.id,1,'no review before 0.14s');
  assert.equal(brain.selectTarget([one,two],hero,core,0.14)?.id,1,'normal challenger begins pending');
  assert.equal(brain.selectTarget([one,two],hero,core,0.28)?.id,1,'normal switch still waiting');
  assert.equal(brain.selectTarget([one,two],hero,core,0.42)?.id,2,'normal switch commits after reaction window');

  const coreBrain=new AutoCombatBrain();
  const a=enemy(3,220),urgent=enemy(4,450,'hero');
  assert.equal(coreBrain.selectTarget([a,urgent],hero,core,1)?.id,3);
  urgent.target='core';
  assert.equal(coreBrain.selectTarget([a,urgent],hero,core,1.14)?.id,3);
  assert.equal(coreBrain.selectTarget([a,urgent],hero,core,1.28)?.id,4,'core threat commits on faster reaction window');
});

test('AUTO regular spell throughput is staggered instead of frame-perfect four-spell bursts',async()=>{
  const {AutoCombatBrain}=await brainModule();
  assert.equal(typeof AutoCombatBrain,'function');
  const brain=new AutoCombatBrain();
  const actions=['spell1','spell2','spell3','spell4'];
  assert.equal(brain.chooseAutoCastAction(actions,0),'spell1');
  brain.recordAutoCast('spell1',0);
  assert.equal(brain.chooseAutoCastAction(actions,0.05),null);
  assert.equal(brain.chooseAutoCastAction(actions,0.14),'spell2');
  brain.recordAutoCast('spell2',0.14);
  assert.equal(brain.chooseAutoCastAction(actions,0.28),'spell3');
});

test('AUTO weakpoint choice is held and aim is helpful but not exact node-center perfection',async()=>{
  const {AutoCombatBrain,AUTO_WEAKPOINT_AIM_BLEND}=await brainModule();
  assert.equal(typeof AutoCombatBrain,'function');
  assert.equal(AUTO_WEAKPOINT_AIM_BLEND,0.79);
  const brain=new AutoCombatBrain();
  const boss={id:77,type:'boss',pos:{x:300,y:0}};
  const nodes=[
    {id:1,pos:{x:250,y:0},hp:60,maxHp:100,alive:true,radius:24},
    {id:2,pos:{x:420,y:0},hp:80,maxHp:100,alive:true,radius:24},
  ];
  assert.equal(brain.selectWeakpoint(77,nodes,hero,0),1);
  nodes[1].hp=30;
  assert.equal(brain.selectWeakpoint(77,nodes,hero,0.10),1);
  assert.equal(brain.selectWeakpoint(77,nodes,hero,0.20),1);
  assert.equal(brain.selectWeakpoint(77,nodes,hero,0.35),2);
  const aim=autoWeakpointAimPoint({autoAim:true,target:boss,heroPos:hero,activeBossId:77,nodes,preferredNodeId:2});
  assert.ok(aim);
  assert.notDeepEqual(aim,nodes[1].pos);
  assert.ok(aim.x>boss.pos.x&&aim.x<nodes[1].pos.x);
  assert.equal(Math.round((aim.x-boss.pos.x)/(nodes[1].pos.x-boss.pos.x)*100),79);
});
