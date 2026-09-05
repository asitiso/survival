import test from 'node:test';
import assert from 'node:assert/strict';

test('phase 1879 tactical status asset and attention audit passes 40 deterministic samples',async()=>{
  const {auditTacticalStatusAssets}=await import('../dist/game/tactical-status-asset-audit.js');
  const audit=auditTacticalStatusAssets();
  assert.equal(audit.passed,true,audit.issues.join(','));
  assert.equal(audit.samples.length,40);
  assert.equal(audit.iconCoverage,1);
  assert.equal(audit.uniqueCellCount,15);
  assert.equal(audit.maxMotionAmplitude,0.05);
  assert.equal(audit.reducedFlashMotionAmplitude,0);
  assert.equal(audit.suppressedCombatMotionAmplitude,0);
  assert.equal(audit.textFallbackPreserved,true);
  assert.equal(audit.gameplayMutation,false);
  assert.equal(audit.snapshotSchemaMutation,false);
});
