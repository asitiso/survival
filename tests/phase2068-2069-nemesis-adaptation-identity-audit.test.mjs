import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNemesisAdaptationIdentityAssets } from '../dist/game/endless/nemesis-adaptation-identity-asset-audit.js';

test('phase 2068-2069 nemesis identity audit locks 60 deterministic presentation gameplay and schema samples',()=>{
  const audit=auditNemesisAdaptationIdentityAssets();
  assert.equal(audit.samples.length,60); assert.equal(audit.adaptationCount,5); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,5);
  assert.equal(audit.learningToastCoverage,1); assert.equal(audit.bossRecallCoverage,1); assert.equal(audit.fallbackCoverage,1); assert.equal(audit.maxVisibleRecallIcons,3);
  assert.equal(audit.textFallbackPreserved,true); assert.equal(audit.imageLoadFailureNonBlocking,true); assert.equal(audit.iconMotionAmplitude,0);
  assert.equal(audit.rankContractMutation,false); assert.equal(audit.tieBreakMutation,false); assert.equal(audit.mirrorAffinityMutation,false); assert.equal(audit.modifierContractMutation,false); assert.equal(audit.actionCount,9); assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]); assert.equal(audit.passed,true);
});
