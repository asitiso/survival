import test from 'node:test';
import assert from 'node:assert/strict';
import { auditDecisionContinuity } from '../dist/game/decision-continuity-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1141 release freeze includes deterministic decision continuity evidence',()=>{
  const decision=auditDecisionContinuity();
  const freeze=auditReleaseFreeze();
  assert.equal(decision.passed,true);
  assert.equal(freeze.decisionContinuityPassed,true);
  assert.equal(freeze.decisionContinuitySamples,decision.samples);
});

test('phase 1142 candidate fails closed when decision continuity evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,decisionContinuityPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1142 candidate signature binds decision continuity samples',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,decisionContinuitySamples:evidence.releaseFreeze.decisionContinuitySamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
