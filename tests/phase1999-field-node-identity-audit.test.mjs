import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFieldNodeIdentityAssets } from '../dist/game/field-node-identity-asset-audit.js';

test('phase 1999 field node identity audit locks presentation contracts with 60 deterministic samples',()=>{
  const audit=auditFieldNodeIdentityAssets();
  assert.equal(audit.samples.length,60); assert.equal(audit.nodeKindCount,5);
  assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,5); assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.bodyCoverage,1); assert.equal(audit.presentationCoverage,1); assert.equal(audit.fallbackCoverage,1);
  assert.equal(audit.textFallbackPreserved,true); assert.equal(audit.imageLoadFailureNonBlocking,true); assert.equal(audit.iconMotionAmplitude,0);
  assert.equal(audit.fieldNodeGameplayMutation,false); assert.equal(audit.worldEvolutionMutation,false);
  assert.equal(audit.actionCount,9); assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]); assert.equal(audit.passed,true);
});
