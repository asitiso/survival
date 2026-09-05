import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

async function loadAssets(){
  assert.equal(fs.existsSync(new URL('../src/game/hero-motion-render-assets.ts', import.meta.url)), true);
  assert.equal(fs.existsSync(new URL('../assets/heroes/hero-motion-render-overlays.png', import.meta.url)), true);
  return import('../dist/game/hero-motion-render-assets.js');
}

test('phase 2859 hero motion render atlas module and asset exist with full coverage', async () => {
  const mod = await loadAssets();
  const audit = mod.auditHeroMotionRenderAtlas(['arkan', 'seria', 'kain', 'edric']);
  assert.equal(mod.HERO_MOTION_RENDER_ATLAS.columns, 4);
  assert.equal(mod.HERO_MOTION_RENDER_ATLAS.rows, 3);
  assert.equal(mod.HERO_MOTION_RENDER_ATLAS.cellWidth, 256);
  assert.equal(mod.HERO_MOTION_RENDER_ATLAS.cellHeight, 256);
  assert.equal(audit.itemCount, 12);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 12);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
});

test('phase 2860 hero motion render presentation exposes readable layer sizes and alphas', async () => {
  const mod = await loadAssets();
  const idle = mod.heroMotionRenderPresentation('idle', 23, true, 0.5);
  const move = mod.heroMotionRenderPresentation('move', 23, true, 1);
  const crest = mod.heroMotionRenderPresentation('crest', 23, true, 0.75);
  assert.equal(idle.visible, true);
  assert.equal(move.visible, true);
  assert.equal(crest.visible, true);
  assert.equal(idle.layer, 'idle');
  assert.equal(move.layer, 'move');
  assert.equal(crest.layer, 'crest');
  assert.ok(idle.size >= 120);
  assert.ok(move.size > idle.size);
  assert.ok(crest.alpha > idle.alpha);
});

test('phase 2861-2868 game preloads and uses hero motion render overlays during hero draw', () => {
  assert.match(gameSource, /initializeHeroMotionRenderAtlas/);
  assert.match(gameSource, /HERO_MOTION_RENDER_ATLAS\.src/);
  assert.match(gameSource, /heroMotionRenderPresentation\('idle'/);
  assert.match(gameSource, /heroMotionRenderPresentation\('move'/);
  assert.match(gameSource, /heroMotionRenderPresentation\('crest'/);
  assert.match(gameSource, /heroMotionRenderSprite\(this\.hero\.profileId, 'idle'\)/);
  assert.match(gameSource, /heroMotionRenderSprite\(this\.hero\.profileId, 'move'\)/);
  assert.match(gameSource, /heroMotionRenderSprite\(this\.hero\.profileId, 'crest'\)/);
  assert.match(gameSource, /heroRenderMotionBlend/);
  assert.match(gameSource, /heroRenderStride/);
  assert.match(gameSource, /ctx\.ellipse\(0, this\.hero\.radius \+ 11/);
  assert.match(gameSource, /ctx\.scale\(bodyScaleX, bodyScaleY\)/);
});

test('phase 2869-2876 hero motion render audit is deterministic presentation-only and release-safe', async () => {
  assert.equal(fs.existsSync(new URL('../src/game/hero-motion-render-audit.ts', import.meta.url)), true);
  const mod = await import('../dist/game/hero-motion-render-audit.js');
  const audit = mod.runHeroMotionRenderAudit();
  assert.equal(audit.samples.length, 64);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.newAtlasCount, 1);
  assert.equal(audit.passed, true);
});
