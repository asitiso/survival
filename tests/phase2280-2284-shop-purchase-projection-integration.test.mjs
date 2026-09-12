import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const projectionUrl=new URL('../dist/game/shop-purchase-projection.js',import.meta.url);
const shop=fs.readFileSync(new URL('../src/ui/shop.ts',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const quick=fs.readFileSync(new URL('../src/game/shop-guidance.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');
const feedback=fs.readFileSync(new URL('../src/game/purchase-impact-feedback.ts',import.meta.url),'utf8');
const base={coins:1000,weapon:null,armor:null,accessory:null,healingPotions:1,inventory:[],discoveredRecipes:[]};
const offer=(id,kind,power,price=200)=>({id,kind,name:id,price,power,description:'x',accent:'#fff'});

test('phase 2280 projects new equip stored materials and potion outcomes through authoritative purchase rules',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'shop purchase projection module must exist');
  const m=await import(projectionUrl.href);
  const equip=m.projectShopPurchase(base,offer('arcane-staff','weapon',.15));assert.equal(equip.actionId,'equip');assert.match(equip.summary,/마법 화력 1\.00×→1\.20×/);
  const rank2={...base,weapon:{id:'arcane-staff',kind:'weapon',name:'staff',rank:2,power:.15,legendary:false}};
  const upgrade=m.projectShopPurchase(rank2,offer('arcane-staff','weapon',.15));assert.equal(upgrade.actionLabel,'보관');assert.match(upgrade.summary,/보관함 저장.*현재 장착 효과 유지/);assert.equal(upgrade.deltas.length,0);
  const rank4={...base,weapon:{id:'arcane-staff',kind:'weapon',name:'staff',rank:4,power:.15,legendary:false}};
  const legendary=m.projectShopPurchase(rank4,offer('arcane-staff','weapon',.15));assert.equal(legendary.actionLabel,'보관');assert.match(legendary.summary,/보관함 저장.*현재 장착 효과 유지/);assert.equal(legendary.deltas.length,0);
  const potion=m.projectShopPurchase(base,offer('healing-potion','potion',.35,70));assert.equal(potion.actionId,'potion');assert.equal(potion.summary,'물약 1→2개 · 최대 HP 35% 회복 1회 추가');
});

test('phase 2281 occupied-slot purchases preserve the equipped item and project storage',async()=>{
  const m=await import(projectionUrl.href);
  const state={...base,weapon:{id:'arcane-staff',kind:'weapon',name:'staff',rank:4,power:.15,legendary:false}};
  const p=m.projectShopPurchase(state,offer('rapid-wand','weapon',.07,240));
  assert.equal(p.actionLabel,'보관');assert.equal(p.deltas.length,0);
  assert.match(p.summary,/보관함 저장.*현재 장착 효과 유지/);
});

test('phase 2282 shop cards show action icon and authoritative delta without changing existing item identity',()=>{
  assert.match(shop,/projectShopPurchase\(model\.state, offer, \{ elapsedSeconds: model\.elapsedSeconds, heroMaxHp: model\.heroMaxHp \}\)/);assert.match(shop,/shopPurchaseActionIdentityStyle\(projection\.actionId\)/);assert.match(shop,/shop-purchase-action/);assert.match(shop,/shop-purchase-delta/);assert.match(shop,/shopItemIconPresentation\(offer\.id\)/);
  assert.match(styles,/\.shop-purchase-action\{/);assert.match(styles,/\.shop-purchase-delta\{/);assert.doesNotMatch(styles,/\.shop-purchase-action\{[^}]*width:\s*(?:2[5-9]|[3-9]\d)px/);
});

test('phase 2283 purchase feedback reuses the same authoritative before-after projection',()=>{
  assert.match(feedback,/shopPurchaseProjectionFromStates/);assert.match(feedback,/projection\.summary/);assert.doesNotMatch(feedback,/const CHANNEL:Record/);
});

test('phase 2284 shop projection is presentation-only and quick-buy replacement protection stays frozen',()=>{
  assert.match(quick,/current&&current\.id!==offer\.id&&\(current\.legendary\|\|current\.rank>=3\)/);assert.match(quick,/if\(!exact\|\|offer\.price>state\.coins\|\|protectedReplacement\(offer,state\)\)return false/);
  assert.doesNotMatch(snapshot,/shopPurchaseProjection|shopPurchaseAction|purchaseDelta/);
});
