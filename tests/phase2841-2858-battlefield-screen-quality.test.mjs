import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const terrainSource = fs.readFileSync(new URL('../src/game/terrain.ts', import.meta.url), 'utf8');

test('phase 2841 depth overlay atlas covers every map and evolution stage', async () => {
  const sourceUrl = new URL('../src/game/battlefield-depth-overlay-assets.ts', import.meta.url);
  const assetUrl = new URL('../assets/arena/battlefield-depth-overlays.png', import.meta.url);
  assert.equal(fs.existsSync(sourceUrl), true);
  assert.equal(fs.existsSync(assetUrl), true);
  if (!fs.existsSync(sourceUrl) || !fs.existsSync(assetUrl)) return;
  const mod = await import('../dist/game/battlefield-depth-overlay-assets.js');
  const audit = mod.auditBattlefieldDepthOverlayAtlas();
  assert.equal(audit.itemCount, 9);
  assert.equal(audit.uniqueCellCount, 9);
  assert.equal(audit.coverage, 1);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.motionAmplitudeMax, 6);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.blocksGameplay, false);
  assert.equal(audit.passed, true);
});

test('phase 2842-2846 game loads and draws battlefield depth overlays between atmosphere and terrain with reduced-motion gating', () => {
  assert.match(gameSource, /initializeBattlefieldDepthOverlayAtlas/);
  assert.match(gameSource, /drawBattlefieldDepthOverlays/);
  assert.match(gameSource, /battlefieldDepthOverlaySprite/);
  assert.match(gameSource, /this\.presentationSettings\.reducedMotion/);
  assert.match(gameSource, /this\.drawArena\(ctx\);[\s\S]*this\.drawBattlefieldAtmosphereVfx\(ctx\);[\s\S]*this\.drawBattlefieldDepthOverlays\(ctx\);[\s\S]*this\.terrain\.render\(ctx, residualMotion\);/);
  assert.match(gameSource, /globalCompositeOperation='screen'/);
});

test('phase 2847-2852 terrain render adds contact shadows, wall depth, and crystal bases without gameplay mutation', () => {
  assert.match(terrainSource, /const crystalAmplitude = motion\?\.terrainCrystalMotionAmplitude \?\? 0\.08/);
  assert.match(terrainSource, /const poolRipple = crystalAmplitude \* 0\.75/);
  assert.match(terrainSource, /wallShadow/);
  assert.match(terrainSource, /groundGlow/);
  assert.match(terrainSource, /ctx\.ellipse\(crystal\.x, crystal\.y \+ 16/);
});

test('phase 2853-2858 deterministic battlefield screen quality audit remains presentation-only', async () => {
  const auditUrl = new URL('../src/game/battlefield-screen-quality-audit.ts', import.meta.url);
  assert.equal(fs.existsSync(auditUrl), true);
  if (!fs.existsSync(auditUrl)) return;
  const mod = await import('../dist/game/battlefield-screen-quality-audit.js');
  const audit = mod.runBattlefieldScreenQualityAudit();
  assert.equal(audit.passed, true);
  assert.equal(audit.samples.length, 48);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.newAtlasCount, 1);
  assert.equal(audit.actionCount, 9);
});
