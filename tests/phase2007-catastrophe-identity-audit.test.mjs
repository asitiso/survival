import test from 'node:test';
import assert from 'node:assert/strict';
import { auditCatastropheIdentityAssets } from '../dist/game/catastrophe-identity-asset-audit.js';

test('phase 2007 catastrophe identity audit locks presentation contracts with 60 deterministic samples',()=>{
  const audit=auditCatastropheIdentityAssets();
  assert.equal(audit.samples.length,60); assert.equal(audit.catastropheCount,5);
  assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,5); assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.iconCoverage,1); assert.equal(audit.rotationCoverage,1); assert.equal(audit.fallbackCoverage,1);
  assert.equal(audit.textFallbackPreserved,true); assert.equal(audit.imageLoadFailureNonBlocking,true); assert.equal(audit.iconMotionAmplitude,0);
  assert.equal(audit.catastropheTimingMutation,false); assert.equal(audit.catastropheModifierMutation,false);
  assert.equal(audit.actionCount,9); assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]); assert.equal(audit.passed,true);
});
