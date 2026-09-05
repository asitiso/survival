import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 2422 deterministic visual evolution audit locks 64 samples', async () => {
  const mod = await import('../dist/game/battlefield-visual-evolution-vfx-audit.js');
  const audit = mod.auditBattlefieldVisualEvolutionVfx();
  assert.equal(audit.samples.length, 64);
  assert.equal(audit.passed, true);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
});

test('phase 2422 release freeze binds visual evolution VFX evidence', () => {
  const freeze = auditReleaseFreeze();
  assert.equal(freeze.battlefieldVisualEvolutionVfxPassed, true);
  assert.equal(freeze.battlefieldVisualEvolutionVfxSamples, 64);
  assert.equal(freeze.passed, true);
});

test('phase 2422 candidate fails closed and signs visual evolution sample count', () => {
  const base = releaseCandidateAudit();
  assert.equal(base.status, 'PASS');
  const forged = structuredClone(base.evidence);
  forged.releaseFreeze.battlefieldVisualEvolutionVfxPassed = false;
  forged.releaseFreeze.passed = true;
  const rejected = releaseCandidateAudit(forged);
  assert.notEqual(rejected.status, 'PASS');
  assert.ok(rejected.issues.includes('release-freeze'));
  const changed = structuredClone(base.evidence);
  changed.releaseFreeze.battlefieldVisualEvolutionVfxSamples += 1;
  assert.notEqual(releaseCandidateAudit(changed).signature, base.signature);
});
