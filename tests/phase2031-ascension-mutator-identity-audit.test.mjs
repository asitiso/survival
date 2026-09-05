import test from 'node:test';
import assert from 'node:assert/strict';
import { auditAscensionMutatorIdentityAssets } from '../dist/game/endless/ascension-mutator-identity-asset-audit.js';

test('phase 2031 ascension mutator identity audit locks presentation tier rng runtime and schema contracts with 60 deterministic samples',()=>{
  const audit=auditAscensionMutatorIdentityAssets();
  assert.equal(audit.samples.length,60); assert.equal(audit.mutatorCount,4);
  assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,4); assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.toastCoverage,1); assert.equal(audit.activeRecallCoverage,1); assert.equal(audit.fallbackCoverage,1); assert.equal(audit.maxVisibleRecallIcons,3);
  assert.equal(audit.textFallbackPreserved,true); assert.equal(audit.imageLoadFailureNonBlocking,true); assert.equal(audit.iconMotionAmplitude,0);
  assert.equal(audit.tierContractMutation,false); assert.equal(audit.rngContractMutation,false); assert.equal(audit.runtimeModifierMutation,false);
  assert.equal(audit.actionCount,9); assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]); assert.equal(audit.passed,true);
});
