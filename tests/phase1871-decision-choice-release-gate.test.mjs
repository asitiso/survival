import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 1871 candidate binds decision choice asset evidence fail-closed',()=>{
  assert.match(candidateSource,/releaseFreeze\.decisionChoiceAssetsPassed/);
  assert.match(candidateSource,/releaseFreeze\.decisionChoiceAssetsSamples/);
  assert.match(candidateSource,/decision-choice-assets/);
});

test('release freeze exposes decision choice evidence and candidate fails closed on forged evidence',async()=>{
  const release=await import('../dist/game/release-candidate-audit.js');
  const evidence=release.collectReleaseCandidateEvidence();
  assert.equal(evidence.releaseFreeze.decisionChoiceAssetsPassed,true);
  assert.equal(evidence.releaseFreeze.decisionChoiceAssetsSamples,32);
  assert.equal(evidence.releaseFreeze.passed,true);
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,decisionChoiceAssetsPassed:false,passed:true}};
  const result=release.releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('candidate signature binds decision choice sample count and markdown evidence',async()=>{
  const release=await import('../dist/game/release-candidate-audit.js');
  const evidence=release.collectReleaseCandidateEvidence();
  const healthy=release.releaseCandidateAudit(evidence);
  const changed=release.releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,decisionChoiceAssetsSamples:evidence.releaseFreeze.decisionChoiceAssetsSamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
  assert.match(healthy.markdown,/decision-choice-assets safe \(32\)/);
});
