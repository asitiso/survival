import test from 'node:test';
import assert from 'node:assert/strict';
import { repeatShopFastPath } from '../dist/game/repeat-shop-fast-path.js';

const state=(weapon=null,armor=null)=>({coins:1800,weapon,armor,healingPotions:2});
const offer=(kind,id,price=500)=>({kind,id,name:id,description:'',accent:'#fff',price});

test('phase 587 a safe same-item midgame upgrade keeps quick-buy promoted after the opening window',()=>{
  const p=repeatShopFastPath(360,offer('weapon','arcane-staff'),state({id:'arcane-staff',name:'Arcane',rank:2,legendary:false}));
  assert.equal(p.promoteQuickBuy,true);
  assert.equal(p.reason,'repeat-upgrade');
});

test('phase 588 repeat fast path never promotes a replacement or potion as a learned one-tap habit',()=>{
  const replacement=repeatShopFastPath(360,offer('weapon','rapid-wand'),state({id:'arcane-staff',name:'Arcane',rank:2,legendary:false}));
  const potion=repeatShopFastPath(360,offer('potion','healing-potion',200),state());
  assert.equal(replacement.promoteQuickBuy,false);
  assert.equal(potion.promoteQuickBuy,false);
});

test('phase 589 repeat fast path is bounded to three-through-fifteen minutes',()=>{
  const equipped=state({id:'arcane-staff',name:'Arcane',rank:2,legendary:false});
  assert.equal(repeatShopFastPath(179,offer('weapon','arcane-staff'),equipped).promoteQuickBuy,false);
  assert.equal(repeatShopFastPath(899,offer('weapon','arcane-staff'),equipped).promoteQuickBuy,true);
  assert.equal(repeatShopFastPath(900,offer('weapon','arcane-staff'),equipped).promoteQuickBuy,false);
});

test('phase 590 repeat fast path adds no control and materially shortens repeat purchase pointer travel',()=>{
  const p=repeatShopFastPath(420,offer('armor','guardian-plate'),state(null,{id:'guardian-plate',name:'Plate',rank:3,legendary:false}));
  assert.equal(p.newControlCount,0);
  assert.ok(p.estimatedPointerTravelReduction>=.35);
});
