import test from 'node:test';
import assert from 'node:assert/strict';
import { auditCriticalDangerHysteresis } from '../dist/game/critical-danger-hysteresis-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1581 release freeze includes deterministic critical danger hysteresis evidence',()=>{
  const danger=auditCriticalDangerHysteresis();
  const freeze=auditReleaseFreeze();
  assert.equal(danger.passed,true);
  assert.equal(freeze.criticalDangerHysteresisPassed,true);
  assert.equal(freeze.criticalDangerHysteresisSamples,danger.samples.length);
});

test('phase 1582 candidate fails closed when critical danger hysteresis evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,criticalDangerHysteresisPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1582 candidate signature binds critical danger hysteresis sample count',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,criticalDangerHysteresisSamples:evidence.releaseFreeze.criticalDangerHysteresisSamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
