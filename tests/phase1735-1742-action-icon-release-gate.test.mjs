import test from 'node:test';
import assert from 'node:assert/strict';

test('phase 1735-1740 deterministic action icon asset audit meets bounded targets', async () => {
  const auditModule = await import('../dist/game/action-icon-asset-audit.js');
  const audit = auditModule.auditActionIconAssets();
  assert.equal(audit.passed, true, audit.issues.join(','));
  assert.equal(audit.samples.length, 25);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 9);
  assert.equal(audit.reachableActionCount, 9);
  assert.equal(audit.motionAmplitude, 0);
  assert.equal(audit.fallbackPreserved, true);
  assert.equal(audit.snapshotSchemaMutation, false);
});

test('phase 1741 release freeze exposes action icon asset evidence', async () => {
  const release = await import('../dist/game/release-candidate-audit.js');
  const evidence = release.collectReleaseCandidateEvidence();
  assert.equal(evidence.releaseFreeze.actionIconAssetsPassed, true);
  assert.equal(evidence.releaseFreeze.actionIconAssetsSamples, 25);
});

test('phase 1741 candidate fails closed when action icon asset evidence is forged false under top-level PASS', async () => {
  const release = await import('../dist/game/release-candidate-audit.js');
  const evidence = release.collectReleaseCandidateEvidence();
  const broken = {...evidence, releaseFreeze: {...evidence.releaseFreeze, actionIconAssetsPassed: false, passed: true}};
  const result = release.releaseCandidateAudit(broken);
  assert.equal(result.ok, false);
  assert.ok(result.issues.includes('release-freeze'));
});

test('phase 1742 candidate signature binds action icon asset sample count', async () => {
  const release = await import('../dist/game/release-candidate-audit.js');
  const evidence = release.collectReleaseCandidateEvidence();
  const healthy = release.releaseCandidateAudit(evidence);
  const changed = release.releaseCandidateAudit({...evidence, releaseFreeze: {...evidence.releaseFreeze, actionIconAssetsSamples: evidence.releaseFreeze.actionIconAssetsSamples + 1}});
  assert.notEqual(healthy.signature, changed.signature);
  assert.match(healthy.markdown, /action-icon-assets safe \(25\)/);
});
