import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLongRunOathRecallAssets } from '../dist/game/long-run-oath-recall-asset-audit.js';

test('phase 2043 oath recall audit locks reused identity lifecycle fallback gameplay and schema contracts with 60 deterministic samples',()=>{
  const audit=auditLongRunOathRecallAssets();
  assert.equal(audit.samples.length,60); assert.equal(audit.oathCount,6);
  assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,6); assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.startToastCoverage,1); assert.equal(audit.activeRecallCoverage,1); assert.equal(audit.outcomeToastCoverage,1); assert.equal(audit.fallbackCoverage,1); assert.equal(audit.maxVisibleRecallIcons,1);
  assert.equal(audit.textFallbackPreserved,true); assert.equal(audit.imageLoadFailureNonBlocking,true); assert.equal(audit.iconMotionAmplitude,0);
  assert.equal(audit.milestoneContractMutation,false); assert.equal(audit.recentChoiceContractMutation,false); assert.equal(audit.targetDeadlineContractMutation,false); assert.equal(audit.coreDamageFailureMutation,false); assert.equal(audit.boonModifierContractMutation,false);
  assert.equal(audit.actionCount,9); assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]); assert.equal(audit.passed,true);
});
