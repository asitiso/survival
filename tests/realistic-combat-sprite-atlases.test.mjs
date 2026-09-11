import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ENEMY_SPRITE_ATLAS, enemySpriteRect } from '../dist/game/enemy-sprite-assets.js';
import { BOSS_SPRITE_ATLAS, bossSpriteRect } from '../dist/game/boss-sprite-assets.js';

function pngInfo(path) {
  const bytes = fs.readFileSync(new URL(path, import.meta.url));
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25],
  };
}

test('detailed enemy atlas keeps twelve transparent equal cells including the elite midboss', () => {
  const image = pngInfo('../assets/enemies/enemy-sprites.png');
  assert.deepEqual(image, { width: 1448, height: 1086, colorType: 6 });
  assert.deepEqual(ENEMY_SPRITE_ATLAS, {
    src: './assets/enemies/enemy-sprites.png',
    columns: 4,
    rows: 3,
    cellSize: 362,
    width: 1448,
    height: 1086,
  });
  assert.deepEqual(enemySpriteRect('elite'), { sx: 1086, sy: 724, sw: 362, sh: 362 });
});

test('detailed boss atlas keeps six transparent equal cells in the established order', () => {
  const image = pngInfo('../assets/bosses/boss-sprites.png');
  assert.deepEqual(image, { width: 1536, height: 1024, colorType: 6 });
  assert.deepEqual(BOSS_SPRITE_ATLAS, {
    src: './assets/bosses/boss-sprites.png',
    columns: 3,
    rows: 2,
    cellSize: 512,
    width: 1536,
    height: 1024,
  });
  assert.deepEqual(bossSpriteRect('timeEater'), { sx: 1024, sy: 512, sw: 512, sh: 512 });
});
