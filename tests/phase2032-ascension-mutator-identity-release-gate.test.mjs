import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 2032 release freeze binds ascension mutator identity evidence',()=>{
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.ascensionMutatorIdentityAssetsPassed,true); assert.equal(freeze.ascensionMutatorIdentityAssetsSamples,60); assert.equal(freeze.passed,true);
});

test('phase 2032 candidate fails closed on forged mutator evidence and sample mutation changes signature',()=>{
  const base=releaseCandidateAudit(); assert.equal(base.status,'PASS');
  const forged=structuredClone(base.evidence); forged.releaseFreeze.ascensionMutatorIdentityAssetsPassed=false; forged.releaseFreeze.passed=true;
  const rejected=releaseCandidateAudit(forged); assert.equal(rejected.status,'REVIEW'); assert.ok(rejected.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence); changed.releaseFreeze.ascensionMutatorIdentityAssetsSamples+=1;
  assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
  assert.match(base.markdown,/ascension-mutator-identity-assets safe \(60\)/);
});
