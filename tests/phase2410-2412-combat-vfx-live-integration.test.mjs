import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const enemySource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
const spellSource = fs.readFileSync(new URL('../src/game/spells.ts', import.meta.url), 'utf8');

test('phase 2410 game preloads and renders enemy hit/death image VFX without replacing gameplay death handling', () => {
  assert.match(gameSource, /initializeEnemyCombatVfxAtlas/);
  assert.match(gameSource, /ENEMY_COMBAT_VFX_ATLAS\.src/);
  assert.match(gameSource, /drawEnemyCombatImageVfx/);
  assert.match(gameSource, /enemyCombatVfxSprite/);
  assert.match(gameSource, /emitDeathPresentation\(death: EnemyDeathEvent\)/);
});

test('phase 2411 boss projectiles retain source archetype only for presentation and hazards render archetype-specific stamps', () => {
  assert.match(enemySource, /bossArchetype\?: BossArchetype/);
  assert.match(enemySource, /bossSpecialProjectileVfxSprite/);
  assert.match(enemySource, /renderProjectiles\([^)]*bossSpecialVfxAtlasImage/);
  assert.match(gameSource, /bossSpecialHazardVfxSprite/);
  assert.match(gameSource, /BOSS_SPECIAL_COMBAT_VFX_ATLAS\.src/);
});

test('phase 2412 chain lightning frost nova and flame field carry hero identity into image VFX rendering', () => {
  assert.match(spellSource, /heroId: HeroId/);
  assert.match(spellSource, /heroSpellSignatureVfxSprite/);
  assert.match(spellSource, /spriteId: 'chainLightning'/);
  assert.match(spellSource, /spriteId: 'frostNova'/);
  assert.match(spellSource, /spriteId: 'flameField'/);
  assert.match(gameSource, /HERO_SPELL_SIGNATURE_VFX_ATLAS\.src/);
});

test('phase 2412 image VFX cleanup survives atlas load failure and hazard stamps draw in world space', () => {
  const cleanupIndex = gameSource.indexOf('this.enemyDeathImageBursts = this.enemyDeathImageBursts.filter');
  const atlasGuardIndex = gameSource.indexOf('if (!this.enemyCombatVfxAtlasReady || !this.enemyCombatVfxAtlasImage) return;');
  assert.ok(cleanupIndex >= 0 && atlasGuardIndex >= 0 && cleanupIndex < atlasGuardIndex);
  assert.match(gameSource, /ctx\.restore\(\);\n\s+if \(this\.bossSpecialCombatVfxAtlasReady && this\.bossSpecialCombatVfxAtlasImage\)/);
});
