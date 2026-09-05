import test from 'node:test';
import assert from 'node:assert/strict';

test('phase 1870 combined decision choice asset audit passes 32 deterministic samples', async()=>{
  const {auditDecisionChoiceAssets}=await import('../dist/game/decision-choice-asset-audit.js');
  const audit=auditDecisionChoiceAssets();
  assert.equal(audit.passed,true,audit.issues.join(','));
  assert.equal(audit.samples.length,32);
  assert.equal(audit.pathCoverage,1);
  assert.equal(audit.growthCoverage,1);
  assert.equal(audit.motionAmplitude,0);
  assert.equal(audit.textFallbackPreserved,true);
  assert.equal(audit.choiceLogicMutation,false);
  assert.equal(audit.snapshotSchemaMutation,false);
});
