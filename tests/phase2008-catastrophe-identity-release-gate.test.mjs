import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 2008 release freeze binds catastrophe identity evidence',()=>{
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.catastropheIdentityAssetsPassed,true); assert.equal(freeze.catastropheIdentityAssetsSamples,60); assert.equal(freeze.passed,true);
});

test('phase 2008 candidate fails closed on forged catastrophe evidence and sample mutation changes signature',()=>{
  const base=releaseCandidateAudit(); assert.equal(base.status,'PASS');
  const forged=structuredClone(base.evidence); forged.releaseFreeze.catastropheIdentityAssetsPassed=false; forged.releaseFreeze.passed=true;
  const rejected=releaseCandidateAudit(forged); assert.equal(rejected.status,'REVIEW'); assert.ok(rejected.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence); changed.releaseFreeze.catastropheIdentityAssetsSamples+=1;
  assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
  assert.match(base.markdown,/catastrophe-identity-assets safe \(60\)/);
});
