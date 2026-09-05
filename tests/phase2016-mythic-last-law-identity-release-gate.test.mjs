import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 2016 release freeze binds mythic last law identity evidence',()=>{
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.mythicLastLawIdentityAssetsPassed,true); assert.equal(freeze.mythicLastLawIdentityAssetsSamples,60); assert.equal(freeze.passed,true);
});

test('phase 2016 candidate fails closed on forged Last Law evidence and sample mutation changes signature',()=>{
  const base=releaseCandidateAudit(); assert.equal(base.status,'PASS');
  const forged=structuredClone(base.evidence); forged.releaseFreeze.mythicLastLawIdentityAssetsPassed=false; forged.releaseFreeze.passed=true;
  const rejected=releaseCandidateAudit(forged); assert.equal(rejected.status,'REVIEW'); assert.ok(rejected.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence); changed.releaseFreeze.mythicLastLawIdentityAssetsSamples+=1;
  assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
  assert.match(base.markdown,/mythic-last-law-identity-assets safe \(60\)/);
});
