import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const freezeUrl=new URL('../dist/game/release-freeze-audit.js',import.meta.url);
const candidateUrl=new URL('../dist/game/release-candidate-audit.js',import.meta.url);

test('phase 2254 release freeze binds hero ascension projection identity evidence',async()=>{
  assert.equal(fs.existsSync(freezeUrl),true);const {auditReleaseFreeze}=await import(freezeUrl.href);const f=auditReleaseFreeze();
  assert.equal(f.heroAscensionProjectionIdentityAssetsPassed,true);assert.equal(f.heroAscensionProjectionIdentityAssetsSamples,60);assert.equal(f.passed,true);
});

test('phase 2254 candidate fails closed on forged hero ascension projection evidence and binds the sample count',async()=>{
  const {releaseCandidateAudit}=await import(candidateUrl.href);const base=releaseCandidateAudit();
  const forged=structuredClone(base.evidence);forged.releaseFreeze.heroAscensionProjectionIdentityAssetsPassed=false;forged.releaseFreeze.passed=true;
  const bad=releaseCandidateAudit(forged);assert.equal(bad.status,'REVIEW');assert.ok(bad.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence);changed.releaseFreeze.heroAscensionProjectionIdentityAssetsSamples+=1;
  const mutated=releaseCandidateAudit(changed);assert.notEqual(mutated.signature,base.signature);
  assert.match(base.markdown,/hero-ascension-projection-identity-assets safe \(60\)/);
});
