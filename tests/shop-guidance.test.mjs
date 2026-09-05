import test from 'node:test';
import assert from 'node:assert/strict';
import { shopGuidanceForOffers } from '../dist/game/shop-guidance.js';

const offers=[
 {id:'arcane-staff',kind:'weapon',name:'마력 지팡이',price:220,power:.15,description:'피해',accent:'#c78cff'},
 {id:'rapid-wand',kind:'weapon',name:'속사 완드',price:240,power:.07,description:'쿨감',accent:'#68d7ff'},
 {id:'blast-rod',kind:'weapon',name:'폭발 지팡이',price:230,power:.09,description:'범위',accent:'#ff9b5e'},
 {id:'guardian-plate',kind:'armor',name:'수호 갑주',price:230,power:.07,description:'핵 방어',accent:'#f0c46b'},
 {id:'healing-potion',kind:'potion',name:'체력 물약',price:70,power:.35,description:'회복',accent:'#6ae19d'},
];
const empty={coins:500,weapon:null,armor:null,healingPotions:0};

test('phase 427 shop guidance maps build archetypes to equipment that materially supports them',()=>{
  const burst=shopGuidanceForOffers(offers,{heroId:'arkan',archetype:'burst',state:empty});
  const fortress=shopGuidanceForOffers(offers,{heroId:'edric',archetype:'fortress',state:empty});
  assert.equal(burst[0].best,true);
  assert.equal(fortress[3].best,true);
});

test('phase 428 shop guidance values upgrading the currently equipped item instead of treating it as a duplicate',()=>{
  const state={...empty,weapon:{id:'rapid-wand',kind:'weapon',name:'속사 완드',rank:3,power:.07,legendary:false}};
  const guided=shopGuidanceForOffers(offers,{heroId:'kain',archetype:'cycle',state});
  assert.match(guided[1].reason,/현재 장비 강화/);
  assert.ok(guided[1].score>guided[2].score);
});

test('phase 429 completed rank-five equipment is never highlighted as a recommendation',()=>{
  const state={...empty,weapon:{id:'arcane-staff',kind:'weapon',name:'마력 지팡이',rank:5,power:.15,legendary:true}};
  const guided=shopGuidanceForOffers(offers,{heroId:'arkan',archetype:'burst',state});
  assert.equal(guided[0].best,false);
  assert.equal(guided[0].label,'완성');
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
