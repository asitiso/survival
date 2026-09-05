import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 1880 candidate binds tactical status evidence fail-closed',()=>{
  assert.match(candidateSource,/releaseFreeze\.tacticalStatusAssetsPassed/);
  assert.match(candidateSource,/releaseFreeze\.tacticalStatusAssetsSamples/);
  assert.match(candidateSource,/tactical-status-assets/);
});

test('release freeze exposes tactical status evidence and forged evidence fails closed',async()=>{
  const release=await import('../dist/game/release-candidate-audit.js');
  const evidence=release.collectReleaseCandidateEvidence();
  assert.equal(evidence.releaseFreeze.tacticalStatusAssetsPassed,true);
  assert.equal(evidence.releaseFreeze.tacticalStatusAssetsSamples,40);
  assert.equal(evidence.releaseFreeze.passed,true);
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,tacticalStatusAssetsPassed:false,passed:true}};
  const result=release.releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('candidate signature binds tactical status sample count and markdown evidence',async()=>{
  const release=await import('../dist/game/release-candidate-audit.js');
  const evidence=release.collectReleaseCandidateEvidence();
  const healthy=release.releaseCandidateAudit(evidence);
  const changed=release.releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,tacticalStatusAssetsSamples:evidence.releaseFreeze.tacticalStatusAssetsSamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
  assert.match(healthy.markdown,/tactical-status-assets safe \(40\)/);
});
