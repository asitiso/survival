import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFatePathRecallAssets } from '../dist/game/fate-path-recall-asset-audit.js';

test('phase 2037 fate recall audit locks reuse selection order fallback gameplay and schema contracts with 60 deterministic samples',()=>{
  const audit=auditFatePathRecallAssets();
  assert.equal(audit.samples.length,60); assert.equal(audit.fateCount,3);
  assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,3); assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.toastCoverage,1); assert.equal(audit.activeRecallCoverage,1); assert.equal(audit.fallbackCoverage,1); assert.equal(audit.maxVisibleRecallIcons,3);
  assert.equal(audit.selectionOrderPreserved,true); assert.equal(audit.duplicateSelectionPreserved,true);
  assert.equal(audit.textFallbackPreserved,true); assert.equal(audit.imageLoadFailureNonBlocking,true); assert.equal(audit.iconMotionAmplitude,0);
  assert.equal(audit.checkpointContractMutation,false); assert.equal(audit.modifierContractMutation,false);
  assert.equal(audit.actionCount,9); assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]); assert.equal(audit.passed,true);
});
