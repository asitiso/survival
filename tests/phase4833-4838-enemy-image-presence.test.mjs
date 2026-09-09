import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const enemySprites = await import('../dist/game/enemy-sprite-assets.js').catch(() => null);
const bossSprites = await import('../dist/game/boss-sprite-assets.js').catch(() => null);

function enemyApi() {
  assert.ok(enemySprites, 'enemy sprite module must exist');
  return enemySprites;
}

function bossApi() {
  assert.ok(bossSprites, 'boss sprite module must exist');
  return bossSprites;
}

test('phase 4833 regular enemy images gain readable silhouette presence without replacing fallback body', () => {
  const { enemySpritePresentation } = enemyApi();
  const p = enemySpritePresentation('grunt', 18, true);
  assert.equal(p.visible, true);
  assert.equal(p.fallbackBodyVisible, true);
  assert.ok(p.drawSize >= 50, `grunt draw size should be presence-boosted, got ${p.drawSize}`);
  assert.ok(p.bodyAlpha <= 0.18, `fallback body should recede behind image, got ${p.bodyAlpha}`);
  assert.ok(p.groundShadowScale > 1);
  assert.ok(p.groundShadowAlphaBoost > 0);
  assert.ok(p.imageShadowBlur >= 4);
});

test('phase 4834 elite image presence is stronger than a same-radius regular enemy while affix UI stays separate', () => {
  const { enemySpritePresentation } = enemyApi();
  const grunt = enemySpritePresentation('grunt', 24, true);
  const elite = enemySpritePresentation('elite', 24, true);
  assert.ok(elite.drawSize > grunt.drawSize);
  assert.ok(elite.groundShadowScale > grunt.groundShadowScale);
  assert.ok(elite.groundShadowAlphaBoost > grunt.groundShadowAlphaBoost);
  assert.ok(elite.imageShadowBlur > grunt.imageShadowBlur);
  assert.ok(elite.bodyAlpha <= grunt.bodyAlpha);
});

test('phase 4835 missing enemy atlas keeps the original body fully authoritative', () => {
  const { enemySpritePresentation } = enemyApi();
  const p = enemySpritePresentation('brute', 22, false);
  assert.equal(p.visible, false);
  assert.equal(p.bodyAlpha, 1);
  assert.equal(p.groundShadowScale, 1);
  assert.equal(p.groundShadowAlphaBoost, 0);
  assert.equal(p.imageShadowBlur, 0);
});

test('phase 4836 every boss archetype receives a larger battlefield image footprint', () => {
  const { BOSS_SPRITE_ARCHETYPES, bossSpritePresentation } = bossApi();
  for (const archetype of BOSS_SPRITE_ARCHETYPES) {
    const p = bossSpritePresentation(archetype, 58, true);
    assert.equal(p.visible, true);
    assert.ok(p.drawSize >= 150, `${archetype} boss sprite should read as a boss, got ${p.drawSize}`);
  }
});

test('phase 4837 boss images carry heavier ground and silhouette weight than regular enemies', () => {
  const { enemySpritePresentation } = enemyApi();
  const { bossSpritePresentation } = bossApi();
  const regular = enemySpritePresentation('brute', 40, true);
  const boss = bossSpritePresentation('juggernaut', 58, true);
  assert.ok(boss.groundShadowScale >= 1.18);
  assert.ok(boss.groundShadowScale > regular.groundShadowScale);
  assert.ok(boss.groundShadowAlphaBoost >= 0.08);
  assert.ok(boss.imageShadowBlur >= 10);
  assert.ok(boss.bodyAlpha <= 0.12);
});

test('phase 4838 live enemy renderer consumes image-presence fields while preserving existing affix rendering', () => {
  const source = readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
  assert.match(source, /imagePresenceShadowScale/);
  assert.match(source, /imagePresenceShadowAlphaBoost/);
  assert.match(source, /spritePresentation\.bodyAlpha/);
  assert.match(source, /bossPresentation\.bodyAlpha/);
  assert.match(source, /spritePresentation\.imageShadowBlur/);
  assert.match(source, /bossPresentation\.imageShadowBlur/);
  assert.match(source, /eliteAffixIdentityIcon/);
  assert.match(source, /eliteAffixIdentityEmphasis/);
});
