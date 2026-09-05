import test from 'node:test';
import assert from 'node:assert/strict';
import { auditActionCueClarity } from '../dist/game/action-cue-clarity-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1501 release freeze includes deterministic action cue clarity evidence',()=>{
  const clarity=auditActionCueClarity();
  const freeze=auditReleaseFreeze();
  assert.equal(clarity.passed,true);
  assert.equal(freeze.actionCueClarityPassed,true);
  assert.equal(freeze.actionCueClaritySamples,clarity.samples.length);
});

test('phase 1502 candidate fails closed when action cue clarity evidence is inconsistent',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,actionCueClarityPassed:false,passed:true}};
  const result=releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1502 candidate signature binds action cue clarity sample count',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,actionCueClaritySamples:evidence.releaseFreeze.actionCueClaritySamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
