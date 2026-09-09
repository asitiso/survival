import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sourceUrl = new URL('../src/game/terrain-foreground-occlusion.ts', import.meta.url);
const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

async function loadModule() {
  assert.equal(fs.existsSync(sourceUrl), true, 'terrain foreground occlusion presentation module must exist');
  return import('../dist/game/terrain-foreground-occlusion.js');
}

const input = (overrides = {}) => ({
  wallWidth: 180,
  wallHeight: 84,
  battlefieldStress: 0.2,
  reducedFlash: false,
  ...overrides,
});

test('phase 4857 terrain foreground occlusion module exists and stays presentation-only', async () => {
  const mod = await loadModule();
  const p = mod.terrainForegroundOcclusionPresentation(input());
  assert.equal(p.presentationOnly, true);
  assert.equal(typeof p.capHeight, 'number');
  assert.equal(typeof p.capAlpha, 'number');
  assert.equal(typeof p.edgeAlpha, 'number');
  assert.equal(typeof p.spriteCropRatio, 'number');
  assert.equal('offsetX' in p, false);
  assert.equal('offsetY' in p, false);
});

test('phase 4858 foreground cap remains shallow so it hints depth without covering front-side actors', async () => {
  const mod = await loadModule();
  for (const wallHeight of [28, 52, 84, 140]) {
    const p = mod.terrainForegroundOcclusionPresentation(input({ wallHeight }));
    assert.ok(p.capHeight >= 6);
    assert.ok(p.capHeight <= Math.min(20, wallHeight * 0.3));
    assert.ok(p.spriteCropRatio >= 0.1 && p.spriteCropRatio <= 0.3);
  }
});

test('phase 4859 dense battlefield pressure softens the foreground cap but preserves essential occlusion', async () => {
  const mod = await loadModule();
  const open = mod.terrainForegroundOcclusionPresentation(input({ battlefieldStress: 0 }));
  const dense = mod.terrainForegroundOcclusionPresentation(input({ battlefieldStress: 1 }));
  assert.ok(dense.capAlpha < open.capAlpha);
  assert.ok(dense.edgeAlpha < open.edgeAlpha);
  assert.ok(dense.capAlpha >= open.capAlpha * 0.7);
  assert.ok(dense.edgeAlpha >= open.edgeAlpha * 0.55);
});

test('phase 4860 reduced flash calms the post-actor edge without erasing the static depth cue', async () => {
  const mod = await loadModule();
  const normal = mod.terrainForegroundOcclusionPresentation(input());
  const reduced = mod.terrainForegroundOcclusionPresentation(input({ reducedFlash: true }));
  assert.ok(reduced.capAlpha < normal.capAlpha);
  assert.ok(reduced.edgeAlpha < normal.edgeAlpha);
  assert.ok(reduced.capAlpha >= normal.capAlpha * 0.7);
  assert.equal(reduced.capHeight, normal.capHeight);
  assert.equal(reduced.spriteCropRatio, normal.spriteCropRatio);
});

test('phase 4861 foreground occlusion output is finite and bounded for malformed dimensions or stress', async () => {
  const mod = await loadModule();
  for (const overrides of [
    { wallWidth: Number.NaN, wallHeight: Number.NaN, battlefieldStress: Number.NaN },
    { wallWidth: -10, wallHeight: -4, battlefieldStress: -3 },
    { wallWidth: 9999, wallHeight: 9999, battlefieldStress: 4 },
  ]) {
    const p = mod.terrainForegroundOcclusionPresentation(input(overrides));
    assert.ok(Number.isFinite(p.capHeight));
    assert.ok(Number.isFinite(p.capAlpha));
    assert.ok(Number.isFinite(p.edgeAlpha));
    assert.ok(Number.isFinite(p.spriteCropRatio));
    assert.ok(p.capHeight >= 6 && p.capHeight <= 20);
    assert.ok(p.capAlpha >= 0 && p.capAlpha <= 1);
    assert.ok(p.edgeAlpha >= 0 && p.edgeAlpha <= 1);
    assert.ok(p.spriteCropRatio >= 0.1 && p.spriteCropRatio <= 0.3);
  }
});

test('phase 4862 foreground terrain pass renders after actors and defeat bodies but before combat overlays', () => {
  assert.match(gameSource, /private drawTerrainForegroundOcclusion\(/);
  assert.match(
    gameSource,
    /this\.enemies\.renderEnemies\([\s\S]*this\.drawEnemyDefeatBodyTransitions\(ctx\);[\s\S]*this\.drawTerrainForegroundOcclusion\(ctx\);[\s\S]*this\.drawElitePackApproachFormationVfx\(ctx\);/
  );
  assert.match(gameSource, /terrainForegroundOcclusionPresentation/);
  assert.match(gameSource, /battlefieldObstacleStateVfxAtlasImage|battlefieldPropVfxAtlasImage/);
});
