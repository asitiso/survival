import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('phase 1901 residual combat motion audit locks 48 deterministic samples',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/residual-combat-motion-audit.ts',import.meta.url)),true);
  const {auditResidualCombatMotion}=await import('../dist/game/residual-combat-motion-audit.js');
  const audit=auditResidualCombatMotion();
  assert.equal(audit.passed,true,audit.issues.join(','));
  assert.equal(audit.samples.length,48);
  assert.equal(audit.maxAnimatedResidualOwners,1);
  assert.equal(audit.reducedFlashMotionAmplitude,0);
  assert.equal(audit.suppressedCombatMotionAmplitude,0);
  assert.equal(audit.screenEffectReducedFlashScaleDelta,0);
  assert.equal(audit.actionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
});
