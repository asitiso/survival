import test from 'node:test';
import assert from 'node:assert/strict';
const visual=await import('../dist/game/visual-effects-audit.js');
const freezeMod=await import('../dist/game/release-freeze-audit.js');
const candidate=await import('../dist/game/release-candidate-audit.js');

test('phase 1019 visual audit and release freeze include visual presence evidence',()=>{
  const audit=visual.auditVisualEffectsSafety();
  assert.equal(audit.visualPresencePassed,true);assert.ok(audit.visualPresenceSamples>=140);
  const freeze=freezeMod.auditReleaseFreeze();
  assert.equal(freeze.visualPresencePassed,true);assert.equal(freeze.visualPresenceSamples,audit.visualPresenceSamples);
});
test('phase 1020 candidate fails closed when visual presence evidence is inconsistent',()=>{
  const evidence=candidate.collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,visualPresencePassed:false,passed:true}};
  const result=candidate.releaseCandidateAudit(broken);
  assert.equal(result.ok,false);assert.ok(result.issues.includes('release-freeze'));
});
test('phase 1021-1022 candidate signature includes visual presence evidence',()=>{
  const evidence=candidate.collectReleaseCandidateEvidence();
  const healthy=candidate.releaseCandidateAudit(evidence);
  const changed=candidate.releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,visualPresenceSamples:evidence.releaseFreeze.visualPresenceSamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
