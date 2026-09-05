import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const url=new URL('../dist/game/shop-purchase-action-identity-assets.js',import.meta.url);

test('phase 2279 provides five static shop purchase action identities',async()=>{
  assert.equal(fs.existsSync(url),true,'shop purchase action identity module must exist');
  const m=await import(url.href);
  assert.deepEqual(m.SHOP_PURCHASE_ACTION_IDS,['equip','upgrade','legendary','replace','potion']);
  assert.deepEqual(m.SHOP_PURCHASE_ACTION_ATLAS,{src:'./assets/ui/shop-purchase-action-icons.png',columns:5,rows:1,cellSize:96,width:480,height:96});
  assert.deepEqual(m.SHOP_PURCHASE_ACTION_IDS.map(id=>m.shopPurchaseActionIdentityIcon(id).label),['신규','강화','전설','교체','물약']);
});

test('phase 2279 action atlas is complete unique static and non-blocking',async()=>{
  const m=await import(url.href);const a=m.auditShopPurchaseActionIdentityAtlas();
  assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,5);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
  for(const id of m.SHOP_PURCHASE_ACTION_IDS){const icon=m.shopPurchaseActionIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);assert.match(m.shopPurchaseActionIdentityStyle(id),/shop-purchase-action-icons\.png/);}
});
