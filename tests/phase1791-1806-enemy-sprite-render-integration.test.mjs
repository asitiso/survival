import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const enemiesSource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

test('phase 1791 enemy render accepts sprite atlas while preserving circle fallback', () => {
  assert.match(enemiesSource, /enemySpritePresentation/);
  assert.match(enemiesSource, /ctx\.drawImage\(/);
  assert.match(enemiesSource, /ctx\.arc\(0, 0, enemy\.radius/);
});

test('phase 1799 game preloads enemy sprite atlas without blocking startup', () => {
  assert.match(gameSource, /initializeEnemySpriteAtlas/);
  assert.match(gameSource, /ENEMY_SPRITE_ATLAS\.src/);
  assert.match(gameSource, /image\.onerror\s*=\s*\(\)\s*=>\s*\{\s*this\.enemySpriteAtlasReady\s*=\s*false/);
});
