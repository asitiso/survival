import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('phase 1823 boss sprite asset module and atlas exist', () => {
  assert.equal(fs.existsSync(new URL('../src/game/boss-sprite-assets.ts', import.meta.url)), true);
  assert.equal(fs.existsSync(new URL('../assets/bosses/boss-sprites.png', import.meta.url)), true);
});

test('boss sprite atlas covers six archetypes with unique cells', async () => {
  const assets = await import('../dist/game/boss-sprite-assets.js');
  const audit = assets.auditBossSpriteAtlas(assets.BOSS_SPRITE_ARCHETYPES);
  assert.equal(audit.archetypeCount, 6);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 6);
  assert.equal(audit.missing.length, 0);
  assert.equal(audit.outOfBounds.length, 0);
  assert.equal(assets.BOSS_SPRITE_ATLAS.columns, 3);
  assert.equal(assets.BOSS_SPRITE_ATLAS.rows, 2);
});
