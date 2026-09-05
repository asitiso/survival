import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const freezeUrl=new URL('../dist/game/release-freeze-audit.js',import.meta.url);
const candidateUrl=new URL('../dist/game/release-candidate-audit.js',import.meta.url);

test('phase 2310 release freeze binds battlefield mechanic projection evidence',async()=>{
  assert.equal(fs.existsSync(freezeUrl),true);const {auditReleaseFreeze}=await import(freezeUrl.href);const f=auditReleaseFreeze();
  assert.equal(f.battlefieldMechanicProjectionIdentityAssetsPassed,true);assert.equal(f.battlefieldMechanicProjectionIdentityAssetsSamples,60);assert.equal(f.passed,true);
});

test('phase 2310 candidate fails closed on forged battlefield mechanic evidence and binds all sixty samples',async()=>{
  const {releaseCandidateAudit}=await import(candidateUrl.href);const base=releaseCandidateAudit();
  const forged=structuredClone(base.evidence);forged.releaseFreeze.battlefieldMechanicProjectionIdentityAssetsPassed=false;forged.releaseFreeze.passed=true;const bad=releaseCandidateAudit(forged);assert.equal(bad.status,'REVIEW');assert.ok(bad.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence);changed.releaseFreeze.battlefieldMechanicProjectionIdentityAssetsSamples+=1;const mutated=releaseCandidateAudit(changed);assert.notEqual(mutated.signature,base.signature);
  assert.match(base.markdown,/battlefield-mechanic-projection-identity-assets safe \(60\)/);
});
