import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const pickupsSource = fs.readFileSync(new URL('../src/game/pickups.ts', import.meta.url), 'utf8');
const enemiesSource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const freezeSource = fs.readFileSync(new URL('../src/game/release-freeze-audit.ts', import.meta.url), 'utf8');
const candidateSource = fs.readFileSync(new URL('../src/game/release-candidate-audit.ts', import.meta.url), 'utf8');

function pngDimensions(buffer) {
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function importIfPresent(sourceRelative, distRelative) {
  const sourceUrl = new URL(sourceRelative, import.meta.url);
  assert.equal(fs.existsSync(sourceUrl), true);
  if (!fs.existsSync(sourceUrl)) return null;
  return import(distRelative);
}

test('phase 2447 pickup flow atlas covers two resources x six readable flow states', async () => {
  const mod = await importIfPresent('../src/game/pickup-flow-vfx-assets.ts', '../dist/game/pickup-flow-vfx-assets.js');
  if (!mod) return;
  const audit = mod.auditPickupFlowVfxAtlas();
  assert.equal(audit.kindCount, 2);
  assert.equal(audit.stateCount, 6);
  assert.equal(audit.itemCount, 12);
  assert.equal(audit.uniqueCellCount, 12);
  assert.equal(audit.coverage, 1);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
  const buffer = fs.readFileSync(path.resolve(mod.PICKUP_FLOW_VFX_ATLAS.src.replace(/^\.\//, '')));
  assert.deepEqual(pngDimensions(buffer), { width: 512, height: 384 });
  assert.ok(buffer.length > 6000);
});

test('phase 2448-2450 pickups expose attract cluster rich global-magnet and collection burst feedback without changing collection rules', () => {
  assert.match(pickupsSource, /pickupFlowVfxSprite/);
  assert.match(pickupsSource, /collectionVfx/);
  assert.match(pickupsSource, /'attract'/);
  assert.match(pickupsSource, /'cluster'/);
  assert.match(pickupsSource, /'rich'/);
  assert.match(pickupsSource, /'globalMagnet'/);
  assert.match(pickupsSource, /'collectSmall'/);
  assert.match(pickupsSource, /'collectLarge'/);
  assert.match(pickupsSource, /battlefieldInteractionSprite\('pickup'/);
  assert.match(pickupsSource, /distance\(pickup\.pos, hero\.pos\) <= hero\.radius \+ pickup\.radius \+ 6/);
});

test('phase 2451 spawn pressure atlas covers regular specialist elite and boss portal lifecycle', async () => {
  const mod = await importIfPresent('../src/game/spawn-pressure-vfx-assets.ts', '../dist/game/spawn-pressure-vfx-assets.js');
  if (!mod) return;
  const audit = mod.auditSpawnPressureVfxAtlas();
  assert.equal(audit.kindCount, 4);
  assert.equal(audit.stateCount, 2);
  assert.equal(audit.itemCount, 8);
  assert.equal(audit.uniqueCellCount, 8);
  assert.equal(audit.coverage, 1);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
  const buffer = fs.readFileSync(path.resolve(mod.SPAWN_PRESSURE_VFX_ATLAS.src.replace(/^\.\//, '')));
  assert.deepEqual(pngDimensions(buffer), { width: 512, height: 256 });
  assert.ok(buffer.length > 5000);
});

test('phase 2452-2453 enemy spawn portals classify specialist elite and boss and preserve spawn counts', () => {
  assert.match(enemiesSource, /spawnPressureVfxSprite/);
  assert.match(enemiesSource, /kind:'regular'\|'specialist'\|'elite'\|'boss'/);
  assert.match(enemiesSource, /type === 'boss' \? 'boss'/);
  assert.match(enemiesSource, /isSpecialistEnemyType/);
  assert.match(enemiesSource, /state = portal\.ttl > 0\.36 \? 'portal' : 'arrival'/);
  assert.match(enemiesSource, /this\.enemies\.push\(/);
});

test('phase 2453 game initializes both atlases and supplies them only to presentation renderers', () => {
  assert.match(gameSource, /initializePickupFlowVfxAtlas/);
  assert.match(gameSource, /initializeSpawnPressureVfxAtlas/);
  assert.match(gameSource, /this\.pickups\.render\([^\n]*pickupFlowVfxAtlasImage/);
  assert.match(gameSource, /this\.enemies\.renderEnemies\([^\n]*spawnPressureVfxAtlasImage/);
});

test('phase 2454 deterministic audit is release-bound and remains presentation-only', async () => {
  const mod = await importIfPresent('../src/game/resource-flow-spawn-pressure-vfx-audit.ts', '../dist/game/resource-flow-spawn-pressure-vfx-audit.js');
  if (!mod) return;
  const audit = mod.runResourceFlowSpawnPressureVfxAudit();
  assert.equal(audit.samples.length, 64);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.loadFailureBlocksGameplay, false);
  assert.equal(audit.passed, true);
  assert.match(freezeSource, /resourceFlowSpawnPressureVfxPassed/);
  assert.match(candidateSource, /resourceFlowSpawnPressureVfxPassed/);
  assert.match(candidateSource, /resource-flow-spawn-pressure-vfx/);
});
