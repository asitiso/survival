import test from 'node:test';
import assert from 'node:assert/strict';
import { auditMythicLastLawIdentityAssets } from '../dist/game/endless/mythic-last-law-identity-asset-audit.js';

test('phase 2015 mythic last law identity audit locks presentation contracts with 60 deterministic samples',()=>{
  const audit=auditMythicLastLawIdentityAssets();
  assert.equal(audit.samples.length,60); assert.equal(audit.lawCount,6);
  assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,6); assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.toastCoverage,1); assert.equal(audit.safeLaneCoverage,1); assert.equal(audit.fallbackCoverage,1);
  assert.equal(audit.textFallbackPreserved,true); assert.equal(audit.imageLoadFailureNonBlocking,true); assert.equal(audit.iconMotionAmplitude,0);
  assert.equal(audit.activationThresholdMutation,false); assert.equal(audit.modifierMutation,false); assert.equal(audit.safeZoneLifecycleMutation,false);
  assert.equal(audit.actionCount,9); assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]); assert.equal(audit.passed,true);
});
