import test from 'node:test';
import assert from 'node:assert/strict';
import { auditBossResponseCycleLatch } from '../dist/game/boss-response-cycle-latch-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1461 release freeze includes deterministic boss response cycle latch evidence',()=>{
  const latch=auditBossResponseCycleLatch();
  const freeze=auditReleaseFreeze();
  assert.equal(latch.passed,true);
  assert.equal(freeze.bossResponseCycleLatchPassed,true);
  assert.equal(freeze.bossResponseCycleLatchSamples,latch.samples.length);
});

test('phase 1462 candidate fails closed when cycle latch evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,bossResponseCycleLatchPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1462 candidate signature binds boss response cycle latch samples',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,bossResponseCycleLatchSamples:evidence.releaseFreeze.bossResponseCycleLatchSamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
