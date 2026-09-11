import test from 'node:test';
import assert from 'node:assert/strict';
import { purchaseOffer } from '../dist/domain/economy.js';
import { strengthenEquipment } from '../dist/domain/equipment-forge.js';
import { equipmentBonuses } from '../dist/game/shop-data.js';
import { openingAutoReadyProfile } from '../dist/game/opening-auto-ready.js';
const offer={id:'iron-robe',kind:'armor',name:'철갑 로브',price:200,power:.08};
test('new runs require manual play by default',()=>assert.equal(openingAutoReadyProfile().initialAutoEnabled,false));
test('legendary strengthening buys a stored material before using the forge gold sink',()=>{
 const state={coins:100000,weapon:null,armor:{...offer,rank:5,legendary:true},accessory:null,healingPotions:0,inventory:[],discoveredRecipes:[]};
 const purchased=purchaseOffer(state,offer);
 assert.equal(purchased.ok,true);
 assert.equal(purchased.state.armor.rank,5);
 assert.deepEqual(purchased.state.inventory.map(({id,rank,count})=>({id,rank,count})),[{id:'iron-robe',rank:1,count:1}]);
 const result=strengthenEquipment(purchased.state,{place:'equipped',kind:'armor'},840);
 assert.equal(result.ok,true);
 assert.equal(result.state.armor.rank,6);
 assert.equal(result.state.armor.legendary,true);
 assert.equal(result.state.inventory.length,0);
 assert.ok(equipmentBonuses(result.state).damageTakenMultiplier<equipmentBonuses(state).damageTakenMultiplier);
 assert.ok(equipmentBonuses(result.state).damageTakenMultiplier>.2);
});
import { InputState } from '../dist/core/input.js';
import { ACTION_BUTTONS, LOGICAL_WIDTH, LOGICAL_HEIGHT } from '../dist/game/config.js';
import { priceShopOffers, ensureEquippedOffers, generateShopOffers } from '../dist/game/shop-data.js';
import { projectShopPurchase } from '../dist/game/shop-purchase-projection.js';
test('three completed level taps reveal AUTO; hidden pointer and keyboard inputs cannot toggle it',()=>{
 const listeners={}; const keyListeners={};
 globalThis.window={addEventListener:(name,fn)=>keyListeners[name]=fn,removeEventListener:()=>{}};
 const canvas={addEventListener:(name,fn)=>listeners[name]=fn,removeEventListener:()=>{},setPointerCapture:()=>{},getBoundingClientRect:()=>({left:0,top:0,width:LOGICAL_WIDTH,height:LOGICAL_HEIGHT})};
 const input=new InputState(canvas);
 const event=(x,y,id=1)=>({clientX:x,clientY:y,pointerId:id,preventDefault(){}});
 const auto=ACTION_BUTTONS.find(b=>b.id==='auto');
 listeners.pointerdown(event(auto.x,auto.y));listeners.pointerup(event(auto.x,auto.y));
 keyListeners.keydown({key:'r',repeat:false,preventDefault(){}});
 assert.equal(input.consumePressed('auto'),false);
 for(let n=0;n<2;n++){listeners.pointerdown(event(50,45));listeners.pointerup(event(50,45));assert.equal(input.autoModeVisible,false);}
 listeners.pointerdown(event(50,45));listeners.pointercancel(event(50,45));assert.equal(input.autoModeVisible,false);
 listeners.pointerdown(event(50,45));listeners.pointerup(event(50,45));assert.equal(input.autoModeVisible,true);
 assert.equal(input.consumePressed('auto'),false);
 listeners.pointerdown(event(auto.x,auto.y));listeners.pointerup(event(auto.x,auto.y));assert.equal(input.consumePressed('auto'),true);
 input.resetAutoReveal();assert.equal(input.autoModeVisible,false);
 input.destroy();delete globalThis.window;
});
test('base material prices remain stable while duplicates accumulate for forge use',()=>{
 const display={...offer,description:'',accent:'#fff'};
 let state={coins:100000,weapon:null,armor:null,accessory:null,healingPotions:0,inventory:[],discoveredRecipes:[]};
 const prices=[];
 for(let n=0;n<7;n++){
  const quoted=priceShopOffers([display],state)[0];prices.push(quoted.price);
  assert.equal(priceShopOffers([quoted],state)[0].price,quoted.price);
  const result=purchaseOffer(state,quoted);assert.equal(result.ok,true);
  assert.equal(state.coins-result.state.coins,quoted.price);
  if(n===0)assert.ok(projectShopPurchase(state,quoted).deltas.length>0);
  else assert.equal(projectShopPurchase(state,quoted).deltas.length,0);
  state=result.state;
 }
 assert.deepEqual(prices,[200,200,200,200,200,200,200]);
 assert.equal(state.inventory[0].count,6);
});
test('every shop retains an upgrade option for both equipped items',()=>{
 const state={coins:10000,weapon:{id:'arcane-staff',kind:'weapon',name:'',rank:5,power:.15,legendary:true},armor:{...offer,rank:5,legendary:true},accessory:null,healingPotions:0,inventory:[],discoveredRecipes:[]};
 const offers=ensureEquippedOffers(generateShopOffers(()=>.8),state);
 assert.equal(offers.length,6);
 assert.ok(offers.some(o=>o.id===state.weapon.id));assert.ok(offers.some(o=>o.id===state.armor.id));
});
