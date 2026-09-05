import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseSpellTarget } from '../dist/game/auto-targeting.js';

const enemy=(id,type,x,y,target='hero',hp=100,maxHp=100,alive=true)=>({id,type,pos:{x,y},target,hp,maxHp,alive});
const hero={x:0,y:0},core={x:500,y:0};

test('phase 467 AUTO keeps its current valid target when a challenger is only marginally better',()=>{
  const current=enemy(1,'elite',260,0);
  const marginal=enemy(2,'elite',220,0);
  assert.equal(chooseSpellTarget([current,marginal],hero,core,true,1)?.id,1);
});

test('phase 468 AUTO switches immediately when a core threat becomes materially more important',()=>{
  const current=enemy(1,'elite',200,0);
  const coreThreat=enemy(2,'grunt',400,0,'core');
  assert.equal(chooseSpellTarget([current,coreThreat],hero,core,true,1)?.id,2);
});

test('phase 469 AUTO releases a dead or out-of-range sticky target without delaying the next cast',()=>{
  const dead=enemy(1,'boss',200,0,'hero',100,100,false);
  const far=enemy(3,'boss',900,0);
  const next=enemy(2,'elite',180,0);
  assert.equal(chooseSpellTarget([dead,next],hero,core,true,1)?.id,2);
  assert.equal(chooseSpellTarget([far,next],hero,core,true,3)?.id,2);
});

test('phase 470 manual targeting ignores AUTO stickiness and preserves the old manual contract',()=>{
  const near=enemy(1,'grunt',40,0);
  const elite=enemy(2,'elite',200,0);
  assert.equal(chooseSpellTarget([near,elite],hero,core,false,1)?.id,2);
});
