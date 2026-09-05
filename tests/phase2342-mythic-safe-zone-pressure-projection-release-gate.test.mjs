import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const freezeUrl=new URL('../dist/game/release-freeze-audit.js',import.meta.url);
const candidateUrl=new URL('../dist/game/release-candidate-audit.js',import.meta.url);

test('phase 2342 release freeze binds Mythic SAFE pressure projection evidence',async()=>{
  assert.equal(fs.existsSync(freezeUrl),true);const {auditReleaseFreeze}=await import(freezeUrl.href);const f=auditReleaseFreeze();
  assert.equal(f.mythicSafeZonePressureProjectionIdentityAssetsPassed,true);assert.equal(f.mythicSafeZonePressureProjectionIdentityAssetsSamples,96);assert.equal(f.passed,true);
});

test('phase 2342 candidate fails closed on forged SAFE pressure evidence and binds all ninety-six samples',async()=>{
  const {releaseCandidateAudit}=await import(candidateUrl.href);const base=releaseCandidateAudit();
  const forged=structuredClone(base.evidence);forged.releaseFreeze.mythicSafeZonePressureProjectionIdentityAssetsPassed=false;forged.releaseFreeze.passed=true;const bad=releaseCandidateAudit(forged);assert.equal(bad.status,'REVIEW');assert.ok(bad.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence);changed.releaseFreeze.mythicSafeZonePressureProjectionIdentityAssetsSamples+=1;assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
  assert.match(base.markdown,/mythic-safe-zone-pressure-projection-identity-assets safe \(96\)/);
});
