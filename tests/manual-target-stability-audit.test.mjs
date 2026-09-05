import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const moduleUrl=new URL('../dist/game/manual-target-stability-audit.js',import.meta.url);
async function loadAudit(){
  assert.equal(fs.existsSync(fileURLToPath(moduleUrl)),true,'manual target stability audit module should exist');
  return import(moduleUrl.href);
}

test('phase 1215 manual target stability audit is deterministic and passes',async()=>{
  const { auditManualTargetStability }=await loadAudit();
  const first=auditManualTargetStability();
  const second=auditManualTargetStability();
  assert.deepEqual(second,first);
  assert.equal(first.passed,true);
  assert.deepEqual(first.issues,[]);
});

test('phase 1216-1218 audit covers stickiness priority override release buffer and AUTO isolation',async()=>{
  const { auditManualTargetStability }=await loadAudit();
  const audit=auditManualTargetStability();
  assert.equal(audit.sameTierSamples,4);
  assert.equal(audit.priorityOverrideSamples,3);
  assert.equal(audit.releaseSamples,5);
  assert.equal(audit.bufferedCastSamples,6);
  assert.equal(audit.autoIsolationSamples,2);
  assert.equal(audit.sameTierPassed,true);
  assert.equal(audit.priorityOverridePassed,true);
  assert.equal(audit.releasePassed,true);
  assert.equal(audit.bufferedCastPassed,true);
  assert.equal(audit.autoIsolationPassed,true);
});

test('phase 1219-1220 audit freezes action snapshot economy damage cooldown and AUTO throughput invariants',async()=>{
  const { auditManualTargetStability }=await loadAudit();
  const audit=auditManualTargetStability();
  assert.equal(audit.samples,25);
  assert.equal(audit.actionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
  assert.equal(audit.economyMutation,false);
  assert.equal(audit.damageMutation,false);
  assert.equal(audit.cooldownMutation,false);
  assert.equal(audit.autoThroughputMutation,false);
});
