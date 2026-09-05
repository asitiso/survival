import test from 'node:test';
import assert from 'node:assert/strict';
const freezeUrl=new URL('../dist/game/release-freeze-audit.js',import.meta.url);
const candidateUrl=new URL('../dist/game/release-candidate-audit.js',import.meta.url);

test('phase 2374 release freeze binds boss pressure multi-threat evidence',async()=>{
  const {auditReleaseFreeze}=await import(freezeUrl.href);const f=auditReleaseFreeze();
  assert.equal(f.bossEffectivePressureMultiThreatPriorityPassed,true);assert.equal(f.bossEffectivePressureMultiThreatPrioritySamples,64);assert.equal(f.passed,true);
});

test('phase 2374 candidate fails closed on forged multi-threat evidence and binds all sixty-four samples',async()=>{
  const {releaseCandidateAudit}=await import(candidateUrl.href);const base=releaseCandidateAudit();
  const forged=structuredClone(base.evidence);forged.releaseFreeze.bossEffectivePressureMultiThreatPriorityPassed=false;forged.releaseFreeze.passed=true;const bad=releaseCandidateAudit(forged);assert.equal(bad.status,'REVIEW');assert.ok(bad.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence);changed.releaseFreeze.bossEffectivePressureMultiThreatPrioritySamples+=1;assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
  assert.match(base.markdown,/boss-effective-pressure-multi-threat-priority safe \(64\)/);
});
