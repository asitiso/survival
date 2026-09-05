import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1952 release freeze binds deep-run decision identity evidence',()=>{
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.deepRunDecisionIdentityPassed,true);
  assert.equal(freeze.deepRunDecisionIdentitySamples,70);
  assert.equal(freeze.passed,true);
});

test('phase 1952 candidate fails closed on forged deep-run evidence and sample mutation changes signature',()=>{
  const base=releaseCandidateAudit();
  assert.equal(base.status,'PASS');
  const forged=structuredClone(base.evidence);
  forged.releaseFreeze.deepRunDecisionIdentityPassed=false;
  forged.releaseFreeze.passed=true;
  const rejected=releaseCandidateAudit(forged);
  assert.equal(rejected.status,'REVIEW');
  assert.ok(rejected.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence);
  changed.releaseFreeze.deepRunDecisionIdentitySamples+=1;
  assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
});
