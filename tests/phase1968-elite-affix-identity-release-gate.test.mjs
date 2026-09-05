import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1968 release freeze binds elite affix identity evidence', () => {
  const freeze = auditReleaseFreeze();
  assert.equal(freeze.eliteAffixIdentityAssetsPassed, true);
  assert.equal(freeze.eliteAffixIdentityAssetsSamples, 54);
  assert.equal(freeze.passed, true);
});

test('phase 1968 candidate fails closed on forged elite affix evidence and sample mutation changes signature', () => {
  const base = releaseCandidateAudit();
  assert.equal(base.status, 'PASS');
  const forged = structuredClone(base.evidence);
  forged.releaseFreeze.eliteAffixIdentityAssetsPassed = false;
  forged.releaseFreeze.passed = true;
  const rejected = releaseCandidateAudit(forged);
  assert.equal(rejected.status, 'REVIEW');
  assert.ok(rejected.issues.includes('release-freeze'));
  const changed = structuredClone(base.evidence);
  changed.releaseFreeze.eliteAffixIdentityAssetsSamples += 1;
  assert.notEqual(releaseCandidateAudit(changed).signature, base.signature);
  assert.match(base.markdown, /elite-affix-identity-assets safe \(54\)/);
});
