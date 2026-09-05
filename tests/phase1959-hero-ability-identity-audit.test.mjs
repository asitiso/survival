import test from 'node:test';
import assert from 'node:assert/strict';
import { auditHeroAbilityIdentityAssets } from '../dist/game/hero-ability-identity-asset-audit.js';

test('phase 1959 deterministic hero ability identity audit covers combat and decision/fallback surfaces', () => {
  const audit = auditHeroAbilityIdentityAssets();
  assert.equal(audit.passed, true, audit.issues.join(','));
  assert.equal(audit.samples.length, 48);
  assert.equal(audit.identityCount, 24);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 24);
  assert.deepEqual(audit.outOfBounds, []);
  assert.deepEqual(audit.heroActionMismatch, []);
  assert.equal(audit.combatCoverage, 1);
  assert.equal(audit.decisionFallbackCoverage, 1);
  assert.equal(audit.motionAmplitude, 0);
  assert.equal(audit.textFallbackPreserved, true);
  assert.equal(audit.legacyFallbackPreserved, true);
  assert.equal(audit.imageLoadFailureNonBlocking, true);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.snapshotSchemaMutation, false);
});

test('phase 1959 each identity contributes exactly one combat and one decision/fallback sample', () => {
  const audit = auditHeroAbilityIdentityAssets();
  const byKey = new Map();
  for (const sample of audit.samples) {
    const surfaces = byKey.get(sample.key) ?? [];
    surfaces.push(sample.surface);
    byKey.set(sample.key, surfaces);
  }
  assert.equal(byKey.size, 24);
  for (const surfaces of byKey.values()) assert.deepEqual(surfaces.sort(), ['combat','decision-fallback']);
});
