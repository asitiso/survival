import test from 'node:test';
import assert from 'node:assert/strict';
const visual=await import('../dist/game/visual-effects-audit.js').catch(()=>({}));
const freezeMod=await import('../dist/game/release-freeze-audit.js').catch(()=>({}));
const candidate=await import('../dist/game/release-candidate-audit.js').catch(()=>({}));

test('phase 1099 visual audit and release freeze include coherence evidence',()=>{
  assert.equal(typeof visual.auditVisualEffectsSafety,'function');
  const audit=visual.auditVisualEffectsSafety();
  assert.equal(audit.visualCoherencePassed,true); assert.ok(audit.visualCoherenceSamples>=100);
  const freeze=freezeMod.auditReleaseFreeze();
  assert.equal(freeze.visualCoherencePassed,true); assert.equal(freeze.visualCoherenceSamples,audit.visualCoherenceSamples);
});

test('phase 1100 candidate fails closed on visual coherence inconsistency',()=>{
  const evidence=candidate.collectReleaseCandidateEvidence();
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,visualCoherencePassed:false,passed:true}};
  const result=candidate.releaseCandidateAudit(broken);
  assert.equal(result.ok,false); assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1101-1102 candidate signature includes visual coherence samples',()=>{
  const evidence=candidate.collectReleaseCandidateEvidence();
  const healthy=candidate.releaseCandidateAudit(evidence);
  const changed=candidate.releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,visualCoherenceSamples:evidence.releaseFreeze.visualCoherenceSamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
});
