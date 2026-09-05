import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const enemiesSource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

test('phase 1831 boss render accepts dedicated atlas while preserving circle fallback and telegraph', () => {
  assert.match(enemiesSource, /bossSpritePresentation/);
  assert.match(enemiesSource, /bossSpriteRect/);
  assert.match(enemiesSource, /ctx\.drawImage\(bossSpriteAtlasImage/);
  assert.match(enemiesSource, /ctx\.arc\(0, 0, enemy\.radius/);
  assert.match(enemiesSource, /telegraph\.telegraphColor/);
});

test('phase 1839 game preloads boss sprite atlas without blocking startup', () => {
  assert.match(gameSource, /initializeBossSpriteAtlas/);
  assert.match(gameSource, /BOSS_SPRITE_ATLAS\.src/);
  assert.match(gameSource, /image\.onerror\s*=\s*\(\)\s*=>\s*\{\s*this\.bossSpriteAtlasReady\s*=\s*false/);
});
