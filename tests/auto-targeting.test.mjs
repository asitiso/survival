import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseSpellTarget } from '../dist/game/auto-targeting.js';

const enemy=(id,type,x,y,target='hero',hp=100,maxHp=100)=>({id,type,pos:{x,y},target,hp,maxHp,alive:true});
const hero={x:0,y:0},core={x:500,y:0};

test('phase 435 auto targeting protects the core instead of wasting casts on a slightly nearer grunt',()=>{
  const grunt=enemy(1,'grunt',90,0);
  const coreThreat=enemy(2,'siegeGolem',420,0,'core');
  assert.equal(chooseSpellTarget([grunt,coreThreat],hero,core,true)?.id,2);
});

test('phase 436 auto targeting gives a boss clear priority when the core is not under immediate pressure',()=>{
  const grunt=enemy(1,'grunt',80,0);
  const boss=enemy(3,'boss',300,0);
  assert.equal(chooseSpellTarget([grunt,boss],hero,core,true)?.id,3);
});

test('phase 437 auto targeting ignores distant off-screen value and resolves ties deterministically by id',()=>{
  const a=enemy(7,'elite',240,20);
  const b=enemy(4,'elite',240,-20);
  const far=enemy(2,'boss',900,0);
  assert.equal(chooseSpellTarget([a,b,far],hero,core,true)?.id,4);
  assert.equal(chooseSpellTarget([far],hero,core,true),null);
});

test('phase 438 manual targeting preserves the existing core-then-elite-then-nearest behavior',()=>{
  const near=enemy(1,'grunt',40,0);
  const elite=enemy(2,'elite',200,0);
  const coreThreat=enemy(3,'grunt',580,0,'core');
  assert.equal(chooseSpellTarget([near,elite,coreThreat],hero,core,false)?.id,3);
  assert.equal(chooseSpellTarget([near,elite],hero,core,false)?.id,2);
  assert.equal(chooseSpellTarget([near],hero,core,false)?.id,1);
});
