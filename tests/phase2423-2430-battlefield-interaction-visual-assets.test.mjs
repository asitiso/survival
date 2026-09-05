import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const pickupsSource = fs.readFileSync(new URL('../src/game/pickups.ts', import.meta.url), 'utf8');
const enemiesSource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');

test('phase 2423 battlefield interaction atlas module and image exist', () => {
  assert.equal(fs.existsSync(new URL('../src/game/battlefield-interaction-vfx-assets.ts', import.meta.url)), true);
  assert.equal(fs.existsSync(new URL('../assets/arena/battlefield-interaction-vfx.png', import.meta.url)), true);
});

test('phase 2424 core render uses three visual states with fallback preserved', () => {
  assert.match(gameSource, /battlefieldCoreVisualState/);
  assert.match(gameSource, /battlefieldInteractionSprite\('core'/);
  assert.match(gameSource, /battlefieldInteractionVfxAtlasReady/);
  assert.match(gameSource, /createRadialGradient/);
});

test('phase 2425 pickups render XP and coin sprites with shape fallback preserved', () => {
  assert.match(pickupsSource, /battlefieldInteractionSprite\('pickup'/);
  assert.match(pickupsSource, /interactionAtlasReady/);
  assert.match(pickupsSource, /pickup\.kind === 'coin'/);
  assert.match(pickupsSource, /fillRect/);
});

test('phase 2426-2428 supply objective and field nodes use interaction atlas without changing gameplay state', () => {
  assert.match(gameSource, /battlefieldInteractionSprite\('supply'/);
  assert.match(gameSource, /battlefieldInteractionSprite\('objective'/);
  assert.match(gameSource, /battlefieldInteractionSprite\('field-node'/);
});

test('phase 2429 enemy manager renders normal and elite spawn portal cues presentation-only', () => {
  assert.match(enemiesSource, /spawnPortalVfx/);
  assert.match(enemiesSource, /battlefieldInteractionSprite\('spawn-portal'/);
  assert.match(enemiesSource, /spawnPortalVfx\.filter/);
});

test('phase 2430 atlas audit covers exactly sixteen unique interaction cells', async () => {
  const moduleUrl = new URL('../dist/game/battlefield-interaction-vfx-assets.js', import.meta.url);
  assert.equal(fs.existsSync(moduleUrl), true);
  const assets = await import(moduleUrl.href);
  const audit = assets.auditBattlefieldInteractionVfxAtlas();
  assert.equal(audit.itemCount, 16);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 16);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
});

test('phase 2427 objective label reserves icon space for the new interaction atlas', () => {
  assert.match(gameSource, /objectiveInteractionVisible/);
  assert.match(gameSource, /objectiveInteractionVisible\s*\|\|\s*\(iconPresentation\.visible&&this\.tacticalStatusIconAtlasReady\)\?27:4/);
});
