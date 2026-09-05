import test from 'node:test';
import assert from 'node:assert/strict';

test('phase 1775 release freeze exposes hero portrait asset evidence', async () => {
  const release = await import('../dist/game/release-candidate-audit.js');
  const evidence = release.collectReleaseCandidateEvidence();
  assert.equal(evidence.releaseFreeze.heroPortraitAssetsPassed, true);
  assert.equal(evidence.releaseFreeze.heroPortraitAssetsSamples, 25);
});

test('phase 1777 candidate fails closed when hero portrait evidence is forged false under top-level PASS', async () => {
  const release = await import('../dist/game/release-candidate-audit.js');
  const evidence = release.collectReleaseCandidateEvidence();
  const broken = {...evidence, releaseFreeze: {...evidence.releaseFreeze, heroPortraitAssetsPassed: false, passed: true}};
  const result = release.releaseCandidateAudit(broken);
  assert.equal(result.ok, false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1782 candidate signature binds hero portrait sample count and reports evidence', async () => {
  const release = await import('../dist/game/release-candidate-audit.js');
  const evidence = release.collectReleaseCandidateEvidence();
  const healthy = release.releaseCandidateAudit(evidence);
  const changed = release.releaseCandidateAudit({...evidence, releaseFreeze: {...evidence.releaseFreeze, heroPortraitAssetsSamples: evidence.releaseFreeze.heroPortraitAssetsSamples + 1}});
  assert.notEqual(healthy.signature, changed.signature);
  assert.match(healthy.markdown, /hero-portrait-assets safe \(25\)/);
});
