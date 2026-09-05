import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const projectionUrl=new URL('../dist/game/shop-purchase-projection.js',import.meta.url);
const shop=fs.readFileSync(new URL('../src/ui/shop.ts',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const quick=fs.readFileSync(new URL('../src/game/shop-guidance.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');
const feedback=fs.readFileSync(new URL('../src/game/purchase-impact-feedback.ts',import.meta.url),'utf8');
const base={coins:1000,weapon:null,armor:null,healingPotions:1};
const offer=(id,kind,power,price=200)=>({id,kind,name:id,price,power,description:'x',accent:'#fff'});

test('phase 2280 projects new equip upgrade legendary and potion outcomes through authoritative purchase rules',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'shop purchase projection module must exist');
  const m=await import(projectionUrl.href);
  const equip=m.projectShopPurchase(base,offer('arcane-staff','weapon',.15));assert.equal(equip.actionId,'equip');assert.match(equip.summary,/마법 화력 1\.00×→1\.15×/);
  const rank2={...base,weapon:{id:'arcane-staff',kind:'weapon',name:'staff',rank:2,power:.15,legendary:false}};
  const upgrade=m.projectShopPurchase(rank2,offer('arcane-staff','weapon',.15));assert.equal(upgrade.actionId,'upgrade');assert.match(upgrade.summary,/1\.30×→1\.45×/);
  const rank4={...base,weapon:{id:'arcane-staff',kind:'weapon',name:'staff',rank:4,power:.15,legendary:false}};
  const legendary=m.projectShopPurchase(rank4,offer('arcane-staff','weapon',.15));assert.equal(legendary.actionId,'legendary');assert.match(legendary.summary,/1\.60×→2\.01×/);
  const potion=m.projectShopPurchase(base,offer('healing-potion','potion',.35,70));assert.equal(potion.actionId,'potion');assert.equal(potion.summary,'물약 1→2개 · 최대 HP 35% 회복 1회 추가');
});

test('phase 2281 replacement projection exposes the largest loss and gain instead of hiding overwrite cost',async()=>{
  const m=await import(projectionUrl.href);
  const state={...base,weapon:{id:'arcane-staff',kind:'weapon',name:'staff',rank:4,power:.15,legendary:false}};
  const p=m.projectShopPurchase(state,offer('rapid-wand','weapon',.07,240));
  assert.equal(p.actionId,'replace');assert.equal(p.deltas.length,2);assert.deepEqual(p.deltas.map(d=>d.id),['spellPowerMultiplier','cooldownMultiplier']);
  assert.match(p.summary,/마법 화력 1\.60×→1\.00×/);assert.match(p.summary,/쿨타임 1\.00×→0\.93×/);
});

test('phase 2282 shop cards show action icon and authoritative delta without changing existing item identity',()=>{
  assert.match(shop,/projectShopPurchase\(model\.state,offer\)/);assert.match(shop,/shopPurchaseActionIdentityStyle\(projection\.actionId\)/);assert.match(shop,/shop-purchase-action/);assert.match(shop,/shop-purchase-delta/);assert.match(shop,/shopItemIconPresentation\(offer\.id\)/);
  assert.match(styles,/\.shop-purchase-action\{/);assert.match(styles,/\.shop-purchase-delta\{/);assert.doesNotMatch(styles,/\.shop-purchase-action\{[^}]*width:\s*(?:2[5-9]|[3-9]\d)px/);
});

test('phase 2283 purchase feedback reuses the same authoritative before-after projection',()=>{
  assert.match(feedback,/shopPurchaseProjectionFromStates/);assert.match(feedback,/projection\.summary/);assert.doesNotMatch(feedback,/const CHANNEL:Record/);
});

test('phase 2284 shop projection is presentation-only and quick-buy replacement protection stays frozen',()=>{
  assert.match(quick,/current&&current\.id!==offer\.id&&\(current\.legendary\|\|current\.rank>=3\)/);assert.match(quick,/if\(!exact\|\|offer\.price>state\.coins\|\|protectedReplacement\(offer,state\)\)return false/);
  assert.doesNotMatch(snapshot,/shopPurchaseProjection|shopPurchaseAction|purchaseDelta/);
});
