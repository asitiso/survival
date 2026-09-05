import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const exists = (path) => fs.existsSync(new URL(path, import.meta.url));

test('phase 2407 enemy hit/death VFX atlas covers 12 non-boss enemy types with 24 unique cells', async () => {
  assert.equal(exists('../src/game/enemy-combat-vfx-assets.ts'), true);
  assert.equal(exists('../assets/enemies/enemy-combat-vfx.png'), true);
  const assets = await import('../dist/game/enemy-combat-vfx-assets.js');
  const audit = assets.auditEnemyCombatVfxAtlas();
  assert.equal(audit.enemyTypeCount, 12);
  assert.equal(audit.itemCount, 24);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 24);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
});

test('phase 2408 boss special projectile/hazard atlas covers six archetypes and two visual channels', async () => {
  assert.equal(exists('../src/game/boss-special-combat-vfx-assets.ts'), true);
  assert.equal(exists('../assets/bosses/boss-special-combat-vfx.png'), true);
  const assets = await import('../dist/game/boss-special-combat-vfx-assets.js');
  const audit = assets.auditBossSpecialCombatVfxAtlas();
  assert.equal(audit.archetypeCount, 6);
  assert.equal(audit.itemCount, 12);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 12);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
});

test('phase 2409 hero chain/nova/field signature atlas covers four heroes and three spell channels', async () => {
  assert.equal(exists('../src/game/hero-spell-signature-vfx-assets.ts'), true);
  assert.equal(exists('../assets/heroes/hero-spell-signature-vfx.png'), true);
  const assets = await import('../dist/game/hero-spell-signature-vfx-assets.js');
  const audit = assets.auditHeroSpellSignatureVfxAtlas();
  assert.equal(audit.heroCount, 4);
  assert.equal(audit.channelCount, 3);
  assert.equal(audit.itemCount, 12);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 12);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
});
