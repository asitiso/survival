import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

async function loadModule() {
  return import('../dist/game/terrain-foreground-occlusion.js');
}

test('phase 4869 terrain foreground registration helper exists and is presentation-only geometry', async () => {
  const mod = await loadModule();
  assert.equal(typeof mod.terrainForegroundSpriteRegistration, 'function');
  const registration = mod.terrainForegroundSpriteRegistration({
    wallX: 100,
    wallY: 200,
    wallWidth: 180,
    wallHeight: 84,
    spriteCropRatio: 0.18,
  });
  assert.equal(registration.presentationOnly, true);
  assert.equal('offsetX' in registration, false);
  assert.equal('offsetY' in registration, false);
});

test('phase 4870 foreground registration exactly matches the existing full obstacle sprite destination', async () => {
  const mod = await loadModule();
  const registration = mod.terrainForegroundSpriteRegistration({
    wallX: 100,
    wallY: 200,
    wallWidth: 180,
    wallHeight: 84,
    spriteCropRatio: 0.18,
  });
  assert.equal(registration.drawWidth, 198);
  assert.equal(registration.drawHeight, 102);
  assert.equal(registration.drawX, 91);
  assert.equal(registration.drawY, 191);
});

test('phase 4871 foreground cap destination height is derived from the registered full sprite scale', async () => {
  const mod = await loadModule();
  const registration = mod.terrainForegroundSpriteRegistration({
    wallX: 100,
    wallY: 200,
    wallWidth: 180,
    wallHeight: 84,
    spriteCropRatio: 0.18,
  });
  assert.ok(Math.abs(registration.capDrawHeight - 18.36) < 1e-9);
  assert.equal(registration.capDrawX, registration.drawX);
  assert.equal(registration.capDrawY, registration.drawY);
  assert.equal(registration.capDrawWidth, registration.drawWidth);
});

test('phase 4872 minimum sprite size registration remains centered for small obstacles', async () => {
  const mod = await loadModule();
  const registration = mod.terrainForegroundSpriteRegistration({
    wallX: 40,
    wallY: 60,
    wallWidth: 20,
    wallHeight: 20,
    spriteCropRatio: 0.3,
  });
  assert.equal(registration.drawWidth, 72);
  assert.equal(registration.drawHeight, 72);
  assert.equal(registration.drawX, 14);
  assert.equal(registration.drawY, 34);
  assert.ok(Math.abs(registration.capDrawHeight - 21.6) < 1e-9);
});

test('phase 4873 malformed registration inputs stay finite and bounded', async () => {
  const mod = await loadModule();
  for (const input of [
    { wallX: Number.NaN, wallY: Number.NaN, wallWidth: Number.NaN, wallHeight: Number.NaN, spriteCropRatio: Number.NaN },
    { wallX: 5, wallY: 7, wallWidth: -2, wallHeight: -3, spriteCropRatio: -4 },
    { wallX: 5, wallY: 7, wallWidth: 9999, wallHeight: 9999, spriteCropRatio: 9 },
  ]) {
    const registration = mod.terrainForegroundSpriteRegistration(input);
    for (const value of [registration.drawX, registration.drawY, registration.drawWidth, registration.drawHeight, registration.capDrawHeight]) {
      assert.ok(Number.isFinite(value));
    }
    assert.ok(registration.drawWidth >= 72);
    assert.ok(registration.drawHeight >= 72);
    assert.ok(registration.capDrawHeight >= 0);
    assert.ok(registration.capDrawHeight <= registration.drawHeight);
  }
});

test('phase 4874 full obstacle overlay foreground cap and critical overlap share one registered geometry contract', () => {
  assert.match(gameSource, /terrainForegroundSpriteRegistration/);
  assert.match(gameSource, /private drawTerrainForegroundOcclusion\([\s\S]*terrainForegroundSpriteRegistration/);
  assert.match(gameSource, /private drawTerrainSpriteOverlays\([\s\S]*terrainForegroundSpriteRegistration/);
  assert.match(gameSource, /wallX:\s*registration\.capDrawX/);
  assert.match(gameSource, /wallY:\s*registration\.capDrawY/);
  assert.match(gameSource, /wallWidth:\s*registration\.capDrawWidth/);
  assert.match(gameSource, /capHeight:\s*registration\.capDrawHeight/);
  assert.doesNotMatch(gameSource, /const destinationX = wall\.x - 4/);
  assert.doesNotMatch(gameSource, /const destinationWidth = wall\.w \+ 8/);
});
