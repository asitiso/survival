import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const auditUrl=new URL('../dist/game/ascension-tier-pressure-projection-identity-audit.js',import.meta.url);

test('phase 2317 deterministic ascension tier pressure audit contains exactly sixty samples',async()=>{
  assert.equal(fs.existsSync(auditUrl),true,'ascension tier pressure audit module must exist');
  const {auditAscensionTierPressureProjectionIdentityAssets}=await import(auditUrl.href);const a=auditAscensionTierPressureProjectionIdentityAssets();
  assert.equal(a.samples.length,60);assert.equal(a.tierTransitionSamples,10);assert.equal(a.forecastWindowSamples,30);assert.equal(a.identityCount,7);assert.equal(a.actionCount,9);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);
});

test('phase 2317 audit covers all ten transitions all seven identities and three mutator thresholds',async()=>{
  const {auditAscensionTierPressureProjectionIdentityAssets}=await import(auditUrl.href);const a=auditAscensionTierPressureProjectionIdentityAssets();
  assert.equal(a.transitionCoverageComplete,true);assert.equal(a.identityCoverageComplete,true);assert.deepEqual(a.mutatorThresholds,[3,6,9]);assert.equal(a.tierCap,10);assert.equal(a.forecastWindowSeconds,90);
});
