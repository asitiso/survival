import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('phase 2413 combat battlefield VFX expansion audit locks 64 deterministic samples', async () => {
  assert.equal(fs.existsSync(new URL('../src/game/combat-battlefield-vfx-expansion-audit.ts', import.meta.url)), true);
  const { auditCombatBattlefieldVfxExpansion } = await import('../dist/game/combat-battlefield-vfx-expansion-audit.js');
  const audit = auditCombatBattlefieldVfxExpansion();
  assert.equal(audit.samples.length, 64);
  assert.equal(audit.passed, true);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.gameplayFormulaMutation, false);
});

test('phase 2414 release freeze and candidate fail closed on combat battlefield VFX expansion evidence', async () => {
  const { auditReleaseFreeze } = await import('../dist/game/release-freeze-audit.js');
  const { releaseCandidateAudit } = await import('../dist/game/release-candidate-audit.js');
  const freeze = auditReleaseFreeze();
  assert.equal(freeze.combatBattlefieldVfxExpansionPassed, true);
  assert.equal(freeze.combatBattlefieldVfxExpansionSamples, 64);
  assert.equal(freeze.passed, true);
  const base = releaseCandidateAudit();
  assert.equal(base.status, 'PASS');
  const forged = structuredClone(base.evidence);
  forged.releaseFreeze.combatBattlefieldVfxExpansionPassed = false;
  forged.releaseFreeze.passed = true;
  const rejected = releaseCandidateAudit(forged);
  assert.notEqual(rejected.status, 'PASS');
  assert.ok(rejected.issues.includes('release-freeze'));
  const changed = structuredClone(base.evidence);
  changed.releaseFreeze.combatBattlefieldVfxExpansionSamples += 1;
  assert.notEqual(releaseCandidateAudit(changed).signature, base.signature);
});
