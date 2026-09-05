import test from 'node:test';
import assert from 'node:assert/strict';
import { purchaseImpactFeedback } from '../dist/game/purchase-impact-feedback.js';

const base={coins:1000,weapon:null,armor:null,healingPotions:1};
const offer=(id,kind,power=.1)=>({id,kind,name:id,price:200,power,description:'',accent:'#fff'});

test('phase 451 purchase impact translates weapon buys into the exact combat channel the player just improved',()=>{
  assert.match(purchaseImpactFeedback(base,{...base,weapon:{id:'arcane-staff',kind:'weapon',name:'staff',rank:1,power:.15,legendary:false}},offer('arcane-staff','weapon',.15)).message,/마법 화력/);
  assert.match(purchaseImpactFeedback(base,{...base,weapon:{id:'rapid-wand',kind:'weapon',name:'wand',rank:1,power:.07,legendary:false}},offer('rapid-wand','weapon',.07)).message,/재사용/);
});

test('phase 452 purchase impact distinguishes survival core-defense mobility and pickup armor benefits',()=>{
  assert.match(purchaseImpactFeedback(base,{...base,armor:{id:'guardian-plate',kind:'armor',name:'plate',rank:1,power:.07,legendary:false}},offer('guardian-plate','armor',.07)).message,/수호핵/);
  assert.match(purchaseImpactFeedback(base,{...base,armor:{id:'gale-cloak',kind:'armor',name:'gale',rank:1,power:.08,legendary:false}},offer('gale-cloak','armor',.08)).message,/이동/);
});

test('phase 453 upgrading the same item reports the new rank so the recommendation has visible follow-through',()=>{
  const before={...base,weapon:{id:'arcane-staff',kind:'weapon',name:'staff',rank:2,power:.15,legendary:false}};
  const after={...base,weapon:{...before.weapon,rank:3}};
  const feedback=purchaseImpactFeedback(before,after,offer('arcane-staff','weapon',.15));
  assert.match(feedback.message,/3단계/);
  assert.equal(feedback.kind,'upgrade');
});

test('phase 454 potion purchase uses a short recovery message and feedback remains presentation-only',()=>{
  const feedback=purchaseImpactFeedback(base,{...base,healingPotions:2},offer('healing-potion','potion',.35));
  assert.match(feedback.message,/물약/);
  assert.deepEqual(Object.keys(feedback).sort(),['kind','message'].sort());
});
