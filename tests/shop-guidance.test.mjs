import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { shopGuidanceForOffers } from '../dist/game/shop-guidance.js';

const offers=[
 {id:'arcane-staff',kind:'weapon',name:'마력 지팡이',price:220,power:.15,description:'피해',accent:'#c78cff'},
 {id:'rapid-wand',kind:'weapon',name:'속사 완드',price:240,power:.07,description:'쿨감',accent:'#68d7ff'},
 {id:'blast-rod',kind:'weapon',name:'폭발 지팡이',price:230,power:.09,description:'범위',accent:'#ff9b5e'},
 {id:'guardian-plate',kind:'armor',name:'수호 갑주',price:230,power:.07,description:'핵 방어',accent:'#f0c46b'},
 {id:'healing-potion',kind:'potion',name:'체력 물약',price:70,power:.35,description:'회복',accent:'#6ae19d'},
];
const empty={coins:500,weapon:null,armor:null,accessory:null,healingPotions:0,inventory:[],discoveredRecipes:[]};

test('phase 427 shop guidance maps build archetypes to equipment that materially supports them',()=>{
  const burst=shopGuidanceForOffers(offers,{heroId:'arkan',archetype:'burst',state:empty});
  const fortress=shopGuidanceForOffers(offers,{heroId:'edric',archetype:'fortress',state:empty});
  assert.equal(burst[0].best,true);
  assert.equal(fortress[3].best,true);
});

test('phase 428 shop guidance describes a current duplicate as stored strengthening material',()=>{
  const state={...empty,weapon:{id:'rapid-wand',kind:'weapon',name:'속사 완드',rank:3,power:.07,legendary:false}};
  const guided=shopGuidanceForOffers(offers,{heroId:'kain',archetype:'cycle',state});
  assert.match(guided[1].reason,/강화 재료 구매.*보관함/);
  assert.ok(guided[1].score>guided[2].score);
});

test('phase 429 legendary equipment remains eligible for stored strengthening materials',()=>{
  const state={...empty,weapon:{id:'arcane-staff',kind:'weapon',name:'마력 지팡이',rank:5,power:.15,legendary:true}};
  const guided=shopGuidanceForOffers(offers,{heroId:'arkan',archetype:'burst',state});
  assert.equal(guided[0].best,true);
  assert.match(guided[0].reason,/강화 재료 구매.*보관함/);
});

test('phase 430 shop guidance highlights no more than two affordable offers and preserves offer order',()=>{
  const guided=shopGuidanceForOffers(offers,{heroId:'seria',archetype:'domain',state:empty});
  assert.equal(guided.length,offers.length);
  assert.ok(guided.filter(x=>x.best).length<=2);
  assert.deepEqual(guided.map(x=>x.offerId),offers.map(x=>x.id));
  const broke=shopGuidanceForOffers(offers,{heroId:'arkan',archetype:'burst',state:{...empty,coins:80}});
  assert.equal(broke[0].best,false);
  assert.equal(broke[2].best,false);
  assert.equal(broke[4].best,true);
});

import { quickShopRecommendation, safeQuickPurchase } from '../dist/game/shop-guidance.js';
import { equipmentCatalog, equipmentDefinition, priceShopOffers } from '../dist/game/shop-data.js';
const gear=(id,rank)=>({...equipmentCatalog().find(x=>x.id===id),rank,legendary:rank>=5});
const readyState={...empty,coins:10000,inventory:[],discoveredRecipes:[],accessory:null};
test('late guidance prioritizes weakest survival metric over hero build preference with a concrete gain',()=>{
 const state={...readyState,weapon:gear('arcane-staff',3),accessory:gear('sage-amulet',3)};
 const catalog=equipmentCatalog();
 const guided=shopGuidanceForOffers(catalog,{heroId:'arkan',archetype:'burst',state,elapsedSeconds:480,heroMaxHp:333});
 const iron=guided.find(x=>x.offerId==='iron-robe');
 assert.equal(iron.best,true);assert.match(iron.reason,/영웅 생존 부족.*타 증가/);
 assert.ok(iron.score>guided.find(x=>x.offerId==='arcane-staff').score);
});
test('six distinct stacks prioritize cleanup over an otherwise recommended buy and disable quick buy',()=>{
 const state={...readyState,weapon:gear('arcane-staff',3),armor:gear('gale-cloak',1),accessory:gear('sage-amulet',3),inventory:['rapid-wand','blast-rod','golden-wand','magnet-cloak','guardian-plate','storm-ring'].map(id=>({...gear(id,1),count:1}))};
 const catalog=equipmentCatalog();
 const guided=shopGuidanceForOffers(catalog,{heroId:'arkan',archetype:'burst',state,elapsedSeconds:480,heroMaxHp:333});
 const iron=guided.find(x=>x.offerId==='iron-robe');
 assert.equal(iron.label,'보관함 정리 필요');assert.equal(iron.action,'cleanup');assert.equal(iron.best,true);
 assert.equal(quickShopRecommendation(catalog,guided,state),null);
});
test('inventory actions never attach to a different offer from the same slot',()=>{
 const state={...readyState,weapon:gear('arcane-staff',3),armor:gear('gale-cloak',1),accessory:gear('sage-amulet',3),inventory:[{...gear('iron-robe',1),count:1}]};
 const guardian=equipmentCatalog().find(x=>x.id==='guardian-plate');
 const [guided]=shopGuidanceForOffers([guardian],{heroId:'arkan',archetype:'burst',state,elapsedSeconds:480,heroMaxHp:333});
 assert.equal(guided.offerId,'guardian-plate');assert.notEqual(guided.action,'equip');
});
test('available forge improvement precedes duplicate buying and never becomes a quick purchase',()=>{
 const state={...readyState,weapon:gear('arcane-staff',3),armor:gear('iron-robe',1),accessory:gear('sage-amulet',3),inventory:[{...gear('iron-robe',1),count:1}]};
 const catalog=equipmentCatalog();
 const guided=shopGuidanceForOffers(catalog,{heroId:'arkan',archetype:'burst',state,elapsedSeconds:480,heroMaxHp:333});
 const iron=guided.find(x=>x.offerId==='iron-robe');
 assert.equal(iron.action,'forge');assert.match(iron.reason,/강화.*타 증가/);
 assert.equal(quickShopRecommendation(catalog,guided,state),null);
 assert.equal(state.armor.rank,1);assert.equal(state.inventory[0].count,1);
});
test('crafted equipment is never eligible for quick buy',()=>{
 const crafted=equipmentDefinition('arcane-accelerator');
 const guidance=[{offerId:crafted.id,label:'추천',reason:'조합',score:100,best:true,action:'purchase'}];
 assert.equal(safeQuickPurchase(crafted,[crafted],readyState),false);
 assert.equal(quickShopRecommendation([crafted],guidance,readyState),null);
});
test('ordinary rank-one material stays eligible before the legacy forge unlock',()=>{
 const state={...readyState,weapon:gear('arcane-staff',1),armor:gear('guardian-plate',3)};
 const [priced]=priceShopOffers([equipmentCatalog().find(item=>item.id==='arcane-staff')],state,30);
 assert.equal(priced.locked,true,'fixture must retain the legacy next-rank presentation flag');
 const [guided]=shopGuidanceForOffers([priced],{heroId:'arkan',archetype:'burst',state,elapsedSeconds:30,heroMaxHp:10000});
 assert.equal(guided.action,'purchase');assert.equal(guided.best,true);
 assert.equal(safeQuickPurchase(priced,[priced],state),true);
 assert.equal(quickShopRecommendation([priced],[guided],state),priced);
});
test('recipe guidance previews a forge without consuming ingredients',()=>{
 const state={...readyState,weapon:gear('arcane-staff',1),armor:gear('iron-robe',3),accessory:gear('sage-amulet',3),inventory:[{...gear('arcane-staff',2),count:1},{...gear('rapid-wand',2),count:1}]};
 const frozen=JSON.stringify(state),catalog=equipmentCatalog();
 const guided=shopGuidanceForOffers(catalog,{heroId:'arkan',archetype:'burst',state,elapsedSeconds:480,heroMaxHp:10000});
 assert.ok(guided.some(entry=>entry.best&&entry.action==='forge'));
 assert.equal(quickShopRecommendation(catalog,guided,state),null);
 assert.equal(JSON.stringify(state),frozen);
});

test('shop integration gives both ordinary and quick guidance actual time and hero maximum HP', () => {
 const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
 const refresh=game.slice(game.indexOf('  private refreshShopOverlay()'),game.indexOf('  private currentCombatBuild()'));
 const calls=[...refresh.matchAll(/shopGuidanceForOffers\([^;]+/g)];
 assert.equal(calls.length,2);
 for(const [call] of calls) {
   assert.match(call,/elapsedSeconds:\s*this\.elapsed/);
   assert.match(call,/heroMaxHp:\s*this\.hero\.maxHp/);
 }
 assert.match(refresh,/this\.shopOverlay\.refresh\(model, handlers\)/,'refresh must replace action closures alongside the new model');
});
