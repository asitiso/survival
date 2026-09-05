import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/combat-attention-arbitration-audit.js',import.meta.url);

test('phase 1535 deterministic combat attention audit locks one-primary warning and preserved response visibility',async()=>{
  assert.equal(fs.existsSync(moduleUrl),true,'combat attention arbitration audit module must exist');
  const { auditCombatAttentionArbitration }=await import(moduleUrl.href);
  const audit=auditCombatAttentionArbitration();
  assert.equal(audit.passed,true);
  assert.equal(audit.samples.length,25);
  assert.ok(audit.maxAnimatedPrimaryWarnings<=1);
  assert.equal(audit.bossResponseVisibilityRate,1);
  assert.equal(audit.criticalDuplicateAssistTextCount,0);
  assert.equal(audit.reducedFlashMotionAmplitude,0);
  assert.ok(audit.minProjectileCues>=1);
  assert.equal(audit.reachableActionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
});
