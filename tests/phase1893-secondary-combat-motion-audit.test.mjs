import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const auditSourceUrl=new URL('../src/game/secondary-combat-motion-audit.ts',import.meta.url);

test('phase 1893 secondary combat motion audit exists and passes 48 deterministic samples',async()=>{
  assert.equal(fs.existsSync(auditSourceUrl),true,'secondary combat motion audit source must exist');
  const {auditSecondaryCombatMotion}=await import('../dist/game/secondary-combat-motion-audit.js');
  const audit=auditSecondaryCombatMotion();
  assert.equal(audit.passed,true,audit.issues.join(','));
  assert.equal(audit.samples.length,48);
  assert.equal(audit.maxAnimatedOwners,1);
  assert.equal(audit.maxMotionAmplitude,0.08);
  assert.equal(audit.reducedFlashMotionAmplitude,0);
  assert.equal(audit.suppressedCombatMotionAmplitude,0);
  assert.equal(audit.supplyIconReused,true);
  assert.equal(audit.visibilityPreserved,true);
  assert.equal(audit.actionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
});
