import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const url=new URL('../dist/game/fate-tradeoff-cumulative-identity-audit.js',import.meta.url);
test('phase 2229 audits exactly 60 deterministic fate tradeoff identity samples',async()=>{
  assert.equal(fs.existsSync(url),true,'fate tradeoff audit module must exist');
  const {auditFateTradeoffCumulativeIdentityAssets}=await import(url.href);const a=auditFateTradeoffCumulativeIdentityAssets();
  assert.equal(a.samples.length,60);assert.equal(a.benefitIdentityCount,4);assert.equal(a.costIdentityCount,5);assert.equal(a.benefitCoverage,1);assert.equal(a.costCoverage,1);assert.equal(a.benefitUniqueCellCount,4);assert.equal(a.costUniqueCellCount,5);
  assert.deepEqual(a.checkpoints,[360,720,1080]);assert.equal(a.actionCount,9);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);assert.equal(a.samples.every(s=>s.passed),true);
});
