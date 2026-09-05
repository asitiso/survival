import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const auditUrl=new URL('../dist/game/catastrophe-transition-projection-identity-audit.js',import.meta.url);

test('phase 2324-2325 deterministic catastrophe transition audit contains exactly sixty samples',async()=>{
  assert.equal(fs.existsSync(auditUrl),true,'catastrophe transition audit module must exist');
  const {auditCatastropheTransitionProjectionIdentityAssets}=await import(auditUrl.href);const a=auditCatastropheTransitionProjectionIdentityAssets();
  assert.equal(a.samples.length,60);assert.equal(a.transitionSamples,20);assert.equal(a.forecastWindowSamples,15);assert.equal(a.identityCount,4);assert.equal(a.actionCount,9);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.gameplayMutation,false);assert.deepEqual(a.issues,[]);assert.equal(a.passed,true);
});

test('phase 2324-2325 audit covers all five rotation edges and all three outcome states',async()=>{
  const {auditCatastropheTransitionProjectionIdentityAssets}=await import(auditUrl.href);const a=auditCatastropheTransitionProjectionIdentityAssets();
  assert.equal(a.rotationCoverageComplete,true);assert.equal(a.identityCoverageComplete,true);assert.deepEqual(a.outcomeStates,['helpful','harmful','mixed']);assert.equal(a.startSeconds,1200);assert.equal(a.rotationSeconds,180);assert.equal(a.forecastWindowSeconds,60);
});
