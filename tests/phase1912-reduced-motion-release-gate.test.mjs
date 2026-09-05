import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1912 release freeze binds reduced-motion accessibility evidence',()=>{
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.reducedMotionAccessibilityPassed,true);
  assert.equal(freeze.reducedMotionAccessibilitySamples,64);
  assert.equal(freeze.passed,true);
});

test('phase 1912 candidate fails closed when reduced motion evidence is forged',()=>{
  const base=releaseCandidateAudit();
  assert.equal(base.status,'PASS');
  const forged=structuredClone(base.evidence);
  forged.releaseFreeze.reducedMotionAccessibilityPassed=false;
  forged.releaseFreeze.passed=true;
  const review=releaseCandidateAudit(forged);
  assert.equal(review.status,'REVIEW');
  assert.ok(review.issues.includes('release-freeze'));
});

test('phase 1912 reduced motion sample count participates in candidate signature',()=>{
  const base=releaseCandidateAudit();
  const changed=structuredClone(base.evidence);
  changed.releaseFreeze.reducedMotionAccessibilitySamples+=1;
  const mutated=releaseCandidateAudit(changed);
  assert.notEqual(mutated.signature,base.signature);
});
