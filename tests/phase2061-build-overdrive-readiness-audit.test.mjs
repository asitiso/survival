import test from 'node:test';
import assert from 'node:assert/strict';
import { auditBuildOverdriveReadinessRecall } from '../dist/game/build-overdrive-recall-audit.js';

test('phase 2061 overdrive readiness audit locks 60 deterministic presentation gameplay and schema samples',()=>{
  const audit=auditBuildOverdriveReadinessRecall();
  assert.equal(audit.samples.length,60);
  assert.equal(audit.readinessCoverage,1); assert.equal(audit.activeCoverage,1); assert.equal(audit.compactCoverage,1); assert.equal(audit.fallbackCoverage,1);
  assert.equal(audit.segmentCoverage,1); assert.equal(audit.textFallbackPreserved,true); assert.equal(audit.imageLoadFailureNonBlocking,true); assert.equal(audit.motionAmplitude,0); assert.equal(audit.staleStateGuarded,true);
  assert.equal(audit.chargeContractMutation,false); assert.equal(audit.activationContractMutation,false); assert.equal(audit.modifierContractMutation,false); assert.equal(audit.actionCount,9); assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]); assert.equal(audit.passed,true);
});
