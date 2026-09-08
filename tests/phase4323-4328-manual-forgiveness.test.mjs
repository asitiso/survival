import test from 'node:test';
import assert from 'node:assert/strict';
import { CastIntentBuffer, CAST_INTENT_BUFFER_WINDOW_SECONDS } from '../dist/game/cast-intent-buffer.js';
import { ManualTargetMemory, MANUAL_TARGET_MEMORY_SECONDS } from '../dist/game/manual-target-stability.js';

const hero={x:0,y:0},core={x:500,y:0};
const enemy=(id,x,target='hero',type='grunt')=>({id,type,pos:{x,y:0},target,hp:100,maxHp:100,alive:true});

async function assistModule(){return import('../dist/game/manual-weakpoint-assist.js').catch(()=>({}));}

test('Phase 4323-4328 expands manual cast intent buffer to 0.32 seconds without accepting late presses',()=>{
  assert.equal(CAST_INTENT_BUFFER_WINDOW_SECONDS,0.32);
  const buffer=new CastIntentBuffer();
  assert.equal(buffer.request('spell1',0.30),'queued');
  assert.equal(buffer.request('spell2',0.33),'rejected');
  assert.equal(buffer.consumeIfReady('spell1',0),true);
});

test('manual target memory holds same-tier intent for 1.15 seconds but still releases after expiry',()=>{
  assert.equal(MANUAL_TARGET_MEMORY_SECONDS,1.15);
  const memory=new ManualTargetMemory();
  const first=enemy(1,120),closer=enemy(2,90);
  assert.equal(memory.select([first],hero,core,10)?.id,1);
  assert.equal(memory.select([first,closer],hero,core,11.0)?.id,1);
  const expiry=new ManualTargetMemory();
  assert.equal(expiry.select([first],hero,core,20)?.id,1);
  assert.equal(expiry.select([first,closer],hero,core,21.16)?.id,2);
});

test('longer manual memory never blocks an urgent core or boss-tier priority override',()=>{
  const memory=new ManualTargetMemory();
  const grunt=enemy(3,80),coreThreat=enemy(4,520,'core'),boss=enemy(5,300,'hero','boss');
  assert.equal(memory.select([grunt],hero,core,20)?.id,3);
  assert.equal(memory.select([grunt,boss],hero,core,20.2)?.id,5);
  const second=new ManualTargetMemory();
  second.select([grunt,boss],hero,core,21);
  assert.equal(second.select([grunt,boss,coreThreat],hero,core,21.2)?.id,4);
});

test('manual boss weakpoint assist is a 38 percent soft bias and never an exact snap',async()=>{
  const mod=await assistModule();
  assert.equal(mod.MANUAL_WEAKPOINT_AIM_BLEND,0.38);
  assert.equal(typeof mod.manualWeakpointAssistAimPoint,'function');
  const boss={id:77,type:'boss',pos:{x:300,y:100}};
  const node={id:1,pos:{x:400,y:100},hp:50,maxHp:100,alive:true,radius:24};
  const aim=mod.manualWeakpointAssistAimPoint({target:boss,heroPos:{x:200,y:100},activeBossId:77,nodes:[node]});
  assert.deepEqual(aim,{x:338,y:100});
  assert.notDeepEqual(aim,node.pos);
  const elite={id:88,type:'elite',pos:{x:350,y:100}};
  assert.deepEqual(mod.manualWeakpointAssistAimPoint({target:elite,heroPos:{x:200,y:100},activeBossId:77,nodes:[node]}),elite.pos);
  assert.deepEqual(mod.manualWeakpointAssistAimPoint({target:boss,heroPos:{x:200,y:100},activeBossId:77,nodes:[{...node,alive:false}]}),boss.pos);
});
