import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSpecialistIntentIdentityAssets } from '../dist/game/specialist-intent-identity-asset-audit.js';

test('phase 1975 specialist intent identity audit locks presentation and frozen gameplay invariants',()=>{
  const audit=auditSpecialistIntentIdentityAssets();
  assert.equal(audit.samples.length,60);
  assert.equal(audit.specialistCount,6);
  assert.equal(audit.coverage,1);
  assert.equal(audit.uniqueCellCount,6);
  assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.onBodyCoverage,1);
  assert.equal(audit.autoTargetCoverage,1);
  assert.equal(audit.activeStateAccuracy,1);
  assert.equal(audit.edgeClampCoverage,1);
  assert.equal(audit.overlapPolicyViolations,0);
  assert.equal(audit.legacyFallbackPreserved,true);
  assert.equal(audit.imageLoadFailureNonBlocking,true);
  assert.equal(audit.motionAmplitude,0);
  assert.equal(audit.specialistGameplayMutation,false);
  assert.equal(audit.autoTargetContractMutation,false);
  assert.equal(audit.enemyGeometryMutation,false);
  assert.equal(audit.actionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]);
  assert.equal(audit.passed,true);
  assert.equal(audit.samples.every(sample=>sample.passed),true);
});
