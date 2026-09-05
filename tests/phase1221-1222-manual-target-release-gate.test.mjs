import test from 'node:test';
import assert from 'node:assert/strict';
import { auditManualTargetStability } from '../dist/game/manual-target-stability-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1221 release freeze includes deterministic manual target stability evidence',()=>{
  const target=auditManualTargetStability();
  const freeze=auditReleaseFreeze();
  assert.equal(target.passed,true);
  assert.equal(freeze.manualTargetStabilityPassed,true);
  assert.equal(freeze.manualTargetStabilitySamples,target.samples);
});

test('phase 1222 candidate fails closed when manual target stability evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,manualTargetStabilityPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1222 candidate signature binds manual target stability samples',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,manualTargetStabilitySamples:evidence.releaseFreeze.manualTargetStabilitySamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
