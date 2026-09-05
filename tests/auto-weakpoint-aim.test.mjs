import test from 'node:test';
import assert from 'node:assert/strict';
import { autoWeakpointAimPoint } from '../dist/game/auto-weakpoint-aim.js';
const boss={id:77,type:'boss',pos:{x:500,y:300},alive:true};
const nodes=[
  {id:1,pos:{x:390,y:310},hp:180,maxHp:200,alive:true,radius:30},
  {id:2,pos:{x:610,y:310},hp:60,maxHp:200,alive:true,radius:30},
];
test('phase 483 AUTO boss aim redirects to the highest-priority live weakpoint',()=>{
  assert.deepEqual(autoWeakpointAimPoint({autoAim:true,target:boss,heroPos:{x:240,y:300},activeBossId:77,nodes}),nodes[1].pos);
});
test('phase 484 manual casts keep the original enemy aim point',()=>{
  assert.deepEqual(autoWeakpointAimPoint({autoAim:false,target:boss,heroPos:{x:240,y:300},activeBossId:77,nodes}),boss.pos);
});
test('phase 485 AUTO never redirects a non-boss or a weakpoint set belonging to another boss',()=>{
  const elite={...boss,id:9,type:'elite'};
  assert.deepEqual(autoWeakpointAimPoint({autoAim:true,target:elite,heroPos:{x:240,y:300},activeBossId:77,nodes}),elite.pos);
  assert.deepEqual(autoWeakpointAimPoint({autoAim:true,target:boss,heroPos:{x:240,y:300},activeBossId:88,nodes}),boss.pos);
});
test('phase 486 destroyed or implausibly distant weakpoints fall back to the boss center',()=>{
  const unusable=nodes.map(n=>({...n,alive:false,hp:0}));
  assert.deepEqual(autoWeakpointAimPoint({autoAim:true,target:boss,heroPos:{x:240,y:300},activeBossId:77,nodes:unusable}),boss.pos);
  const far=[{...nodes[1],pos:{x:1400,y:800}}];
  assert.deepEqual(autoWeakpointAimPoint({autoAim:true,target:boss,heroPos:{x:240,y:300},activeBossId:77,nodes:far}),boss.pos);
});
