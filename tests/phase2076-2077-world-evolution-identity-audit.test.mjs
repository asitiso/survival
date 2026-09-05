import test from 'node:test';
import assert from 'node:assert/strict';
import { auditWorldEvolutionIdentityAssets } from '../dist/game/endless/world-evolution-identity-asset-audit.js';

test('phase 2076-2077 audits exactly sixty deterministic world evolution identity samples',()=>{
  const audit=auditWorldEvolutionIdentityAssets();
  assert.equal(audit.samples.length,60);
  assert.equal(audit.worldCount,5);
  assert.equal(audit.coverage,1);
  assert.equal(audit.uniqueCellCount,5);
  assert.equal(audit.toastCoverage,1);
  assert.equal(audit.activeRecallCoverage,1);
  assert.equal(audit.fallbackCoverage,1);
  assert.equal(audit.maxVisibleRecallIcons,1);
  assert.equal(audit.textFallbackPreserved,true);
  assert.equal(audit.imageLoadFailureNonBlocking,true);
  assert.equal(audit.iconMotionAmplitude,0);
  assert.equal(audit.evolutionTimingMutation,false);
  assert.equal(audit.weightedPickMutation,false);
  assert.equal(audit.nodeContractMutation,false);
  assert.equal(audit.modifierContractMutation,false);
  assert.equal(audit.actionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]);
  assert.equal(audit.passed,true);
});
