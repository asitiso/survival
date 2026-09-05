import test from 'node:test';
import assert from 'node:assert/strict';
const visual=await import('../dist/game/visual-effects-audit.js').catch(()=>({}));
const freezeMod=await import('../dist/game/release-freeze-audit.js').catch(()=>({}));
const candidate=await import('../dist/game/release-candidate-audit.js').catch(()=>({}));

test('phase 1059 visual audit and release freeze include timing/readability evidence',()=>{
  assert.equal(typeof visual.auditVisualEffectsSafety,'function');
  const audit=visual.auditVisualEffectsSafety();
  assert.equal(audit.visualTimingPassed,true); assert.ok(audit.visualTimingSamples>=160);
  const freeze=freezeMod.auditReleaseFreeze();
  assert.equal(freeze.visualTimingPassed,true); assert.equal(freeze.visualTimingSamples,audit.visualTimingSamples);
});

test('phase 1060 candidate fails closed on visual timing inconsistency',()=>{
  const evidence=candidate.collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,visualTimingPassed:false,passed:true}};
  const result=candidate.releaseCandidateAudit(broken);
  assert.equal(result.ok,false); assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1061-1062 candidate signature includes visual timing samples',()=>{
  const evidence=candidate.collectReleaseCandidateEvidence();
  const healthy=candidate.releaseCandidateAudit(evidence);
  const changed=candidate.releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,visualTimingSamples:evidence.releaseFreeze.visualTimingSamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
