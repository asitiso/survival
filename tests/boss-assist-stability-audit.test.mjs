import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const srcUrl=new URL('../src/game/boss-assist-stability-audit.ts',import.meta.url);

test('phase 1375 boss assist stability audit exists and covers all six archetypes',async()=>{
  assert.equal(fs.existsSync(srcUrl),true);
  const { auditBossAssistStability }=await import('../dist/game/boss-assist-stability-audit.js');
  const audit=auditBossAssistStability();
  assert.equal(audit.archetypeCount,6);
  assert.equal(audit.samples.length,25);
});

test('phase 1376 stable assist reduces recommendation switching without reducing response coverage',async()=>{
  const { auditBossAssistStability }=await import('../dist/game/boss-assist-stability-audit.js');
  const audit=auditBossAssistStability();
  assert.ok(audit.stableSwitchCount<audit.baselineSwitchCount);
  assert.equal(audit.responseCoverage,1);
});

test('phase 1377 potion rescue and window reset remain complete',async()=>{
  const { auditBossAssistStability }=await import('../dist/game/boss-assist-stability-audit.js');
  const audit=auditBossAssistStability();
  assert.equal(audit.potionRescueCoverage,1);
  assert.equal(audit.windowResetCoverage,1);
});

test('phase 1380 audit freezes action count and snapshot schema',async()=>{
  const { auditBossAssistStability }=await import('../dist/game/boss-assist-stability-audit.js');
  const audit=auditBossAssistStability();
  assert.equal(audit.actionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
  assert.equal(audit.passed,true);
  assert.deepEqual(audit.issues,[]);
});
