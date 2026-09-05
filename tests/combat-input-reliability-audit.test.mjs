import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const moduleUrl=new URL('../dist/game/combat-input-reliability-audit.js',import.meta.url);

async function loadAudit(){
  assert.equal(fs.existsSync(fileURLToPath(moduleUrl)),true,'combat input reliability audit module should exist');
  return import(moduleUrl.href);
}

test('phase 1175 combat input reliability audit is deterministic and passes',async()=>{
  const { auditCombatInputReliability }=await loadAudit();
  const first=auditCombatInputReliability();
  const second=auditCombatInputReliability();
  assert.deepEqual(second,first);
  assert.equal(first.passed,true);
  assert.deepEqual(first.issues,[]);
});

test('phase 1176 audit covers all six cast actions across early exact and outside-window timing',async()=>{
  const { auditCombatInputReliability }=await loadAudit();
  const audit=auditCombatInputReliability();
  assert.equal(audit.castActionCount,6);
  assert.equal(audit.timingSamples,18);
  assert.equal(audit.windowSeconds,0.20);
  assert.equal(audit.timingPassed,true);
});

test('phase 1177-1178 audit proves duplicate coalescing exactly-once manual priority and lifecycle clear',async()=>{
  const { auditCombatInputReliability }=await loadAudit();
  const audit=auditCombatInputReliability();
  assert.equal(audit.duplicateCoalescingPassed,true);
  assert.equal(audit.exactlyOncePassed,true);
  assert.equal(audit.manualPriorityPassed,true);
  assert.equal(audit.lifecycleClearPassed,true);
  assert.equal(audit.samples,25);
});

test('phase 1179-1180 audit freezes action snapshot economy damage cooldown and AUTO throughput invariants',async()=>{
  const { auditCombatInputReliability }=await loadAudit();
  const audit=auditCombatInputReliability();
  assert.equal(audit.actionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
  assert.equal(audit.economyMutation,false);
  assert.equal(audit.damageMutation,false);
  assert.equal(audit.cooldownMutation,false);
  assert.equal(audit.autoThroughputMutation,false);
});
