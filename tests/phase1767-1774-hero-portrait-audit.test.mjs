import test from 'node:test';
import assert from 'node:assert/strict';

test('phase 1767-1774 deterministic hero portrait asset audit meets bounded targets', async () => {
  const auditModule = await import('../dist/game/hero-portrait-asset-audit.js');
  const audit = auditModule.auditHeroPortraitAssets();
  assert.equal(audit.passed, true, audit.issues.join(','));
  assert.equal(audit.samples.length, 25);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 4);
  assert.equal(audit.selectableHeroCount, 4);
  assert.equal(audit.motionAmplitude, 0);
  assert.equal(audit.fallbackPreserved, true);
  assert.equal(audit.snapshotSchemaMutation, false);
});
