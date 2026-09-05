import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const freezeUrl=new URL('../dist/game/release-freeze-audit.js',import.meta.url);
const candidateUrl=new URL('../dist/game/release-candidate-audit.js',import.meta.url);

test('phase 2318 release freeze binds ascension tier pressure projection evidence',async()=>{
  assert.equal(fs.existsSync(freezeUrl),true);const {auditReleaseFreeze}=await import(freezeUrl.href);const f=auditReleaseFreeze();
  assert.equal(f.ascensionTierPressureProjectionIdentityAssetsPassed,true);assert.equal(f.ascensionTierPressureProjectionIdentityAssetsSamples,60);assert.equal(f.passed,true);
});

test('phase 2318 candidate fails closed on forged ascension tier pressure evidence and binds all sixty samples',async()=>{
  const {releaseCandidateAudit}=await import(candidateUrl.href);const base=releaseCandidateAudit();
  const forged=structuredClone(base.evidence);forged.releaseFreeze.ascensionTierPressureProjectionIdentityAssetsPassed=false;forged.releaseFreeze.passed=true;const bad=releaseCandidateAudit(forged);assert.equal(bad.status,'REVIEW');assert.ok(bad.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence);changed.releaseFreeze.ascensionTierPressureProjectionIdentityAssetsSamples+=1;const mutated=releaseCandidateAudit(changed);assert.notEqual(mutated.signature,base.signature);
  assert.match(base.markdown,/ascension-tier-pressure-projection-identity-assets safe \(60\)/);
});
