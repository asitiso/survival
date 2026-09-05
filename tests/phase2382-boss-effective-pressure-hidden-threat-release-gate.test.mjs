import test from 'node:test';
import assert from 'node:assert/strict';
const freezeUrl=new URL('../dist/game/release-freeze-audit.js',import.meta.url);
const candidateUrl=new URL('../dist/game/release-candidate-audit.js',import.meta.url);

test('phase 2382 release freeze binds hidden-threat count evidence',async()=>{
  const {auditReleaseFreeze}=await import(freezeUrl.href);const f=auditReleaseFreeze();
  assert.equal(f.bossEffectivePressureHiddenThreatCountPassed,true);assert.equal(f.bossEffectivePressureHiddenThreatCountSamples,64);assert.equal(f.passed,true);
});

test('phase 2382 candidate fails closed on forged hidden-threat evidence and binds sixty-four samples',async()=>{
  const {releaseCandidateAudit}=await import(candidateUrl.href);const base=releaseCandidateAudit();
  const forged=structuredClone(base.evidence);forged.releaseFreeze.bossEffectivePressureHiddenThreatCountPassed=false;forged.releaseFreeze.passed=true;const bad=releaseCandidateAudit(forged);assert.equal(bad.status,'REVIEW');assert.ok(bad.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence);changed.releaseFreeze.bossEffectivePressureHiddenThreatCountSamples+=1;assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
  assert.match(base.markdown,/boss-effective-pressure-hidden-threat-count safe \(64\)/);
});
