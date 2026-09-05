import test from 'node:test';
import assert from 'node:assert/strict';
import { auditBossWeakpointIdentityAssets } from '../dist/game/boss-weakpoint-identity-asset-audit.js';

test('phase 1983 boss weakpoint identity audit locks visual identity and frozen encounter contracts',()=>{
  const audit=auditBossWeakpointIdentityAssets();
  assert.equal(audit.samples.length,60);
  assert.equal(audit.nodeKindCount,6);
  assert.equal(audit.coverage,1);
  assert.equal(audit.uniqueCellCount,6);
  assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.bodyCoverage,1);
  assert.equal(audit.primaryWeakpointCoverage,1);
  assert.equal(audit.textFallbackPreserved,true);
  assert.equal(audit.imageLoadFailureNonBlocking,true);
  assert.equal(audit.motionAmplitude,0);
  assert.equal(audit.nodeRadiusMutation,false);
  assert.equal(audit.nodeHpMutation,false);
  assert.equal(audit.modifierMutation,false);
  assert.equal(audit.autoWeakpointContractMutation,false);
  assert.equal(audit.actionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]);
  assert.equal(audit.passed,true);
  assert.equal(audit.samples.every(sample=>sample.passed),true);
});
