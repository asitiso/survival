import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 2070 release freeze binds nemesis adaptation identity evidence',()=>{
  const freeze=auditReleaseFreeze(); assert.equal(freeze.nemesisAdaptationIdentityAssetsPassed,true); assert.equal(freeze.nemesisAdaptationIdentityAssetsSamples,60); assert.equal(freeze.passed,true);
});

test('phase 2070 candidate fails closed on forged nemesis identity evidence and sample mutation changes signature',()=>{
  const base=releaseCandidateAudit(); assert.equal(base.status,'PASS');
  const forged=structuredClone(base.evidence); forged.releaseFreeze.nemesisAdaptationIdentityAssetsPassed=false; forged.releaseFreeze.passed=true;
  const rejected=releaseCandidateAudit(forged); assert.equal(rejected.status,'REVIEW'); assert.ok(rejected.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence); changed.releaseFreeze.nemesisAdaptationIdentityAssetsSamples+=1;
  assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
  assert.match(base.markdown,/nemesis-adaptation-identity-assets safe \(60\)/);
});
