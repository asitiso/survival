import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const auditUrl=new URL('../dist/game/build-overdrive-effect-projection-identity-audit.js',import.meta.url);

test('phase 2300 deterministic build overdrive effect audit contains exactly sixty samples',async()=>{
  assert.equal(fs.existsSync(auditUrl),true,'build overdrive effect audit module must exist');
  const {auditBuildOverdriveEffectProjectionIdentityAssets}=await import(auditUrl.href);const a=auditBuildOverdriveEffectProjectionIdentityAssets();
  assert.equal(a.samples.length,60);assert.equal(a.runtimeProjectionSamples,48);assert.equal(a.archetypeCount,4);assert.equal(a.effectIdentityCount,7);assert.deepEqual([...a.archetypesCovered].sort(),['burst','cycle','domain','fortress']);assert.equal(a.actionCount,9);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);
});

test('phase 2301 audit proves active/inactive, compact helper and exact modifier coverage without mutating overdrive state',async()=>{
  const {auditBuildOverdriveEffectProjectionIdentityAssets}=await import(auditUrl.href);const a=auditBuildOverdriveEffectProjectionIdentityAssets();
  assert.equal(a.activeSeen,true);assert.equal(a.inactiveSeen,true);assert.equal(a.maxHudHelpers,2);assert.equal(a.stateMutation,false);assert.equal(a.effectCoverageComplete,true);
});
