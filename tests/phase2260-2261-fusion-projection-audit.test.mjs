import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const url=new URL('../dist/game/fusion-projection-identity-audit.js',import.meta.url);

test('phase 2260-2261 audits exactly 60 deterministic fusion projection samples and frozen contracts',async()=>{
  assert.equal(fs.existsSync(url),true,'fusion projection audit module must exist');
  const {auditFusionProjectionIdentityAssets}=await import(url.href);const a=auditFusionProjectionIdentityAssets();
  assert.equal(a.samples.length,60);assert.equal(a.modifierIdentityCount,7);assert.equal(a.relationIdentityCount,2);
  assert.equal(a.modifierCoverage,1);assert.equal(a.relationCoverage,1);assert.equal(a.modifierUniqueCellCount,7);assert.equal(a.relationUniqueCellCount,2);
  assert.equal(a.fusionDefinitionCount,6);assert.equal(a.uniquePairCount,6);assert.equal(a.minimumComponentLevel,10);assert.equal(a.maxFusions,2);assert.equal(a.oneSlotCandidateCount,5);assert.equal(a.actionCount,9);
  assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);assert.equal(a.samples.every(s=>s.passed),true);
});
