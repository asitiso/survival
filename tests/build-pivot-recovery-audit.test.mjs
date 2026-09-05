import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPivotRecoverySamples, auditBuildPivotRecovery } from '../dist/game/build-pivot-recovery-audit.js';

test('phase 403 pivot recovery scores four one-axis alternatives for every hero threat and progression checkpoint',()=>{
  const samples=buildPivotRecoverySamples();
  assert.equal(samples.length,144);
  assert.deepEqual(new Set(samples.map((sample)=>sample.axis)),new Set(['relic','fusion','finalForm','archetype']));
  assert.deepEqual(new Set(samples.map((sample)=>sample.minute)),new Set([30,60,120]));
  assert.ok(samples.every((sample)=>sample.referenceScore>0&&sample.pivotScore>0));
});

test('phase 404 a one-axis pivot keeps most of the reference completed-build value',()=>{
  const audit=auditBuildPivotRecovery();
  assert.ok(audit.minRecoveryRatio>=0.78);
  assert.ok(audit.maxRecoveryLoss<=0.22);
  assert.equal(audit.deadPivotCount,0);
});

test('phase 405 pivot recovery stays fair across heroes and does not get worse with threat',()=>{
  const audit=auditBuildPivotRecovery();
  assert.ok(audit.maxHeroRecoverySpread<=1.18);
  assert.equal(audit.threatParity,true);
});

test('phase 406 build pivot recovery audit passes release bounds',()=>{
  assert.equal(auditBuildPivotRecovery().passed,true);
});
