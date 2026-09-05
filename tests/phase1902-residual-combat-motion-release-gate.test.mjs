import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 1902 release freeze binds residual combat motion evidence',async()=>{
  const {auditReleaseFreeze}=await import('../dist/game/release-freeze-audit.js');
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.residualCombatMotionPassed,true);
  assert.equal(freeze.residualCombatMotionSamples,48);
  assert.equal(freeze.passed,true);
});

test('phase 1902 candidate fails closed when residual motion evidence is forged',async()=>{
  const {collectReleaseCandidateEvidence,releaseCandidateAudit}=await import('../dist/game/release-candidate-audit.js');
  const evidence=collectReleaseCandidateEvidence();
  const forged=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,residualCombatMotionPassed:false,passed:true}});
  assert.equal(forged.ok,false);
  assert.ok(forged.issues.includes('release-freeze'));
});

test('phase 1902 residual sample count participates in candidate signature',async()=>{
  const {collectReleaseCandidateEvidence,releaseCandidateAudit}=await import('../dist/game/release-candidate-audit.js');
  const evidence=collectReleaseCandidateEvidence();
  const baseline=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,residualCombatMotionSamples:evidence.releaseFreeze.residualCombatMotionSamples+1}});
  assert.notEqual(changed.signature,baseline.signature);
  assert.match(candidateSource,/residualCombatMotionSamples/);
});
