import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1960 release freeze binds hero ability identity evidence', () => {
  const freeze = auditReleaseFreeze();
  assert.equal(freeze.heroAbilityIdentityAssetsPassed, true);
  assert.equal(freeze.heroAbilityIdentityAssetsSamples, 48);
  assert.equal(freeze.passed, true);
});

test('phase 1960 candidate fails closed on forged hero ability evidence and sample mutation changes signature', () => {
  const base = releaseCandidateAudit();
  assert.equal(base.status, 'PASS');
  const forged = structuredClone(base.evidence);
  forged.releaseFreeze.heroAbilityIdentityAssetsPassed = false;
  forged.releaseFreeze.passed = true;
  const rejected = releaseCandidateAudit(forged);
  assert.equal(rejected.status, 'REVIEW');
  assert.ok(rejected.issues.includes('release-freeze'));
  const changed = structuredClone(base.evidence);
  changed.releaseFreeze.heroAbilityIdentityAssetsSamples += 1;
  assert.notEqual(releaseCandidateAudit(changed).signature, base.signature);
  assert.match(base.markdown, /hero-ability-identity-assets safe \(48\)/);
});
