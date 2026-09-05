import test from 'node:test';import assert from 'node:assert/strict';import { lateShopFastPath } from '../dist/game/late-shop-fast-path.js';
const state={coins:1800,weapon:{id:'arcane-staff',kind:'weapon',name:'Arcane',rank:3,power:.15,legendary:false},armor:{id:'iron-robe',kind:'armor',name:'Robe',rank:3,power:.08,legendary:false},healingPotions:2};
const same={kind:'weapon',id:'arcane-staff',name:'Arcane',description:'',accent:'#fff',price:500,power:.15};
const swap={kind:'weapon',id:'storm-wand',name:'Storm',description:'',accent:'#fff',price:500,power:.15};
const potion={kind:'potion',id:'potion',name:'Potion',description:'',accent:'#fff',price:250,power:0};
test('phase 607 late shop promotes a safe same-item upgrade during 30-60 minutes',()=>{assert.equal(lateShopFastPath(2000,same,state).promoteQuickBuy,true);});
test('phase 608 late shop never promotes a replacement weapon through the repeat fast path',()=>{assert.equal(lateShopFastPath(2000,swap,state).promoteQuickBuy,false);});
test('phase 609 late shop may promote an affordable potion because it cannot replace equipment',()=>{assert.equal(lateShopFastPath(2400,potion,state).promoteQuickBuy,true);});
test('phase 610 late shop fast path adds no control and is bounded to the 30-60 minute window',()=>{const p=lateShopFastPath(2000,same,state);assert.equal(p.newControlCount,0);assert.equal(lateShopFastPath(1700,same,state).promoteQuickBuy,false);assert.equal(lateShopFastPath(3700,same,state).promoteQuickBuy,false);});
