import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const srcUrl=new URL('../src/game/boss-response-acknowledgement-audit.ts',import.meta.url);

test('phase 1415 boss response acknowledgement audit exists with 25 deterministic samples',async()=>{
  assert.equal(fs.existsSync(srcUrl),true);
  const { auditBossResponseAcknowledgement }=await import('../dist/game/boss-response-acknowledgement-audit.js');
  const audit=auditBossResponseAcknowledgement();
  assert.equal(audit.archetypeCount,6);
  assert.equal(audit.samples.length,25);
});

test('phase 1416 acknowledgement and queued intent coverage remain complete',async()=>{
  const { auditBossResponseAcknowledgement }=await import('../dist/game/boss-response-acknowledgement-audit.js');
  const audit=auditBossResponseAcknowledgement();
  assert.equal(audit.acknowledgementCoverage,1);
  assert.equal(audit.alternativeResponseCoverage,1);
  assert.equal(audit.queuedCueCoverage,1);
});

test('phase 1417 potion emergency and window reset remain complete',async()=>{
  const { auditBossResponseAcknowledgement }=await import('../dist/game/boss-response-acknowledgement-audit.js');
  const audit=auditBossResponseAcknowledgement();
  assert.equal(audit.potionRescueCoverage,1);
  assert.equal(audit.windowResetCoverage,1);
  assert.equal(audit.queuedCancelRepromptCoverage,1);
});

test('phase 1420 audit freezes actions and snapshot schema',async()=>{
  const { auditBossResponseAcknowledgement }=await import('../dist/game/boss-response-acknowledgement-audit.js');
  const audit=auditBossResponseAcknowledgement();
  assert.equal(audit.actionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
  assert.equal(audit.passed,true);
  assert.deepEqual(audit.issues,[]);
});
