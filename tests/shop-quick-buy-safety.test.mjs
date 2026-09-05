import test from 'node:test';
import assert from 'node:assert/strict';
import { quickShopRecommendation, shopGuidanceForOffers, safeQuickPurchase } from '../dist/game/shop-guidance.js';
const baseState={coins:1000,weapon:null,armor:null,healingPotions:1};
const context=(state)=>({heroId:'arkan',archetype:'burst',state});
const offer=(id,kind,price,name=id)=>({id,kind,price,name,description:'x',accent:'#fff'});
test('phase 495 quick-buy hides replacements that would overwrite a developed rank-three-or-higher item',()=>{
  const state={...baseState,weapon:{id:'rapid-wand',name:'Rapid',rank:4,legendary:false}};
  const offers=[offer('arcane-staff','weapon',400),offer('healing-potion','potion',80)];
  const guidance=shopGuidanceForOffers(offers,context(state));
  assert.notEqual(quickShopRecommendation(offers,guidance,state)?.id,'arcane-staff');
});
test('phase 496 same-item rank-four upgrade remains eligible for one-tap quick-buy',()=>{
  const state={...baseState,weapon:{id:'arcane-staff',name:'Staff',rank:4,legendary:false}};
  const offers=[offer('arcane-staff','weapon',400)];
  const guidance=shopGuidanceForOffers(offers,context(state));
  assert.equal(quickShopRecommendation(offers,guidance,state)?.id,'arcane-staff');
});
test('phase 497 stale or newly unaffordable quick offers fail closed at click time',()=>{
  const candidate=offer('arcane-staff','weapon',400);
  assert.equal(safeQuickPurchase(candidate,[candidate],baseState),true);
  assert.equal(safeQuickPurchase(candidate,[candidate],{...baseState,coins:300}),false);
  assert.equal(safeQuickPurchase(candidate,[offer('rapid-wand','weapon',400)],baseState),false);
});
test('phase 498 protected legendary replacement can still use normal card purchase but not quick purchase',()=>{
  const state={...baseState,weapon:{id:'rapid-wand',name:'Rapid',rank:5,legendary:true}};
  const candidate=offer('arcane-staff','weapon',300);
  assert.equal(safeQuickPurchase(candidate,[candidate],state),false);
});
