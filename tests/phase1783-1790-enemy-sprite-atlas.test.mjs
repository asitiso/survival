import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('phase 1783 enemy sprite asset module and atlas exist', () => {
  assert.equal(fs.existsSync(new URL('../src/game/enemy-sprite-assets.ts', import.meta.url)), true);
  assert.equal(fs.existsSync(new URL('../assets/enemies/enemy-sprites.png', import.meta.url)), true);
});

test('enemy sprite atlas covers twelve non-boss enemy identities with unique cells', async () => {
  const assets = await import('../dist/game/enemy-sprite-assets.js');
  const audit = assets.auditEnemySpriteAtlas(assets.ENEMY_SPRITE_TYPES);
  assert.equal(audit.typeCount, 12);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 12);
  assert.equal(audit.missing.length, 0);
  assert.equal(audit.outOfBounds.length, 0);
  assert.equal(assets.ENEMY_SPRITE_ATLAS.columns, 4);
  assert.equal(assets.ENEMY_SPRITE_ATLAS.rows, 3);
});
