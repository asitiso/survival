import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const candidate=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');
const manifestScript=fs.readFileSync(new URL('../scripts/release-manifest.mjs',import.meta.url),'utf8');

test('phase 339-341 release candidate imports every precise tuning audit and explicit budget ceilings',()=>{
  assert.match(candidate,/openingThirtyTimetableAudit/);
  assert.match(candidate,/auditFirstSixBosses/);
  assert.match(candidate,/auditThermalRecoveryHysteresis/);
  assert.match(candidate,/auditLongRunEconomy/);
  assert.match(candidate,/enemyCeiling/);
  assert.match(candidate,/projectileCeiling/);
  assert.match(candidate,/effectCeiling/);
});

test('phase 342 production manifest passes the candidate budget summary through the existing candidate evidence seam',()=>{
  assert.match(manifestScript,/releaseCandidateBudgetSummary/);
  assert.match(manifestScript,/summary:/);
  assert.doesNotMatch(manifestScript,/baselineMutation:true/);
});
