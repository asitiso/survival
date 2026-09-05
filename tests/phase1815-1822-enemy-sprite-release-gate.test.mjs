import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const candidateSource = fs.readFileSync(new URL('../src/game/release-candidate-audit.ts', import.meta.url), 'utf8');

test('phase 1815 candidate binds enemy sprite evidence fail-closed', () => {
  assert.match(candidateSource, /enemySpriteAssetsPassed/);
  assert.match(candidateSource, /enemySpriteAssetsSamples/);
  assert.match(candidateSource, /enemy-sprite-assets/);
});

test('release freeze exposes enemy sprite evidence and candidate fails closed on forged evidence', async () => {
  const release = await import('../dist/game/release-candidate-audit.js');
  const evidence = release.collectReleaseCandidateEvidence();
  assert.equal(evidence.releaseFreeze.enemySpriteAssetsPassed, true);
  assert.equal(evidence.releaseFreeze.enemySpriteAssetsSamples, 25);
  const broken = {...evidence, releaseFreeze: {...evidence.releaseFreeze, enemySpriteAssetsPassed: false, passed: true}};
  const result = release.releaseCandidateAudit(broken);
  assert.equal(result.ok, false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('candidate signature binds enemy sprite sample count and markdown evidence', async () => {
  const release = await import('../dist/game/release-candidate-audit.js');
  const evidence = release.collectReleaseCandidateEvidence();
  const healthy = release.releaseCandidateAudit(evidence);
  const changed = release.releaseCandidateAudit({...evidence, releaseFreeze: {...evidence.releaseFreeze, enemySpriteAssetsSamples: evidence.releaseFreeze.enemySpriteAssetsSamples + 1}});
  assert.notEqual(healthy.signature, changed.signature);
  assert.match(healthy.markdown, /enemy-sprite-assets safe \(25\)/);
});
