import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 1866 candidate binds shop item asset evidence fail-closed',()=>{
  assert.match(candidateSource,/shopItemAssetsPassed/);
  assert.match(candidateSource,/shopItemAssetsSamples/);
  assert.match(candidateSource,/shop-item-assets/);
});

test('release freeze exposes shop item evidence and candidate fails closed on forged evidence',async()=>{
  const release=await import('../dist/game/release-candidate-audit.js');
  const evidence=release.collectReleaseCandidateEvidence();
  assert.equal(evidence.releaseFreeze.shopItemAssetsPassed,true);
  assert.equal(evidence.releaseFreeze.shopItemAssetsSamples,25);
  const broken={...evidence,releaseFreeze:{...evidence.releaseFreeze,shopItemAssetsPassed:false,passed:true}};
  const result=release.releaseCandidateAudit(broken);
  assert.equal(result.ok,false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('candidate signature binds shop item sample count and markdown evidence',async()=>{
  const release=await import('../dist/game/release-candidate-audit.js');
  const evidence=release.collectReleaseCandidateEvidence();
  const healthy=release.releaseCandidateAudit(evidence);
  const changed=release.releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,shopItemAssetsSamples:evidence.releaseFreeze.shopItemAssetsSamples+1}});
  assert.notEqual(healthy.signature,changed.signature);
  assert.match(healthy.markdown,/shop-item-assets safe \(25\)/);
});
