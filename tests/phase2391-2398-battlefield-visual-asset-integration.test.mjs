import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const spellsSource = fs.readFileSync(new URL('../src/game/spells.ts', import.meta.url), 'utf8');

test('phase 2391 hero battle sprite atlas module and asset exist', async () => {
  assert.equal(fs.existsSync(new URL('../src/game/hero-battle-sprite-assets.ts', import.meta.url)), true);
  assert.equal(fs.existsSync(new URL('../assets/heroes/hero-battle-sprites.png', import.meta.url)), true);
  const assets = await import('../dist/game/hero-battle-sprite-assets.js');
  const audit = assets.auditHeroBattleSpriteAtlas(['arkan', 'seria', 'kain', 'edric']);
  assert.equal(audit.heroCount, 4);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 4);
  assert.deepEqual(audit.missing, []);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(assets.HERO_BATTLE_SPRITE_ATLAS.columns, 2);
  assert.equal(assets.HERO_BATTLE_SPRITE_ATLAS.rows, 2);
});

test('phase 2393 battlefield prop and vfx atlas module and asset exist', async () => {
  assert.equal(fs.existsSync(new URL('../src/game/battlefield-props-vfx-assets.ts', import.meta.url)), true);
  assert.equal(fs.existsSync(new URL('../assets/arena/battlefield-props-vfx.png', import.meta.url)), true);
  const assets = await import('../dist/game/battlefield-props-vfx-assets.js');
  const audit = assets.auditBattlefieldPropVfxAtlas();
  assert.equal(audit.itemCount, 12);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 12);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
  assert.equal(assets.BATTLEFIELD_PROP_VFX_ATLAS.columns, 3);
  assert.equal(assets.BATTLEFIELD_PROP_VFX_ATLAS.rows, 4);
});

test('phase 2394-2398 game and spells preload and render battlefield visual atlases with safe fallbacks', () => {
  assert.match(gameSource, /initializeHeroBattleSpriteAtlas/);
  assert.match(gameSource, /HERO_BATTLE_SPRITE_ATLAS\.src/);
  assert.match(gameSource, /drawTerrainSpriteOverlays/);
  assert.match(gameSource, /BATTLEFIELD_PROP_VFX_ATLAS\.src/);
  assert.match(gameSource, /heroBattleSpritePresentation/);
  assert.match(gameSource, /ctx\.drawImage\(this\.battlefieldPropVfxAtlasImage/);
  assert.match(spellsSource, /battlefieldSpellVfxSprite/);
  assert.match(spellsSource, /propVfxAtlasImage\?: HTMLImageElement \| null/);
  assert.match(spellsSource, /drawVfxStamp/);
});
