import test from 'node:test';
import assert from 'node:assert/strict';
import { auditOpeningTenMinuteFlow } from '../dist/game/opening-ten-minute-flow-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 579 ten-minute flow combines AUTO upgrade shop and boss-prep evidence',()=>{
  const a=auditOpeningTenMinuteFlow();
  assert.ok(a.samples>=80);
  assert.equal(a.childAuditCount,4);
});
test('phase 580 opening flow keeps modeled combat-stat inflation at zero while reducing friction',()=>{
  const a=auditOpeningTenMinuteFlow();
  assert.equal(a.maxCombatStatInflation,0);
  assert.ok(a.estimatedPauseReduction>=0.35);
});
test('phase 581 ten-minute flow preserves actions and snapshot schema and passes release thresholds',()=>{
  const a=auditOpeningTenMinuteFlow();
  assert.equal(a.actionCount,9);
  assert.equal(a.snapshotMutation,false);
  assert.equal(a.passed,true);
});
test('phase 582 candidate fails closed when ten-minute opening flow health regresses',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,openingTenMinuteFlow:{...evidence.openingTenMinuteFlow,passed:false}};
  const audit=releaseCandidateAudit(broken);
  assert.equal(audit.status,'REVIEW');
  assert.ok(audit.issues.includes('opening-ten-minute-flow'));
});
