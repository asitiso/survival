import test from 'node:test';
import assert from 'node:assert/strict';
import { auditRunContractBoonRecallAssets } from '../dist/game/run-contract-boon-recall-asset-audit.js';

test('phase 2049 run contract boon recall audit locks reused identity lifecycle fallback gameplay and schema contracts with 60 deterministic samples',()=>{
  const audit=auditRunContractBoonRecallAssets();
  assert.equal(audit.samples.length,60); assert.equal(audit.contractCount,5); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,5); assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.acceptToastCoverage,1); assert.equal(audit.successToastCoverage,1); assert.equal(audit.failureToastCoverage,1); assert.equal(audit.activeBoonCoverage,1); assert.equal(audit.fallbackCoverage,1); assert.equal(audit.maxVisibleBoonIcons,1);
  assert.equal(audit.countdownCoverage,1); assert.equal(audit.textFallbackPreserved,true); assert.equal(audit.imageLoadFailureNonBlocking,true); assert.equal(audit.iconMotionAmplitude,0);
  assert.equal(audit.offerScheduleMutation,false); assert.equal(audit.offerChoiceMutation,false); assert.equal(audit.failureContractMutation,false); assert.equal(audit.boonDurationMutation,false); assert.equal(audit.modifierContractMutation,false); assert.equal(audit.expiryContractMutation,false);
  assert.equal(audit.actionCount,9); assert.equal(audit.snapshotSchemaMutation,false); assert.deepEqual(audit.issues,[]); assert.equal(audit.passed,true);
});
