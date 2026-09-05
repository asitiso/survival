import test from 'node:test';
import assert from 'node:assert/strict';
import { auditMythicTacticIdentityAssets } from '../dist/game/endless/mythic-tactic-identity-asset-audit.js';

test('phase 2023 mythic tactic identity audit locks presentation and combat contracts with 60 deterministic samples',()=>{
  const audit=auditMythicTacticIdentityAssets();
  assert.equal(audit.samples.length,60); assert.equal(audit.tacticCount,6);
  assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,6); assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.rewardCoverage,1); assert.equal(audit.primedCoverage,1); assert.equal(audit.consumedCoverage,1); assert.equal(audit.fallbackCoverage,1);
  assert.equal(audit.textFallbackPreserved,true); assert.equal(audit.imageLoadFailureNonBlocking,true); assert.equal(audit.iconMotionAmplitude,0);
  assert.equal(audit.rewardContractMutation,false); assert.equal(audit.attackLinkMutation,false); assert.equal(audit.expiryConsumeMutation,false);
  assert.equal(audit.actionCount,9); assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]); assert.equal(audit.passed,true);
});
