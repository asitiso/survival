import test from 'node:test';
import assert from 'node:assert/strict';
import { auditRelicResonanceRecallAssets } from '../dist/game/relic-resonance-recall-asset-audit.js';

test('phase 2055 relic resonance recall audit locks reused identity tier badge fallback gameplay and schema contracts with 60 deterministic samples',()=>{
  const audit=auditRelicResonanceRecallAssets();
  assert.equal(audit.samples.length,60); assert.equal(audit.relicCount,14); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,14); assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.toastCoverage,1); assert.equal(audit.stripBadgeCoverage,1); assert.equal(audit.fallbackCoverage,1); assert.equal(audit.tierBadgeCoverage,1);
  assert.equal(audit.textFallbackPreserved,true); assert.equal(audit.imageLoadFailureNonBlocking,true); assert.equal(audit.iconMotionAmplitude,0); assert.equal(audit.staleBadgeGuarded,true);
  assert.equal(audit.scoreContractMutation,false); assert.equal(audit.tierThresholdMutation,false); assert.equal(audit.modifierContractMutation,false);
  assert.equal(audit.actionCount,9); assert.equal(audit.snapshotSchemaMutation,false); assert.deepEqual(audit.issues,[]); assert.equal(audit.passed,true);
});
