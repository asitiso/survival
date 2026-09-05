import test from 'node:test';
import assert from 'node:assert/strict';
import { auditBossResponseAcknowledgement } from '../dist/game/boss-response-acknowledgement-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1421 release freeze includes deterministic boss response acknowledgement evidence',()=>{
  const ack=auditBossResponseAcknowledgement();
  const freeze=auditReleaseFreeze();
  assert.equal(ack.passed,true);
  assert.equal(freeze.bossResponseAcknowledgementPassed,true);
  assert.equal(freeze.bossResponseAcknowledgementSamples,ack.samples.length);
});

test('phase 1422 candidate fails closed when boss response acknowledgement evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,bossResponseAcknowledgementPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1422 candidate signature binds boss response acknowledgement samples',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,bossResponseAcknowledgementSamples:evidence.releaseFreeze.bossResponseAcknowledgementSamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
