import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('phase 2404 combat visual asset integration audit module exists', () => {
  assert.equal(fs.existsSync(new URL('../src/game/combat-visual-asset-integration-audit.ts', import.meta.url)), true);
});

test('phase 2405 release freeze binds combat visual asset integration evidence', async () => {
  const { auditReleaseFreeze } = await import('../dist/game/release-freeze-audit.js');
  const freeze = auditReleaseFreeze();
  assert.equal(freeze.combatVisualAssetIntegrationPassed, true);
  assert.equal(freeze.combatVisualAssetIntegrationSamples, 32);
  assert.equal(freeze.passed, true);
});

test('phase 2406 candidate fails closed on forged combat visual evidence and signs sample count', async () => {
  const { releaseCandidateAudit } = await import('../dist/game/release-candidate-audit.js');
  const base = releaseCandidateAudit();
  assert.equal(base.status, 'PASS');
  const forged = structuredClone(base.evidence);
  forged.releaseFreeze.combatVisualAssetIntegrationPassed = false;
  forged.releaseFreeze.passed = true;
  const rejected = releaseCandidateAudit(forged);
  assert.notEqual(rejected.status, 'PASS');
  assert.ok(rejected.issues.includes('release-freeze'));
  const changed = structuredClone(base.evidence);
  changed.releaseFreeze.combatVisualAssetIntegrationSamples += 1;
  assert.notEqual(releaseCandidateAudit(changed).signature, base.signature);
});
