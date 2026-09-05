import test from 'node:test';
import assert from 'node:assert/strict';
import { auditActionHoldReliability } from '../dist/game/action-hold-reliability-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1261 release freeze includes deterministic action hold reliability evidence',()=>{
  const hold=auditActionHoldReliability();
  const freeze=auditReleaseFreeze();
  assert.equal(hold.passed,true);
  assert.equal(freeze.actionHoldReliabilityPassed,true);
  assert.equal(freeze.actionHoldReliabilitySamples,hold.samples);
});

test('phase 1262 candidate fails closed when action hold reliability evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,actionHoldReliabilityPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1262 candidate signature binds action hold reliability samples',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,actionHoldReliabilitySamples:evidence.releaseFreeze.actionHoldReliabilitySamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
