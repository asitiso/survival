import test from 'node:test';
import assert from 'node:assert/strict';

test('phase 1865 shop item asset audit is deterministic and presentation-only',async()=>{
  const mod=await import('../dist/game/shop-item-asset-audit.js');
  const audit=mod.auditShopItemAssets();
  assert.equal(audit.passed,true);
  assert.equal(audit.samples.length,25);
  assert.equal(audit.coverage,1);
  assert.equal(audit.uniqueCellCount,9);
  assert.equal(audit.motionAmplitude,0);
  assert.equal(audit.textFallbackPreserved,true);
  assert.equal(audit.offerLogicMutation,false);
  assert.equal(audit.snapshotSchemaMutation,false);
});
