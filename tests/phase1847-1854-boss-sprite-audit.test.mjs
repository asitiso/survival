import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const freezeSource = fs.readFileSync(new URL('../src/game/release-freeze-audit.ts', import.meta.url), 'utf8');

test('phase 1847 boss sprite deterministic audit exists and is wired into release freeze', () => {
  assert.equal(fs.existsSync(new URL('../src/game/boss-sprite-asset-audit.ts', import.meta.url)), true);
  assert.match(freezeSource, /bossSpriteAssetsPassed/);
  assert.match(freezeSource, /bossSpriteAssetsSamples/);
});

test('boss sprite audit locks 25 static fail-safe samples', async () => {
  const auditModule = await import('../dist/game/boss-sprite-asset-audit.js');
  const audit = auditModule.auditBossSpriteAssets();
  assert.equal(audit.passed, true);
  assert.equal(audit.samples.length, 25);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 6);
  assert.equal(audit.archetypeCount, 6);
  assert.equal(audit.motionAmplitude, 0);
  assert.equal(audit.fallbackPreserved, true);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.snapshotSchemaMutation, false);
});
