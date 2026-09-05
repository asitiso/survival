import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const candidateSource = fs.readFileSync(new URL('../src/game/release-candidate-audit.ts', import.meta.url), 'utf8');

test('phase 1855 candidate binds boss sprite evidence fail-closed', () => {
  assert.match(candidateSource, /bossSpriteAssetsPassed/);
  assert.match(candidateSource, /bossSpriteAssetsSamples/);
  assert.match(candidateSource, /boss-sprite-assets/);
});

test('release freeze exposes boss sprite evidence and candidate fails closed on forged evidence', async () => {
  const release = await import('../dist/game/release-candidate-audit.js');
  const evidence = release.collectReleaseCandidateEvidence();
  assert.equal(evidence.releaseFreeze.bossSpriteAssetsPassed, true);
  assert.equal(evidence.releaseFreeze.bossSpriteAssetsSamples, 25);
  const broken = {...evidence, releaseFreeze: {...evidence.releaseFreeze, bossSpriteAssetsPassed: false, passed: true}};
  const result = release.releaseCandidateAudit(broken);
  assert.equal(result.ok, false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('candidate signature binds boss sprite sample count and markdown evidence', async () => {
  const release = await import('../dist/game/release-candidate-audit.js');
  const evidence = release.collectReleaseCandidateEvidence();
  const healthy = release.releaseCandidateAudit(evidence);
  const changed = release.releaseCandidateAudit({...evidence, releaseFreeze: {...evidence.releaseFreeze, bossSpriteAssetsSamples: evidence.releaseFreeze.bossSpriteAssetsSamples + 1}});
  assert.notEqual(healthy.signature, changed.signature);
  assert.match(healthy.markdown, /boss-sprite-assets safe \(25\)/);
});
