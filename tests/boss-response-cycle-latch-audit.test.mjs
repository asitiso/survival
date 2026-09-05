import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl=new URL('../dist/game/boss-response-cycle-latch-audit.js',import.meta.url);

test('phase 1455 deterministic cycle-latch audit covers all archetypes and cycle boundaries',async()=>{
  assert.equal(fs.existsSync(moduleUrl),true,'cycle latch audit module must exist');
  const { auditBossResponseCycleLatch }=await import(moduleUrl.href);
  const audit=auditBossResponseCycleLatch();
  assert.equal(audit.passed,true);
  assert.equal(audit.archetypeCount,6);
  assert.equal(audit.samples.length,25);
  assert.equal(audit.sameCycleRepromptRate,0);
  assert.equal(audit.nextCycleRepromptCoverage,1);
  assert.equal(audit.potionRescueCoverage,1);
  assert.equal(audit.actionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
});
