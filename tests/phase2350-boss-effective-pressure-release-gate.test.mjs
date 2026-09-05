import test from 'node:test';
import assert from 'node:assert/strict';
const freezeUrl=new URL('../dist/game/release-freeze-audit.js',import.meta.url);
const candidateUrl=new URL('../dist/game/release-candidate-audit.js',import.meta.url);

test('phase 2350 release freeze binds final boss effective pressure evidence',async()=>{
  const {auditReleaseFreeze}=await import(freezeUrl.href);const f=auditReleaseFreeze();
  assert.equal(f.bossEffectivePressureProjectionIdentityPassed,true);assert.equal(f.bossEffectivePressureProjectionIdentitySamples,60);assert.equal(f.passed,true);
});

test('phase 2350 candidate fails closed on forged final boss pressure evidence and binds all sixty samples',async()=>{
  const {releaseCandidateAudit}=await import(candidateUrl.href);const base=releaseCandidateAudit();
  const forged=structuredClone(base.evidence);forged.releaseFreeze.bossEffectivePressureProjectionIdentityPassed=false;forged.releaseFreeze.passed=true;const bad=releaseCandidateAudit(forged);assert.equal(bad.status,'REVIEW');assert.ok(bad.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence);changed.releaseFreeze.bossEffectivePressureProjectionIdentitySamples+=1;assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
  assert.match(base.markdown,/boss-effective-pressure-projection-identity safe \(60\)/);
});
