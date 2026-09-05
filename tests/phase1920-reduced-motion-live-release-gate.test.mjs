import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit, collectReleaseCandidateEvidence } from '../dist/game/release-candidate-audit.js';

test('phase 1920 release freeze binds reduced-motion live combat evidence',()=>{
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.reducedMotionLiveCombatPassed,true);
  assert.equal(freeze.reducedMotionLiveCombatSamples,80);
  assert.equal(freeze.actionCount,9);
  assert.equal(freeze.snapshotSchemaMutation,false);
});

test('phase 1920 candidate fails closed for forged live-combat evidence and signs sample count',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const baseline=releaseCandidateAudit(evidence);
  assert.equal(baseline.status,'PASS');
  const forged=structuredClone(evidence);
  forged.releaseFreeze.reducedMotionLiveCombatPassed=false;
  forged.releaseFreeze.passed=true;
  const rejected=releaseCandidateAudit(forged);
  assert.equal(rejected.status,'REVIEW');
  assert.ok(rejected.issues.includes('release-freeze'));
  const changed=structuredClone(evidence);
  changed.releaseFreeze.reducedMotionLiveCombatSamples+=1;
  changed.releaseFreeze.passed=true;
  const resigned=releaseCandidateAudit(changed);
  assert.notEqual(resigned.signature,baseline.signature);
});
