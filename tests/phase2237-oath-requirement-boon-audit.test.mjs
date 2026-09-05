import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const url=new URL('../dist/game/oath-requirement-boon-identity-audit.js',import.meta.url);

test('phase 2237 audits exactly 60 deterministic oath requirement and boon samples',async()=>{
  assert.equal(fs.existsSync(url),true,'oath requirement/boon audit module must exist');
  const {auditOathRequirementBoonIdentityAssets}=await import(url.href);
  const a=auditOathRequirementBoonIdentityAssets();
  assert.equal(a.samples.length,60);
  assert.equal(a.requirementIdentityCount,6);assert.equal(a.boonIdentityCount,4);
  assert.equal(a.requirementCoverage,1);assert.equal(a.boonCoverage,1);
  assert.equal(a.requirementUniqueCellCount,6);assert.equal(a.boonUniqueCellCount,4);
  assert.deepEqual(a.milestones,[120,150,180,240,300,360]);
  assert.equal(a.actionCount,9);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayMutation,false);
  assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);assert.equal(a.samples.every(s=>s.passed),true);
});
