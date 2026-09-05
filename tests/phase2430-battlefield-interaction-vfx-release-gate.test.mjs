import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 2430 deterministic battlefield interaction VFX audit locks 64 samples', async () => {
  const url = new URL('../dist/game/battlefield-interaction-vfx-audit.js', import.meta.url);
  assert.equal(fs.existsSync(url), true);
  const mod = await import(url.href);
  const audit = mod.auditBattlefieldInteractionVfx();
  assert.equal(audit.samples.length, 64);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.loadFailureBlocksGameplay, false);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.passed, true);
});

test('phase 2430 release freeze binds battlefield interaction VFX evidence', () => {
  const freeze = auditReleaseFreeze();
  assert.equal(freeze.battlefieldInteractionVfxPassed, true);
  assert.equal(freeze.battlefieldInteractionVfxSamples, 64);
  assert.equal(freeze.passed, true);
});

test('phase 2430 candidate fails closed and signs battlefield interaction VFX sample count', () => {
  const base = releaseCandidateAudit();
  assert.equal(base.status, 'PASS');
  const forged = structuredClone(base.evidence);
  forged.releaseFreeze.battlefieldInteractionVfxPassed = false;
  forged.releaseFreeze.passed = true;
  const rejected = releaseCandidateAudit(forged);
  assert.notEqual(rejected.status, 'PASS');
  assert.ok(rejected.issues.includes('release-freeze'));
  const changed = structuredClone(base.evidence);
  changed.releaseFreeze.battlefieldInteractionVfxSamples += 1;
  assert.notEqual(releaseCandidateAudit(changed).signature, base.signature);
});
