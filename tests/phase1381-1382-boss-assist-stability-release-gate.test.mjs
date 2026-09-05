import test from 'node:test';
import assert from 'node:assert/strict';
import { auditBossAssistStability } from '../dist/game/boss-assist-stability-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1381 release freeze includes deterministic boss assist stability evidence',()=>{
  const stability=auditBossAssistStability();
  const freeze=auditReleaseFreeze();
  assert.equal(stability.passed,true);
  assert.equal(freeze.bossAssistStabilityPassed,true);
  assert.equal(freeze.bossAssistStabilitySamples,stability.samples.length);
});

test('phase 1382 candidate fails closed when boss assist stability evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,bossAssistStabilityPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1382 candidate signature binds boss assist stability samples',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,bossAssistStabilitySamples:evidence.releaseFreeze.bossAssistStabilitySamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
