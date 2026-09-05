import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const auditUrl=new URL('../dist/game/endless/boss-effective-pressure-projection-identity-audit.js',import.meta.url);

test('phase 2348-2349 final boss pressure audit contains exactly sixty deterministic samples',async()=>{
  assert.equal(fs.existsSync(auditUrl),true,'final boss pressure audit module must exist');
  const {auditBossEffectivePressureProjectionIdentity}=await import(auditUrl.href);const a=auditBossEffectivePressureProjectionIdentity();
  assert.equal(a.samples.length,60);assert.equal(a.effectIdentityCount,4);assert.equal(a.actionCount,9);assert.equal(a.maxPrimaryEffects,2);
  assert.equal(a.managerStateMutation,false);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayFormulaMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);
});

test('phase 2348-2349 audit proves atlas reuse full channel coverage and defensive applied-modifier reads',async()=>{
  const {auditBossEffectivePressureProjectionIdentity}=await import(auditUrl.href);const a=auditBossEffectivePressureProjectionIdentity();
  assert.equal(a.effectCoverageComplete,true);assert.equal(a.atlasReusePassed,true);assert.equal(a.defensiveReadPassed,true);assert.equal(a.neutralHiddenPassed,true);
});
