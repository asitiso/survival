import test from 'node:test';
import assert from 'node:assert/strict';
import { ManualTargetMemory } from '../dist/game/manual-target-stability.js';

const enemy=(id,type,x,y,target='hero',alive=true)=>({id,type,pos:{x,y},target,hp:100,maxHp:100,alive});
const hero={x:0,y:0};
const core={x:500,y:0};

test('phase 1183 manual target memory keeps the same same-priority target for 0.75 seconds',()=>{
  const memory=new ManualTargetMemory();
  const first=enemy(1,'grunt',120,0);
  const challenger=enemy(2,'grunt',100,0);
  assert.equal(memory.select([first],hero,core,10)?.id,1);
  assert.equal(memory.select([first,challenger],hero,core,10.74)?.id,1);
});

test('phase 1199 manual target memory releases a core threat as soon as it leaves the 620 priority range',()=>{
  const memory=new ManualTargetMemory();
  const coreThreat=enemy(1,'grunt',610,0,'core');
  const challenger=enemy(2,'grunt',100,0);
  assert.equal(memory.select([coreThreat,challenger],hero,core,20)?.id,1);
  coreThreat.pos.x=625;
  assert.equal(memory.select([coreThreat,challenger],hero,core,20.1)?.id,2);
});

test('phase 1184 memory expires at 0.75 seconds and allows a same-tier nearer target to take over',()=>{
  const memory=new ManualTargetMemory();
  const first=enemy(1,'grunt',120,0);
  const challenger=enemy(2,'grunt',80,0);
  assert.equal(memory.select([first],hero,core,30)?.id,1);
  assert.equal(memory.select([first,challenger],hero,core,30.75)?.id,2);
});

test('phase 1191 higher manual priority tiers override remembered lower tiers immediately',()=>{
  const memory=new ManualTargetMemory();
  const normal=enemy(1,'grunt',90,0);
  const elite=enemy(2,'elite',300,0);
  const coreThreat=enemy(3,'grunt',500,0,'core');
  assert.equal(memory.select([normal],hero,core,40)?.id,1);
  assert.equal(memory.select([normal,elite],hero,core,40.1)?.id,2);
  assert.equal(memory.select([normal,elite,coreThreat],hero,core,40.2)?.id,3);
});

test('phase 1192 boss and elite share one priority grade so stickiness does not oscillate between them',()=>{
  const memory=new ManualTargetMemory();
  const elite=enemy(1,'elite',220,0);
  const boss=enemy(2,'boss',180,0);
  assert.equal(memory.select([elite],hero,core,50)?.id,1);
  assert.equal(memory.select([elite,boss],hero,core,50.1)?.id,1);
});

test('phase 1200 dead remembered targets release immediately',()=>{
  const memory=new ManualTargetMemory();
  const first=enemy(1,'grunt',100,0);
  const next=enemy(2,'grunt',130,0);
  assert.equal(memory.select([first,next],hero,core,60)?.id,1);
  first.alive=false;
  assert.equal(memory.select([first,next],hero,core,60.1)?.id,2);
});

test('phase 1201 elite memory releases when it leaves the existing 650 elite priority range',()=>{
  const memory=new ManualTargetMemory();
  const elite=enemy(1,'elite',640,0);
  const normal=enemy(2,'grunt',100,0);
  assert.equal(memory.select([elite,normal],hero,core,70)?.id,1);
  elite.pos.x=651;
  assert.equal(memory.select([elite,normal],hero,core,70.1)?.id,2);
});

test('phase 1202 memory retention has a 720 safety radius without changing fallback targeting',()=>{
  const memory=new ManualTargetMemory();
  const first=enemy(1,'grunt',710,0);
  const next=enemy(2,'grunt',730,0);
  assert.equal(memory.select([first,next],hero,core,80)?.id,1);
  first.pos.x=721;
  next.pos.x=100;
  assert.equal(memory.select([first,next],hero,core,80.1)?.id,2);
});

test('phase 1203 clear drops transient manual memory immediately',()=>{
  const memory=new ManualTargetMemory();
  const first=enemy(1,'grunt',100,0);
  const next=enemy(2,'grunt',80,0);
  assert.equal(memory.select([first],hero,core,90)?.id,1);
  assert.equal(memory.currentTargetId(),1);
  memory.clear();
  assert.equal(memory.currentTargetId(),null);
  assert.equal(memory.select([first,next],hero,core,90.1)?.id,2);
});
