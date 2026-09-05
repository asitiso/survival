import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gamePath = new URL('../src/game/game.ts', import.meta.url);
const spellsPath = new URL('../src/game/spells.ts', import.meta.url);
const gameSource = fs.readFileSync(gamePath, 'utf8');
const spellsSource = fs.readFileSync(spellsPath, 'utf8');

test('phase 2399 boss signature VFX atlas module and image are present', () => {
  assert.equal(fs.existsSync(new URL('../src/game/boss-signature-vfx-assets.ts', import.meta.url)), true);
  assert.equal(fs.existsSync(new URL('../assets/bosses/boss-signature-vfx.png', import.meta.url)), true);
});

test('phase 2400 hero projectile VFX atlas module and image are present', () => {
  assert.equal(fs.existsSync(new URL('../src/game/hero-projectile-vfx-assets.ts', import.meta.url)), true);
  assert.equal(fs.existsSync(new URL('../assets/heroes/hero-projectile-vfx.png', import.meta.url)), true);
});

test('phase 2401 game preloads and renders boss signature VFX without replacing boss sprite fallback', () => {
  assert.match(gameSource, /initializeBossSignatureVfxAtlas/);
  assert.match(gameSource, /BOSS_SIGNATURE_VFX_ATLAS\.src/);
  assert.match(gameSource, /drawBossSignatureVfx/);
  assert.match(gameSource, /bossSignatureVfxSprite/);
  assert.match(gameSource, /this\.enemies\.renderEnemies\(/);
});

test('phase 2402 spell system renders hero projectile images and hit bursts while preserving circle fallback', () => {
  assert.match(spellsSource, /heroProjectileVfxSprite/);
  assert.match(spellsSource, /heroProjectileImpactVfxSprite/);
  assert.match(spellsSource, /projectileImpactVisuals/);
  assert.match(spellsSource, /ctx\.arc\(projectile\.pos\.x, projectile\.pos\.y, projectile\.radius/);
  assert.match(spellsSource, /ctx\.drawImage\(heroProjectileAtlasImage/);
});

test('phase 2403 game passes hero projectile atlas into spell render path', () => {
  assert.match(gameSource, /initializeHeroProjectileVfxAtlas/);
  assert.match(gameSource, /HERO_PROJECTILE_VFX_ATLAS\.src/);
  assert.match(gameSource, /this\.spells\.render\([\s\S]*this\.heroProjectileVfxAtlasImage/);
});
