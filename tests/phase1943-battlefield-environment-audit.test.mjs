import test from 'node:test';
import assert from 'node:assert/strict';
import { auditBattlefieldEnvironmentAssets } from '../dist/game/battlefield-environment-asset-audit.js';

test('Phase 1943 battlefield identity audit covers every map stage and persistent surface deterministically',()=>{
  const audit=auditBattlefieldEnvironmentAssets();
  assert.equal(audit.samples.length,45);
  assert.equal(audit.coverage,1);
  assert.equal(audit.uniqueCellCount,9);
  assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.surfaceCoverage,1);
  assert.equal(audit.motionAmplitude,0);
  assert.equal(audit.textFallbackPreserved,true);
  assert.equal(audit.imageLoadFailureNonBlocking,true);
  assert.equal(audit.actionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]);
  assert.equal(audit.passed,true);
});
