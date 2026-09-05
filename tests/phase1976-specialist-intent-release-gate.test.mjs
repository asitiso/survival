import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1976 release freeze binds specialist intent identity evidence',()=>{
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.specialistIntentIdentityAssetsPassed,true);
  assert.equal(freeze.specialistIntentIdentityAssetsSamples,60);
  assert.equal(freeze.passed,true);
});

test('phase 1976 candidate fails closed on forged specialist intent evidence and sample mutation changes signature',()=>{
  const base=releaseCandidateAudit();
  assert.equal(base.status,'PASS');
  const forged=structuredClone(base.evidence);
  forged.releaseFreeze.specialistIntentIdentityAssetsPassed=false;
  forged.releaseFreeze.passed=true;
  const rejected=releaseCandidateAudit(forged);
  assert.equal(rejected.status,'REVIEW');
  assert.ok(rejected.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence);
  changed.releaseFreeze.specialistIntentIdentityAssetsSamples+=1;
  assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
  assert.match(base.markdown,/specialist-intent-identity-assets safe \(60\)/);
});
