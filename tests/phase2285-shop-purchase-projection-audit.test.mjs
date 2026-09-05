import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const url=new URL('../dist/game/shop-purchase-projection-identity-audit.js',import.meta.url);

test('phase 2285 audits exactly 60 deterministic shop purchase projection samples and frozen contracts',async()=>{
  assert.equal(fs.existsSync(url),true,'shop purchase projection audit module must exist');
  const {auditShopPurchaseProjectionIdentityAssets}=await import(url.href);const a=auditShopPurchaseProjectionIdentityAssets();
  assert.equal(a.samples.length,60);assert.equal(a.actionIdentityCount,5);assert.equal(a.actionCoverage,1);assert.equal(a.actionUniqueCellCount,5);assert.equal(a.scenarioCount,5);assert.equal(a.offerCount,9);assert.equal(a.runtimeProjectionSamples,45);assert.deepEqual(a.actionIds,['equip','upgrade','legendary','replace','potion']);assert.equal(a.actionCount,9);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);assert.equal(a.samples.every(s=>s.passed),true);
});
