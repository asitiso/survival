import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1928 release freeze gates build identity assets',()=>{
  const f=auditReleaseFreeze(); assert.equal(f.buildIdentityAssetsPassed,true); assert.equal(f.buildIdentityAssetsSamples,40); assert.equal(f.passed,true);
});

test('phase 1928 candidate fails closed when build identity evidence is forged',()=>{
  const base=releaseCandidateAudit();
  const forged=structuredClone(base.evidence); forged.releaseFreeze.buildIdentityAssetsPassed=false; forged.releaseFreeze.passed=true;
  const next=releaseCandidateAudit(forged); assert.equal(next.ok,false); assert.equal(next.issues.includes('release-freeze'),true);
  const changed=structuredClone(base.evidence); changed.releaseFreeze.buildIdentityAssetsSamples+=1;
  assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
});
