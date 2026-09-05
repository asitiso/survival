import test from 'node:test';
import assert from 'node:assert/strict';
import { auditDamageSourceIdentityAssets } from '../dist/game/damage-source-identity-asset-audit.js';

test('phase 1991 damage source identity audit locks presentation and damage-reason contracts with 60 samples',()=>{
  const audit=auditDamageSourceIdentityAssets();
  assert.equal(audit.samples.length,60);
  assert.equal(audit.sourceCount,5);
  assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,5); assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.cueCoverage,1); assert.equal(audit.severityCoverage,1);
  assert.equal(audit.repeatedSourceMergeCoverage,1); assert.equal(audit.sourceSwitchDensityGuardCoverage,1);
  assert.equal(audit.textFallbackPreserved,true); assert.equal(audit.imageLoadFailureNonBlocking,true); assert.equal(audit.motionAmplitude,0);
  assert.equal(audit.damageThresholdMutation,false); assert.equal(audit.dwellTimeMutation,false); assert.equal(audit.densityGuardMutation,false); assert.equal(audit.damageAmountMutation,false);
  assert.equal(audit.actionCount,9); assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]); assert.equal(audit.passed,true);
});
