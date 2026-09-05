import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const url=new URL('../dist/game/boss-reward-impact-projection-identity-audit.js',import.meta.url);

test('phase 2276-2277 audits exactly 60 deterministic boss reward impact samples and frozen contracts',async()=>{
  assert.equal(fs.existsSync(url),true,'boss reward impact projection audit module must exist');
  const {auditBossRewardImpactProjectionIdentityAssets}=await import(url.href);const a=auditBossRewardImpactProjectionIdentityAssets();
  assert.equal(a.samples.length,60);assert.equal(a.roleIdentityCount,5);assert.equal(a.roleCoverage,1);assert.equal(a.roleUniqueCellCount,5);assert.equal(a.heroCount,4);assert.equal(a.scenarioCount,4);assert.equal(a.generatedChoiceSamples,48);assert.deepEqual(a.roleIds,['offense','survival','growth','economy','pivot']);assert.equal(a.actionCount,9);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);assert.equal(a.samples.every(s=>s.passed),true);
});
