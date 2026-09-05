import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const enemySource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');

async function loadHeroCastAssets() {
  assert.equal(fs.existsSync(new URL('../src/game/hero-cast-render-assets.ts', import.meta.url)), true);
  assert.equal(fs.existsSync(new URL('../assets/heroes/hero-cast-render-overlays.png', import.meta.url)), true);
  return import('../dist/game/hero-cast-render-assets.js');
}

async function loadEnemyMotionModule() {
  assert.equal(fs.existsSync(new URL('../src/game/enemy-motion-rendering.ts', import.meta.url)), true);
  return import('../dist/game/enemy-motion-rendering.js');
}

test('phase 2877 hero cast render atlas module and asset exist with full coverage', async () => {
  const mod = await loadHeroCastAssets();
  const audit = mod.auditHeroCastRenderAtlas(['arkan', 'seria', 'kain', 'edric']);
  assert.equal(mod.HERO_CAST_RENDER_ATLAS.columns, 4);
  assert.equal(mod.HERO_CAST_RENDER_ATLAS.rows, 2);
  assert.equal(mod.HERO_CAST_RENDER_ATLAS.cellWidth, 256);
  assert.equal(mod.HERO_CAST_RENDER_ATLAS.cellHeight, 256);
  assert.equal(audit.itemCount, 8);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 8);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
});

test('phase 2878 hero cast render presentation exposes readable cast and recovery emphasis', async () => {
  const mod = await loadHeroCastAssets();
  const cast = mod.heroCastRenderPresentation('cast', 23, true, 1);
  const recover = mod.heroCastRenderPresentation('recover', 23, true, 0.75);
  assert.equal(cast.visible, true);
  assert.equal(recover.visible, true);
  assert.equal(cast.layer, 'cast');
  assert.equal(recover.layer, 'recover');
  assert.ok(cast.size > recover.size);
  assert.ok(cast.alpha > recover.alpha);
  assert.ok(cast.focusOffset > recover.focusOffset);
});

test('phase 2879-2888 game preloads and uses hero cast overlays plus movement recovery polish', () => {
  assert.match(gameSource, /initializeHeroCastRenderAtlas/);
  assert.match(gameSource, /HERO_CAST_RENDER_ATLAS\.src/);
  assert.match(gameSource, /heroCastRenderPresentation\('cast'/);
  assert.match(gameSource, /heroCastRenderPresentation\('recover'/);
  assert.match(gameSource, /heroCastRenderSprite\(this\.hero\.profileId, 'cast'\)/);
  assert.match(gameSource, /heroCastRenderSprite\(this\.hero\.profileId, 'recover'\)/);
  assert.match(gameSource, /heroCastRenderCast/);
  assert.match(gameSource, /heroCastRenderRecover/);
  assert.match(gameSource, /heroRenderTurnTilt/);
  assert.match(gameSource, /heroRenderRecoveryBlend/);
});

test('phase 2889 enemy motion render module computes deterministic movement presentation', async () => {
  const mod = await loadEnemyMotionModule();
  const moving = mod.advanceEnemyMotionRenderState(undefined, 18, 0, 0.16, 20);
  const recovering = mod.advanceEnemyMotionRenderState(moving, 0, 0, 0.16, 20);
  const presentation = mod.enemyMotionRenderPresentation('assassin', 20, moving, false);
  assert.ok(moving.motionBlend > 0);
  assert.ok(recovering.recovery >= 0);
  assert.equal(presentation.moving, true);
  assert.ok(presentation.shadowWidth > presentation.shadowHeight);
  assert.ok(presentation.scaleX >= 1);
  assert.ok(presentation.silhouetteAlpha >= 0);
});

test('phase 2890-2894 enemy render integrates motion shadows, silhouettes, and reduced motion safety', async () => {
  assert.match(enemySource, /advanceEnemyMotionRenderState/);
  assert.match(enemySource, /enemyMotionRenderPresentation/);
  assert.match(enemySource, /renderMotion\?: EnemyMotionRenderState/);
  assert.match(enemySource, /commitRenderMotion/);
  assert.match(enemySource, /ctx\.ellipse\(motionPresentation\.shadowOffsetX/);
  assert.match(enemySource, /dynamicSilhouette/);
  assert.match(enemySource, /reducedFlash = false, reducedMotion = false/);
  assert.equal(fs.existsSync(new URL('../src/game/hero-cast-render-audit.ts', import.meta.url)), true);
  assert.equal(fs.existsSync(new URL('../src/game/enemy-motion-render-audit.ts', import.meta.url)), true);
  const heroAuditMod = await import('../dist/game/hero-cast-render-audit.js');
  const enemyAuditMod = await import('../dist/game/enemy-motion-render-audit.js');
  const heroAudit = heroAuditMod.runHeroCastRenderAudit();
  const enemyAudit = enemyAuditMod.runEnemyMotionRenderAudit();
  assert.equal(heroAudit.samples.length, 48);
  assert.equal(heroAudit.actionCount, 9);
  assert.equal(heroAudit.presentationOnly, true);
  assert.equal(heroAudit.gameplayFormulaMutation, false);
  assert.equal(heroAudit.snapshotSchemaMutation, false);
  assert.equal(heroAudit.newAtlasCount, 1);
  assert.equal(heroAudit.passed, true);
  assert.equal(enemyAudit.samples.length, 72);
  assert.equal(enemyAudit.enemyTypeCount, 13);
  assert.equal(enemyAudit.actionCount, 9);
  assert.equal(enemyAudit.presentationOnly, true);
  assert.equal(enemyAudit.gameplayFormulaMutation, false);
  assert.equal(enemyAudit.snapshotSchemaMutation, false);
  assert.equal(enemyAudit.passed, true);
});
