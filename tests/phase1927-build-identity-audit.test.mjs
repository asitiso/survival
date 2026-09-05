import test from 'node:test';
import assert from 'node:assert/strict';
import { auditBuildIdentityAssets } from '../dist/game/build-identity-asset-audit.js';

test('phase 1927 build identity audit covers reward and persistent surfaces',()=>{
  const a=auditBuildIdentityAssets();
  assert.equal(a.samples.length,40); assert.equal(a.coverage,1); assert.equal(a.uniqueCellCount,20);
  assert.equal(a.rewardCoverage,1); assert.equal(a.persistentCoverage,1); assert.equal(a.motionAmplitude,0);
  assert.equal(a.textFallbackPreserved,true); assert.equal(a.actionCount,9); assert.equal(a.snapshotSchemaMutation,false); assert.equal(a.passed,true);
});
