import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const auditUrl=new URL('../dist/game/battlefield-mechanic-projection-identity-audit.js',import.meta.url);

test('phase 2308 deterministic battlefield mechanic audit contains exactly sixty samples',async()=>{
  assert.equal(fs.existsSync(auditUrl),true,'battlefield mechanic audit module must exist');
  const {auditBattlefieldMechanicProjectionIdentityAssets}=await import(auditUrl.href);const a=auditBattlefieldMechanicProjectionIdentityAssets();
  assert.equal(a.samples.length,60);assert.equal(a.runtimeProjectionSamples,45);assert.equal(a.mapCount,3);assert.equal(a.mechanicIdentityCount,3);assert.equal(a.stageIdentityCount,3);assert.equal(a.actionCount,9);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);
});

test('phase 2309 audit covers all mechanics stages and both evolution transitions',async()=>{
  const {auditBattlefieldMechanicProjectionIdentityAssets}=await import(auditUrl.href);const a=auditBattlefieldMechanicProjectionIdentityAssets();
  assert.equal(a.mechanicCoverageComplete,true);assert.equal(a.stageCoverageComplete,true);assert.equal(a.evolutionTransitionsCovered,6);assert.deepEqual([...a.dominantMechanicsCovered].sort(),['crystal','slow','wall']);
});
