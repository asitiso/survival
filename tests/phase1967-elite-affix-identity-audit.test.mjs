import test from 'node:test';
import assert from 'node:assert/strict';
import { auditEliteAffixIdentityAssets } from '../dist/game/elite-affix-identity-asset-audit.js';

test('phase 1967 deterministic elite affix identity audit preserves combat/readability invariants', () => {
  const audit = auditEliteAffixIdentityAssets();
  assert.equal(audit.passed, true, audit.issues.join(','));
  assert.equal(audit.samples.length, 54);
  assert.equal(audit.affixCount, 6);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 6);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.singleAffixCoverage, 1);
  assert.equal(audit.doubleAffixCoverage, 1);
  assert.equal(audit.onBodyCoverage, 1);
  assert.equal(audit.overlapPolicyViolations, 0);
  assert.equal(audit.textFallbackPreserved, true);
  assert.equal(audit.imageLoadFailureNonBlocking, true);
  assert.equal(audit.motionAmplitude, 0);
  assert.equal(audit.modifierMutation, false);
  assert.equal(audit.enemyGeometryMutation, false);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.snapshotSchemaMutation, false);
});

test('phase 1967 audit includes every affix in single and double layout coverage', () => {
  const audit = auditEliteAffixIdentityAssets();
  const single = new Set(audit.samples.filter((sample) => sample.surface === 'single').map((sample) => sample.affixId));
  const double = new Set(audit.samples.filter((sample) => sample.surface === 'double').map((sample) => sample.affixId));
  assert.equal(single.size, 6);
  assert.equal(double.size, 6);
});
