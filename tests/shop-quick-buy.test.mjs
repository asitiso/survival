import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { quickShopRecommendation } from '../dist/game/shop-guidance.js';

const offers=[
 {id:'arcane-staff',kind:'weapon',name:'마력 지팡이',price:220,power:.15,description:'피해',accent:'#c78cff'},
 {id:'rapid-wand',kind:'weapon',name:'속사 완드',price:240,power:.07,description:'쿨감',accent:'#68d7ff'},
 {id:'healing-potion',kind:'potion',name:'체력 물약',price:70,power:.35,description:'회복',accent:'#6ae19d'},
];
const guide=(id,score,best=true)=>({offerId:id,label:'추천',reason:'적합',score,best});

test('phase 475 quick shop action picks the highest-scored recommended affordable offer',()=>{
  const picked=quickShopRecommendation(offers,[guide('arcane-staff',60),guide('rapid-wand',72),guide('healing-potion',25,false)]);
  assert.equal(picked?.id,'rapid-wand');
  const duplicate=[{...offers[2],price:90},{...offers[2],price:60}];
  const duplicateGuidance=[guide('healing-potion',20,false),guide('healing-potion',30,true)];
  assert.equal(quickShopRecommendation(duplicate,duplicateGuidance)?.price,60);
});

test('phase 476 quick shop action disappears when guidance has no valid recommended purchase',()=>{
  assert.equal(quickShopRecommendation(offers,[guide('arcane-staff',60,false),guide('rapid-wand',72,false)]),null);
});

test('phase 477 shop overlay exposes one optional recommendation purchase-and-return action instead of another shop mode',()=>{
  const source=readFileSync('src/ui/shop.ts','utf8');
  assert.match(source,/onQuickPurchase/);
  assert.match(source,/추천 바로 구매/);
  assert.doesNotMatch(source,/quickBuyMode|shopMode/);
});

test('phase 478 quick recommendation purchase closes the existing shop only after a successful purchase',()=>{
  const source=readFileSync('src/game/game.ts','utf8');
  assert.match(source,/onQuickPurchase/);
  assert.match(source,/closeAfterPurchase/);
  assert.match(source,/if \(closeAfterPurchase\)/);
});
