import test from 'node:test';
import assert from 'node:assert/strict';
import { primaryWeakpointNode, weakpointIndicator } from '../dist/game/auto-target-visibility.js';

const node=(id,x,hp=100,maxHp=100,alive=true)=>({id,kind:'armorPlate',pos:{x,y:200},hp,maxHp,radius:27,alive});

test('phase 471 weakpoint labeling chooses the most damaged live node instead of labeling every node equally',()=>{
  const picked=primaryWeakpointNode([node(1,120,100),node(2,420,35)],{x:100,y:200});
  assert.equal(picked?.id,2);
});

test('phase 472 equal-health weakpoints choose the nearest node then stable id to prevent label hopping',()=>{
  assert.equal(primaryWeakpointNode([node(7,300,70),node(4,180,70)],{x:100,y:200})?.id,4);
  assert.equal(primaryWeakpointNode([node(7,180,70),node(4,180,70)],{x:100,y:200})?.id,4);
});

test('phase 473 secondary weakpoints keep a ring but drop duplicate text while the primary keeps the label',()=>{
  const n=node(2,300,80,200);
  const primary=weakpointIndicator(n,true);
  const secondary=weakpointIndicator(n,false);
  assert.equal(primary?.label,'약점');
  assert.equal(secondary?.label,'');
  assert.ok(secondary.urgency<primary.urgency);
  assert.ok(secondary.radius>0);
});

test('phase 474 destroyed weakpoints never participate in primary-label selection',()=>{
  const picked=primaryWeakpointNode([node(1,120,5,100,false),node(2,420,100)],{x:100,y:200});
  assert.equal(picked?.id,2);
});
